const router = require("express").Router();
const conn = require("../db/dbConnection");
const authorized = require("../middleware/authorize");
const admin = require("../middleware/admin");
const { body, validationResult } = require("express-validator");
const util = require("util");

router.post(
  "",
  admin,
  body("title")
    .isString()
    .withMessage("please enter a valid title")
    .isLength({ min: 5 })
    .withMessage("title should be at lease 5 characters"),
  body("description")
    .isString()
    .withMessage("please enter a valid description ")
    .isLength({ min: 5 })
    .withMessage("description should be at lease 5 characters"),
  body("name")
    .isString()
    .withMessage("please enter a valid name")
    .isLength({ min: 5 })
    .withMessage("product name should be at lease 5 characters"),

    async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const query = util.promisify(conn.query).bind(conn);
      const categories = await query("select * from category where name = ?", [
        req.body.name,
      ]);
      if (categories[0]) {
        res.status(404).json({ ms: "category already existed !" });
        return;
      }
      const category = {
        name: req.body.name,
        title: req.body.title,
        description: req.body.description,
      };
      await query("insert into category set ? ", category);
      res.status(200).json({
        msg: "category added successfully !",
      });
    } catch (err) {
      res.status(500).json(err);
      console.log(err);
    }
  }
);



router.put(
  "/:id", 
  admin,
body("title")
  .isString()
  .withMessage("please enter a valid title")
  .isLength({ min: 5 })
  .withMessage("title should be at lease 5 characters"),
body("description")
  .isString()
  .withMessage("please enter a valid description ")
  .isLength({ min: 5 })
  .withMessage("description should be at lease 5 characters"),
body("name")
  .isString()
  .withMessage("please enter a valid name")
  .isLength({ min: 5 })
  .withMessage("category name should be at lease 5 characters"),
  async (req, res) => {
    try { 
      const query = util.promisify(conn.query).bind(conn);
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const categories = await query("select * from category where id = ?", [
        req.params.id,
      ]);
      if (!categories[0]) {
        res.status(404).json({ ms: "category not found !" });
        return;
      }  
      const category = {
        name: req.body.name,
        title: req.body.title,
        description: req.body.description,
      };
      await query("update category set ? where id = ?", [category, categories[0].id]);

      res.status(200).json({
        msg: "category updated successfully",
      });
    } catch (err) {
      res.status(500).json(err);
    }
  }
);

router.delete(
  "/:id", 
  admin,
  async (req, res) => {
    try {
      const query = util.promisify(conn.query).bind(conn);
      const categories = await query("select * from category where id = ?", [
        req.params.id,
      ]);
      if (!categories[0]) {
        res.status(404).json({ ms: "category not found !" });
        return;
      }
      await query("delete from category where id = ?", [categories[0].id]);
      res.status(200).json({
        msg: "category delete successfully",
      });
    } catch (err) {
      res.status(500).json(err);
    }
  }
);

router.get("", admin,async (req, res) => {
  const query = util.promisify(conn.query).bind(conn);
  let search = "";
  if (req.query.search) {
    search = `where name LIKE '%${req.query.search}%'`;
  }
  const categories = await query(`select * from category ${search}`);
  if (!categories[0]) {
    res.status(404).json({ ms: "category not found !" });
    return;
  }
  res.status(200).json(categories);
});

router.get("/:id",admin, async (req, res) => {
  const query = util.promisify(conn.query).bind(conn);
  const categories = await query("select * from category where id = ?", [
    req.params.id,
  ]);
  if (!categories[0]) {
    res.status(404).json({ ms: "category not found !" });
    return;
  }
  res.status(200).json(categories[0]);
});

module.exports = router;
