const dbModels = require("../models/order.model");
const helper = require("../utilities/helper");
const apiHelper = require("../utilities/api.helper");

exports.placeOrder = async (req, res) => {
  try {
    const { orderValue, customer, deliveryAddress, card } = req.body;

    // Verify customer existence
    const customerExists = await apiHelper.checkCustomer(customer.customerId);
    if (!customerExists) {
      return res
        .status(400)
        .json({ message: "Invalid customer ID. Please verify and try again." });
    }

    // Prepare card details for payment
    const cardDetails = {
      cardId: card.cardId,
      nameOnCard: card.nameOnCard,
      cardType: card.cardType,
      cvv: card.cvv,
      expiryDate: card.expiryDate,
      customerId: customer.customerId,
    };


    // Attempt to make the payment
    const paymentResult = await apiHelper.makePayment(cardDetails, orderValue);

    // Check if payment was successful
    if (!paymentResult || !paymentResult.paymentId) {
      console.error("Payment failed:", paymentResult); // Log payment failure details
      return res.status(400).json({
        message:
          paymentResult.message ||
          "Payment failed. Please check your card details and try again.",
      });
    }

    // Generate a unique order ID
    const orderId = await helper.getOrderId();

    // Create the order in the database
    const newOrder = await dbModels.Order.create({
      orderId: orderId,
      orderValueBeforeDiscount: orderValue,
      customer: customer,
      deliveryAddress: deliveryAddress,
      card: card, // Store card details as they are
    });

    // Respond with success message and order details
    return res.status(201).json({
      message: "Order placed successfully and payment processed.",
      data: newOrder,
    });
  } catch (error) {
    return res.status(500).json({
      message:
        "An error occurred while placing your order. Please try again later.",
      error: error.message,
    });
  }
};