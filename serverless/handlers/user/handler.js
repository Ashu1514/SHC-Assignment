"use strict";
const connectToDatabase = require("../../utility/db");
const OTP = require("../../models/Otp");
const User = require("../../models/User");
const returnError = require("../../utility/error");
const {
  generateOTP,
  sendSMS,
  signToken,
  getUserFromToken,
} = require("../../utility/utils");

module.exports.signUp = async (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;

  // Extracting data from the request body
  const { name, email, phone, password } = JSON.parse(event.body);
  const userObj = new User({
    phone,
    name,
    email,
    password,
  });

  const otp = generateOTP();
  const optObj = new OTP({
    otp,
  });

  try {
    await connectToDatabase();
    // Checking if the user already exists
    const userExisted = await User.findOne({ email });

    if (userExisted) {
      callback(null, {
        headers: {
          "Content-Type": "application/json",
        },
        statusCode: 501,
        body: JSON.stringify({
          message: "User already existed!",
          success: false,
        }),
      });
      return; // Return early if the user already exists
    }

    // Create a new user and OTP entry
    const user = await User.create(userObj);
    optObj.user_id = String(user._id);
    const opt = await OTP.create(optObj);

    // Sending OTP via SMS
    const sms = await sendSMS(
      phone,
      `Your one-time password (OTP) is ${optObj.otp} and will expire in 2 minutes.`
    );

    // Modifying user data for response
    const userData = user._doc;
    userData.id = String(userData._id);
    delete userData._id;

    // Generating and signing the authentication token
    const token = await signToken({ ...userData });

    // Constructing the response
    const data = {token, success: true };
    callback(null, {
      headers: {
        "Content-Type": "application/json",
      },
      statusCode: 201,
      body: JSON.stringify(data),
    });
  } catch (error) {
    returnError(error, callback);
  }
};

module.exports.signIn = async (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;
  // Extracting data from the request body
  const { email, password } = JSON.parse(event.body);
  try {
    await connectToDatabase();
    // Finding the user based on email and password
    const userDetails = await User.findOne({ email, password });

    if (!userDetails) {
      callback(null, {
        headers: {
          "Content-Type": "application/json",
        },
        statusCode: 501,
        body: JSON.stringify({ message: "User not found!", success: false }),
      });
      return; // Return early if the user is not found
    }
    // Modifying user data for response
    const userData = { ...userDetails._doc };
    userData.id = String(userData._id);
    delete userData._id;

    // Generating and signing the authentication token
    const token = await signToken(userData);

    // Constructing the response
    const data = { userDetails, token, success: true };
    callback(null, {
      headers: {
        "Content-Type": "application/json",
      },
      statusCode: 201,
      body: JSON.stringify(data),
    });
  } catch (error) {
    returnError(error, callback);
  }
};

module.exports.verifyPhone = async (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;
  // Extracting data from the request body
  const { otp } = JSON.parse(event.body);

  try {
    const decoded = await getUserFromToken(event.headers.Authorization);
    await connectToDatabase();

    // Finding the user by decoded ID
    const user = await User.findById(decoded.id);

    // Finding the latest OTP for the user
    const otpObject = await OTP.findOne({ user_id: decoded.id, otp })
      .sort({ createdAt: -1 })
      .exec();

    if (!otpObject) {
      callback(null, {
        headers: {
          "Content-Type": "application/json",
        },
        statusCode: 501,
        body: JSON.stringify({ success: false, message: "Invalid OTP" }),
      });
      return; // Return early if OTP is invalid
    }

    // Checking OTP expiration
    const currentTime = new Date();
    const timeDifference = currentTime - otpObject.createdAt;
    const timeLimit = 2 * 60 * 1000; // 2 minutes in milliseconds

    if (timeDifference > timeLimit) {
      callback(null, {
        headers: {
          "Content-Type": "application/json",
        },
        statusCode: 501,
        body: JSON.stringify({ success: false, message: "OTP has expired" }),
      });
      return; // Return early if OTP has expired
    }

    // Update user verification status and delete OTP
    await User.findByIdAndUpdate(user._id, { isVerified: true });
    await OTP.findByIdAndDelete(otpObject._id);

    // Constructing the response
    callback(null, {
      headers: {
        "Content-Type": "application/json",
      },
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: "OTP validated successfully",
        user,
      }),
    });
  } catch (error) {
    returnError(error, callback);
  }
};
