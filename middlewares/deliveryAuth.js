import jwt from "jsonwebtoken";

export const deliveryAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    console.log("Authorization header nahi mila");
    return res.status(401).json({ message: "No token provided" });
  }

  if (!authHeader.startsWith("Bearer ")) {
    console.log("Authorization header 'Bearer' se start nahi hota");
    return res.status(401).json({ message: "Token must start with Bearer" });
  }


  const token = authHeader.split(" ")[1];
  console.log("Token mil gaya:", token);


  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    if (decoded.role !== "delivery") {
      console.log("Token ka role delivery nahi hai:", decoded.role);
      return res.status(403).json({ message: "Not a delivery token" });
    }

    req.deliveryBoyId = decoded.id;
    next();
  } catch (error) {
     console.error("JWT verify karte waqt error aaya:", error.message);
    return res.status(401).json({ message: "Invalid token" });
  }
};
