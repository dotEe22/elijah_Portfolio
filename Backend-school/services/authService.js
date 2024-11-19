//import User from "../models/userModel.js";
const User = require("../Model/userModel");


exports.updateUserRoleService = async (res, id, role) => {
    const user = await User.findByIdAndUpdate(id, { role }, { new: true });
  
    res.status(201).json({
      success: true,
      user,
    });
  }