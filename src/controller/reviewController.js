const bookModel = require("../models/bookModel")
const reviewModel = require("../models/reviewModel")
const valid = require("../validator/validator")
const moment = require("moment")
const mongoose = require('mongoose')

const createReviwe = async function (req, res) {
    try {
        const reviewData = req.body
        const bookId = req.params.bookId
     if (!valid.isValidRequestBody(reviewData)) { return res.status(400).send({ status: false, msg: "plz provide data" }); }
    
        const {  rating,reviewedBy } = reviewData;

        if (!valid.isValidObjectId(bookId)) { return res.status(400).send({ status: false, msg: " valid book id is required"}); }
        if (!rating) return res.status(400).send({ status: false, message: "rating Is Mandatory" })
        if (!(rating >= 1 && rating <= 5)) {
            return res.status(400).send({ status: false, msg: "Rating should be inbetween 1-5 " });
        }

        const findBook = await bookModel.find({ bookId: bookId, isDeleted: false })
            if(!findBook) return res.status(404).send({status:false, message: "Book not Available"})
         await bookModel.findOneAndUpdate({ bookId: bookId, isDeleted: false },{$inc:{reviews:1}});
        
     if(reviewedBy==="" || typeof reviewedBy ==="number" ||  typeof reviewedBy=== "boolean"){
        reviewData.reviewedBy="Guest"
     }
     else{
        if(!valid.isValidName(reviewedBy)){
            return res.status(404).send({status:false, message: "huh"})
        }
     }
        reviewData.bookId=bookId
        reviewData.reviewedAt= moment()
          const createdReview = await reviewModel.create(reviewData)
          res.status(201).send({ status: true, message: "success", data: createdReview });
    }catch(error) {
        res.status(500).send({ status: false, err: error.message });
      }
}

const updateReview= async (req,res)=>{
    let bookId=req.params.bookId
    let reviewId=req.params.reviewId
    let reviewDetails=req.body
    let{reviewedBy,rating,review}=reviewDetails
    if (!valid.isValidObjectId(bookId&&reviewId)){
        return res.status(400).send({ status: false, msg: "plz provide valid id" }); 
    }

    if (!valid.isValidRequestBody(reviewDetails)) { return res.status(400).send({ status: false, msg: "plz provide data To Be Updated" }); }

    let dataToBeUpdated= await reviewModel.findOne({bookId:bookId,_id:reviewId,isDeleted:false})
    if(!dataToBeUpdated){
        return res.status(400).send({ status: false, msg: "data not found" }); 
    }
    if (!(rating >= 1 && rating <= 5)) {
        return res.status(400).send({ status: false, msg: "Rating should be inbetween 1-5 " });
    }
    if(reviewedBy==="" || typeof reviewedBy ==="number" ||  typeof reviewedBy=== "boolean"){
        reviewData.reviewedBy="Guest"
     }
     else{
        if(!valid.isValidName(reviewedBy)){
            return res.status(404).send({status:false, message: "huh"})
        }
     }
    let updatedData=await reviewModel.findByIdAndUpdate(dataToBeUpdated._id,{reviewedBy:reviewedBy,rating:rating,review:review},{new:true})
   

   return res.status(200).send({msg:"done",data:updatedData})

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


module.exports = { createReviwe, deleteReview ,updateReview};