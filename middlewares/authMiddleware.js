import jwt from "jsonwebtoken";
import UserModel from "../models/User.js";

const checkUserAuth = async (req, res, next) => {
  try {
    // 🔹 CHANGE 1:
    // Pehle destructuring thi → const { authorization } = req.headers
    // Ab direct read kar rahe hain (safe & clear)
    const authHeader = req.headers.authorization;

    // 🔹 CHANGE 2:
    // Token nahi hai ya "Bearer" se start nahi hota
    // yahin se return kar diya (IMPORTANT)
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        status: "failed",
        message: "Unauthorized User, No Token",
      });
    }

    // 🔹 CHANGE 3:
    // "Bearer TOKEN" → TOKEN extract kiya
    const token = authHeader.split(" ")[1];

    // 🔹 CHANGE 4:
    // jwt.verify ko try-catch ke andar rakha
    // taki expired / invalid token crash na kare
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    // 🔹 CHANGE 5 (SECURITY):
    // Password field remove kar di response se
    const user = await UserModel.findById(decoded.userID).select("-Password");

    // 🔹 ADD:
    // Token valid hai par user DB me nahi mila
    if (!user) {
      return res.status(401).json({
        status: "failed",
        message: "Unauthorized User",
      });
    }

    // 🔹 ADD:
    // User ko request ke andar attach kiya
    req.user = user;

    // 🔹 SUCCESS:
    // Sab sahi hai → next middleware / controller
    next();

  } catch (error) {
    // 🔹 CHANGE 6:
    // Har error (invalid / expired token) ka single response
    return res.status(401).json({
      status: "failed",
      message: "Unauthorized User",
    });
  }
};

export default checkUserAuth;


// import jwt from "jsonwebtoken";
// import UserModel from "../models/User.js";


// var checkUserAuth = async (req, res, next) => {
//     let token
//     const { authorization } = req.headers
//     if (authorization && authorization.startsWith("Bearer")) {
//         try {
//             token = authorization.split(' ')[1]

//             const { userID } = jwt.verify(token, process.env.JWT_SECRET_KEY)

//             req.user = await UserModel.findById(userID).select('-Password')
//             console.log(req.user)
//             next()
//         } catch (error) {
//             res.status(401).send({ "status": "failed", "message": "Unauthorized User"})
//         }
//     }
//     if (!token) {
//         res.status(401).send({ "status": "failed", "message": "Unauthorized User, No Token"})
//     }
// }

// export default checkUserAuth