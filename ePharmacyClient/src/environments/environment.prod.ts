export const environment = {
    production: true,
  
    // URLs for microservices in local development
    customerMSUrl: 'http://localhost:3001/customer-api/',
    medicineMSUrl: 'http://localhost:3002/medicine-api/',
    cartMSUrl: 'http://localhost:3003/cart-api/',
    orderMSUrl: 'http://localhost:3004/order-api/',
    paymentMSUrl: 'http://localhost:3005/payment-api/',
  
    // Alternative gateway URLs for testing or different setups
    // customerMSUrl: 'http://localhost:8500/customer-api/',
    // medicineMSUrl: 'http://localhost:8500/medicine-api/',
    // cartMSUrl: 'http://localhost:8500/cart-api/',
    // orderMSUrl: 'http://localhost:8500/order-api/',
    // paymentMSUrl: 'http://localhost:8500/payment-api/',
  };
  