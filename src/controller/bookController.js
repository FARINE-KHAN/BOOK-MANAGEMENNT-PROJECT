const bookModel = require("../models/bookModel");
const valid = require("../validator/validator");
const reviewModel = require("../models/reviewModel");
const mongoose = require("mongoose");
const {uploadFile}=require("../aws/aws")

//=====================================create book function=========================================//
const createbook = async function (req, res) {
  try {
    let data = req.body;
    let { title, excerpt, userId, ISBN, category, subcategory, releasedAt } = data;
    let files= req.files
    if(files && files.length>0){
        //upload to s3 and get the uploaded link
        // res.send the link back to frontend/postman
        let uploadedFileURL= await uploadFile(files[0])
       // res.status(201).send({msg: "file uploaded succesfully", data: uploadedFileURL})
       data.bookCover=uploadedFileURL
    }
    else{
       return res.status(400).send({ msg: "No file found" })
    }
   

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
    const { userId} = data;

    if (userId) {
      if (!mongoose.isValidObjectId(data.userId))
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
    res.status(200).send({ status: true, message: "success", data:result });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }

};

//============================================updateBook==============================================//

const updatebook = async function (req, res) {
  try {
    let id = req.params.bookId;
    let book = await bookModel.findById(id);
    if (!book || book.isDeleted === true) {
      return res.status(404).send({
        status: false,
        message: "book not found..",
      });
    }
    const requestBody = req.body;
    if (!valid.isValidRequestBody(requestBody)) {
      return res.status(400).send({
        status: false,
        message: " Please provide updation details",
      });
    }
    // - title  - excerpt  - release date - ISBN

    if (req.body.title) {
      if (valid.isValid(req.body.title)) {
        const validTitle = await bookModel.findOne({ title: req.body.title });
        if (validTitle) {
          return res.status(400).send({
            status: false,
            message: "Title already exists...",
          });
        }
        book.title = req.body.title.trim();
      } else {
        return res.status(400).send({
          status: false,
          message: "Title must be string.",
        });
      }
    }
    if (req.body.excerpt) {
      if (valid.isValid(req.body.excerpt)) {
        book.excerpt = req.body.excerpt.trim();
      } else {
        return res.status(400).send({
          status: false,
          message: "excerpt must be string.",
        });
      }
    }
    if (req.body.ISBN) {
      if (valid.isValidA(req.body.ISBN)) {
        const validISBN = await bookModel.findOne({ ISBN: req.body.ISBN });
        if (validISBN) {
          return res.status(400).send({
            status: false,
            message: "ISBN already exists...",
          });
        }
        book.ISBN = req.body.ISBN.trim();
      } else {
        return res.status(400).send({
          status: false,
          message: "Book ISBN must be string and valid",
        });
      }
    }
    if (req.body.releasedAt) {
      if(valid.isValidDate(releasedAt)){
      book.releasedAt = req.body.releasedAt;}
      else{
        return res.status(400).send({status: false,msg: "releasedAt date should be in format=> yyyy-mm-dd"})
      }
    }
    // book.releasedAt = moment();
    let book2 = await bookModel.findByIdAndUpdate({ _id: id }, book, {
      new: true,
    });
    return res
      .status(200)
      .send({ status: true, message: "successfully updated", data: book2 });
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
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
