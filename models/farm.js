const mongoose = require("mongoose");
const Product = require("./product"); //bringing in products
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

//mongo middleware. NOT AT ALL RELATED TO EXPRESS MIDDLEWARE
//doing this to delete farm and all of its associated products
//we're running a .post because we get the information to delete afterwards
//findOneAndDelete will run regardless of whatever other 'find_andDelete' we run
// $in - is mongoose syntax
// https://www.udemy.com/course/the-web-developer-bootcamp/learn/lecture/22117222#questions
farmSchema.post("findOneAndDelete", async function (farm) {
  if (farm.products.length) {
    //making sure not an empty array of products
    const res = await Product.deleteMany({ _id: { $in: farm.products } });
    console.log(res);
  }
});

const Farm = mongoose.model("Farm", farmSchema); //creating the actual model

module.exports = Farm; //exporting the model we have just created
