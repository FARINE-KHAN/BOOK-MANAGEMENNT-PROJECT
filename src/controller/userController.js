const userModel = require("../models/UserModel");
const valid = require("../validator/validator");
const jwt = require("jsonwebtoken");

//===========================================create user=====================================//
const createUser = async (req, res) => {
  try {
    let data = req.body;
    let { title, name, phone, email, password, address } = data;
    //===emptyRequest===//
    if (!valid.isValidRequestBody(data)) {
      return res.status(400).send({ status: false, msg: "plz provide data" });
    }
    //                              <<===mandatory/format===>>                                     //
    //--title--//
    if (!title) {return res.status(400).send({ status: false, message: "Title is required" })}
    if (!["Mr", "Mrs", "Miss"].includes(title)) {return res.status(400).send({ status: false, message: "Title should contain Mr.,Mrs.,Miss" });}
    //--name--//
    if(!valid.isValid(name)){return res.status(400).send({ status: false, message: "name is required" })}
    if (!valid.isValidName(name)) { return res.status(400).send({status: false,
          msg: " full name(Name Surname=>Jane Does)first character must be capital...!",
        });}
    //--phone--//  
    if(!valid.isValid(phone)){return res.status(400).send({ status: false, message: "phone is required" })}
    if(!valid.isValidMobile(phone)){return res.status(400).send({ status: false, message: " only 10 character " })}
   const dublicatePhone = await userModel.findOne({ phone: phone });
   if (dublicatePhone) {return res.status(400).send({ status: false, msg: "phone must be unique...!",});}
   //--email--//
   if(!valid.isValid(email)){return res.status(400).send({ status: false, message: "email is required" })}
   if(!valid.isValidEmail(email)){return res.status(400).send({ status: false, message: "email should be valid" })}
   const dublicateEmail = await userModel.findOne({ email: email });
    if (dublicateEmail) { return res.status(400).send({  status: false,
     msg: " emailId is required and must be unique and must be in valid format =>example@gmail.com...!", });}
    //--password--//
    if(!valid.isValid(password)){return res.status(400).send({ status: false, message: "password is required" })}
    if (!valid.isValidPassword(password)) {return res.status(400).send({status: false,
    msg: "Your password must contain at least one alphabet one number and one special character minimum 8character maximum 15",
        });
    }
    if (address) {
      if (typeof address !== "object") {return res.status(400).send({ status: false,
            msg: "address should be in object format only", });}

      if (address.street) {
        if (typeof address.street !== "string") { return res.status(400).send({ status: false, msg: "provid street address" });
        }
      } else if (address.city) {
        if (typeof address.city !== "string") { return res .status(400) .send({ status: false, msg: "provid city address" });
        }
      } else if (address.pincode) {
        if (!valid.isValidpin(address.pincode)) {return res.status(400).send({ status: false, msg: " pincode must have 6 digits only" });
        }
      }
    }
    //===creation===//

    let savedData = await userModel.create(data);
    res.status(201).send({ status: true, message: "success", data: savedData });
  } catch (error) {
    res.status(500).send({ status: false, err: error.message });
  }
};

//=======================================login/token generation===============================//

const loginUser = async function (req, res) {
  try {
    let data = req.body;
    let { email, password } = data;

    if (!valid.isValidRequestBody(data)) {
      return res.status(400).send({ status: false, msg: "plz provide data" });
    }
    if (!valid.isValidPassword(password)) {
      return res
        .status(400)
        .send({
          status: false,
          msg: "Your password must contain at least one alphabet one number and minimum 8character maximum 15",
        });
    }
    if (!valid.isValidEmail(email)) {
      return res
        .status(400)
        .send({
          status: false,
          msg: " emailId is required and must be unique...!",
        });
    }
    
    const user = await userModel.findOne({ email: email, password: password });
    if (!user) {
      return res.status(400).send({ status: false, msg: "User Not found" });
    }

    let exp = "10h";
    const token = jwt.sign(
      { userId: user._id.toString() },
      "Project-3_Group-5",
      { expiresIn: exp }
    );
    res.setHeader("x-auth-token", token);

    res
      .status(201)
      .send({ status: true, message: "Login successfully...!", data: token });
  } catch (error) {
    res.status(500).send({ status: false, err: error.message });
  }
};
//farheen=happiness
module.exports = { createUser, loginUser };
