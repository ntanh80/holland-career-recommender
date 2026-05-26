const nodemailer = require('nodemailer');
const env = require('./env');

const transporter = nodemailer.createTransport({
  host: env.smtp.host,
  port: env.smtp.port,
  secure: false,
  auth: {
    user: env.smtp.user,
    pass: env.smtp.pass,
  },
});

transporter.verify()
  .then(() => console.log('Email transporter ready'))
  .catch(err => console.warn('Email transporter not configured:', err.message));

module.exports = transporter;
