const router = require("express").Router();
const conn = require("../db/dbConnection");
const authorized = require("../middleware/authorize");
const admin = require("../middleware/admin");
const { body, validationResult } = require("express-validator");
const util = require("util"); // helper
// CREATE PRODUCT [ADMIN]
router.post(
  "",
  admin,
  body("name")
    .isString()
    .withMessage("please enter a valid name")
    .isLength({ min: 5 })
    .withMessage("product name should be at lease 5 characters"),
  body("description")
    .isString()
    .withMessage("please enter a valid description ")
    .isLength({ min: 5 })
    .withMessage("description should be at lease 5 characters"),
    body("price")
    .isNumeric()
    .withMessage("please enter a valid price "),
    body("category_id").isNumeric().withMessage("please enter a valid job ID"),
  async (req, res) => {
    try {
      const query = util.promisify(conn.query).bind(conn);
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const category = await query("select * from category where id = ?", [
        req.body.category_id,
      ]);
      if (!category[0]) {
        res.status(404).json({ ms: "category not found !" });
        return;
      }
      // 3- PREPARE product OBJECT
      const product = {
        name: req.body.name,
        description: req.body.description,
        price: req.body.price,
        category_id:req.body.category_id
      };
      // 4 - INSERT PRODUCT INTO DB
     
      await query("insert into products set ? ", product);
      res.status(200).json({
        msg: "product added successfully !",
      });
    } catch (err) {
      res.status(500).json(err);
      console.log(err);
    }
  }
);


// UPDATE job [ADMIN]
router.put(
  "/:id", // params
  admin,
  body("name")
    .isString()
    .withMessage("please enter a valid name")
    .isLength({ min: 5 })
    .withMessage("description name should be at lease 5 characters"),
  body("description")
    .isString()
    .withMessage("please enter a valid description ")
    .isLength({ min: 10 })
    .withMessage("description name should be at lease 10 characters"),
    body("price")
    .isNumeric()
    .withMessage("please enter a valid price "),
    body("category_id").isNumeric().withMessage("please enter a valid job ID"),
  async (req, res) => {
    try {
      // 1- VALIDATION REQUEST 
      const query = util.promisify(conn.query).bind(conn);
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      // 2- CHECK IF product EXISTS OR NOT
      const product = await query("select * from products where id = ?", [
        req.params.id,
      ]);
      if (!product[0]) {
        res.status(404).json({ ms: "product not found !" });
        return;
      }
      const category = await query("select * from category where id = ?", [
        req.body.category_id,
      ]);
      if (!category[0]) {
        res.status(404).json({ ms: "category not found !" });
        return;
      }
      // 3- PREPARE product OBJECT
      const productObj = {
        name: req.body.name,
        description: req.body.description,
        price: req.body.price,
      };

      // 4- UPDATE product
      await query("update products set ? where id = ?", [productObj, product[0].id]);

      res.status(200).json({
        msg: "product updated successfully",
      });
    } catch (err) {
      res.status(500).json(err);
    }
  }
);

// DELETE product [ADMIN]
router.delete(
  "/:id", // params
  admin,
  async (req, res) => {
    try {
      // 1- CHECK IF product EXISTS OR NOT
      const query = util.promisify(conn.query).bind(conn);
      const product = await query("select * from products where id = ?", [
        req.params.id,
      ]);
      if (!product[0]) {
        res.status(404).json({ ms: "product not found !" });
        return;
      }
      await query("delete from products where id = ?", [product[0].id]);
      res.status(200).json({
        msg: "product delete successfully",
      });
    } catch (err) {
      res.status(500).json(err);
    }
  }
);

// LIST & SEARCH [ADMIN, USER]
router.get("", async (req, res) => {
  const query = util.promisify(conn.query).bind(conn);
  let search = "";
  if (req.query.search) {
    // QUERY PARAMS
    search = `where name LIKE '%${req.query.search}%'`;
  }
  const products = await query(`select * from products ${search}`);
  res.status(200).json(products);
});

// SHOW job [ADMIN, USER]
router.get("/:id", async (req, res) => {
  const query = util.promisify(conn.query).bind(conn);
  const products = await query("select * from products where id = ?", [
    req.params.id,
  ]);
  if (!products[0]) {
    res.status(404).json({ ms: "product not found !" });
    return;
  }
  res.status(200).json(products[0]);
});

module.exports = router;
