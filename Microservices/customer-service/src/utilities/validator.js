exports.validateName = (name) => {
    // Name should only contain alphabets with a single space between words
    const nameRegex = /^[a-zA-Z]+(?: [a-zA-Z]+)*$/;
    return nameRegex.test(name.trim());
};

exports.validateEmail = (email) => {
    // Email should be valid with .com or .in domain
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com|in)$/;
    return emailRegex.test(email.trim());
};

exports.validateGender = (gender) => {
    // Gender can be male, female, or other
    const genderRegex = /^(male|female|other)$/i;
    return genderRegex.test(gender.trim());
};

exports.validateDOB = (dob) => {
    // Date of Birth validation - user should be above 18 years
    const birthDate = new Date(dob);
    const currentDate = new Date();
    const age = currentDate.getFullYear() - birthDate.getFullYear();
    const monthDifference = currentDate.getMonth() - birthDate.getMonth();
    const dayDifference = currentDate.getDate() - birthDate.getDate();

    // If current month is before birth month or birth day hasn't passed yet, subtract 1 from age
    if (monthDifference < 0 || (monthDifference === 0 && dayDifference < 0)) {
        return age - 1 >= 18;
    }
    return age >= 18;
};

exports.validateMobileNumber = (mobileNumber) => {
    // Mobile number should start with 6, 7, 8, or 9 and should be exactly 10 digits
    const mobileNumberRegex = /^[6-9]\d{9}$/;
    return mobileNumberRegex.test(mobileNumber.trim());
};

exports.validatePassword = (password) => {
    // Password should contain at least one uppercase, one lowercase, one digit, one special character
    // Length between 7 and 20 characters
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{7,20}$/;
    return passwordRegex.test(password.trim());
};

exports.validatePincode = (pincode) => {
    // Pincode should be exactly 6 digits
    const pincodeRegex = /^\d{6}$/;
    return pincodeRegex.test(pincode.trim());
};
