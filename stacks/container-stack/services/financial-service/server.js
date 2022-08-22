"use strict";

const express = require("express");
const AWS = require("aws-sdk");
const axios = require("axios").default;

const PORT = 8080;
const HOST = "0.0.0.0";
const REGION = "eu-central-1";

const stockServiceId = process.env.STOCK_SERVICE_ID;
const stockCacheTableName = process.env.STOCK_CACHE_TABLE_NAME;

const serviceDiscovery = new AWS.ServiceDiscovery({ region: REGION });
const dynamoDB = new AWS.DynamoDB({ region: REGION });

const app = express();
app.get("/stocks", async (req, res) => {
  console.log("/stocks endpoint invoked");

  const stockServiceInstances = (
    await serviceDiscovery
      .listInstances({ ServiceId: stockServiceId })
      .promise()
  ).Instances;
  if (stockServiceInstances.length === 0) {
    throw Error("No stock service instances available");
  }
  const stockServiceInstance = stockServiceInstances[0].Attributes;

  console.log("obtained url from service discovery");

  const stockServiceUrl = `http://${stockServiceInstance.AWS_INSTANCE_IPV4}:${stockServiceInstance.AWS_INSTANCE_PORT}/stockvalue`;

  try {
    const response = await axios.get(stockServiceUrl);
    const stockValue = response.data.stockValue;

    await dynamoDB
      .putItem({
        TableName: stockCacheTableName,
        Item: AWS.DynamoDB.Converter.marshall({
          key: "latest-stock-value",
          value: stockValue,
        }),
      })
      .promise();
    console.log("stored latest stock value in cache");

    res.send([{ stockName: "XYZ INC", stockValue }]);
  } catch (error) {
    console.log("something went wrong:", error);
  }
});

app.get("/", (req, res) => {
  res.send({});
});

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);
