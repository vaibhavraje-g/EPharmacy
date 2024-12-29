const axios = require("axios");
const consul = require("consul")();

let customerPort;
let customerHost = "";
const customerServiceId = "customer-service";

let paymentPort;
let paymentHost = "";
const paymentServiceId = "payments-service";

// Consul method to fetch customer service host and port
consul.health.service(
  {
    service: customerServiceId,
    passing: true,
  },
  (err, result) => {
    if (err) {
      console.error(
        `Error retrieving service information for ${customerServiceId}: ${err}`
      );
      return;
    }

    if (result.length === 0) {
      console.error(`No service instances found for ${customerServiceId}`);
      return;
    }

    const instance = result[0];
    customerHost = instance.Service.Address;
    customerPort = instance.Service.Port;

    console.log(
      `Customer Service - Host: ${customerHost}, Port: ${customerPort}`
    );
  }
);

// Consul method to fetch payment service host and port
consul.health.service(
  {
    service: paymentServiceId,
    passing: true,
  },
  (err, result) => {
    if (err) {
      console.error(
        `Error retrieving service information for ${paymentServiceId}: ${err}`
      );
      return;
    }

    if (result.length === 0) {
      console.error(`No service instances found for ${paymentServiceId}`);
      return;
    }

    const instance = result[0];
    paymentHost = instance.Service.Address;
    paymentPort = instance.Service.Port;

    console.log(`payment Service - Host: ${paymentHost}, Port: ${paymentPort}`);
  }
);

// Watch for changes in customer service
const customerWatcher = consul.watch({
  method: consul.health.service,
  options: {
    service: customerServiceId,
    passing: true,
  },
});

// Watch for changes in payment service
const paymentWatcher = consul.watch({
  method: consul.health.service,
  options: {
    service: paymentServiceId,
    passing: true,
  },
});

const checkCustomer = async (customerId) => {
  try {
    const response = await axios.get(
     ` http://${customerHost}:${customerPort}/customer-api/customer/${customerId}`
    );
    return response.status === 200;
  } catch (error) {
    console.log(error);
    return false;
  }
};

const makePayment = async (cardDetails, amountToPay) => {
  try {
    // Prepare the request body with card details
    const paymentPayload = {
      cardId: cardDetails.cardId,
      nameOnCard: cardDetails.nameOnCard,
      cardType: cardDetails.cardType,
      cvv: cardDetails.cvv,
      expiryDate: cardDetails.expiryDate, // Ensure it's in a valid LocalDate format
      customerId: cardDetails.customerId,
    };

    // Send the POST request to the payment service
    const response = await axios.post(
      `http://${paymentHost}:${paymentPort}/payment-api/payment/amount/${amountToPay}`,
      paymentPayload
    );

    // Log the full response for debugging (optional, you can remove after verifying)
    console.log('Payment API Response:', response.data);

    // Check if the payment was successful
    if (response.status === 201 || response.status === 200) {
      const payment = response.data.data || {}; // Safely access response data

      if (payment.paymentStatus === "Completed") {
        return {
          success: true,
          paymentId: payment._id, // Returning the payment ID
          message: "Payment processed successfully.",
        };
      } else {
        return {
          success: false,
          message: payment.message || "Payment failed. Please try again later.",
        };
      }
    } else {
      // Handle unexpected status codes with a custom error message
      console.error('Unexpected status code:', response.status);
      return {
        success: false,
        message: response.data.message || "Failed to process payment. Please check your payment details.",
      };
    }
  } catch (error) {
    // Log the full error for debugging
    console.error('Payment error:', error);

    // Check if error response is available
    const errorMessage = error.response ? error.response.data.message : error.message;

    return {
      success: false,
      message: errorMessage || "An error occurred while processing the payment. Please try again later.",
    };
  }
};



const refundPayment = async (paymentId, orderId) => {};

module.exports = { checkCustomer, makePayment };