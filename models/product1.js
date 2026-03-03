const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  productId: {
    type: String,
    required: true,
    unique: true
  },

  name: String,
  image: String,
  description: String,
  slug: String,

  // unit-wise pricing
  units: {
    tablets: {
      price: Number,   // price per tablet
      enabled: Boolean
    },
    ml: {
      price: Number,   // price per ml
      enabled: Boolean
    },
    kg: {
      price: Number,   // price per kg
      enabled: Boolean
    }
  }
});

module.exports = mongoose.model("Product", productSchema);
