import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    // ref: "User",
    ref: "user",
    required: true
  },

  userName: { type: String },
  userEmail: { type: String },
  medicalStoreName: { type: String },
  city: { type: String },
  mobileNo: { type: String },
  gstin: { type: String },

  address: Object,

  products: [
    {
      productId: String,
      name: String,
      variant: {
        size: Number,   // 100, 150, 300
        unit: String,   // ml, gm, etc
        // price: Number   // variant price
        mrp: Number,
        rate: Number
      },

      // batchNo: {
      //   type: String,
      //   required: true
      // },

      // mfgDate: {                 // ✅ Manufacturing Date
      //   type: Date,
      //   required: true
      // },



      // expiryDate: {              // ✅ Expiry Date
      //   type: Date,
      //   required: true
      // },

      // batchNo: String,
      // mfgDate: Date,
      expiryDate: String,
      
      // price: Number,
      quantity: Number,
      total: Number,
      image: String,
    }
  ],

  // tax: {
  //   cgst: Number,
  //   sgst: Number,
  //   igst: Number
  // },

  grandTotal: Number,

  paymentMethod: String,
  orderStatus: {
    type: String,
    // default: "Pending",
    enum: [
      "Pending",
      "Assigned",
      "Picked",
      "Out for Delivery",
      "Delivered",
      "Cancelled"
    ],
    default: "Pending",
    index: true
  },

  deliveryBoyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "DeliveryBoy",
    default: null
  },

  deliveredAt: Date,

  // createdAt: {
  //   type: Date,
  //   default: Date.now
  // },

  // image: {
  //   type: String,
  //   required: true
  // },

  createdAt: {
    type: Date,
    default: Date.now
  },

  day: String,
  time: String
});

export default mongoose.model("Order", orderSchema);