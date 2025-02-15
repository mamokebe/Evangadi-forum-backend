import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const transport = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  secure: false,
  auth: {
    user: "82ddc5002@smtp-brevo.com",
    pass: "ySHx5w3BsmcOFUV4",
  },
});

export default transport;
