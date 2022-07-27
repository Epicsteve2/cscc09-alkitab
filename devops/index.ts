import * as pulumi from "@pulumi/pulumi";
import * as k8s from "@pulumi/kubernetes";

// // Minikube does not implement services of type `LoadBalancer`; require the user to specify if we're
// // running on minikube, and if so, create only services of type ClusterIP.
// const config = new pulumi.Config();
// const isMinikube = config.requireBoolean("isMinikube");

// const appName = "nginx";
// const appLabels = { app: appName };
// const deployment = new k8s.apps.v1.Deployment(appName, {
//   spec: {
//     selector: { matchLabels: appLabels },
//     replicas: 1,
//     template: {
//       metadata: { labels: appLabels },
//       spec: { containers: [{ name: appName, image: "nginx" }] },
//     },
//   },
// });

// // Allocate an IP to the Deployment.
// const frontend = new k8s.core.v1.Service(appName, {
//   metadata: { labels: deployment.spec.template.metadata.labels },
//   spec: {
//     type: isMinikube ? "ClusterIP" : "LoadBalancer",
//     ports: [{ port: 80, targetPort: 80, protocol: "TCP" }],
//     selector: appLabels,
//   },
// });

// // When "done", this will print the public IP.
// export const ip = isMinikube
//   ? frontend.spec.clusterIP
//   : frontend.status.loadBalancer.apply(
//       (lb) => lb.ingress[0].ip || lb.ingress[0].hostname
//     );

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
      image: {
        tag: "1.0.0-alpha.4",
      },
      mongodbEnableAdmin: true,
      mongodbAuthUsername: "root",
      mongodbAuthPassword: "123456",
      siteBaseUrl: "/mongo-express",
      // TODO: connect to database
    },
  },
  { dependsOn: mongodb.ready }
);

const nginx = new k8s.helm.v3.Chart(
  "nginx",
  {
    chart: "nginx",
    version: "13.1.4",
    fetchOpts: {
      repo: "https://charts.bitnami.com/bitnami",
    },
    values: {
      image: {
        tag: "1.23.1-debian-11-r2",
      },
      containerPorts: {
        https: 0, // TODO
      },
      service: {
        type: "Ingress Controller",
      },
      ingress: {
        enabled: true,
        selfSigned: false, // TODO
      },
    },
  },
  { dependsOn: mongodb.ready }
);
