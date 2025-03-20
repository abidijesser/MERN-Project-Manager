const nodemailer = require("nodemailer");

// Créer un transporteur factice qui ne fait rien
const transporter = {
  sendMail: async () => {
    console.log("Email sending is currently disabled");
    return true;
  },
};

module.exports = transporter;
