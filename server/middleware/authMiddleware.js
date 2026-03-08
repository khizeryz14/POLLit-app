import jwt from "jsonwebtoken"
import { JWT_SECRET } from "../server.js"

function authenticateToken(req, res, next){
    const token = req.cookies.token;

    if (!token){
        return res.status(401).json({message: "Unauthorized request"})
    }

    try{
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded.userId;

        next();
    }
    catch(err){
        return res.status(401).json({message: "Invalid or expired token!"});
    }   
}

export default authenticateToken;