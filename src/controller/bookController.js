const bookModel = require("../models/bookModel");
const valid = require("../validator/validator");
const reviewModel = require("../models/reviewModel");
const mongoose = require("mongoose");

//=====================================create book function=========================================//
const createbook = async function (req, res) {
  try {
    let data = req.body;
    let { title, excerpt, userId, ISBN, category, subcategory, releasedAt } = data;

    //                                <<===emptyRequest===>>                                   //
    if (!valid.isValidRequestBody(data)) {
      return res.status(400).send({ status: false, msg: "plz provide data" });
    }
    //                              <<===mandatory/format===>>                                    //
    
    //---title---//
    if(!valid.isValid(title)){ return res.status(400).send({status: false,msg: " title is required", });}
    const dublicatetitle = await bookModel.findOne({ title: title });
    if(dublicatetitle){ return res.status(409).send({status: false,msg: " title should be unique", });}

    //---excerpt---//
    if (!valid.isValid(excerpt)) {return res.status(400).send({ status: false, msg: " excerpt is required" }); }

    //---userId---//
    if(!userId){return res.status(400).send({ status: false, msg: " userId is required" });}
    if (!valid.isValidObjectId(userId)) {return res.status(400).send({ status: false, msg: " userId is not valid" });
    }
   
    //---ISBN---//
    if (!valid.isValid(ISBN)) {return res.status(400).send({ status: false, msg: " ISBN is required" }); }
    if(!valid.isValidA(ISBN) ){ return res.status(400).send({ status: false, msg: " ISBN is Invalid" });}
    const dublicateISBN = await bookModel.findOne({ ISBN: ISBN });
    if (dublicateISBN) { return res.status(409).send({ status: false, msg: " ISBN is Already present" }); }
    //---category---//
    if (!valid.isValid(category)) {return res.status(400).send({ status: false, msg: " category is required" });}
    //---subcategory---//
    if (!valid.isValid(subcategory)) {return res.status(400).send({ status: false, msg: " subcategory is required" });}
    //---releasedAt---//
    if(!valid.isValid(releasedAt)){return res.status(400).send({status: false,msg: "provide releasedAt date"})}
    if (!valid.isValidDate(releasedAt)) {return res.status(400).send({status: false,msg: " releasedAt date should be in format=> yyyy-mm-dd",});}
    //---creating data---//
    let savedData = await bookModel.create(data);
    res.status(201).send({ status: true, message: "success", data: savedData });
  } catch (error) {
    res.status(500).send({ status: false, err: error.message });
  }
};

//===========================================getBookData==============================================//

const getBook = async function (req, res) {
  try {
    let data = req.query;
    const { userId, category, subcategory } = data;

    if (userId) {
      if (!mongoose.Types.ObjectId.isValid(data.userId))
       { return res.status(400).send({ status: false, msg: "User id is not valid" });}
    }
    const returnBook = await bookModel.find({ $and: [data, { isDeleted: false }] })
      .select("title excerpt userId category releasedAt reviews")
      .sort({ title: 1 });
    if (returnBook.length > 0) {
      return res.status(200).send({
          status: true,
          count: returnBook.length,
          message: "Book list",
          data:returnBook,
        });
    } else {
      res.status(404).send({ status: false, message: "No Book Found" });
    }
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};

//==========================================getBookDataById============================================//

const getById = async (req, res) => {
  try {
    let data = req.params.bookId;
    if (data) {
      if (!mongoose.Types.ObjectId.isValid(data)) {
        return res
          .status(400)
          .send({ status: false, msg: "!!Oops Book id is not valid" });
      }
    }

    let allbooks = await bookModel.findById(data);
    if (!allbooks) { return res.status(404).send({ status: false, msg: "book not found" });}
    if ( allbooks.isDeleted === true) { return res.status(404).send({ status: false, msg: "book is Deleted" }); }
 //console.log({...allbooks})
    let reviews = await reviewModel
      .find({ bookId: data })
      .select("reviewedBy reviewedAt rating review");//.lean();
    const result = allbooks._doc;
    result.reviewsData = reviews;
    res.status(200).send({ status: true, message: "success", data:allbooks });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }

};

//============================================updateBook==============================================//

const updatebook = async function (req, res) {
  try {
    let bookId = req.params.bookId;
    if (!valid.isValidObjectId(bookId)) {
      return res
        .status(400)
        .send({ status: false, msg: "enter valid bookId " });
    }
    let book = await bookModel.findById(bookId);
    if (!book) { return res.status(404).send({ status: false, msg: "No book found" });}
    if (book.isDeleted === true) { return res.status(404).send({ status: false, msg: "Book is Deleted" });}
    
    let data = req.body;
    let { title, excerpt, releasedAt, ISBN } = data;

    //===emptyRequest===//
    if (!valid.isValidRequestBody(data)) {
      return res.status(400).send({ status: false, msg: "plz provide data" });
    }
    
    //======uniquecase=====///

    if (title || title==="") {
      const dublicatetitle = await bookModel.findOne({ title: title });
      if (!valid.isValid(title)||dublicatetitle) {
        return res .status(400).send({ status: false, msg: " title is required or already in use" });
      }
    }
    if (ISBN|| ISBN==="") {
      const dublicateISBN = await bookModel.findOne({ ISBN: ISBN });
      if (!valid.isValidA(ISBN) || dublicateISBN) {
        return res
          .status(400)
          .send({
            status: false,
            msg: " ISBN is required or ISBN already in used",
          });
      }
    }
    if (excerpt||excerpt==="") {
      if (!valid.isValid(excerpt)) { 
        return res
          .status(400)
          .send({ status: false, msg: " excerpt is required" });
      }
    }

    if (releasedAt||releasedAt==="") {
      if (!valid.isValidDate(releasedAt)) {
        return res
          .status(400)
          .send({ status: false, msg: " releasedAt yyyy-mm-dd" });
      }
    }

    let updatedBook = await bookModel.findOneAndUpdate(
      { _id: bookId },{ title, excerpt, releasedAt, ISBN },{ new: true }
    );
    return res.status(200).send({ status: true, message: "success", data: updatedBook });
  } catch (error) {
    res.status(500).send({ status: false, msg: error.message });
  }
};

//============================================deleteBook===============================================//

let deleteBooks = async function (req, res) {
  try {
    let bookId = req.params.bookId;
    if (!mongoose.Types.ObjectId.isValid(bookId)) {
      return res
        .status(400)
        .send({ status: false, message: "not a valid bookId" });
    }
    const checkBookId = await bookModel.findOne({
      _id: bookId,
      isDeleted: false,
    });
    if (!checkBookId)
      return res
        .status(404)
        .send({ status: false, message: "Book Not Found Maybe Deleted" });

    await bookModel.findOneAndUpdate(
      { _id: checkBookId._id },
      { isDeleted: true, deletedAt: new Date() }
    );
    return res
      .status(200)
      .send({ status: true, message: "Successfully Deleted" });
  } catch (err) {
    res.status(500).send({ status: false, msg: err.message });
  }
};

module.exports = { createbook, getBook, getById, updatebook, deleteBooks };
