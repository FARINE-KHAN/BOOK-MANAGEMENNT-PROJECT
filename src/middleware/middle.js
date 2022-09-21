const jwt = require("jsonwebtoken");
const mongoose = require('mongoose')

const bookModel = require("../models/bookModel");



// =======================================================AUTHENTICATION==============================================


const authentication = (req, res, next) => {
    try {
        let token = req.headers["x-auth-token"];
        if (!token)
            return res.status(401).send({ status: false, msg: "token is required" });
        jwt.verify(token, "Project-3_Group-5", function (error, decoded) {
            if (error) {
                return res.status(401).send({ status: false, msg: "Authentication failed Or Token Expired..!" });
            } else {
                req.token = decoded;
                next();
            }
        });
    } catch (error) {
        res.status(500).send({ status: false, err: error.message });
    }
};

// ====================================================================================================================================
    // ============================================AUTHORISATION===============================================================


    const authorisation = function (req, res, next) {

    try {
        let token = req.headers["x-auth-token"]
        if(!token)token = req.headers["X-AUTH-TOKEN"]
        // let decodedtoken = jwt.verify(token, "Project-3_Group-5")
        let decodedtoken=req.token
        let userId = req.body.userId;
        if (decodedtoken.userId != userId) {
            return res.status(403).send({ status: false, msg: "you are not authorise" })
        }

        next()
    }
    catch (error) {
        return res.status(500).send({ status: false, msg: error.message })

    }

}

// ====================================================================================================================================

// ======================================================AUTHORISATION BY BOOKID=======================================================
    
const authorisationbyBId = async function(req,res,next){
    let bookId = req.params.bookId
    
    if(!bookId){
       return res.status(400).send({status: false, message: "Please enter a book ID."});
    }
    if(!mongoose.isValidObjectId(bookId)){
       return res.status(400).send({status: false, message: 'Invalid book id'});
    }

    let bookData = await bookModel.findById({_id:bookId,isDeleted:false})
    if(!bookData){
        return res.status(404).send({status: false, message: 'No Book exists with that id or Might be Deleted'});
    }
    
    if(bookData.userId.toString() !== req.userId){
    return res.status(403).send({status: false, message: 'Unauthorized access'});
    }
    
    next()
}

// ==============================================================================================================================

//exporting functions
module.exports={authentication,authorisation,authorisationbyBId}


