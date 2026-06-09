const nodemailer = require('nodemailer');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isValidEmail(email) {
  return typeof email === 'string' && EMAIL_REGEX.test(email.trim());
}

function getMailConfig() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, ADMIN_EMAIL, MAIL_FROM } = process.env;

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS || !ADMIN_EMAIL || !MAIL_FROM) {
    return null;
  }

  const port = Number(SMTP_PORT) || 465;

  return {
    adminEmail: ADMIN_EMAIL,
    mailFrom: MAIL_FROM,
    transporter: nodemailer.createTransport({
      host: SMTP_HOST,
      port,
      secure: port === 465,
      requireTLS: port === 587,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS.replace(/\s/g, '')
      }
    })
  };
}

async function sendContactEmails(email) {
  const config = getMailConfig();
  if (!config) {
    throw new Error('MAIL_NOT_CONFIGURED');
  }

  const normalizedEmail = email.trim().toLowerCase();

  await config.transporter.sendMail({
    from: config.mailFrom,
    to: config.adminEmail,
    subject: 'Nuevo contacto — Empléate Aquí',
    text: `Alguien dejó su correo en la página de mantenimiento.\n\nCorreo: ${normalizedEmail}\nFecha: ${new Date().toISOString()}`
  });

  await config.transporter.sendMail({
    from: config.mailFrom,
    to: normalizedEmail,
    subject: 'Recibimos tu mensaje — Empléate Aquí',
    text: `Hola,\n\nGracias por dejarnos tu correo. Nos pondremos en contacto contigo pronto.\n\nSaludos,\nEquipo Empléate Aquí`
  });
}

module.exports = {
  isValidEmail,
  getMailConfig,
  sendContactEmails
};
