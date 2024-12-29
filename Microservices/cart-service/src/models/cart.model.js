const mongoose = require("mongoose");
const connectDB = require("../config/db.config");
const fs = require("fs");
const path = require("path");

// Schema
const cartSchema = new mongoose.Schema(
  {
    customer: {
      customerId: { type: Number, required: true, unique: true },
    },
    cartItems: [
      {
        medicineId: { type: Number, required: true },
        medicineName: { type: String, required: false },
        quantity: { type: Number, required: false },
      },
    ],
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
dbModels.Cart = mongoose.model("Cart", cartSchema);

// Function to populate cart data
async function populateCarts() {
  try {
    await connectDB();

    // Load initial data from the default.json file
    const defaultDataPath = path.join(__dirname, "./default.json");
    const rawData = fs.readFileSync(defaultDataPath, "utf-8");
    const { carts } = JSON.parse(rawData);

    await dbModels.Cart.deleteMany(); // Clear existing data
    await dbModels.Cart.create(carts); // Populate the database with initial data

    console.log("Carts created successfully");
  } catch (err) {
    console.error("Error populating carts:", err.message);
  }
}

populateCarts();

module.exports = dbModels;
