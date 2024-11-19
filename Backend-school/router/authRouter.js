const express = require('express');
const { signup, login,protect, updateUserRole, restrictTo, activateUser,forgotPassword,resetPassword,getAllAdmins } = require('../controller/authController.js');

const authRouter = express.Router();


authRouter
.post("/signup", signup)
.post("/login", login)
.post("/activateuser", activateUser)
.post("/forgotpassword", forgotPassword)
.post("/resetpassword/:token", resetPassword)
 .get("/admins", getAllAdmins)
 .get("/top5rated",getAllAdmins)
// .patch("/editsUserRole", protect, restrictTo("admin"), updateUserRole)
// .delete("/delete/admin-email", protect, restrictTo("admin"), deleteUser);
//.patch("/editprofile", updateProfilePicture)

// .put(updateManyStudents)

// studentRouter.route("/:id")
//     .get(getSingleStudent)
//     .patch(editStudentInfo)
//     .delete(deleteStudent)

module.exports = authRouter;