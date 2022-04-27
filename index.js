const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const AppError = require("./AppError");

const Product = require("./models/product");
const Farm = require("./models/farm");
const { findByIdAndDelete } = require("./models/product");
const req = require("express/lib/request");

mongoose
  .connect("mongodb://localhost:27017/farmStand", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("MONGO Connection Open!");
  })
  .catch((err) => {
    console.log("Oh No! MONGO connection Error!");
    console.log(err);
  });

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

//Farm Routes

app.get("/farms", async (req, res) => {
  const farms = await Farm.find({});
  res.render("farms/index", { farms });
});

app.get("/farms/new", (req, res) => {
  res.render("farms/new");
});

app.get("/farms/:id", async (req, res) => {
  //.populate will show us the products related to the farm and 'products' is the same name as in the farm model
  const farm = await Farm.findById(req.params.id).populate("products");
  console.log(farm);
  res.render("farms/show", { farm });
});

app.delete("/farms/:id", async (req, res) => {
  const farm = await Farm.findByIdAndDelete(req.params.id);
  res.redirect("/farms");
});

app.post("/farms", async (req, res) => {
  const farm = new Farm(req.body);
  await farm.save();
  res.redirect("/farms");
});

app.get("/farms/:id/products/new", async (req, res) => {
  const { id } = req.params;
  const farm = await Farm.findById(id);
  res.render("products/new", { categories, farm }); //this is passing in categories into our products/new (check the page) which are the categories located in the Product Routes (below)
  //this is necessary to display the form correctly
});

app.post("/farms/:id/products", async (req, res) => {
  const { id } = req.params;
  const farm = await Farm.findById(id);
  const { name, price, category } = req.body;
  const product = new Product({ name, price, category });
  farm.products.push(product); //ACTUAL CRUCIAL PART TO THIS!
  // this is pushing the product id because of our farmSchema. We're pushing that product we just created into the farm.
  product.farm = farm; // = the farm we just found and this is tying the two things together
  await farm.save();
  await product.save();
  res.redirect(`/farms/${id}`);
});

//Product Routes
const categories = ["fruit", "vegetable", "dairy"];

function wrapAsync(fn) {
  return function (req, res, next) {
    fn(req, res, next).catch((e) => next(e));
  };
}

app.get(
  "/products",
  wrapAsync(async (req, res, next) => {
    const { category } = req.query;
    if (category) {
      const products = await Product.find({ category });
      res.render("products/index", { products, category });
    } else {
      const products = await Product.find({});
      res.render("products/index", { products, category: "All" });
    }
  })
);

app.get("/products/new", (req, res) => {
  res.render("products/new", { categories });
});

app.post(
  "/products",
  wrapAsync(async (req, res, next) => {
    const newProduct = new Product(req.body);
    await newProduct.save();
    console.log(newProduct);
    res.redirect(`/products/${newProduct._id}`);
  })
);

app.get(
  "/products/:id",
  wrapAsync(async (req, res, next) => {
    const { id } = req.params;
    const product = await Product.findById(id).populate("farm", "name");
    console.log(product);
    res.render("products/show", { product });
  })
);

app.get("/products/:id/edit", async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    res.render("products/edit", { product, categories });
  } catch (error) {
    next(new AppError("Product cannot be found (coming from edit)", 400));
  }
});

app.put(
  "/products/:id",
  wrapAsync(async (req, res, next) => {
    const { id } = req.params;
    const product = await Product.findByIdAndUpdate(id, req.body, {
      runValidators: true,
      new: true,
    });
    console.log(req.body);
    res.redirect(`/products/${product._id}`);
  })
);

app.delete(
  "/products/:id",
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    const deletedProduct = await Product.findByIdAndDelete(id);
    res.redirect("/products");
  })
);

const handleValidationErr = (err) => {
  //using for mongooseErrors
  console.log(err);
  return new AppError(`Validation Failed...${err.message}`, 400); //(2)creating the error message
};

app.use((err, req, res, next) => {
  //using for mongooseErrors
  console.log(err.name);
  if (err.name === "ValidationError") err = handleValidationErr(err); //(1) this is catching error with function handleValidationErr
  next(err); //(3)passing the error onto the error handling middleware
});

app.use((err, req, res, next) => {
  //error handling middleware adding(4) here to illustrate where the err handler would go to next
  const { status = 500, message = "Something went wrong" } = err;
  res.status(status).send(message);
});

app.listen(9000, () => {
  console.log("App is listening on port 9000!");
});
