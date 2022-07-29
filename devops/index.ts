import * as pulumi from "@pulumi/pulumi";
import * as k8s from "@pulumi/kubernetes";
import * as nginx from "@pulumi/kubernetes-ingress-nginx";
import * as docker from "@pulumi/docker";

const stack = pulumi.getStack();

const config = new pulumi.Config();
const isMinikube = config.requireBoolean("isMinikube");

// const ns = new k8s.core.v1.Namespace("default");

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
      // helmOptions: {
      //     namespace: ns.metadata.name,
      // },
    }
  );
}

const mongodb = new k8s.helm.v3.Chart("mongodb", {
  chart: "mongodb",
  version: "12.1.29",
  fetchOpts: {
    repo: "https://charts.bitnami.com/bitnami",
  },
  values: {
    image: {
      tag: "5.0.9-debian-11-r7",
    },
    auth: {
      rootPassword: "123456",
      databases: ["books"],
      // idk why this is needed
      usernames: ["Mashiro"],
      passwords: ["SoupPasta"],
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
      // image: {
      //   tag: "1.0.0-alpha.4",
      // },
      mongodbEnableAdmin: true,
      mongodbAdminPassword: "123456",
      mongodbAuthUsername: "Mashiro",
      mongodbAuthDatabase: "books",
      mongodbAuthPassword: "SoupPasta",
      siteBaseUrl: "/mongo-express",
      // basicAuthUsername: "Mashiro", // TODO: Prod
      // basicAuthPassword: "123456", // TODO: Prod
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
              ports: [
                {
                  containerPort: 80,
                },
              ],
            },
          ],
        },
      },
    },
  },
  { dependsOn: mongodb.ready }
);

const frontendService = new k8s.core.v1.Service(`${appName}-frontend-service`, {
  metadata: {
    labels: frontendDeployment.spec.template.metadata.labels,
    name: "alkitab-frontend",
  },
  spec: {
    // type: isMinikube ? "ClusterIP" : "LoadBalancer",
    type: "ClusterIP",
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
              imagePullPolicy: "Never",
              ports: [
                {
                  containerPort: 3000,
                },
              ],
            },
          ],
        },
      },
    },
  }
);

const backendService = new k8s.core.v1.Service(`${appName}-backend-service`, {
  metadata: {
    labels: backendDeployment.spec.template.metadata.labels,
    name: "alkitab-backend",
  },
  spec: {
    // type: isMinikube ? "ClusterIP" : "LoadBalancer",
    type: "ClusterIP",
    ports: [{ port: 3000 }],
    selector: appLabels,
  },
});

// Next, expose the app using an Ingress.
const appIngress = new k8s.networking.v1.Ingress(`alkitab-ingress`, {
  metadata: {
    name: "ingress",
    annotations: {
      "kubernetes.io/ingress.class": "nginx",
      // "nginx.ingress.kubernetes.io/rewrite-target": "/$1",
      // "nginx.ingress.kubernetes.io/rewrite-target": "/,",
    },
    // namespace: ns.metadata.name
  },
  spec: {
    defaultBackend: {
      service: {
        // name: frontendDeployment.metadata.name,
        name: "alkitab-frontend",
        port: { number: 80 },
      },
    },
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
                  name: "alkitab-backend",
                  port: { number: 3000 },
                },
              },
            },
            {
              pathType: "Prefix",
              path: "/test3",
              backend: {
                service: {
                  name: "whoami",
                  port: { number: 80 },
                },
              },
            },
          ],
        },
      },
    ],
  },
});

// export const controllerStatus: pulumi.Output<any> =
//   nginxIngressController.status;
