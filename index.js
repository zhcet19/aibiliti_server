// Importing necessary modules
const express = require('express');
const cors=require('cors');
const bodyParser = require('body-parser');
const appRouter = require('./routes/route.js');
const app = express();


app.use(cors());



// Setting up middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use("/app", appRouter);

// Starting the server
const port = process.env.PORT || 3001; // Using the provided PORT or default to 3001
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});