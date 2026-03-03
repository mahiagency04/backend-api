// import { DeliveryBoy } from "../models/DeliveryBoy.js";
// import Order from "../models/Order.js";
// import bcrypt from "bcrypt";

// export const deliveryLogin = async (req, res) => {
//   try {
//     const { mobile, password } = req.body;

//     const boy = await DeliveryBoy.findOne({ mobile });
//     if (!boy) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     const match = await bcrypt.compare(password, boy.password);
//     if (!match) {
//       return res.status(401).json({ message: "Wrong password" });
//     }

//     res.status(200).json({
//       message: "Login success",
//       deliveryBoy: boy
//     });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// export const getAssignedOrders = async (req, res) => {
//   try {
//     const orders = await Order.find({
//       deliveryBoyId: req.params.deliveryBoyId
//     });

//     res.status(200).json(orders);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// export const updateOrderStatus = async (req, res) => {
//   try {
//     const { status } = req.body;

//     const order = await Order.findByIdAndUpdate(
//       req.params.orderId,
//       {
//         orderStatus: status,
//         deliveredAt: status === "Delivered" ? new Date() : null
//       },
//       { new: true }
//     );

//     res.status(200).json(order);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { DeliveryBoy } from "../models/DeliveryBoy.js";
import Order from "../models/Order.js";
import mongoose from "mongoose";
import crypto from "crypto";
import transporter from "../config/emailConfig.js";



// export const createDeliveryBoy = async (req, res) => {
//   try {
//     const { name, mobile, password } = req.body;

//     const exists = await DeliveryBoy.findOne({ mobile });
//     if (exists) {
//       return res.status(400).json({ message: "Mobile already registered" });
//     }


//     const newDeliveryBoy = new DeliveryBoy({
//       name,
//       mobile,
//       password
//     });

//     await newDeliveryBoy.save();
//     res.status(201).json({ message: "Delivery Boy created successfully" });
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ message: "Server Error" });
//   }
// };

export const createDeliveryBoy = async (req, res) => {
  try {
    const { name, mobile, email, password } = req.body;

    if (!mobile && !email) {
      return res.status(400).json({
        message: "Mobile or Email required"
      });
    }

    const exists = await DeliveryBoy.findOne({
      $or: [{ mobile }, { email }]
    });

    if (exists) {
      return res
        .status(400)
        .json({ message: "Mobile or Email already registered" });
    }

    const newDeliveryBoy = new DeliveryBoy({
      name,
      mobile,
      email,
      password
    });

    await newDeliveryBoy.save();

    res.status(201).json({
      message: "Delivery boy created successfully"
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};

// export const deliveryLogin = async (req, res) => {
//   const { mobile, password } = req.body;

//   const deliveryBoy = await DeliveryBoy.findOne({ mobile });
//   if (!deliveryBoy)
//     return res.status(404).json({ message: "Delivery boy not found" });

//   if (!deliveryBoy.isActive)
//     return res.status(403).json({ message: "Account disabled" });

//   const isMatch = await bcrypt.compare(password, deliveryBoy.password);
//   if (!isMatch)
//     return res.status(401).json({ message: "Wrong password" });

//   const token = jwt.sign(
//     { id: deliveryBoy._id, role: "delivery" },
//     process.env.JWT_SECRET_KEY,
//     { expiresIn: "7d" }
//   );

//   res.json({
//     token,
//     deliveryBoy: {
//       id: deliveryBoy._id,
//       name: deliveryBoy.name,
//       mobile: deliveryBoy.mobile
//     }
//   });
// };

export const deliveryLogin = async (req, res) => {
  const { mobile, email, password } = req.body;

  if (!mobile && !email) {
    return res.status(400).json({
      message: "Mobile or Email required"
    });
  }

  const deliveryBoy = await DeliveryBoy.findOne({
    $or: [{ mobile }, { email }]
  });

  if (!deliveryBoy)
    return res.status(404).json({
      message: "Delivery boy not found"
    });

  if (!deliveryBoy.isActive)
    return res.status(403).json({
      message: "Account disabled"
    });

  const isMatch = await bcrypt.compare(
    password,
    deliveryBoy.password
  );

  if (!isMatch)
    return res.status(401).json({
      message: "Wrong password"
    });

  const token = jwt.sign(
    { id: deliveryBoy._id, role: "delivery" },
    process.env.JWT_SECRET_KEY,
    { expiresIn: "7d" }
  );

  res.json({
    token,
    deliveryBoy: {
      id: deliveryBoy._id,
      name: deliveryBoy.name,
      mobile: deliveryBoy.mobile,
      email: deliveryBoy.email
    }
  });
};

export const deliveryLogout = async (req, res) => {
  res.status(200).json({
    message: "Delivery boy logged out successfully"
  });
};

// export const getAssignedOrders = async (req, res) => {
//   const orders = await Order.find({
//      deliveryBoyId: req.deliveryBoyId,
//     orderStatus: { $ne: "Delivered" }
//   }).populate("userId", "userName mobileNo");

//   res.json(orders);
// };

// export const getAssignedOrders = async (req, res) => {

//   const orders = await Order.find({
//     deliveryBoyId: req.deliveryBoyId,
//     orderStatus: { $ne: "Delivered" }
//   })
//     .populate(
//       "userId",
//       "name Medical_Store_Name Mobile_NO Email GSTIN City addresses"
//     )
//     .populate(
//       "products.product",
//       "name image price"
//     );

//   res.status(200).json({
//     message: "Assigned orders fetched successfully",
//     totalOrders: orders.length,
//     orders
//   });
// };

export const getAssignedOrders = async (req, res) => {

  const orders = await Order.find({
    deliveryBoyId: req.deliveryBoyId,
    orderStatus: { $ne: "Delivered" }
  })
  .populate(
    "userId",
    "name Medical_Store_Name Mobile_NO Email GSTIN City addresses"
  );

  res.status(200).json(orders);
};



// export const updateOrderStatus = async (req, res) => {
//   const { orderId } = req.params;
//   const { status } = req.body;

//   const allowedStatus = [
//     "Picked",
//     "Out for Delivery",
//     "Delivered",
//     "Cancelled"
//   ];

//   if (!allowedStatus.includes(status))
//     return res.status(400).json({ message: "Invalid status" });

//   const order = await Order.findOne({
//     _id: orderId,
//     deliveryBoyId: req.deliveryBoyId // <-- schema field
//   });

//   if (!order)
//     return res.status(404).json({ message: "Order not found" });

//   order.orderStatus = status; // <-- schema field
//   await order.save();

//   res.json({ message: "Status updated", order });
// };

export const updateOrderStatus = async (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body;

  const allowedStatus = [
    "Picked",
    "Out for Delivery",
    "Delivered",
    "Cancelled"
  ];

  if (!allowedStatus.includes(status))
    return res.status(400).json({ message: "Invalid status" });

  const order = await Order.findOne({
    _id: orderId,
    deliveryBoyId: req.deliveryBoyId
  });

  if (!order)
    return res.status(404).json({ message: "Order not found" });

  order.orderStatus = status;

  if (status === "Delivered") {
    order.deliveredAt = new Date();
  }

  await order.save();

  res.json({ message: "Status updated", order });
};

export const forgotPassword = async (req, res) => {

  const { email } = req.body;

  const user = await DeliveryBoy.findOne({ email });

  if (!user)
    return res.status(404).json({
      message: "Email not registered"
    });

  // token generate
  const resetToken = crypto.randomBytes(32).toString("hex");

  user.resetPasswordToken = resetToken;
  user.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 min

  await user.save();

//   const resetLink = `
// http://localhost:5173/reset-password/${resetToken}
// `;

    const resetLink = `http://192.168.29.234:5173/reset-password/${resetToken}`;


  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: user.email,
    subject: "Reset Your Password",
    html: `
      <h3>Password Reset</h3>
      <p>Click link below to reset password</p>
      <a href="${resetLink}">
        Reset Password
      </a>
      <p>Valid for 15 minutes</p>
    `
  });

  res.json({
    message: "Password reset link sent to email"
  });
};

export const resetPassword = async (req, res) => {

  const { token } = req.params;
  const { newPassword, confirmPassword } = req.body;

  if (!newPassword || !confirmPassword) {
    return res.status(400).json({
      message: "Both passwords are required"
    });
  }

  if (newPassword !== confirmPassword) {
    return res.status(400).json({
      message: "Passwords do not match"
    });
  }

  const user = await DeliveryBoy.findOne({
    resetPasswordToken: token,
    resetPasswordExpire: { $gt: Date.now() }
  });

  if (!user) {
    return res.status(400).json({
      message: "Token expired or invalid"
    });
  }

  user.password = newPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  res.status(200).json({
    message: "Password reset successfully"
  });
};
