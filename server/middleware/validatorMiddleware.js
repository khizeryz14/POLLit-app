export function validateFields(req, res, next){
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if(usernameRegex.test(req.body.username) &&
    emailRegex.test(req.body.email) && 
    (req.body.password && req.body.password.length >= 6)){
        return next();
    }
    
    return res.status(400).json({"message":"Invalid request"});
}