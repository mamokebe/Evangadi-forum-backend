import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import dbConnection from "./db/dbConfig.js";
import body_parser from "body-parser";

//user routes middleware file
import userRouter from "./routes/userRoute.js";
//questions routes middleware file
import questionRouter from "./routes/questionRoute.js";
//answers routes middleware file
import answerRouter from "./routes/answerRoute.js";
//middleware
import authMiddleware from "./middleware/auth.js";

const app = express();
dotenv.config();
const port = 4500;
const allowedOrigins = ["https://evangadi-forum-qa.netlify.app"];
//middleware to captures all the information entered in an HTML form and parses them in an object form.
app.use(body_parser.urlencoded({ extended: true }));
//middleware (initialize middleware used to parse any request using json )
app.use(express.json());
//access backend from any frontend
app.use(cors({ origin: allowedOrigins, credentials: true }));

//user routes middleware
app.use("/api/user", userRouter);
//question routes middleware
app.use("/api", authMiddleware, questionRouter);
//answer routes middleware
app.use("/api", authMiddleware, answerRouter);

//using get http method (to request data from server)
app.get("/", (req, res) => {
  res.send("API Working");
});
//new method of server starter with db connection
const startConnection = async () => {
  try {
    const result = await dbConnection.execute("select 'test'");
    console.log(result);
    await app.listen(port);
    console.log("database connected");
    console.log(`server running on http://localhost:${port}`);
  } catch (error) {
    console.log(error.message);
  }
};
startConnection();
