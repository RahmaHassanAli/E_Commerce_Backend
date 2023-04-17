// ==================== INITIALIZE EXPRESS APP ====================
const express = require("express");
const app = express();

// ====================  GLOBAL MIDDLEWARE ====================
app.use(express.json());

app.use(express.urlencoded({ extended: true })); // TO ACCESS URL FORM ENCODED
app.use(express.static("upload"));
const cors = require("cors");
app.use(cors()); // ALLOW HTTP REQUESTS LOCAL HOSTS

// ====================  Required Module ====================
const auth = require("./routes/auth");
const products = require("./routes/products");
const category = require("./routes/category");
const order = require("./routes/order");
const manage_users = require("./routes/manage_users");
const cart = require("./routes/cart");
const purchase = require("./routes/purchase");
// ====================  RUN THE APP  ====================
app.listen(2000, "localhost", () => {
  console.log("SERVER IS RUNNING ");
});

// ====================  API ROUTES [ ENDPOINTS ]  ====================
app.use("/auth", auth);
app.use("/products", products);
app.use("/category", category);
app.use("/order", order);
app.use("/manage_users", manage_users);
app.use("/cart", cart);
app.use("/purchase", purchase);


