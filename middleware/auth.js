import jwt from "jsonwebtoken";
import StatusCode from "http-status-codes";
import dotenv from "dotenv";
dotenv.config();

//when user send data they will use token to authenticate them
//and to checkUser by adding to checkUser route
const authMiddleware = async (req, res, next) => {
  //take token from users (generated token)
  const authHeader = req.headers.authorization;
  //check if  token is not available
  if (!authHeader || !authHeader.startsWith("Bearer")) {
    return res.status(StatusCode.UNAUTHORIZED).json({
      success: false,
      message: "Not Authorized Login again",
    });
  }
  const token = authHeader.split(" ")[1];

  try {
    const { userName, userId } = jwt.verify(token, process.env.JWT_SECRET);
    //set user with userName & userId
    req.user = { userName, userId };
    console.log("Decoded:", userName, userId);
    // call callback function to pass the data up on authorization.
    next();
  } catch (error) {
    console.error(error);
    return res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Something went wrong, try again later!",
    });
  }
};
// const authMiddleware = async (req, res, next) => {
//   const token = req.headers["authorization"]?.split(" ")[1];

//   if (!token) {
//     return res.status(401).json({ message: "No token provided" });
//   }
//   try {
//     jwt.verify(
//       token,
//       process.env.JWT_SECRET,
//       { ignoreExpiration: true },
//       (err, userName, userId) => {
//         if (err) {
//           console.log("JWT Error:", err);
//           return res.status(403).json({ message: "Invalid or expired token" });
//         } else {
//           console.log("Decoded:", userName, userId);
//         }
//         // Continue with the decoded user info
//         req.user = [userName, userId];
//         next();
//       }
//     );
//   } catch (error) {
//     console.error("Token verification failed: ", error);

//     if (error instanceof jwt.ExpiredError) {
//       return res.status(StatusCode.UNAUTHORIZED).json({
//         success: false,
//         message: "Token has expired. Please log in again.",
//       });
//     }

//     if (error instanceof jwt.JsonWebTokenError) {
//       return res.status(StatusCode.UNAUTHORIZED).json({
//         success: false,
//         message: "Invalid token. Please log in again.",
//       });
//     }
//     // For other errors
//     return res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
//       success: false,
//       message: "Something went wrong. Please try again later.",
//     });
//   }
// };

export default authMiddleware;
