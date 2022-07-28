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

// Minikube does it's own thing with an ingress controller
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

// const mongoExpress = new k8s.helm.v3.Chart(
//   "mongo-express",
//   {
//     chart: "mongo-express",
//     version: "2.6.6",
//     fetchOpts: {
//       repo: "https://cowboysysop.github.io/charts/",
//     },
//     values: {
//       image: {
//         tag: "1.0.0-alpha.4",
//       },
//       mongodbEnableAdmin: true,
//       mongodbAuthUsername: "root",
//       mongodbAuthPassword: "123456",
//       siteBaseUrl: "/mongo-express",
//       // TODO: connect to database
//     },
//   },
//   { dependsOn: mongodb.ready }
// );

const whoami = new k8s.helm.v3.Chart("whoami", {
  chart: "whoami",
  fetchOpts: {
    repo: "https://cowboysysop.github.io/charts/",
  },
});

const frontendDeployment = new k8s.apps.v1.Deployment(appName, {
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
});

const frontendService = new k8s.core.v1.Service(appName, {
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

// Next, expose the app using an Ingress.
const appIngress = new k8s.networking.v1.Ingress(`alkitab-ingress`, {
  metadata: {
    name: "test-ingress2",
    annotations: {
      "kubernetes.io/ingress.class": "nginx",
      "nginx.ingress.kubernetes.io/rewrite-target": "/$1",
      // "ingress.kubernetes.io/configuration-snippet": "try_files $uri $uri/ /index.html",
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
              path: "/test3",
              backend: {
                service: {
                  name: "whoami",
                  port: { number: 80 },
                },
              },
            },
            {
              pathType: "Prefix",
              path: "/(.*)",
              backend: {
                service: {
                  // name: frontendDeployment.metadata.name,
                  name: "alkitab-frontend",
                  port: { number: 80 },
                },
              },
            },
            {
              pathType: "Prefix",
              path: "/testagain",
              backend: {
                service: {
                  // name: frontendDeployment.metadata.name,
                  name: "alkitab-frontend",
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
