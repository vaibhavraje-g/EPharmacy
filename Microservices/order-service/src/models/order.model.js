const mongoose = require("mongoose");
const connectDB = require("../config/db.config");
const fs = require("fs");
const path = require("path");

// Schema
const orderSchema = new mongoose.Schema(
  {
    orderId: { type: Number, required: true, unique: true },
    orderValueBeforeDiscount: { type: Number, required: true },
    customer: {
      customerId: { type: Number, required: true },
    },
    deliveryAddress: {
      addressId: { type: String, required: true },
    },
    card: {
      cardId: { type: String, required: true },
      cvv: { type: String, required: true },
      customerId: { type: Number, required: true },
    },
  },
  {
    timestamps: {
      createdAt: true,
      updatedAt: true,
    },
  }
);

// Models
const dbModels = {};
dbModels.Order = mongoose.model("Order", orderSchema);

// Function to populate order data
async function populateOrders() {
  try {
    await connectDB();

    // Load initial data from the default.json file
    const defaultDataPath = path.join(__dirname, "./default.json");
    const rawData = fs.readFileSync(defaultDataPath, "utf-8");
    const { orders } = JSON.parse(rawData);

    await dbModels.Order.deleteMany(); // Clear existing data
    await dbModels.Order.create(orders); // Populate the database with initial data

    console.log("Orders created successfully");
  } catch (err) {
    console.error("Error populating orders:", err.message);
  }
}

populateOrders();

module.exports = dbModels;
