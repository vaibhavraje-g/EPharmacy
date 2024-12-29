const express = require("express");
const paymentController = require("../controllers/payments.controller");

const routing = express.Router();

routing.post("/payment/amount/:amountToPay", paymentController.payAmount);

routing.get("/payment/view-cards/:customerId", paymentController.viewCard);

routing.post("/payment/add-card/:customerId", paymentController.addCard);

// Handle invalid paths
routing.all("*", (req, res) => {
  res.status(404).json({
    status: "fail",
    message: "Invalid path",
  });
});

module.exports = routing;
