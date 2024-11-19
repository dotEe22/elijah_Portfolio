const express = require('express');
const { getAllStudents, registerStudent, editStudentInfo, getSingleStudent, deleteStudent, updateManyStudents } = require('../controller/studentController.js');
const {protect} = require("../controller/authController.js")
const studentRouter = express.Router();

studentRouter.route("/")
    .get(protect, getAllStudents)
    .post(registerStudent)
    // .put(updateManyStudents)

studentRouter.route("/:id")
    .get(getSingleStudent)
    .patch(editStudentInfo)
    .delete(deleteStudent)

module.exports = studentRouter;