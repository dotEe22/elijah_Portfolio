// const app = require("./app")
// const mongoose = require("mongoose")
// const dotenv = require("dotenv")

// dotenv.config();
// mongoose.connect(process.env.LOCAL_DB_URL).then(con => {
//         console.log("connection successful");
//         // console.log(con.connection)
// })

// const PORT = process.env.PORT || 4000

// app.listen(PORT, () => {
//         console.log(`Server established at ${PORT}`);
// })
const app = require("./app")
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
// const studentRoutes = require('./routes/studentRoutes');

dotenv.config();

mongoose.connect(process.env.LOCAL_DB_URL)
        .then(() => console.log('Database connection successful'))
        .catch(err => console.error('Database connection error:', err));

// const app = express();
// app.use(express.json());
// app.use('/api', studentRoutes);

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
});

module.exports = app;
