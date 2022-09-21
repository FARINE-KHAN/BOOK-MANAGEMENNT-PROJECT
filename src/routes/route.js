const express = require('express')
const router = express.Router()
const userController= require("../controller/userController")
const bookController= require("../controller/bookController")
const middleware=require("../middleware/middle")

router.post("/register",userController.createUser)

router.post("/login",userController.loginUser)

router.post("/books",bookController.createbook)

router.get("/books",middleware.authenticate,bookController.getBook)


router.all("/*", (req, res) => { res.status(400).send({ status: false, message: "Endpoint is not correct" }) })

module.exports = router;