import jwt from "jsonwebtoken";
import User from "../models/User.js";

const protectRoute = async(req, res, next) => {
    try {
        const token = req.header("Authorization").replace("Bearer ", "");
        if(!token) return res.status(401).json({message: "Token not found, access denied"  });

        //verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        //find the user
        const user = await User.findById(decoded.userId).select("-password");

        if(!user) return res.status(401).json({message: "Token is invalid, access denied"  });  
        
        req.user = user;
        next();


    } catch (error) {
        console.log("Error in protectRoute middleware", error.message);
        res.status(401).json({message: "Token is invalid, access denied"  });
    }
};

export default protectRoute;