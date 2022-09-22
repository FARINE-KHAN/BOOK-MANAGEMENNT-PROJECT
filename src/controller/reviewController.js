const bookModel =require("../models/bookModel")
const reviewModel=require("../models/reviewModel")
const valid=require("../validator/validator")
const moment=require("moment")
const mongoose=require('mongoose')

const createReviwe=async function(req,res){
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
            if(!findBook) return res.status(404).send({status:false, message: "Book not Available"})

         const findAndUpdateBook = await bookModel.findOneAndUpdate
         ({ bookId: bookId, isDeleted: false },{$inc:{reviews:1}},{new:true});

        let obj={
            bookId: bookId,
            reviewedBy: reviewedBy,
            reviewedAt: moment(),
            rating: rating,
            review: review
          }

          const createdReview = await reviewModel.create(obj)
          res.status(201).send({ status: true, message: "success", data: createdReview })
    

    }catch(error) {
        res.status(500).send({ status: false, err: error.message });
      }
}

module.exports = { createReviwe};