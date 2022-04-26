const mongoose = require("mongoose");
const { Schema } = mongoose;

const farmSchema = Schema({
  //creating schema
  name: {
    type: String,
    required: [true, "Farm must have a name!"],
  },
  city: {
    type: String,
  },
  email: {
    type: String,
    required: [true, "Email required"],
  },
  products: [
    {
      type: Schema.Types.ObjectId,
      ref: "Product", //referencing our product model
    },
  ],
});

const Farm = model("Farm", farmSchema); //creating the actual model

module.exports = Farm; //exporting the model we have just created
