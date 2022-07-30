import * as linode from "@pulumi/linode";

// Just create this by hand...

const alkitabDomain = new linode.Domain("alkitabDomain", {
  type: "master",
  domain: "cscc09-alkitab.ninja",
  soaEmail: "steve.guo@mail.utoronto.ca",
  masterIps: ["172.105.1.199"],
  tags: ["prod"],
});

const alkitabDomainRecord = new linode.DomainRecord("alkitabDomainRecord", {
  domainId: alkitabDomain.id,
  name: "www",
  recordType: "CNAME",
  target: " cscc09-alkitab.ninja",
});

const my_cluster = new linode.LkeCluster("alkitab-cluster", {
  k8sVersion: "1.23",
  label: "alkitab",
  pools: [
    {
      count: 1,
      type: "g6-standard-2",
    },
  ],
  region: "ca-central",
  tags: ["prod"],
});
