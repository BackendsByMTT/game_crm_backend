const express = require('express');
const nodemailer = require('nodemailer');
const Company = require('../models/userSchema');
const { use } = require('../routes');

require('dotenv').config();

const app = express();
app.use(express.json());

// Dummy user data (you would fetch this from your database)
const users = [
  { id: 1, email: 'user@example.com', password: 'userpassword' },
  // Add more users as needed
];

// Store the generated OTPs temporarily (you may use a database in a real application)
const otpStore = {};


// Route to send OTP to user's email
const sendOtp = async (req, res) => {
  const user =await Company.findOne({userName:req.body.userName})
  if(!user)
     return res.status(201).json({error:"Company Not Found"})
  if(user.email!== req.body.email)
      return res.status(201).json({error:"Wrong Credentials"})
  // Generate OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore[user.email] = otp;

  // Create reusable transporter object using the default SMTP transport
  const transporter = nodemailer.createTransport({    
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
  // Email options
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: user.email,
    subject: 'Password Reset OTP',
    text: `Your OTP for password reset is: ${otp}`,
  };

  // Send email
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
      return res.status(500).json({ error: 'Failed to send OTP' });
    } else {
      console.log('Email sent: ' + info.response);
      return res.status(200).json({ message: 'OTP sent successfully' });
    }
  });
};

// Route to reset password using OTP
const otpVerification = async (req, res) => {
  console.log("rees",req.body)

   const { email, otp } = req.body;

  if (otp !== otpStore[email]) {
    return res.status(201).json({ error: 'Invalid OTP' });
  }else{
    return res.status(200).json({message:"OTP succesfully verified"})
  }

}

const resetPassword =async (req,res)=>{

  const updatedComapnyPassword = await Company.findOneAndUpdate({userName:req.body.userName},{
    password:req.body.newPassword,
   },{new:true})
  // Remove the OTP from the store as it is no longer needed
  delete otpStore[req.body.email];

  return res.status(200).json({ message: 'Password reset successfully' });
};

module.exports={resetPassword,sendOtp,otpVerification}