"use strict";

const express = require("express");
const AWS = require("aws-sdk");
const axios = require("axios").default;

const PORT = 8080;
const HOST = "0.0.0.0";
const REGION = "eu-central-1";

const serviceDiscovery = new AWS.ServiceDiscovery({ region: REGION });
const stockServiceId = process.env.STOCK_SERVICE_ID;

const app = express();
app.get("/stocks", async (req, res) => {
  console.log("/stocks endpoint invoked");

  const stockServiceInstance = (
    await serviceDiscovery
      .listInstances({ ServiceId: stockServiceId })
      .promise()
  ).Instances[0].Attributes;

  console.log("obtained url from service discovery");

  const stockServiceUrl = `http://${stockServiceInstance.AWS_INSTANCE_IPV4}:${stockServiceInstance.AWS_INSTANCE_PORT}/stockvalue`;

  try {
    const response = await axios.get(stockServiceUrl);

    res.send([{ stockName: "XYZ INC", stockValue: 42 }]);
  } catch (error) {
    console.log("something went wrong:", error);
  }
});

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);
