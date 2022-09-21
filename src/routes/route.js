const express = require('express')
const router = express.Router()
const userController= require("../controller/userController")
const bookController= require("../controller/bookController")
const reviewController= require("../controller/reviewController")
const middleware=require("../middleware/middle")

router.post("/register",userController.createUser)
router.post("/login",userController.loginUser)

router.post("/books",bookController.createbook)
router.get("/books",bookController.getBook)
// router.get("/books/:bookId",bookController.getById)

router.post("/books/:bookId/review",reviewController.createReviwe)

router.all("/*", (req, res) => { res.status(400).send({ status: false, message: "Endpoint is not correct" }) })

module.exports = router;