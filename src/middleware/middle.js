const jwt =require('jsonwebtoken')
const authenticate = (req, res, next) => {
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

//const authorisation=async (req,res,next)=>{
    
module.exports={authenticate}//,authorisation}


