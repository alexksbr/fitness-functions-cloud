"use strict";

const express = require("express");
const AWS = require("aws-sdk");

const PORT = 8080;
const HOST = "0.0.0.0";

const app = express();
app.get("/stocks", (req, res) => {
  res.send([{ stockName: "XYZ INC", stockValue: 42 }]);
});

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);
