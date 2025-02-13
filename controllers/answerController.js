import dbConnection from "../db/dbConfig.js";
import StatusCode from "http-status-codes";
import crypto from "crypto";

const postAnswer = async (req, res) => {
  const { questionId, answer } = req.body;
  if (!questionId || !answer) {
    return res.status(StatusCode.BAD_REQUEST).json({
      success: false,
      message: "Please provide all required fields",
    });
  }

  try {
    // Insert the new answer into the database
    const [answersRow] = await dbConnection.query(
      "INSERT INTO answers (userId, questionId, answer) VALUES (?, ?, ?)",
      [req.user.userId, questionId, answer]
    );
    // Respond with success
    // return res.status(StatusCode.OK).json(answersRow);
    return res.status(StatusCode.CREATED).json({
      success: true,
      message: "Answer posted successfully",
    });
  } catch (error) {
    console.error(error.message);
    return res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Something went wrong, try again later!",
    });
  }
};

// const questionId = crypto.randomBytes(16).toString("hex");

const getAnswer = async (req, res) => {
  const questionId = req.params.questionId;
  // const questionId = req.body;
  console.log(questionId);
  try {
    const [answers] = await dbConnection.query(
      "SELECT a.questionId, a.answer, a.answerId, a.userId, a.create_at, u.userName, u.firstName, u.lastName FROM answers AS a INNER JOIN users AS u ON a.userId = u.userId WHERE a.questionId = ?",
      [questionId]

      // "SELECT * from answers WHERE questionId = ?",
      // [questionId]
    );
    // if (!answers || answers.length === 0) {
    //   return res.status(StatusCode.NOT_FOUND).json({
    //     success: false,
    //     message: "No answers found for this question.",
    //   });
    // }

    return res.status(StatusCode.OK).json(answers);
  } catch (error) {
    console.error(error.message);
    return res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Something went wrong, try again later!",
    });
  }
};
//additional api for deleting answer by user
const deleteAnswerByUser = async (req, res) => {
  // const userId = req.user.userId;
  // const questionId = req.params.questionId;
  const { userId } = req.params;

  try {
    // Delete the answers by userId
    const answer = await dbConnection.query(
      "DELETE FROM answers WHERE userId = ?",
      [userId]
    );
    // Respond with success message
    if (answer.affectedRows === 0) {
      return res.status(StatusCode.NOT_FOUND).json({
        success: true,
        message: "Answer not found",
      });
    } else {
      // Check if any answers were deleted
      return res.status(StatusCode.OK).json({
        success: true,
        message: "Answer removed successfully",
      });
    }
  } catch (error) {
    console.error(error.message);
    return res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Something went wrong, try again later!",
    });
  }
};

// const deleteAnswerByUser = async (req, res) => {
//   const { questionId, userId } = req.params; // Ensure these are extracted from req.params
//   // console.log("Deleting answer for:");
//   // console.log("UserId:", userId);
//   // console.log("QuestionId:", questionId);
//   try {
//     const [result] = await dbPromise.query(
//       "DELETE FROM answers WHERE userId = ? AND questionId = ?",
//       [userId, questionId]
//     );
//     console.log("SQL Result:", result);
//     if (result.affectedRows === 0) {
//       return res.status(StatusCode.NOT_FOUND).json({
//         success: false,
//         msg: "Answer not found or already deleted.",
//       });
//     }
//     return res.status(StatusCode.OK).json({
//       success: true,
//       message: "Answer removed successfully.",
//     });
//   } catch (error) {
//     console.error("Error deleting answer:", error.message);
//     return res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
//       success: false,
//       msg: "Something went wrong, try again later!",
//     });
//   }
// };
// Messages addressed to "meeting group chat" will also appear in the meeting group chat in Team Chat

export { postAnswer, getAnswer, deleteAnswerByUser };
