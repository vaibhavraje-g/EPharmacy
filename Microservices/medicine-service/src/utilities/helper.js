const calculateDiscount = (expiryDate) => {
    const currentDate = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = Math.abs(expiry - currentDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
    if (diffDays <= 90) {
      return 30;
    } else if (diffDays <= 180) {
      return 20;
    } else {
      return 0;
    }
  };
  
  module.exports = { calculateDiscount };