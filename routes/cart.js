const router = require("express").Router();
const conn = require("../db/dbConnection");
const authorized = require("../middleware/authorize");
const admin = require("../middleware/admin");
const { body, validationResult } = require("express-validator");
const util = require("util"); 
router.post(
    "/select_cart",
    authorized,
    body("order_id").isNumeric().withMessage("please enter a valid order id"),
    async (req, res) => {
      try {
        const query = util.promisify(conn.query).bind(conn); 
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        } 
        const orders = await query("select * from `order` where id = ?", [
          req.body.order_id,
        ]);
        if (!orders[0]) {
          res.status(404).json({ ms: "order not found !" });
          return;
        }
        const cart = {
        order_id: orders[0].id,
        };
        await query("insert into `shopping cart` set ?", cart); 
        res.status(200).json({
          msg: "cart took successfully !",
        });
      } catch (err) {
        console.log(err);
        res.status(500).json(err);
      }
    }
  );
  
router.post(
    "/add_item",
    authorized,
    body("product_id").isNumeric().withMessage("please enter a valid product id"),
    body("cart_id").isNumeric().withMessage("please enter a valid cart id"),
    body("quantity").isNumeric().withMessage("please enter a valid quantity"),
    async (req, res) => {
      try {
        if(req.body.quantity <= 0){
            res.status(400).json({ msg : "quantity must be greater than zero " });
            return;
        }
        const query = util.promisify(conn.query).bind(conn); 
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.log(errors);
          return res.status(400).json({ errors: errors.array() });
        } 
        const products = await query("select * from products where id = ?", [
          req.body.product_id,
        ]);
        if (!products[0]) {
          res.status(404).json({ ms: "product not found !" });
          return;
        }
        const carts = await query("select * from `shopping cart` where id = ?", [
            req.body.cart_id,
          ]);
          if (!carts[0]) {
            res.status(404).json({ ms: "this shopping cart not found !" });
            return;
          }
        const item = {
         product_id: products[0].id,
         cart_id: carts[0].id,
         quantity: req.body.quantity
        };
        await query("insert into `cart_of_product` set ?", item); 
        res.status(200).json({
          msg: "product added successfully to cart!",
        });
      } catch (err) {
        console.log(err);
        res.status(500).json(err);
      }
    }
  );

    
router.post(
    "/remove_item",
    authorized,
    body("product_id").isNumeric().withMessage("please enter a valid product id"),
    body("cart_id").isNumeric().withMessage("please enter a valid cart id"),
    body("quantity").isNumeric().withMessage("please enter a valid quantity"),
    async (req, res) => {
      try {
        if(req.body.quantity <= 0){
            res.status(400).json({ msg : "quantity must be greater than zero " });
            return;
        }
        const query = util.promisify(conn.query).bind(conn); 
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.log(errors);
          return res.status(400).json({ errors: errors.array() });
        } 
        const products = await query("select * from products where id = ?", [
          req.body.product_id,
        ]);
        if (!products[0]) {
          res.status(404).json({ ms: "product not found !" });
          return;
        }
        const carts = await query("select * from `shopping cart` where id = ?", [
            req.body.cart_id,
          ]);
          if (!carts[0]) {
            res.status(404).json({ ms: "this shopping cart not found !" });
            return;
          }
        const item = {
         product_id: products[0].id,
         cart_id: carts[0].id,
         quantity: req.body.quantity
        };
        await query("insert into `cart_of_product` set ?", item); 
        res.status(200).json({
          msg: "product added successfully to cart!",
        });
      } catch (err) {
        console.log(err);
        res.status(500).json(err);
      }
    }
  );

module.exports = router;
