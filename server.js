"use-strict";

/*
 * 1. Nodemailer is a package that allows us to send emails.
 * 2. The dotenv package is used to read the .env file, which contains the variables we need to send emails.
 */
const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
const multiparty = require("multiparty");
require("dotenv").config();

/*
 * 1. process.env.PORT is a way to hide your port number. This is a best practice to use environment variables when you deploy your app.
 * 2.	If there is a port number, we use it. Otherwise, we use the default port number 3000.
 */
const PORT = process.env.PORT || 3000;

/*
 * 1. First we enable CORS (Cross-Origin Resource Sharing).
 * 2. Then we set up the server to serve static files.
 */
const app = express();
app.use(cors({ origin: "*" }));
app.use("/", express.static(process.cwd() + "/"));
app.use("/assets", express.static(process.cwd() + "/assets"));

/*
 * 1. We create a transport object which we can use to send our email.
 * 2. We are using gmail's smtp server as our transport host.
 * 3. We are also using port 587 (standard) or 2525 (for gmail) to connect to the smtp server.
 * 4. We are using nodemailer's auth object to authenticate our transport.
 * 5. We are using the process.env.EMAIL and process.env.PASS to authenticate.
 */
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587 || 2525,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASS,
  },
});

/*
 * 1. transporter.verify() checks the credentials of the account by sending a verification email to the account.
 * 2. If the verification failed, it will call the callback with an error object.
 * 3. If the verification succeeded, it will call the callback with null for the error.
 */
transporter.verify(function (error, success) {
  if (error) {
    console.log(error);
  } else {
    console.log("Server is ready to take our messages");
  }
});

/*
 * 1. We are creating an instance of the multiparty form.
 * 2. We are parsing the form data.
 * 3. We are creating an empty object to contain the form data.
 * 4. We are iterating over the form fields and assigning the key value pair to the data object.
 * 5. We are creating a mail object and sending the message to the corresponding email.
 * 6. We are checking for any errors and sending the message if there aren't any errors.
 */
app.post("/send", (req, res) => {
  let form = new multiparty.Form();
  let data = {};
  form.parse(req, function (err, fields) {
    Object.keys(fields).forEach(function (property) {
      data[property] = fields[property].toString();
    });
    console.log(data);
    const mail = {
      sender: `${data.name} <${data.email}>`, // sender name + address
      to: process.env.EMAIL, // receiver email,
      subject: data.subject, // subject of the email
      text: `${data.name} <${data.email}> \n${data.message}`, // email text body
    };
    transporter.sendMail(mail, (err, data) => {
      if (err) {
        console.log(err);
        res.status(500).send("Something went wrong.");
      } else {
        res.status(200).send("Email successfully sent to recipient!");
      }
    });
  });
});

/*
 * 1. We are creating the route method used to define the url path.
 * 2. The get method is used to define the http method.
 * 3. The function is used to define the route handler.
 * 4. The function has two arguments: req and res.
 * 5. The req argument is used to access the request information.
 * 6. The res argument is used to access the response information.
 * 7. The sendFile() method is used to send the html file stored in the public folder.
 */
app.route("/").get(function (req, res) {
  res.sendFile(process.cwd() + "/index.html");
});

/*
 * 1. The app.listen function is called on port 3000.
 * 2. It is given an anonymous function as an argument.
 * 3. This anonymous function is given two arguments, the PORT and a callback function.
 * 4. The callback function is called when the server is successfully listening on the port.
 * 5. The callback function prints out a message to the console.
 */
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}...`);
});
