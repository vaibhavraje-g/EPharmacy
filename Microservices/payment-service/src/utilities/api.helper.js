const axios = require("axios");
const consul = require("consul")();

let customerPort;
let customerHost = "";
const customerServiceId = "customer-service";

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

// Watch for changes in customer service
const customerWatcher = consul.watch({
  method: consul.health.service,
  options: {
    service: customerServiceId,
    passing: true,
  },
});

const checkCustomer = async (customerId) => {
  try {
    const response = await axios.get(
      `http://${customerHost}:${customerPort}/customer-api/customer/${customerId}`
    );
    return response.status === 200;
  } catch (error) {
    console.log(error);
    return false;
  }
};

const makePayment = async (paymentId, quantity) => {
  try {
    const response = await axios.get(
      `http://${paymentHost}:${paymentPort}/payment-api/payments/${paymentId}`
    );
    if (response.status === 200) {
      const payment = response.data.data;
      if (payment.quantity < quantity) {
        return false;
      }
    }
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};

const refundPayment = async (paymentId, orderId) => {};

module.exports = { checkCustomer, makePayment };
