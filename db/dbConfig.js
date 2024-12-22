import mysql2 from "mysql2";
import dotenv from "dotenv";
dotenv.config();

const dbConnection = mysql2.createPool({
  user: process.env.USER,
  password: process.env.PASSWORD,
  host: process.env.HOST,
  database: process.env.DB_NAME,
  connectionLimit: 10,
});
// // Create tables in database

//   const user = `CREATE TABLE if not exists users(
//       userId INT(20) NOT NULL AUTO_INCREMENT,
//       userName VARCHAR(20) NOT NUll,
//       firstName VARCHAR(20) NOT NULL,
//       lastName VARCHAR(20) NOT NULL,
//       email VARCHAR(40) NOT NULL,
//       password VARCHAR(100) NOT NULL,
//       RegisteredTime TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//       LastLogin TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//       PRIMARY KEY(userId)
//   )`;

//   const question = `CREATE TABLE if not exists questions(
//       id INT(20) NOT NULL AUTO_INCREMENT,
//       questionId VARCHAR(100) NOT NUll UNIQUE,
//       userId INT(20) NOT NULL,
//       title VARCHAR(50) NOT NULL,
//       description VARCHAR(200) NOT NULL,
//       tag VARCHAR(20),
//       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//       PRIMARY KEY(id, questionId),
//       FOREIGN KEY(userId) REFERENCES users(userId)
//   )`;

//   const answer = `CREATE TABLE if not exists answers(
//       answerId INT(20) NOT NULL AUTO_INCREMENT,
//       userId INT(20) NOT NULL,
//       questionId VARCHAR(100) NOT NUll,
//       answer VARCHAR(200) NOT NULL,
//       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//       PRIMARY KEY(answerId),
//       FOREIGN KEY(questionId) REFERENCES questions(questionId),
//       FOREIGN KEY(userId) REFERENCES users(userId)
//   )`;

// // Qyery
//   dbConnection.query(user, (err, results) => {
//       if (err) throw err;
//       console.log("user table created");
//   });

//   dbConnection.query(question, (err, results) => {
//       if (err) throw err;
//       console.log("question table created");
//   });
//   dbConnection.query(answer, (err, results) => {
//       if (err) throw err;
//       console.log("answer table created");
//   });

//new method using promise based
export default dbConnection.promise();

// CREATE INDEX idx_userName ON userTable (userName); CREATE INDEX idx_questionId ON questionTable (questionId); CREATE INDEX idx_questionId_userId ON answerTable (questionId, userId);
