
const express = require('express');
const app = express();
const authRoutes = require('./router/authRouter');
const studentRoutes = require('./router/studentRouter');
// const teacherRoutes = require('./router/teacherRouter')
const morgan = require('morgan');
const path = require('path');
const cors = require('cors');
const bodyparser = require('body-parser');
const AppError = require('./Utils/appError');
const errorHandler = require('./controller/errorController');
const expressRateLimiter = require('express-rate-limit');
const helmet = require('helmet');
const {xss} = require("express-xss-sanitizer");
const expressMongoSanitize = require("express-mongo-sanitize");


const PORT = 4000;

app.use(helmet());
app.use(express.json());


app.use(morgan("dev"));
app.use(cors());
app.use(bodyparser.json());
app.use(bodyparser.urlencoded());
app.use(expressMongoSanitize());
app.use(xss());

const limiter = expressRateLimiter({
  max:5,
  windowMs: 5 * 60 * 1000,
  message: "too many request try after 5 minutes"
});


app.use("/api", limiter);

// data sanitization against nosql injection
// data sanitization against xss

   





app.use("/api/v1/student", studentRoutes);
// app.use("/api/v1/teacher", teacherRoutes)
app.use("/api/v1/auth", authRoutes);
// app.use("/api/v1/Bursary", bursaryRouter)

//handle all 404 errors
app.get("*", (req, res, next) => {
  // res.status(404).json({
  //     status:"fail",
  //     message:`cannot find ${req.originalUrl} on this server`
  // })

  next(new AppError(`cannot find ${req.originalUrl} on this server`))
  // err.status = "fail"
  // err.statusCode = 404
  // next(err)
})



app.use(errorHandler);














module.exports = app