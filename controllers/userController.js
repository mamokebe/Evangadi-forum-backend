import dbConnection from "../db/dbConfig.js";
import validator from "validator";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import StatusCode from "http-status-codes";
import "dotenv/config";
import transport from "../db/nodemailer.js";
import dotenv from "dotenv";
import { PASSWORD_RESET_TEMPLATE } from "../db/emailTemplates.js";
dotenv.config();

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
    // console.log(userId);
    const [data] = await dbConnection.query(`SELECT * FROM users`);

    // After saving user, create a JWT token
    const userId = data[data.length - 1].userId;
    const token = jwt.sign({ userName, userId }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });
    //sending well come email
    // const email = data[data.length - 1].email;
    const mailOptionals = {
      from: process.env.SENDER_EMAIL,
      to: email,
      subject: "Well come to Evangadi forum ",
      text: `Well come to Evangadi forum website.  Your account has been created with email id: ${email}.  You can ask programming related question and give answer for any asked questions on this website `,
    };

    await transport.sendMail(mailOptionals);

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
//send password reset OTP
const sendResetOtp = async (req, res) => {
  // to reset password user have to provide Email
  const { email } = req.body;
  console.log(email);
  if (!email) {
    return res.json({ success: false, message: "Email is required" });
  }
  try {
    // const user = await userModel.findOne({ email });
    const [user] = await dbConnection.query(
      `SELECT * FROM users WHERE email = ?`,
      [email]
    );
    if (user.length == 0) {
      return res.json({ success: false, message: "User not find" });
    }
    //generate 6 digit random number and convert to string
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const resetOtp = otp;
    const resetOtpExpireAt = Date.now() + 15 * 60 * 1000; //15 min expire

    await dbConnection.query(
      `UPDATE users SET resetOtp=?, resetOtpExpireAt=? where email=?`,
      [resetOtp, resetOtpExpireAt, email]
    );

    const mailOption = {
      from: process.env.SENDER_EMAIL,
      to: email,
      subject: "Password Reset OTP ",
      // text: `Your OTP for resetting your password is ${otp}.  Use this OTP to proceed with resetting your password `,
      html: PASSWORD_RESET_TEMPLATE.replace("{{otp}}", otp).replace(
        "{{email}}",
        email
      ),
    };
    console.log(email);
    await transport.sendMail(mailOption);
    return res.status(StatusCode.OK).json({
      success: true,
      message: "OTP sent to your email",
      // data: data[data.length - 1],
      // token: token,
    });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};
//Reset user  password r
const resetPassword = async (req, res) => {
  // to reset password user have to provide Email
  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword) {
    return res.json({ success: false, message: "Fields required" });
  }
  try {
    //find user by email from db
    // const user = await userModel.findOne({ email });
    const [user] = await dbConnection.query(
      `SELECT * FROM users WHERE email = ?`,
      [email]
    );
    if (user.length == 0) {
      return res.json({ success: false, message: "User not found" });
    }
    console.log(user[0].resetOtp);
    //if resetOtp (user input otp) is empty or not  match with db otp
    if (user[0].resetOtp === null || user[0].resetOtp !== otp) {
      return res.json({ success: false, message: "Invalid OTP" });
    }
    //if OTP valid and check the expire date
    if (user.resetOtpExpireAt < Date.now()) {
      return res.json({ success: false, message: "OTP Expired" });
    }
    //if not expired and valid otp then update user password account
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const password = hashedPassword;
    const resetOtp = null;
    const resetOtpExpireAt = 0;
    await dbConnection.query(
      `UPDATE users SET resetOtp=?, resetOtpExpireAt=?, password=? where email=?`,
      [resetOtp, resetOtpExpireAt, password, email]
    );
    console.log(email);
    return res.json({
      success: true,
      message: "Password has been reset successfully",
    });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

export {
  loginUser,
  registerUser,
  checkUser,
  logoutUser,
  sendResetOtp,
  resetPassword,
};
