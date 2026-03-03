import Order from "../models/Order.js";
import mongoose from "mongoose";

export const placeOrder = async (req, res) => {
  try {
    const now = new Date();
    const BASE_URL = "http://192.168.29.234:4000";


    if (!req.body.address || !req.body.products || req.body.products.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Address and products are required",
      });
    }
    const DISCOUNT_PERCENT = 20;

    const calculateRate = (mrp) => {
      return Number((mrp - (mrp * DISCOUNT_PERCENT) / 100).toFixed(2));
    };

    let grandTotal = 0;

    const productsWithImages = req.body.products.map((p) => {
      const variant = p.variant || {};
      const mrp = variant.mrp || 0;
      // const quantity = p.quantity || 1;

      // if (!p.batchNo || !p.mfgDate || !p.expiryDate) {
      //   throw new Error("Batch No, MFG Date and Expiry Date are required");
      // }

      // const mfgDate = new Date(p.mfgDate);
      // const expiryDate = new Date(p.expiryDate);

      // if (isNaN(mfgDate.getTime()) || isNaN(expiryDate.getTime())) {
      //   throw new Error(`Invalid date format for ${p.name}`);
      // }

      // if (expiryDate <= mfgDate) {
      //   throw new Error(`Invalid expiry for ${p.name}`);
      // }

      // if (expiryDate <= new Date()) {
      //   throw new Error(`${p.name} is expired`);
      // }

      const rate = calculateRate(mrp);

      const quantity = Number(p.quantity) || 1;
      // const mrp = Number(p.variant?.mrp) || 0;
      // const rate = Number(p.variant?.rate) || mrp;
      const total = rate * p.quantity;

      grandTotal += total;
      return {
        productId: p.productId || "",
        name: p.name || "",
        variant: {
          size: p.variant?.size || "",
          unit: p.variant?.unit || "",
          // price: p.variant?.price
          mrp: mrp,
          rate: rate,
        },

        // batchNo: p.batchNo || "",
        // mfgDate: p.mfgDate ? new Date(p.mfgDate) : null,
        expiryDate: p.expiryDate || "-",
        // price: variant.price || p.price || 0,
        // quantity: p.quantity,
        quantity: quantity,
        // total: p.total,
        // total: (variant.price || p.price || 0) * p.quantity,
        total: total,
        image: p.image,
        // image: product.image, 
      }
    });

    const order = new Order({
      userId: req.user._id,
      // address: req.body.address,
      address: req.body.address[0],
      products: productsWithImages,
      tax: req.body.tax,
      // grandTotal: req.body.grandTotal,
      grandTotal: grandTotal,
      paymentMethod: req.body.paymentMethod,
      upiId: req.body.upiId || undefined,
      day: now.toLocaleDateString(),
      time: now.toLocaleTimeString(),
    });

    await order.save();

    return res.status(201).json({
      success: true,
      message: "Order placed successfully",
      orderId: order._id,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id }).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const cancelOrder = async (req, res) => {
  try {
    const orderId = req.params.id;
    const userId = req.user._id;

    const order = await Order.findOne({ _id: orderId, userId });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (order.orderStatus === "Cancelled") {
      return res.status(400).json({
        success: false,
        message: "Order already cancelled",
      });
    }

    order.orderStatus = "Cancelled";
    await order.save();

    return res.status(200).json({
      success: true,
      message: "Order cancelled successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// export const assignDeliveryBoy = async (req, res) => {
//   const { orderId, deliveryBoyId } = req.body;

//   const order = await Order.findByIdAndUpdate(
//     orderId,
//     {
//       deliveryBoyId,
//       orderStatus: "Assigned"
//     },
//     { new: true }
//   );

//   res.json(order);
// };

// export const assignOrder = async (req, res) => {
//   try {
//     const { orderId, deliveryBoyId } = req.body;

//     const order = await Order.findById(orderId);
//     if (!order)
//       return res.status(404).json({ message: "Order not found" });

//     order.deliveryBoyId = deliveryBoyId;
//     // order.deliveryBoyId = new mongoose.Types.ObjectId(deliveryBoyId);
//     order.orderStatus = "Assigned";

//     await order.save();

//     res.json({ message: "Order assigned successfully", order });

//   } catch (error) {
//     res.status(500).json({ message: "Server error" });
//   }
// };

export const assignOrder = async (req, res) => {
  try {
    const { orderId, deliveryBoyId } = req.body;

    // ✅ ID validation
    if (
      !mongoose.Types.ObjectId.isValid(orderId) ||
      !mongoose.Types.ObjectId.isValid(deliveryBoyId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid Order ID or Delivery Boy ID",
      });
    }

    // ✅ Order check
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // ❌ Cancelled order assign nahi hoga
    if (order.orderStatus === "Cancelled") {
      return res.status(400).json({
        success: false,
        message: "Cancelled order cannot be assigned",
      });
    }

    // ❌ Already assigned
    if (order.deliveryBoyId) {
      return res.status(400).json({
        success: false,
        message: "Order already assigned",
      });
    }

    // ✅ Assign
    order.deliveryBoyId = deliveryBoyId;
    order.orderStatus = "Assigned";

    await order.save();

    return res.status(200).json({
      success: true,
      message: "Order assigned successfully",
      order,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};