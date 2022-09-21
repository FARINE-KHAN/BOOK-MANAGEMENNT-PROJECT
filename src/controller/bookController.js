const bookModel =require("../models/bookModel")
const valid=require("../validator/validator")
const moment=require("moment")
const userModel=require("../models/UserModel")

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
      
   //  let day ="2022/09/21";
     let day = moment(data2.releasedAt, "YYYY/MM/DD");

     //res.status()
     //const data.day=day
     let savedData = await bookModel.create(data);
    res.status(201).send({ status: true, message: "success", data:[day,data]} );
}
catch(error) {
    res.status(500).send({ status: false, err: error.message });
  }
}
module.exports={createbook}