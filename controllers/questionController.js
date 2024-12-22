import dbConnection from "../db/dbConfig.js";
import StatusCode from "http-status-codes";
import crypto from "crypto";
// import KeywordExtractor from "keyword-extractor";

// const generateTag = (title) => {
//   const extractionResult = KeywordExtractor.extract(title, {
//     language: "english",
//     remove_digits: true,
//     return_changed_case: true,
//     remove_duplicates: true,
//   });
//   return extractionResult.length > 0 ? extractionResult[0] : "general";
// };

const newQuestion = async (req, res) => {
  const { title, description } = req.body;
  //  userId is from middleware
  const userId = req.user.userId;
  // Generate a unique questionId from a random 16-byte string and convert it to hexadecimal format
  const questionId = crypto.randomBytes(16).toString("hex");

  // validate for missing fields
  if (!title || !description || !userId) {
    return res.status(StatusCode.BAD_REQUEST).json({
      success: false,
      message: "Please provide all required fields",
    });
  }

  try {
    // Inserting new question into the database
    await dbConnection.query(
      "INSERT INTO questions (questionId, userId, title, description) VALUES (?, ?, ?, ?)",
      [questionId, userId, title, description]
    );

    // Respond with success
    return res.status(StatusCode.CREATED).json({
      success: true,
      message: "New question posted successfully",
    });
  } catch (error) {
    console.error(error.message);
    return res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Something went wrong, try again later!",
    });
  }
};

const allQuestion = async (req, res) => {
  try {
    // get all questions with user details from the database
    const [allQuestions] = await dbConnection.query(
      "SELECT q.questionId, q.title, q.description, q.userId, q.create_at, u.userName, u.firstName, u.lastName, (SELECT COUNT(*) FROM answers WHERE answers.questionId = q.questionId) AS total_answers FROM questions AS q JOIN users AS u ON q.userId = u.userId"
    );
    //  handle this validation at front end to display msg for user
    // Check if any questions are available

    // if (!allQuestions || allQuestions.length === 0) {
    //   return res.status(StatusCode.NOT_FOUND).json({
    //     success: false,
    //     message: "There is no questions found.",
    //   });
    //}
    console.log(allQuestions);
    return res.status(StatusCode.OK).json(allQuestions);
  } catch (error) {
    console.error(error.message);
    return res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Something went wrong, try again later!",
    });
  }
};

const singleQuestion = async (req, res) => {
  // Access the path parameter
  // const { questionId } = req.body;
  const questionId = req.params.questionId;
  console.log(questionId);

  try {
    const [questions] = await dbConnection.query(
      "SELECT questions.questionId, questions.title, questions.description, users.userName, questions.create_at FROM questions JOIN users ON users.userId = questions.userId WHERE questionId = ?",
      [questionId]
      // "SELECT * FROM questions WHERE questionId = ?",
      // [questionId]
    );
    if (!questions || questions.length === 0) {
      return res.status(StatusCode.NOT_FOUND).json({
        success: false,
        message: "Question not found",
      });
    }

    // Return the single question
    return res.status(StatusCode.OK).json(questions[0]);
  } catch (error) {
    console.error(error);
    return res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Something went wrong, try again later!",
    });
  }
};

export { newQuestion, allQuestion, singleQuestion };
