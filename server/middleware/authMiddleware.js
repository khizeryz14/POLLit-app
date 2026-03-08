import dotenv from "dotenv"
dotenv.config();
import jwt from "jsonwebtoken"

function authenticateToken(req, res, next){
    const token = req.cookies.token;

    if (!token){
        return res.status(401).json({message: "Unauthorized request"})
    }

    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded.userId;

        next();
    }
    catch(err){
        return res.status(401).json({message: "Invalid or expired token!"});
    }   
}

export default authenticateToken;