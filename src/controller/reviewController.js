const bookModel = require("../models/bookModel");
const reviewModel = require("../models/reviewModel");
const valid = require("../validator/validator");
const moment = require("moment");
const mongoose = require("mongoose");

//========================================create review============================================//
const createReview = async function (req, res) {
  try {
    const reviewData = req.body;
    const bookId = req.params.bookId;
    if (!valid.isValidRequestBody(reviewData)) {
      return res.status(400).send({ status: false, msg: "plz provide data" });
    }
    const { rating, reviewedBy } = reviewData;
    if (!valid.isValidObjectId(bookId)) {
      return res
        .status(400)
        .send({ status: false, msg: " valid book id is required" });
    }
    
    let present = await bookModel.findById(bookId)
    if (!present) { return res.status(404).send({ status: false, msg: "Book not Available" }); }
    if (present.isDeleted === true) { return res.status(404).send({ status: false, msg: "Book is deleted" }); }
    if (!rating)
      return res
        .status(400)
        .send({ status: false, message: "rating Is Mandatory" });
    if (!(rating >= 1 && rating <= 5)) {
      return res
        .status(400)
        .send({ status: false, msg: "Rating should be inbetween 1-5 " });
    }
    
    if (!reviewedBy) {
      reviewData.reviewedBy = "Guest";

    } else {
      if (!valid.isValidName(reviewedBy)) {
        return res.status(404).send({ status: false, message: "provide name" });
      }
    }

   const book = await bookModel.findOneAndUpdate(
      { bookId: bookId, isDeleted: false },
      { $inc: { reviews: 1 } }
    );

    reviewData.bookId = bookId;
    
    reviewData.reviewedAt = moment();
    const createdReview = await reviewModel.create(reviewData);

    const data= await reviewModel.findOne(reviewData).populate("bookId").select({updatedAt:0,createdAt:0,__v:0})
    res
      .status(201)
      .send({ status: true, message: "success", data: data  });
  } catch (error) {
    res.status(500).send({ status: false, err: error.message });
  }
};
//======================================update review=======================================//
const updateReview = async (req, res) => {
  try {
    let bookId = req.params.bookId;
    let reviewId = req.params.reviewId;
    let reviewDetails = req.body;
    let { reviewedBy, rating, review } = reviewDetails;
    if (!valid.isValidObjectId(bookId)) {
      return res.status(400).send({ status: false, msg: "plz provide valid book id" });
    }
    if (!valid.isValidObjectId(reviewId)) {
      return res.status(400).send({ status: false, msg: "plz provide valid review id" });
    }

    if (!valid.isValidRequestBody(reviewDetails)) {
      return res
        .status(400)
        .send({ status: false, msg: "plz provide data To Be Updated" });
    }

    let dataToBeUpdated = await reviewModel.findOne({
      bookId: bookId,
      _id: reviewId,
      isDeleted: false,
    });
    if (!dataToBeUpdated) {
      return res.status(404).send({ status: false, msg: "data not found" });
    }
    if (reviewedBy || reviewedBy === "") {
      if (!valid.isValidName(reviewedBy)) {
        return res.status(404).send({ status: false, message: "provide your name" });
      }
    }
    if (rating) {
      if (!(rating >= 1 && rating <= 5)) {
        return res.status(400).send({ status: false, msg: "Rating should be inbetween 1-5 " });
      }
    }

    let updatedData = await reviewModel.findByIdAndUpdate(
      dataToBeUpdated._id,
      { reviewedBy: reviewedBy, rating: rating, review: review },
      { new: true }
    ).populate("bookId");
    

    return res.status(200).send({ msg: "done", data: updatedData });
  } catch (error) {
    res.status(500).send({ status: false, message: err.message });

  }
};
//===============================================DELETEAPI======================================//

const deleteReview = async (req, res) => {
  try {
    let bookId = req.params.bookId;
    let reviewId = req.params.reviewId;

    if (!mongoose.Types.ObjectId.isValid(bookId)) {
      return res.status(400).send({ status: false, msg: "Invalid BookId" })
    }

    if (!mongoose.Types.ObjectId.isValid(reviewId)) {
      return res.status(400).send({ status: false, msg: "Invalid reviewId" })
    }

    let book = await bookModel.findById(bookId);
    if (book) {

      if (!book) return res.status(404).send({ status: false, message: "Book not found with this bookId" });

      if (book['isDeleted'] == true) return res.status(400).send({ status: false, message: "The book is already deleted" });

      if (book['reviews'] == 0) return res.status(400).send({ status: false, message: "no review present:(" });

    } 


    let review = await reviewModel.findById(reviewId);
    if (review) {

      if (review['isDeleted'] == true) return res.status(400).send({ status: false, message: "Review has been deleted" });


      if (review.bookId != bookId) {
        return res.status(400).send({ status: false, message: "the review from this bookId is not valid" })
      }

    } else if (!review) return res.status(404).send({ status: false, message: "Review not found" });



    await reviewModel.findByIdAndUpdate(reviewId, { isDeleted: true });

    await bookModel.findByIdAndUpdate(bookId, { $inc: { reviews: -1 } });


    res.status(200).send({ status: true, message: "Review deleted successfully" });
  } catch (err) {
    res.status(500).send({ status: false, message: err.message });
  }
}
module.exports = { createReview, deleteReview, updateReview };
