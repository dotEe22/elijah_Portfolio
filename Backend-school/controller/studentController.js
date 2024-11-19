// const Student = require("../Model/studentModel")

// const getAllStudents = (req, res) => {
//     res.send("get all student")
// }

// const registerStudent = (req, res) => {
//     res.send("get all student")
// }

// const editStudentInfo = (req, res) => {
//     res.send("get all student ")
// }

// const deleteStudent = (req, res) => {
//     res.send("get all student")
// }

// module.exports = { getAllStudents, registerStudent, editStudentInfo, deleteStudent };
const Student = require("../Model/studentModel");

// Get all students
const getAllStudents = async (req, res) => {
    try {
        const students = await Student.find();
        res.status(200).json({
            result: students.length,
            "status": "ok",
            students
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getSingleStudent = async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);
        if (!student) {
            return res.status(404).send();
        }
        res.status(200).send(student);
    } catch (error) {
        res.status(500).send(error);
    }
};


// Register a new student
const registerStudent = async (req, res) => {
    const { name, email, studentId, age, gender, role } = req.body;
    const newStudent = new Student(req.body);

    try {
        const savedStudent = await newStudent.save();
        res.status(201).json(savedStudent);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Edit student information
const editStudentInfo = async (req, res) => {
    const { id } = req.params;
    const { name, email, studentId, age, gender, role } = req.body;

    try {
        const updatedStudent = await Student.findByIdAndUpdate(
            id,
            { name, email, studentId, age, gender, role },
            { new: true }
        );
        if (!updatedStudent) {
            return res.status(404).json({ message: "Student not found" });
        }
        res.status(200).json(updatedStudent);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};


const updateManyStudents = async (req, res) => {
    const filter = req.body.filter; // The criteria to match documents
    const update = req.body.update; // The update to apply to matched documents
  
    try {
      const result = await Student.updateMany(filter, update, {
        new: true, // Return the updated document
        runValidators: true, // Run schema validators on the update
      });
  
      if (result.nModified === 0) {
        return res.status(404).send({ message: 'No students matched the criteria.' });
      }
  
      res.status(200).send({ message: `${result.nModified} students updated successfully.` });
    } catch (error) {
      res.status(400).send(error);
    }
  };

// Delete a student
const deleteStudent = async (req, res) => {
    const { id } = req.params;

    try {
        const deletedStudent = await Student.findByIdAndDelete(id);
        if (!deletedStudent) {
            return res.status(404).json({ message: "Student not found" });
        }
        res.status(200).json({ message: "Student deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getAllStudents, registerStudent,getSingleStudent,editStudentInfo, deleteStudent,updateManyStudents };
