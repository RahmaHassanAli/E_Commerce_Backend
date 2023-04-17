const router = require("express").Router();
const conn = require("../db/dbConnection");
const authorized = require("../middleware/authorize");
const admin = require("../middleware/admin");
const { body, validationResult } = require("express-validator");
const util = require("util"); // helper

const bcrypt = require("bcrypt");
const crypto = require("crypto");
router.post(
  "",
  admin,
  body("email").isEmail().withMessage("please enter a valid email!"),
  body("name")
    .isString()
    .withMessage("please enter a valid name")
    .isLength({ min: 10, max: 20 })
    .withMessage("name should be between (10-20) character"),
  body("password")
    .isLength({ min: 8, max: 12 })
    .withMessage("password should be between (8-12) character"),
  body("phone").isMobilePhone()
    .withMessage("please enter a valid phoneNumber"),async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const query = util.promisify(conn.query).bind(conn); 
      const checkEmailExists = await query(
        "select * from users where email = ?",
        [req.body.email]
      );
      if (checkEmailExists.length > 0) {
        res.status(400).json({
          errors: [
            {
              msg: "email already exists !",
            },
          ],
        });
        return;
      }

      const checkPhoneExists = await query(
        "select * from users where phone = ?",
        [req.body.phone]
      );
      if (checkPhoneExists.length > 0) {
        res.status(400).json({
          errors: [
            {
              msg: "this phone used before !",
            },
          ],
        });
        return;
      }
      const userData = {
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        password: await bcrypt.hash(req.body.password, 10),
        token: crypto.randomBytes(16).toString("hex"), 
      };

      await query("insert into users set ? ", userData);
      delete userData.password;
      res.status(200).json(userData);
    } catch (err) {
        console.log(err);
      res.status(500).json({ err: err });
    }
  }
);



router.put(
  "/:id", 
  admin,
  body("email").isEmail().withMessage("please enter a valid email!"),
  body("name")
    .isString()
    .withMessage("please enter a valid name")
    .isLength({ min: 5, max: 20 })
    .withMessage("name should be between (5-20) character"),
  body("password")
    .isLength({ min: 8, max: 12 })
    .withMessage("password should be between (8-12) character"),
  body("phone").isMobilePhone()
    .withMessage("please enter a valid phoneNumber"),
  async (req, res) => {
    try {
      const query = util.promisify(conn.query).bind(conn);
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const users = await query("select * from users where id = ?", [
        req.params.id,
      ]);
      if (!users[0]) {
        res.status(404).json({ ms: "user not found !" });
      }

      const userData = {
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        password: await bcrypt.hash(req.body.password, 10),
        token: crypto.randomBytes(16).toString("hex"), 
      };

      await query("update users set ? where id = ?", [userData, users[0].id]);

      res.status(200).json({
        msg: "user updated successfully",
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
      const users = await query("select * from users where id = ?", [
        req.params.id,
      ]);
      if (!users[0]) {
        res.status(404).json({ ms: "user not found !" });
        return;
      }
      await query("delete from users where id = ?", [users[0].id]);
      res.status(200).json({
        msg: "user delete successfully",
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
  const users = await query(`select * from users ${search}`);
  res.status(200).json(users);
});


router.get("/:id", admin,async (req, res) => {
  const query = util.promisify(conn.query).bind(conn);
  const users = await query("select * from users where id = ?", [
    req.params.id,
  ]);
  if (!users[0]) {
    res.status(404).json({ ms: "user not found !" });
  }
  res.status(200).json(users[0]);
});

module.exports = router;
