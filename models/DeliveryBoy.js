// import mongoose from "mongoose";

// const deliveryBoySchema = new mongoose.Schema({
//   name: {
//     type: String,
//     required: true
//   },

//   mobile: {
//     type: String,
//     required: true,
//     unique: true
//   },

//   password: {
//     type: String,
//     required: true
//   },

//   isActive: {
//     type: Boolean,
//     default: true
//   },

//   createdAt: {
//     type: Date,
//     default: Date.now
//   }
// });

// const DeliveryBoy = mongoose.model("DeliveryBoy", deliveryBoySchema);

// export { DeliveryBoy };

import mongoose from "mongoose";
import bcrypt from "bcrypt";

const deliveryBoySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },

  mobile: {
    type: String,
    required: true,
    unique: true,
    sparse: true
  },

  email: {
    type: String,
    unique: true,
    // required: true,
    sparse: true
  },

  password: {
    type: String,
    required: true
  },

  resetPasswordToken: {
  type: String
},

resetPasswordExpire: {
  type: Date
},

  isActive: {
    type: Boolean,
    default: true
  },

  role: {
    type: String,
    default: "delivery"
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

// deliveryBoySchema.pre("save", async function (next) {
//   if (!this.isModified("password")) return next();
//   this.password = await bcrypt.hash(this.password, 10);
//   next();
// });

// deliveryBoySchema.pre("save", async function (next) {
//   if (!this.isModified("password")) return next();

//   this.password = await bcrypt.hash(this.password, 10);
//   next();
// });

deliveryBoySchema.pre("save", async function () {

  if (!this.isModified("password")) return;

  const hash = await bcrypt.hash(this.password, 10);
  this.password = hash;

});

export const DeliveryBoy = mongoose.model(
  "DeliveryBoy",
  deliveryBoySchema
);