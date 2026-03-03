import dotenv from "dotenv";
dotenv.config();

import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // 16-digit App Password
  },
  tls: {
    rejectUnauthorized: false   // 🔥 THIS FIXES YOUR ERROR
  }
});

export default transporter;