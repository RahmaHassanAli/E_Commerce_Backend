const router = require("express").Router();
const conn = require("../db/dbConnection");
const authorized = require("../middleware/authorize");
const admin = require("../middleware/admin");
const { body, validationResult } = require("express-validator");
const util = require("util"); // helper

router.get("/:id", authorized,async (req, res) => {
    const query = util.promisify(conn.query).bind(conn);
    const orders = await query("select * from `order` where id = ?", [
        req.params.id,
      ]);
      if (!orders[0]) {
        res.status(404).json({ ms: "this order not found !" });
        return;
      }
    const priceOfOrder = await query("select `order`.address ,sum(products.price * cart_of_product.quantity)  `total price of order`  from products join `cart_of_product` on products.id=cart_of_product.product_id join `shopping cart`on  `shopping cart`.id =  cart_of_product.cart_id join `order` on order.id = `shopping cart`.order_id where order.id = ?",[
        req.params.id
      ]);
    if (!orders[0]) {
      res.status(404).json({ ms: "THERE IS NO ORDERS!" });
      return;
    }
    res.status(200).json(priceOfOrder);
  });
  
module.exports = router;
