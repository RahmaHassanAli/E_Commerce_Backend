const router = require("express").Router();
const conn = require("../db/dbConnection");
const authorized = require("../middleware/authorize");
const admin = require("../middleware/admin");
const { body, validationResult } = require("express-validator");
const util = require("util"); 

router.post(
    "",
    authorized,
    body("address")
    .isString()
    .withMessage("please enter a valid address ")
    .isLength({ min: 5 })
    .withMessage("address should be at lease 5 characters"),
    async (req, res) => {
      try {
        const query = util.promisify(conn.query).bind(conn);
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.log(errors);
          return res.status(400).json({ errors: errors.array() });
        } 
  
        const orders = {
        user_id	: res.locals.user.id,
        address: req.body.address
        };
        console.log(orders);
        await query("insert into `order` set ? ",orders);
        res.status(200).json({
          msg: "request for order made successfully !",
        });
      } catch (err) {
        console.log(err);
        res.status(500).json(err);
      }
    }
  );
  
  


router.get("/getHistoryAllUsers", admin,async (req, res) => {
  const query = util.promisify(conn.query).bind(conn);
  const orders = await query("select users.email,`order`.id,`order`.address from users join `order` on users.id=order.user_id ");
  if (!orders[0]) {
    res.status(404).json({ ms: "THERE IS NO ORDERS!" });
    return;
  }
  res.status(200).json(orders);
});

router.get("/getMyHistory", authorized, async (req, res) => {
  const query = util.promisify(conn.query).bind(conn);
  const orders = await query("select users.email,`order`.id,`order`.address from users join `order` on users.id=order.user_id where users.id=?", [
    res.locals.user.id,
  ]);
  if (!orders[0]) {
    res.status(404).json({ ms: "NO ORDERS FOR THIS USER!" });
    return;
  }
  res.status(200).json(orders);
});

module.exports = router;
