const mongoose = require("mongoose");
const connectDB = require("../config/db.config");
const fs = require("fs");
const path = require("path");

// Schema
const customerSchema = new mongoose.Schema(
  {
    customerId: { type: Number, required: true, unique: true },
    customerName: { type: String, required: true },
    customerEmailId: { type: String, required: true, unique: true },
    contactNumber: { type: String, required: true },
    password: { type: String, required: true },
    gender: { type: String, required: true },
    dateOfBirth: { type: Date, required: true },
    addressList: [
      {
        addressName: { type: String, required: true },
        addressLine1: { type: String, required: true },
        addressLine2: { type: String, required: true },
        area: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        pincode: { type: String, required: true },
      },
    ],
    healthCoins: { type: Number, required: true, default: 0 },
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
dbModels.Customers = mongoose.model("Customers", customerSchema);

// Function to populate cart data
async function populateCustomer() {
  try {
    await connectDB();

    // Load initial data from the default.json file
    const defaultDataPath = path.join(__dirname, "./default.json");
    const rawData = fs.readFileSync(defaultDataPath, "utf-8");
    const { customers } = JSON.parse(rawData);

    await dbModels.Customers.deleteMany(); // Clear existing data
    await dbModels.Customers.create(customers); // Populate the database with initial data

    console.log("Customers created successfully");
  } catch (err) {
    console.error("Error populating customers:", err.message);
  }
}

populateCustomer();

module.exports = dbModels;
