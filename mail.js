const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, // Use SSL
  auth: {
    user: "pbaidoo.pb10@gmail.com", // Your email
    pass: "qzcxwuoiznhdyufr",       // Your app password
  },
});

async function sendMail(email, subject, msg) {
  try {
    let info = await transporter.sendMail({
      from: `"Shoppy" <pbaidoo.pb10@gmail.com>`, // Sender info
      to: email,
      subject: subject,
      html: msg,
    });
    console.log(' Email sent:', info.response);
  } catch (error) {
    console.error(' Error sending email:', error);
  }
}

// Call the function
sendMail("solomonbaidoo.sb@gmail.com", 'Subject', '<h1>Message agehrsjw</h1>');
