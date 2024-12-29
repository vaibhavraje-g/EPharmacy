const dbModels = require("../models/cart.model");
const helper = require("../utilities/helper");
const apiHelper = require("../utilities/api.helper");

// Add medicine to cart
exports.addMedicineToCart = async (req, res, next) => {
  try {
    const { medicineId, customerId } = req.params;
    const quantity = req.body.quantity;

    // Validate inputs
    if (!medicineId || !customerId || !quantity || quantity <= 0) {
      return res.status(400).json({
        status: "fail",
        message: "Invalid medicineId/customerId/quantity",
      });
    }

    // Check if medicine exists
    const medicineExists = await apiHelper.checkMedicine(medicineId);
    if (!medicineExists) {
      return res.status(404).json({
        status: "fail",
        message: "Medicine not found",
      });
    }

    // Check if customer exists
    const customerExists = await apiHelper.checkCustomer(customerId);
    if (!customerExists) {
      return res.status(404).json({
        status: "fail",
        message: "Customer not found",
      });
    }

    // Find or create cart
    let cart = await dbModels.Cart.findOne({
      "customer.customerId": customerId,
    });
    if (!cart) {
      cart = new dbModels.Cart({
        customer: { customerId: customerId },
        cartItems: [],
      });
    }

    // Add or update medicine in cart
    const existingItem = cart.cartItems.find(
      (item) => item.medicineId === parseInt(medicineId)
    );

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.cartItems.push({ medicineId: parseInt(medicineId), quantity });
    }

    // Save cart
    await cart.save();

    res.status(200).json({
      status: "success",
      message: "Medicine added to cart successfully",
    });
  } catch (error) {
    console.error("Error in addMedicineToCart:", error.message);
    next(error);
  }
};

// Get medicines in cart
exports.getMedicinesInCart = async (req, res, next) => {
  try {
    const { customerId } = req.params;

    // Validate input
    if (!customerId) {
      return res.status(400).json({
        status: "fail",
        message: "Invalid customerId",
      });
    }

    // Fetch cart
    const cart = await dbModels.Cart.findOne({
      "customer.customerId": parseInt(customerId),
    });

    if (!cart || cart.cartItems.length === 0) {
      return res.status(400).json({
        status: "fail",
        message: "No medicine found in the customer’s cart",
      });
    }

    res.status(200).json({
      status: "success",
      message: "Fetched medicines in cart successfully",
      data: cart.cartItems,
    });
  } catch (error) {
    console.error("Error in getMedicinesInCart:", error.message);
    next(error);
  }
};

// Update medicine quantity in cart
exports.updateMedicineQuantityInCart = async (req, res, next) => {
  try {
    const { medicineId, customerId } = req.params;
    const quantity = req.body.quantity;

    // Validate inputs
    if (!medicineId || !customerId || !quantity || quantity <= 0) {
      return res.status(400).json({
        status: "fail",
        message: "Invalid medicineId/customerId/quantity",
      });
    }

    // Fetch cart
    const cart = await dbModels.Cart.findOne({
      "customer.customerId": customerId,
    });

    if (!cart) {
      return res.status(404).json({
        status: "fail",
        message: "Cart not found",
      });
    }

    // Update medicine quantity
    const existingItem = cart.cartItems.find(
      (item) => item.medicineId === parseInt(medicineId)
    );

    if (!existingItem) {
      return res.status(404).json({
        status: "fail",
        message: "Medicine not found in cart",
      });
    }

    existingItem.quantity = quantity;
    await cart.save();

    res.status(200).json({
      status: "success",
      message: "Medicine quantity updated in cart successfully",
    });
  } catch (error) {
    console.error("Error in updateMedicineQuantityInCart:", error.message);
    next(error);
  }
};

// Delete medicine from cart
exports.deleteMedicineFromCart = async (req, res, next) => {
  try {
    const { medicineId, customerId } = req.params;

    // Validate inputs
    if (!medicineId || !customerId) {
      return res.status(400).json({
        status: "fail",
        message: "Invalid medicineId/customerId",
      });
    }

    // Fetch cart
    const cart = await dbModels.Cart.findOne({
      "customer.customerId": parseInt(customerId),
    });

    if (!cart) {
      return res.status(404).json({
        status: "fail",
        message: "Cart not found",
      });
    }

    // Remove medicine from cart
    const medicineIndex = cart.cartItems.findIndex(
      (item) => item.medicineId === parseInt(medicineId)
    );

    if (medicineIndex === -1) {
      return res.status(404).json({
        status: "fail",
        message: "Medicine not found in cart",
      });
    }

    cart.cartItems.splice(medicineIndex, 1);
    await cart.save();

    res.status(200).json({
      status: "success",
      message: "Medicine deleted from cart successfully",
    });
  } catch (error) {
    console.error("Error in deleteMedicineFromCart:", error.message);
    next(error);
  }
};

// Delete all medicines from cart
exports.deleteAllMedicinesFromCart = async (req, res, next) => {
  try {
    const { customerId } = req.params;

    // Validate input
    if (!customerId) {
      return res.status(400).json({
        status: "fail",
        message: "Invalid customerId",
      });
    }

    // Fetch cart
    const cart = await dbModels.Cart.findOne({
      "customer.customerId": parseInt(customerId),
    });

    if (!cart) {
      return res.status(404).json({
        status: "fail",
        message: "Cart not found",
      });
    }

    // Clear cart
    cart.cartItems = [];
    await cart.save();

    res.status(200).json({
      status: "success",
      message: "All medicines deleted from cart successfully",
    });
  } catch (error) {
    console.error("Error in deleteAllMedicinesFromCart:", error.message);
    next(error);
  }
};
