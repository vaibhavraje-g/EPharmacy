const express = require("express");
const medicineController = require("../controllers/medicine.controller");

const routing = express.Router();

// Route to get medicines with pagination
routing.get("/medicines/pageNumber/:pageNumber/pageSize/:pageSize", medicineController.getMedicinesByPage);

// Route to get a specific medicine by its ID
routing.get("/medicines/:medicineId", medicineController.getMedicineById);

// Route to get medicines by category
routing.get("/medicines/category/:category", medicineController.getMedicinesByCategory);

// Route to update stock of a specific medicine
routing.put("/medicines/update-stock/medicine/:medicineId", medicineController.updateStock);

// Handle invalid paths
routing.all("*", (req, res) => {
  res.status(404).json({
    status: "fail",
    message: "Invalid path",
  });
});

module.exports = routing;