"use strict";

const express = require("express");
const AWS = require("aws-sdk");
const fetch = require("node-fetch");

const PORT = 8080;
const HOST = "0.0.0.0";
const REGION = "eu-central-1";

const serviceDiscovery = new AWS.ServiceDiscovery({ region: REGION });
const stockServiceId = process.env.STOCK_SERVICE_ID;

const app = express();
app.get("/stocks", (req, res) => {
  console.log("/stocks endpoint invoked");

  const stockServiceInstance = (
    await serviceDiscovery
      .listInstances({ ServiceId: stockServiceId })
      .promise()
  ).Instances[0].Attributes;

  console.log(
    "obtained url from service discovery",
    stockServiceInstance.AWS_INSTANCE_IPV4,
    stockServiceInstance.AWS_INSTANCE_PORT
  );

  const stockServiceUrl = `http://${stockServiceInstance.AWS_INSTANCE_IPV4}:${stockServiceInstance.AWS_INSTANCE_PORT}/stockvalue`;

  const response = await fetch(stockServiceUrl);

  console.log("response", response);

  res.send([{ stockName: "XYZ INC", stockValue: 42 }]);
});

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);
