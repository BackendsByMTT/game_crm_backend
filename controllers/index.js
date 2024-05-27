const companyController = require("express").Router();
const { verifyToken } = require("../middleware/tokenAuth");
const {
  sendOtp,
  otpVerification,
  resetPassword,
} = require("../utils/company_reset_password");

companyController.post("/sendOtp", sendOtp);
companyController.post("/veryfyOtp", otpVerification);
companyController.post("/resetPassword", resetPassword);

module.exports = companyController;
