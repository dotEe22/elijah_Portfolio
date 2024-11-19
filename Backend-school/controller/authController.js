const User = require("../Model/userModel");
const jwt = require("jsonwebtoken");
const AppError = require("../Utils/appError");
const catchAsync = require("../Utils/catchAsync");
const { promisify } = require("util");
const Student = require("../Model/studentModel");
const { updateUserRoleService } = require("../services/authService");
const ejs = require("ejs");
const path = require("path");
const { sendMail } = require("../Utils/sendMail");
const crypto = require("crypto");


const  aliasTop5 = async(req, res, next) => {
  req.query.limit = "5"
  req.query.sort = "-rating , price"
  req.query.fields = "name , email"
  
  next()
}

const getAllAdmins = async (req, res) => {
  //1a: build the query
  
   const queryObj = {...req.query};
   const excludedField = ["page","sort","limit","fields"];
   console.log(req.query,queryObj);
   excludedField.forEach(el => delete queryObj[el]);
    //1b: await query
  let queryStr = JSON.stringify(queryObj);
  //replace gte,gt,lte,lt
  queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`)
  console.log(JSON.parse(queryStr))
   let query = User.find(JSON.parse(queryStr));
   
  //2: sorting
   if (req.query.sort){
    const sortBy = req.query.sort.split(",").join(" ")
    console.log(sortBy)
    query = query.sort(sortBy)
   }else {
    query = query.sort("createdAt")
   }

   //3: fields limit

   if (req.query.fields){
    const fields = req.query.fields.split(",").join(" ")
    console.log(fields)
    query = query.select(fields)
   }else {
    query = query.sort("-__v")
   }

   //pagination
   const page = req.query.page * 1 || 1
   // limits the amount of data to show 
    const limit = req.query.limit * 1 || 100
   
    /** skip (page 1 - 1) = 0 (0 *10) = 0 
     skip (page 2 - 1) = 1 (1 * 10) = 10
    */
    const skip = (page - 1) * limit
    if (req.query.page){
       const numberOfUsers =  await User.countDocuments()
       if (skip >= numberOfUsers){
         return next(new AppError("this is the end", 404))
       }
    }
    query = query.skip(skip).limit(limit)
     

 const user = await query;
  //  const user = await User.find().where("role").equals("user"); 
   res.status(200).json({
    result: user.length,
     status: "ok",
     data:user,
   });
 };

// const deleteUser = async (req, res) => {
//   const { email } = req.params;
//   const newAdmin = req.body;
//   const user = await User.findOneAndDelete({ email });
//   res.status(200).json({
//     status: "ok",
//     data: { user },
//   });
// };



const signedToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES,
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signedToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === "production") cookieOptions.secure = true;

  res.cookie("jwt", token, cookieOptions);

  // don't send password to frontend/client
  user.password = undefined;

  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};

const signup = catchAsync(async (req, res, next) => {
  try {
    const { name, email, password, confirmPassword, phoneNumber, role } =
      req.body;

    const isEmailExist = await User.findOne({ email });
    if (isEmailExist) {
      return next(new AppError("Email already exist", 400));
    }

    const user = {
      name,
      email,
      password,
      confirmPassword,
      phoneNumber,
      role,
    };

    const activationToken = createActivationToken(user);

    const activationCode = activationToken.activationCode;

    const data = { user: { name: user.name }, activationCode };
    const html = await ejs.renderFile(
      path.join(__dirname, "../mails/activation-email.ejs"),
      data
    );

    try {
      await sendMail({
        email: user.email,
        subject: "Activate your account",
        template: "activation-email.ejs",
        data,
      });

      res.status(201).json({
        success: true,
        message: `Please check your email: ${user.email} to activate your account!`,
        activationToken: activationToken.token,
      });
    } catch (error) {
      return next(new AppError("fdjjjdjfjdjjjjfjhhfhfhh", 400));
    }
  } catch (error) {
    return next(new AppError(error.message, 400));
  }
});

const activateUser = catchAsync(async (req, res, next) => {
  try {
    const { activation_token, activation_code } = req.body;

    const newUser = jwt.verify(activation_token, process.env.JWT_SECRET);

    if (newUser.activationCode !== activation_code) {
      return next(new AppError("Invalid activation code", 400));
    }

    const { name, email, password, confirmPassword, role, phoneNumber } =
      newUser.user;

    const existUser = await User.findOne({ email });

    if (existUser) {
      return next(new AppError("Email already exist", 400));
    }
    const user = await User.create({
      name,
      email,
      password,
      confirmPassword,
      phoneNumber,
      role,
    });

    res.status(201).json({
      success: true,
    });
  } catch (error) {
    return next(new AppError("failed", 400));
  }
});

const forgotPassword = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError("There is no user with email address.", 404));
  }

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });
  const resetURL = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/auth/resetpassword/${resetToken}`;

  try {
    const data = { resetURL };
    const html = await ejs.renderFile(
      path.join(__dirname, "../mails/forgot-password-email.ejs"),
      data
    );

    try {
      await sendMail({
        email: user.email,
        subject: "reset password",
        template: "forgot-password-email.ejs",
        data,
      });

      res.status(201).json({
        success: true,
        message: `Please check your email  to reset your password!`,
      });
    } catch (error) {
      return next(new AppError(error.message, 400));
    }
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(new AppError(error.message, 500));
  }
});

const resetPassword = catchAsync(async (req, res, next) => {
  const token = req.params.token;
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(new AppError("Token is invalid or has expired", 400));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  createSendToken(user, 200, req, res);
});

const createActivationToken = (user) => {
  const activationCode = Math.floor(1000 + Math.random() * 9000).toString();

  const token = jwt.sign(
    {
      user,
      activationCode,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "10m",
    }
  );

  return { token, activationCode };
};

const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError("please provide email and password", 400));
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError("incorrect email or password", 401));
  }

  createSendToken(user,200,res)

  // const token = signedToken(user._id);
  // res.status(200).json({
  //   status: "success",
  //   token,
  // });
});

const protect = catchAsync(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (!token) {
    return next(
      new AppError(
        "you are not logged in, kindly login to access this route",
        401
      )
    );
  }

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(new AppError("the user is no longer among us"));
  }

  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError("user recently changed password please login again", 401)
    );
  }

  req.user = currentUser;
  next();
});

const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError("You do not have access to view this", 403));
    }
    next();
  };
};

const updateUserRole = catchAsync(async (req, res, next) => {
  const { email, role } = req.body;
  const isUserExist = await User.findOne({ email });
  const id = isUserExist._id;
  if (!isUserExist) {
    return next(new AppError("this user does not exist", 400));
  }

  updateUserRoleService(res, id, role);
});

module.exports = {
  signup,
  login,
  protect,
  restrictTo,
//   deleteUser,
 getAllAdmins,
//   deleteStudent,
  updateUserRole,
  createActivationToken,
  activateUser,
  forgotPassword,
  resetPassword,
};