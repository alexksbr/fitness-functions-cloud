"use strict";

const express = require("express");

const PORT = 8080;
const HOST = "0.0.0.0";

const app = express();
app.get("/stockvalue", (req, res) => {
  const randomNumber = Math.floor(100 + Math.random() * 50);
  res.send({ stockValue: randomNumber });
});

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);
