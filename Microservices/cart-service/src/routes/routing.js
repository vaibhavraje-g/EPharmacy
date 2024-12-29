const express = require("express");
const cartController = require("../controllers/cart.controller");

const routing = express.Router();

// Add the medicine to customer’s cart
routing.post(
  "/cart/addmedicine/:medicineId/customer/:customerId",
  cartController.addMedicineToCart
);

// Fetch the medicines present in given customer’s cart
routing.get(
  "/cart/medicines/customer/:customerId",
  cartController.getMedicinesInCart
);

// Update the quantity of medicine in customer’s cart
routing.put(
  "/cart/updatequantity/medicine/:medicineId/customer/:customerId",
  cartController.updateMedicineQuantityInCart
);

// Delete a specific medicine from customer’s cart
routing.delete(
  "/cart/delete-medicines/:medicineId/customer/:customerId",
  cartController.deleteMedicineFromCart
);

// Delete all medicines from customer’s cart
routing.delete(
  "/cart/delete-medicines/customer/:customerId",
  cartController.deleteAllMedicinesFromCart
);

// Handle invalid paths
routing.all("*", (req, res) => {
  res.status(404).json({
    status: "fail",
    message: "Invalid path",
  });
});

module.exports = routing;
