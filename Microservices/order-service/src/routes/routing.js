const express = require("express");
const orderController = require("../controllers/order.controller");

const routing = express.Router();

routing.post("/order/place-order", orderController.placeOrder);


// Handle invalid paths
routing.all("*", (req, res) => {
  res.status(404).json({
    status: "fail",
    message: "Invalid path",
  });
});

module.exports = routing;