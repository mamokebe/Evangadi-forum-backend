import express from "express";
import {
  allQuestion,
  singleQuestion,
  newQuestion,
} from "../controllers/questionController.js";

const questionRouter = express.Router();

//get all questions
questionRouter.get("/question", allQuestion);

//get single question
questionRouter.get("/question/:questionId", singleQuestion);
//questionId ---> used as url parameter

//create a new question
questionRouter.post("/question", newQuestion);
//request body ---> title, description

export default questionRouter;
