const express = require('express');
const { getAllTeachers, getTeacherById, registerTeacher, editTeacherInfo, deleteTeacher } = require('../controller/teacherController');

const teacherRouter = express.Router();

// Middleware to handle the "id" parameter
teacherRouter.param('id', (req, res, next, val) => {
    console.log(`Teacher ID is: ${val}`);
    // You can add additional validation or logic here
    next();
});

teacherRouter.get('/teachers', getAllTeachers);
teacherRouter.get('/teachers/:id', getTeacherById);
teacherRouter.post('/teachers', registerTeacher);
teacherRouter.put('/teachers/:id', editTeacherInfo);
teacherRouter.delete('/teachers/:id', deleteTeacher);

module.exports = teacherRouter;
