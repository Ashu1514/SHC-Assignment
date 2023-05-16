const AWS = require("aws-sdk");
const jwt = require("jsonwebtoken");

// Create a new instance of AWS SNS
const sns = new AWS.SNS();

/**
 * Function to extract user information from a JWT token
 * @param {string} token - JWT token
 * @returns {object} - Decoded user information
 */
async function getUserFromToken(token) {
  const secret = process.env.JWT_SECRET;

  // Verify the JWT token and extract the user information
  const decoded = jwt.verify(token.replace("Bearer ", ""), secret);
  return decoded;
}

/**
 * Generates a random 6-digit OTP
 * @returns Randomly generated OTP
 */
const generateOTP = () => {
  const otpLength = 6;
  const otpDigits = "0123456789";
  let otp = "";

  for (let i = 0; i < otpLength; i++) {
    const randomIndex = Math.floor(Math.random() * otpDigits.length);
    otp += otpDigits[randomIndex];
  }

  return otp;
};

/**
 * Sends an SMS message to the specified phone number
 * @param {*} phone Phone number to send SMS message to
 * @param {*} text Text of the SMS message
 * @returns AWS SNS response object
 */
const sendSMS = async (phone, text) => {
  const params = {
    Message: text,
    PhoneNumber: `+91${phone}`,
    MessageAttributes: {
      "AWS.SNS.SMS.SenderID": {
        DataType: "String",
        StringValue: "MyApp",
      },
      "AWS.SNS.SMS.SMSType": {
        DataType: "String",
        StringValue: "Transactional",
      },
    },
  };
  const data = await sns.publish(params).promise();
  return data;
};

/**
 * Generates a JWT token signed with the server's secret
 * @param {*} data Data to include in the JWT token
 * @returns Signed JWT token
 */
const signToken = async (data) => {
  console.log(data);
  const secret = process.env.JWT_SECRET;

  // Sign the token with the server's secret and return it
  return await jwt.sign(data, secret, {expiresIn: "15m"});
};

// Export the helper functions
module.exports = {
  getUserFromToken,
  generateOTP,
  sendSMS,
  signToken,
};
