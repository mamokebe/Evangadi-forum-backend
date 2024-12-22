import express from "express";
import {
  postAnswer,
  getAnswer,
  deleteAnswerByUser,
} from "../controllers/answerController.js";
// import authMiddleware from "../middleware/auth.js";

const answerRouter = express.Router();

//retrieve answers for a specific question
answerRouter.get("/answer/:questionId", getAnswer);
//questionId ---> url parameters

//submits an answer for a specific question
answerRouter.post("/answer", postAnswer);
//request body ---> questionId, answer

//delete answer by user
answerRouter.delete("/answer/:userId", deleteAnswerByUser);
//userId ---> url parameters

export default answerRouter;
