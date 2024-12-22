import dbConnection from "../db/dbConfig.js";
import validator from "validator";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import StatusCode from "http-status-codes";
import "dotenv/config";

const loginUser = async (req, res) => {
  //destructuring from req.body
  const { email, password } = req.body;
  //validation
  // checking for the presence of every input fields
  if (!email || !password) {
    return res.status(StatusCode.NOT_FOUND).json({
      success: false,
      message: "Please provide all required fields!",
    });
  }
  try {
    //find user by email from database
    //sending data to check if email exist on our database
    const [user] = await dbConnection.query(
      `SELECT userName, userId, password FROM users WHERE email=?`,
      [email]
    );
    if (user.length == 0) {
      return res.status(StatusCode.NOT_FOUND).json({
        success: false,
        message: "User doesn't exist with this email",
      });
    }
    //check user password with the encrypted password from database by using bcrypt compare method
    const isMatch = await bcrypt.compare(password, user[0].password);
    if (!isMatch) {
      //if not match
      return res.status(StatusCode.NOT_FOUND).json({
        success: false,
        message: "Password is NOT correct, Please provide correct password",
      });
    }
    // return res.json({user:user[0].password})
    //create token for user using jwt by using userName and userid
    const userName = user[0].userName;
    const userId = user[0].userId;
    // const token = createToken(userName, userId);
    const token = jwt.sign({ userName, userId }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });
    return res.status(StatusCode.OK).json({
      success: true,
      message: "User login successfully",
      token,
    });
    //or another way we can use to get email from database
    // await getUserByEmail(email, (err, result) => {
    //   if (err) {
    //     console.log(err);
    //     res.status(500).json({
    //       success: false,
    //       message: "Database connection error",
    //     });
    //   }
    //   // if email not exist user not exist, generate response
    //   if (!result) {
    //     return res.status(404).json({
    //       success: false,
    //       message: "User doesn't exist with this email",
    //     });
    //   }
    //   //if user exist check if the password input is matched with existing password (password stored in the db)
    //   const isMatch = bcrypt.compare(password, result.user_password);
    //   if (!isMatch) {
    //     //if not match
    //     return res.json({
    //       success: false,
    //       message: "Password is NOT correct, Please provide correct password",
    //     });
    //   }
    //   //if match generate token
    //   const token = createToken(result.user_id);
    //   //send token as response
    //   res.json({ success: true, token });
    // });
  } catch (error) {
    console.error(error);
    return res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Something went wrong, try again later!",
    });
  }
  // //create token for user using jwt by using user id as parameter & return it
  // const createToken = (userid) => {
  //   return jwt.sign({ userid }, process.env.JWT_SECRET);
  // };
};

//create token for user using jwt by using userName & userId as parameter & return it
// const createToken = (name, id) => {
//   return jwt.sign({ name, id }, process.env.JWT_SECRET);
// };

const registerUser = async (req, res) => {
  const { userName, firstName, lastName, email, password } = req.body;
  //Validation
  // checking for the presence of every input fields.
  if (!userName || !firstName || !lastName || !email || !password) {
    return res.status(StatusCode.BAD_REQUEST).json({
      success: false,
      message: "Please provide all required fields",
    });
  }

  try {
    //check if user is already exists
    const [user] = await dbConnection.query(
      `SELECT userName, userId FROM users WHERE userName = ? OR email = ?`,
      [userName, email]
    );

    if (user.length > 0) {
      return res.status(StatusCode.BAD_REQUEST).json({
        success: false,
        message: "User already existed",
        user: user,
      });
    }
    //validating  strong password and email format
    if (password.length < 8) {
      return res.status(StatusCode.BAD_REQUEST).json({
        success: false,
        message: "Please enter a strong password",
      });
    }
    if (!validator.isEmail(email)) {
      return res.status(StatusCode.BAD_REQUEST).json({
        success: false,
        message: "Please enter a valid email",
      });
    }
    //hashing user password (encrypting password)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    //save hashed password in the database rather than real password for security

    await dbConnection.query(
      `INSERT INTO users(userName, firstName, lastName, email, password) VALUES (?, ?, ?, ?, ?)`,
      [userName, firstName, lastName, email, hashedPassword]
    );

    const [data] = await dbConnection.query(`SELECT * FROM users`);

    // After saving user, create a JWT token
    const userId = data[data.length - 1].userId;
    const token = jwt.sign({ userName, userId }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    return res.status(StatusCode.OK).json({
      data: data[data.length - 1],
      token: token,
    });
  } catch (error) {
    console.error(error);
    return res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Something went wrong, try again later!",
    });
  }
};

const checkUser = async (req, res) => {
  const userName = req.user.userName;
  const userId = req.user.userId;
  return res.status(StatusCode.OK).json({
    success: true,
    message: "valid user",
    userName,
    userId,
  });
};
const logoutUser = (req, res) => {
  // as JWT is stateless, we don't need to do anything here(server-side).
  // Just send a success response for the client to handle the token removal
  return res.status(StatusCode.OK).json({
    success: true,
    message: "Successfully logged out",
  });
};

export { loginUser, registerUser, checkUser, logoutUser };
