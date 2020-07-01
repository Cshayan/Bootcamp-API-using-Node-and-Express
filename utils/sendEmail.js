/*
* File to send email to users for different purposes
*/

// Dependencies
const nodemailer = require('nodemailer');

// Function to send email
const sendEmail = async (options) => {

    // Create the transporter
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        auth: {
            user: process.env.SMTP_EMAIL,
            pass: process.env.SMTP_PASSWORD
        }
    });

    // Message to send in email
    const message = {
        from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
        to: options.email,
        subject: options.subject,
        text: options.message
    }

    // Send the email
    const info = await transporter.sendMail(message);
};

// export the function
module.exports = sendEmail;