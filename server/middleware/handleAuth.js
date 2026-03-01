import jwt from "jsonwebtoken";

const handleAuth = (req, res, next) => {
    //Getting Authorization header
    const authHeader = req.headers.authorization;
    
    if(!authHeader){
        return res.status(401).json({ message: "No token provided "});
    }

    //Format should be: "Bearer Token"
    const token = authHeader.split(" ")[1];

    if(!token){
        return res.status(401).json({ message: "Malformed token "});
    }

    try {
        //verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        //Attaching user infor to request
        req.user = decoded; //decoded = {id:, username:, iat, exp}

        //continue to route
        next();

    } catch(error){
        return res.status(403).json({ message: "Invalid or expired token"});
    }
};

export default handleAuth;