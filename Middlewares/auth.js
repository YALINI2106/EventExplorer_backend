const jwt=require("jsonwebtoken");
const authMiddleware=(req,res,next)=>{
    // req.header-->{
    //     'Authorization':'Bearer 546d57f86g9h0j-cfyvgubhinj>'
    // }
    const token=req.header("Authorization")?.split(" ")[1]
    if(!token){
        return res
         .status(401)
         .json({message:"Access denied.No token provided"})
    }
    try{
//        const decoded=jwt.verify(token,"secret_key");
       req.user=decoded;
       next()
    }
    catch(error){
        return res.status(401).json({message:"Invalid token"});
    }
};
module.exports=authMiddleware //exporting it to use it in app.js file