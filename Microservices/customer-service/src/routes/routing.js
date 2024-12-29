const express = require("express");
const customerController = require("../controllers/customer.controller");

const routing = express.Router();

// Register a customer
routing.post("/customer/register", customerController.register);

// Customer login
routing.post("/customer/login", customerController.login);

// Get customer details by customerId
routing.get("/customer/:customerId", customerController.getCustomerDetails);

// Invalid path
routing.all("*", (req, res) => {
  res.status(404).json({
    status: "fail",
    message: "Invalid path",
  });
});

module.exports = routing;
