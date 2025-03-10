require('dotenv').config(); // To use environment variables
const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const cors = require('cors'); // For Cross-Origin Resource Sharing

const app = express();
const defaultPort = 3000; // Local testing port

// Root route (for testing)
app.get('/', (req, res) => {
    res.send('Welcome to my backend server!');
});

// Define allowed origins for CORS
const allowedOrigins = [
    'https://luisru42.github.io', // Your GitHub Pages URL
    'https://html-portfolio-1-2a6o.onrender.com' // Your Render backend URL
];
const corsOptions = {
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true); // Allow requests from allowed origins
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
};

app.use(cors(corsOptions)); // Use CORS with defined options
app.use(bodyParser.urlencoded({ extended: true })); // Parse URL-encoded data
app.use(bodyParser.json()); // Parse JSON data (optional, useful for testing APIs)

// Route to handle form submissions
app.post('/send-email', (req, res) => {
    const { name, email, message } = req.body;

    // Handle form validation
    if (!name || !email || !message) {
        console.error('Validation failed: Missing fields.');
        return res.status(400).send('All fields are required!');
    }

    // Log form data for debugging
    console.log("Received form data:", req.body);

    // Create a transporter using environment variables
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER, // Your email
            pass: process.env.EMAIL_PASS, // Your email password (App-specific password recommended)
        },
    });

    // Email content
    const mailOptions = {
        from: email, // Sender's email (from the form)
        to: process.env.EMAIL_USER, // Your email (receiver)
        subject: `Message from ${name}`,
        text: message,
    };

    // Send the email
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error(error);
            res.status(500).send('Something went wrong. Please try again.');
        } else {
            console.log('Email sent: ' + info.response);
            res.send('Your message has been sent successfully!');
        }
    });
});

// Start the server
const port = process.env.PORT || defaultPort; // Use Render's provided port or 3000 for local testing
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
