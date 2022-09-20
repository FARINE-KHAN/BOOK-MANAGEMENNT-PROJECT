const userModel = require("../models/UserModel");
const valid = require("../validator/validator");
const jwt=require('jsonwebtoken')


const createUser = async (req, res) => {
  try {
    let data = req.body;
    let { title, name, phone, email, password, address } = data;
    //===emptyRequest===//
    if (!valid.isValidRequestBody(data)) { return res.status(400).send({ status: false, msg: "plz provide data" }); }

   //===mandatory/format===//

    if (!title) { return res.status(400).send({ status: false, message: "Title is required" }); }
    if (!["Mr", "Mrs", "Miss"].includes(title)) { return res  .status(400) .send({ status: false, message: "Title should contain Mr.,Mrs.,Miss" }); }
    
    
    const dublicatePhone = await userModel.findOne({ phone: phone });
    const dublicateEmail = await userModel.findOne({ email: email });
    // if (dublicate.phone) {return res.status(400).send({ status: false,  msg: "phone must be unique...!", })}
    // if (dublicate.email) { return res.status(400).send({ status: false,msg: "email must be unique...!" })}
    
    if (!valid.isValidName(name)) { return res.status(400).send({ status: false, msg: " Name is required and first character must be capital...!", }); }
    if (!valid.isValidMobile(phone) ||dublicatePhone) { return res.status(400).send({ status: false, msg: "phone is required , only 10 character and must be unique...!", });}
    if (!valid.isValidEmail(email) ||dublicateEmail) { return res.status(400).send({status: false, msg: " emailId is required and must be unique...!", }); }
    if (!valid.isValidPassword(password)) { return res.status(400).send({status: false,
        msg: "Your password must contain at least one alphabet one number and one special character minimum 8character maximum 15",}); }
    if (!valid.isValidpin(address.pincode)) { return res.status(400).send({ status: false, msg: " pincode must have 6 digits only", }); }

    if(typeof address.street!=="string"){ return res.status(400).send({status: false, msg: "provid street address", }) }
    if(typeof address.city!=="string"){ return res.status(400).send({status: false, msg: "provid street address", }) }
 
   //===creation===//

    let savedData = await userModel.create(data);
    res.status(201).send({ status: true, message: "success", data: savedData });
  } catch (error) {
    res.status(500).send({ status: false, err: error.message });
  }
};


//////////////////////////////


const loginUser=async function(req,res){
  try {
    let data=req.body;
    let{email,password}=data;
    
    if (!valid.isValidRequestBody(data)) { return res.status(400).send({ status: false, msg: "plz provide data" }); }
    if (!valid.isValidPassword(password)) { return res.status(400).send({status: false,
      msg: "Your password must contain at least one alphabet one number and minimum 8character maximum 15",}); }
    if (!valid.isValidEmail(email)) { return res.status(400).send({status: false, msg: " emailId is required and must be unique...!", }); }
    
    const user=await userModel.findOne({email:email,password:password})
    if(!user){ return res.status(400).send({ status: false, msg: "User Not found" }); }
    
    const token=jwt.sign({userId:user._id.toString()},"Project-3_Group-5",{expiresIn:"240s"});
    res.setHeader("x-auth-token", token)
    res.status(201).send({status:true,message:"Login successfully...!",data:token})

  } catch (error) {
    res.status(500).send({ status: false, err: error.message });
  }
}


module.exports = { createUser ,loginUser};
