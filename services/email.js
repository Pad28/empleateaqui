const nodemailer = require('nodemailer');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_FIELD_LENGTH = 200;

function isValidEmail(email) {
  return typeof email === 'string' && EMAIL_REGEX.test(email.trim());
}

function isValidPhone(phone) {
  if (typeof phone !== 'string') return false;
  const digits = phone.replace(/\D/g, '');
  return digits.length >= 10 && digits.length <= 15;
}

function normalizeText(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function validateContactData(body) {
  const nombre = normalizeText(body?.nombre);
  const empresa = normalizeText(body?.empresa);
  const email = normalizeText(body?.email);
  const telefono = normalizeText(body?.telefono);
  const perfil = normalizeText(body?.perfil);
  const urgencia = normalizeText(body?.urgencia);

  if (!nombre) {
    return { valid: false, error: 'Introduce tu nombre.' };
  }
  if (!empresa) {
    return { valid: false, error: 'Introduce el nombre de tu empresa.' };
  }
  if (!isValidEmail(email)) {
    return { valid: false, error: 'Introduce un correo electrónico válido.' };
  }
  if (!isValidPhone(telefono)) {
    return { valid: false, error: 'Introduce un número telefónico válido (mínimo 10 dígitos).' };
  }
  if (!perfil) {
    return { valid: false, error: 'Indica el tipo de perfil que necesitas.' };
  }
  if (!urgencia) {
    return { valid: false, error: 'Indica la urgencia del proceso.' };
  }

  const fields = { nombre, empresa, email, telefono, perfil, urgencia };
  const tooLong = Object.entries(fields).find(([, value]) => value.length > MAX_FIELD_LENGTH);
  if (tooLong) {
    return { valid: false, error: 'Uno de los campos supera el límite permitido.' };
  }

  return {
    valid: true,
    data: {
      ...fields,
      email: email.toLowerCase()
    }
  };
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

async function sendContactEmails(contact) {
  const config = getMailConfig();
  if (!config) {
    throw new Error('MAIL_NOT_CONFIGURED');
  }

  const { nombre, empresa, email, telefono, perfil, urgencia } = contact;
  const submittedAt = new Date().toLocaleString('es-MX', { timeZone: 'America/Mexico_City' });

  await config.transporter.sendMail({
    from: config.mailFrom,
    to: config.adminEmail,
    subject: `Nuevo contacto — ${nombre} (${empresa})`,
    text: [
      'Nuevo contacto desde la landing de Empléate Aquí.',
      '',
      `Nombre: ${nombre}`,
      `Empresa: ${empresa}`,
      `Correo: ${email}`,
      `Teléfono (WhatsApp): ${telefono}`,
      `Perfil requerido: ${perfil}`,
      `Urgencia: ${urgencia}`,
      '',
      `Fecha: ${submittedAt}`
    ].join('\n')
  });

  await config.transporter.sendMail({
    from: config.mailFrom,
    to: email,
    subject: 'Recibimos tu solicitud — Empléate Aquí',
    text: [
      `Hola ${nombre},`,
      '',
      'Gracias por contactarnos. Recibimos tu solicitud y un ejecutivo se pondrá en contacto contigo pronto.',
      '',
      'Resumen de tu solicitud:',
      `- Empresa: ${empresa}`,
      `- Perfil: ${perfil}`,
      `- Urgencia: ${urgencia}`,
      '',
      'Saludos,',
      'Equipo Empléate Aquí'
    ].join('\n')
  });
}

module.exports = {
  isValidEmail,
  isValidPhone,
  validateContactData,
  getMailConfig,
  sendContactEmails
};
