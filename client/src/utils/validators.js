const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateUsername(username){
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    if(usernameRegex.test(username)){
        return true;
    }
    return false;
}

export function validateEmail(email){
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if(emailRegex.test(email)){
        return true;
    }
    return false;
}