const mongoose = require("mongoose");
//I am not destructuring { Schema } = mongoose on purpose as a reminder to what this looks like without it vs farm.js

const productSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, "name cannot be blank"],
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  category: {
    type: String,
    enum: ["fruit", "vegetable", "dairy"],
  },
  farm: {
    type: Schema.Types.ObjectId,
    ref: "Farm", //referencing our farm model
  },
});

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
