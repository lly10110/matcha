const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const axios = require('axios');
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, '.env') }) 

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
const uri = process.env.MONGO_CONNECTION_STRING;
const databaseAndCollection = { db: 'CMSC335_DB', collection: 'matcha' };

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.get('/', (req, res) => {
    // Render your main HTML file
    res.sendFile(__dirname + '/public/index.html');
});

app.post('/process', (req, res) => {
    // Process your data here
    console.log(req.body);
    res.send('Data received');
});


// Add more routes as needed

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}: http://localhost:${PORT}`);
});

