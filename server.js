const express = require('express');
const path = require('path');
require('dotenv').config();

const { validateContactData, getMailConfig, sendContactEmails } = require('./services/email');

const app = express();
const PORT = process.env.PORT || 8000;
const PUBLIC_DIR = path.join(__dirname, 'public');

app.set('trust proxy', 1);
app.use(express.json({ limit: '16kb' }));
app.use(express.static(PUBLIC_DIR));

app.get('/', (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, 'index.html'));
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'La aplicación Node.js está funcionando correctamente',
    timestamp: new Date().toISOString(),
    nodeVersion: process.version,
    port: PORT,
    mailConfigured: Boolean(getMailConfig())
  });
});

app.post('/api/contact', async (req, res, next) => {
  const validation = validateContactData(req.body);

  if (!validation.valid) {
    return res.status(400).json({ error: validation.error });
  }

  if (!getMailConfig()) {
    return res.status(503).json({ error: 'El servicio de correo no está configurado.' });
  }

  try {
    await sendContactEmails(validation.data);
    res.status(201).json({ message: 'Gracias. Nos pondremos en contacto contigo pronto.' });
  } catch (err) {
    if (err.message === 'MAIL_NOT_CONFIGURED') {
      return res.status(503).json({ error: 'El servicio de correo no está configurado.' });
    }
    next(err);
  }
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'No pudimos procesar tu solicitud. Inténtalo más tarde.' });
});

const server = app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
  if (!getMailConfig()) {
    console.warn('Aviso: variables SMTP no configuradas. POST /api/contact no enviará correos.');
  }
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`El puerto ${PORT} ya está en uso. Cierra el otro proceso o usa: PORT=8001 npm start`);
    process.exit(1);
  }
  throw err;
});
