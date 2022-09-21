const bookModel =require("../models/bookModel")
const valid=require("../validator/validator")
const moment=require("moment")
const userModel=require("../models/UserModel")
const mongoose=require('mongoose')

const createbook=async function (req,res){
try{
    let data =req.body
    let {title,excerpt,userId,ISBN,category,subcategory,reviews,}=data
    let data2 =req.body.releasedAt
    let {releasedAt}=data2

     //===emptyRequest===//
     if (!valid.isValidRequestBody(data)) { return res.status(400).send({ status: false, msg: "plz provide data" }); }

     //===mandatory/format===//
    
     const dublicatetitle = await bookModel.findOne({ title:title });
     if (!valid.isValid(title)||dublicatetitle) { return res.status(400).send({ status: false, msg: " title is required and should be unique"}); }
     if (!valid.isValid(excerpt)) { return res.status(400).send({ status: false, msg: " excerpt is required"}); }
     if (!valid.isValidObjectId(userId)) { return res.status(400).send({ status: false, msg: " userId is required"}); }

     let user=await userModel .findById(userId)
     if(!user){ return res.status(404).send({ status:false,msg:"no such user exist"})}

     const dublicateISBN = await bookModel.findOne({ ISBN:ISBN });
     if (!valid.isValidA(ISBN)||dublicateISBN) { return res.status(400).send({ status: false, msg: " ISBN is required"}); }
     if (!valid.isValid(category)) { return res.status(400).send({ status: false, msg: " category is required"}); }
     if (!valid.isValid(subcategory)) { return res.status(400).send({ status: false, msg: " subcategory is required"}); }
     if(releasedAt){
      if (!valid.isValidDate(releasedAt)) { return res.status(400).send({ status: false, msg: " releasedAt yyyy-mm-dd"}); }
     }else{
      data.releasedAt=moment().format("YYYY-MM-DD"); }
     let savedData = await bookModel.create(data);
    res.status(201).send({ status: true, message: "success", data: savedData });

}
catch(error) {
    res.status(500).send({ status: false, err: error.message });
  }
}


const getBook = async function (req, res){
  try {
    let data =req.query
    const { userId, category, subcategory }=data

if(userId){
  if (!mongoose.Types.ObjectId.isValid(data.userId )) {
    return res.status(400).send({ status: false, msg: "!!Oops User id is not valid" });}
  
  const findUser = await userModel.findById( userId )
  if (!findUser) return res.status(404).send({ status: false, message: "This User Not exist" })
  }
    

  const returnBook = await bookModel.find({ $and: [data, { isDeleted: false }] })
  .select({title: 1, excerpt: 1, userId: 1, category: 1, releasedAt: 1, reviews: 1 }).sort({ title: 1 })
if (returnBook.length > 0) {
  return res.status(200).send({ status: true, count: returnBook.length, message: "Book list", data: returnBook })
} else {
  res.status(404).send({ status: false, message: "No Book Found" })
}

  } catch (error) {
    return res.status(500).send({ status: false, message: error.message })
  }
}


module.exports={createbook,getBook}