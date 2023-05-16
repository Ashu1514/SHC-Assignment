const mongoose = require("mongoose");

// Define the OTP schema
const OtpSchema = new mongoose.Schema(
  {
    user_id: {
      type: String,
      required: true,
    },
    otp: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

// Create and export the OTP model
module.exports = mongoose.model("Otp", OtpSchema);
