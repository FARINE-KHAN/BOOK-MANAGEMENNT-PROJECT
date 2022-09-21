const express = require('express')
const router = express.Router()
const userController= require("../controller/userController")
const auth=require("../middleware/middle")

router.post("/register",userController.createUser)

router.post("/login",userController.loginUser)

router.all("/*", (req, res) => { res.status(400).send({ status: false, message: "Endpoint is not correct" }) })

module.exports = router;