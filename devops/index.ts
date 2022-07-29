import * as pulumi from "@pulumi/pulumi";
import * as k8s from "@pulumi/kubernetes";
import * as nginx from "@pulumi/kubernetes-ingress-nginx";
import * as certmanager from "@pulumi/kubernetes-cert-manager";
import * as docker from "@pulumi/docker";

const stack = pulumi.getStack();

const config = new pulumi.Config();
const isMinikube = config.requireBoolean("isMinikube");

const appName = "alkitab";
const appLabels = { app: appName };

// Minikube does its own thing with an ingress controller
if (!isMinikube) {
  const nginxIngressController = new nginx.IngressController(
    "nginx-ingress-controller",
    {
      controller: {
        publishService: {
          enabled: true,
        },
        service: {
          type: isMinikube ? "ClusterIP" : "LoadBalancer",
        },
      },
    }
  );
}

const mongodb = new k8s.helm.v3.Chart("mongodb", {
  chart: "mongodb",
  version: "12.1.30",
  fetchOpts: {
    repo: "https://charts.bitnami.com/bitnami",
  },
  values: {
    image: {
      tag: "5.0.9-debian-11-r7",
    },
    auth: {
      rootPassword: "123456",
    },
  },
});

const mongoExpress = new k8s.helm.v3.Chart(
  "mongo-express",
  {
    chart: "mongo-express",
    version: "2.6.6",
    fetchOpts: {
      repo: "https://cowboysysop.github.io/charts/",
    },
    values: {
      image: {
        tag: "1.0.0-alpha.4",
      },
      mongodbEnableAdmin: true,
      mongodbAdminPassword: "123456",
      siteBaseUrl: "/mongo-express",
      basicAuthUsername: isMinikube ? null : "Mashiro",
      basicAuthPassword: isMinikube ? null : "SoupPasta",
    },
  },
  { dependsOn: mongodb.ready }
);

const frontendDeployment = new k8s.apps.v1.Deployment(
  `${appName}-frontend-deployment`,
  {
    spec: {
      selector: { matchLabels: appLabels },
      replicas: 1,
      template: {
        metadata: { labels: appLabels },
        spec: {
          containers: [
            {
              name: `${appName}-frontend`,
              image: "alkitab-frontend",
              imagePullPolicy: "Never",
              ports: [{ containerPort: 80 }],
            },
          ],
        },
      },
    },
  }
);

const frontendService = new k8s.core.v1.Service(`${appName}-frontend-service`, {
  metadata: {
    labels: frontendDeployment.spec.template.metadata.labels,
    name: "alkitab-frontend-service",
  },
  spec: {
    type: isMinikube ? "ClusterIP" : "LoadBalancer",
    ports: [{ port: 80 }],
    selector: appLabels,
  },
});

const backendDeployment = new k8s.apps.v1.Deployment(
  `${appName}-backend-deployment`,
  {
    spec: {
      selector: { matchLabels: appLabels },
      replicas: 1,
      template: {
        metadata: { labels: appLabels },
        spec: {
          containers: [
            {
              name: `${appName}-backend`,
              image: "alkitab-backend",
              imagePullPolicy: isMinikube ? "Never" : "Always",
              ports: [{ containerPort: 3000 }],
              env: [{ name: "MONGO_HOST", value: "mongodb" }],
            },
          ],
        },
      },
    },
  },
  { dependsOn: mongodb.ready }
);

const backendService = new k8s.core.v1.Service(`${appName}-backend-service`, {
  metadata: {
    labels: backendDeployment.spec.template.metadata.labels,
    name: "alkitab-backend-service",
  },
  spec: {
    type: isMinikube ? "ClusterIP" : "LoadBalancer",
    ports: [{ port: 3000 }],
    selector: appLabels,
  },
});

const certManager = new certmanager.CertManager("cert-manager", {
  installCRDs: true,
  helmOptions: {
    namespace: "cert-manager",
    createNamespace: true,
  },
});

// yeah i'm not gonna bother with the pulumi api. Just creat custom resources i guess lol
if (isMinikube) {
  const clusterIssuer = new k8s.apiextensions.CustomResource(
    "self-signed-cluster-issuer",
    {
      apiVersion: "cert-manager.io/v1",
      kind: "ClusterIssuer",
      metadata: {
        name: "selfsigned-cluster-issuer",
        namespace: "cert-manager",
      },
      spec: {
        selfSigned: {},
      },
    }
    // ! Idk if this works
    // { dependsOn: certManager }
  );
  const certificate = new k8s.apiextensions.CustomResource(
    "self-signed-certificate",
    {
      apiVersion: "cert-manager.io/v1",
      kind: "Certificate",
      metadata: {
        name: "self-signed-certificate",
        namespace: "cert-manager",
      },
      spec: {
        secretName: "self-signed-tls-secret",
        issuerRef: {
          name: "self-signed-cluster-issuer",
          kind: "ClusterIssuer",
          group: "cert-manager.io",
        },
      },
    }
  );
}

// Next, expose the app using an Ingress.
const appIngress = new k8s.networking.v1.Ingress(`alkitab-ingress`, {
  metadata: {
    name: "ingress",
    annotations: {
      "kubernetes.io/ingress.class": "nginx",
      "nginx.ingress.kubernetes.io/proxy-body-size": "0",
      "nginx.ingress.kubernetes.io/proxy-read-timeout": "600",
      "nginx.ingress.kubernetes.io/proxy-send-timeout": "600",
      ...(isMinikube && {
        "cert-manager.io/cluster-issuer": "self-signed-cluster-issuer",
        // This is only needed for minikube I think
        "nginx.ingress.kubernetes.io/force-ssl-redirect": "true",
      }),
    },
  },
  spec: {
    defaultBackend: {
      service: {
        name: "alkitab-frontend-service",
        port: { number: 80 },
      },
    },
    tls: [
      {
        // hosts: [""],
        secretName: "self-signed-tls-secret",
      },
    ],
    rules: [
      {
        // Replace this with your own domain!
        // host: "myservicea.foo.org",
        http: {
          paths: [
            {
              pathType: "Prefix",
              path: "/mongo-express",
              backend: {
                service: {
                  name: "mongo-express",
                  port: { number: 8081 },
                },
              },
            },
            {
              pathType: "Prefix",
              path: "/api",
              backend: {
                service: {
                  name: "alkitab-backend-service",
                  port: { number: 3000 },
                },
              },
            },
          ],
        },
      },
    ],
  },
});

const portainerIngress = new k8s.networking.v1.Ingress(`portainer-ingress`, {
  metadata: {
    name: "portainer-ingress",
    annotations: {
      "nginx.ingress.kubernetes.io/rewrite-target": "/$2",
      ...(isMinikube && {
        "cert-manager.io/cluster-issuer": "self-signed-cluster-issuer",
        // This is only needed for minikube I think
        "nginx.ingress.kubernetes.io/force-ssl-redirect": "true",
      }),
    },
  },
  spec: {
    tls: [
      {
        // hosts: [""],
        secretName: "self-signed-tls-secret",
      },
    ],
    rules: [
      {
        // Replace this with your own domain!
        // host: "myservicea.foo.org",
        http: {
          paths: [
            {
              pathType: "Prefix",
              path: "/portainer(/|$)(.*)",
              backend: {
                service: {
                  name: "portainer",
                  port: { number: 9000 },
                },
              },
            },
          ],
        },
      },
    ],
  },
});

const portainer = new k8s.helm.v3.Chart("portainer", {
  chart: "portainer",
  // version: "12.1.30",
  fetchOpts: {
    repo: "https://portainer.github.io/k8s/",
  },
  values: {
    ingress: {
      enabled: true,
      ingressClassName: "nginx",
      hosts: [
        {
          host: null,
          paths: [
            {
              path: "/portainer",
            },
          ],
        },
      ],
    },
    service: {
      type: "ClusterIP",
    },
  },
});

export const certManagerStatus = certManager.status;

// export const controllerStatus: pulumi.Output<any> =
//   nginxIngressController.status;
