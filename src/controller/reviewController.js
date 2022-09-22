const bookModel = require("../models/bookModel")
const reviewModel = require("../models/reviewModel")
const valid = require("../validator/validator")
const moment = require("moment")
const mongoose = require('mongoose')

const createReviwe = async function (req, res) {
    try {
        const reviewData = req.body
        const bookId = req.params.bookId
        const { reviewedBy, rating, review } = reviewData;

        if (!bookId) return res.status(400).send({ status: false, message: "BookId Is Mandatory" })

        if (!rating) return res.status(400).send({ status: false, message: "rating Is Mandatory" })

        if (!(rating >= 1 && rating <= 5)) {
            return res.status(400).send({ status: false, msg: "Rating should be inbetween 1-5 " });
        }


        const findBook = await bookModel.find({ bookId: bookId, isDeleted: false })
        // .select({ _id: 1, bookId: 1, reviewedBy: 1, reviewedAt: 1, rating: 1, review: 1 })
        if (!findBook) return res.status(404).send({ status: false, message: "Book not Available" })

        const findAndUpdateBook = await bookModel.findOneAndUpdate
            ({ bookId: bookId, isDeleted: false }, { $inc: { reviews: 1 } }, { new: true });

        let obj = {
            bookId: bookId,
            reviewedBy: reviewedBy,
            reviewedAt: moment(),
            rating: rating,
            review: review
        }

        const createdReview = await reviewModel.create(obj)
        res.status(201).send({ status: true, message: "success", data: createdReview });




    } catch (error) {
        res.status(500).send({ status: false, err: error.message });
    }
}
// ==============================================================================================================================
// ================================================DELETE API=================================================================

const deleteReview = async (req, res) => {
    try{
        let bookId = req.params.bookId; 
        let reviewId = req.params.reviewId;

        if(!mongoose.Types.ObjectId.isValid(bookId)){
            return res.status(400).send({status: false, msg: "Invalid BookId" })
        }
        let book = await bookModel.findById(bookId);
        if(book){
            if(book['isDeleted'] == true) return res.status(400).send({status: false, message: "The book has been deleted"});
        }else return res.status(404).send({status: false, message: "Book not found"});

        if(!mongoose.Types.ObjectId.isValid(reviewId)){
            return res.status(400).send({status: false, msg: "Invalid reviewId" })
        }
        let review = await reviewModel.findById(reviewId);
        if(review){ 
            if(review['isDeleted'] == true) return res.status(400).send({status: false, message:"Review already deleted"});
        }else return res.status(404).send({status: false, message: "Review not found"});
        if(review.bookId !== bookId){
            return res.status(400).send({status: false, msg: "review id not match for this book please provide valid review id" })
        }
        await reviewModel.findOneAndUpdate({_id: reviewId},{isDeleted: true});
        await bookModel.findOneAndUpdate({_id: bookId},{$inc: {reviews: -1}});

        res.status(200).send({status: true, message: "Review deleted successfully"});
    }catch(err){
        res.status(500).send({ status: false, message: err.message });
    }
}


module.exports = { createReviwe, deleteReview };