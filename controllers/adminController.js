import Order from "../models/Order.js";

export const assignOrder = async (req, res) => {
  const { orderId, deliveryBoyId } = req.body;

  const order = await Order.findById(orderId);
  if (!order) return res.status(404).json({ message: "Order not found" });

  order.deliveryBoy = deliveryBoyId;
  order.status = "Assigned";
  await order.save();

  res.json({ message: "Order assigned successfully" });
};
