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
    'https://luisru42.github.io/html-portfolio/', // Your GitHub Pages URL
    'https://html-portfolio-1-2a6o.onrender.com'  // Your Render backend URL
];

// Define CORS options with enhanced error handling
const corsOptions = {
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true); // Allow requests from allowed origins
        } else {
            console.error('Not allowed by CORS:', origin); // Log the blocked origin
            callback(new Error('Not allowed by CORS'));
        }
    },
};

// Use CORS with the defined options
app.use(cors(corsOptions));

// Middleware for parsing form data
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
        from: `"${name} via Your Website" <${process.env.EMAIL_USER}>`, // Makes it clear who the email is from
        to: process.env.EMAIL_USER, // Your email (receiver)
        replyTo: email, // The person's email for replying directly
        subject: `New Message from ${name} (${email})`, // Includes their email in the subject
        text: `You have received a new message from your website contact form.\n\n` +
              `Name: ${name}\n` +
              `Email: ${email}\n` +
              `Message:\n${message}`,
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
