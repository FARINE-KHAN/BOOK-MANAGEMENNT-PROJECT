const express = require('express')
const router = express.Router()
const userController= require("../controller/userController")
const bookController= require("../controller/bookController")
const reviewController= require("../controller/reviewController")
const middleware=require("../middleware/middle")


// ============================================USER API======================================================//

router.post("/register",userController.createUser)
router.post("/login",userController.loginUser)

// ==========================================================================================================//

// =============================================BOOK API==================================================//

router.post("/books",middleware.authentication/*,middleware.authorisation*/,bookController.createbook)
router.get("/books",middleware.authentication,bookController.getBook)
// router.get("/books/:bookId",middleware.authentication,bookController.getById)
 router.put("/books/:bookId",bookController.updatebook)
router.get("/books/:bookId",bookController.getById)

// ==================================================================================================================//
// ================================================ REVIEW API =====================================================//
router.post("/books/:bookId/review",reviewController.createReviwe)
router.put("/books/:bookId/review/:reviewId",reviewController.updateReview)
router.delete("/books/:bookId/review/:reviewId",reviewController.deleteReview)

router.delete("/books/:bookId",bookController.deleteBooks)

router.all("/*", (req, res) => { res.status(400).send({ status: false, message: "Endpoint is not correct" }) })

module.exports = router;