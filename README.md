# Empléate Aquí
codigo empleate aqui

## Requisitos

- Node.js >= 18
- npm

## Instalación local

```bash
npm install
cp .env.example .env
# Edita .env con tus valores reales
npm start
```

Por defecto el servidor escucha en `http://localhost:8000` (o el puerto definido en `PORT`).

---

## Variables de entorno


| Variable | Obligatoria | Descripción | Ejemplo |
|----------|-------------|-------------|---------|
| `PORT` | No | Puerto del servidor. En local usa el valor que prefieras. En Hostinger lo asigna la plataforma. | `8000` |
| `SMTP_HOST` | Sí* | Servidor SMTP | `smtp.hostinger.com` |
| `SMTP_PORT` | No | Puerto SMTP. `465` (SSL) por defecto. Usa `587` para STARTTLS. | `465` |
| `SMTP_USER` | Sí* | Usuario del buzón emisor | `contacto@empleateaqui.com` |
| `SMTP_PASS` | Sí* | Contraseña del buzón o **contraseña de aplicación** (Gmail) | `********` |
| `MAIL_FROM` | Sí* | Remitente visible en los correos | `"Empléate Aquí <contacto@empleateaqui.com>"` |
| `ADMIN_EMAIL` | Sí* | Correo que recibe las notificaciones de nuevos contactos | `admin@empleateaqui.com` |

\* Obligatorias para que `POST /api/contact` envíe correos. Si faltan, el endpoint responde `503`.

### Ejemplo `.env` 

```env
PORT=8000

SMTP_HOST=smtp.hostinger.com
SMTP_PORT=465
SMTP_USER=contacto@test.com
SMTP_PASS=tu_contraseña_del_buzon
MAIL_FROM="Empléate Aquí <contacto@test.com>"
ADMIN_EMAIL=admin@test.com
```

### Ejemplo `.env` (Gmail con contraseña de aplicación)

```env
PORT=8000

SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=tu.cuenta@gmail.com
SMTP_PASS=abcdefghijklmnop
MAIL_FROM="Empléate Aquí <tu.cuenta@gmail.com>"
ADMIN_EMAIL=admin@test.com
```

> Puedes pegar la contraseña de aplicación con o sin espacios (`abcd efgh ijkl mnop`); la app elimina los espacios automáticamente.

### Configuración con Gmail

1. Activa la **verificación en 2 pasos** en tu cuenta Google: [myaccount.google.com/security](https://myaccount.google.com/security)
2. Crea una **contraseña de aplicación**: **Seguridad → Contraseñas de aplicaciones** (o busca “App passwords” en la cuenta).
3. Elige app **Correo** y dispositivo **Otro** (por ejemplo “Empléate Aquí”).
4. Google genera una clave de 16 caracteres. Cópiala en `SMTP_PASS`.
5. Configura las variables:
   - `SMTP_HOST`: `smtp.gmail.com`
   - `SMTP_PORT`: `465` (SSL, recomendado) o `587` (STARTTLS)
   - `SMTP_USER`: tu correo Gmail completo
   - `SMTP_PASS`: la contraseña de aplicación (no uses tu contraseña normal de Gmail)
   - `MAIL_FROM`: debe usar la misma cuenta Gmail, p. ej. `"Empléate Aquí <tu.cuenta@gmail.com>"`
   - `ADMIN_EMAIL`: correo donde quieres recibir los avisos (puede ser el mismo Gmail u otro)


### Configuración SMTP en Hostinger

1. Crea un buzón en **hPanel → Emails**.
2. Usa ese buzón en `SMTP_USER` y en `MAIL_FROM`.
3. `SMTP_HOST`: `smtp.hostinger.com`


---

## Endpoints


### `GET /`

Sirve la página de mantenimiento (`public/index.html`).

---

### `GET /api/health`

Comprueba que la aplicación está en ejecución.

**Respuesta `200 OK`**

```json
{
  "status": "ok",
  "message": "La aplicación Node.js está funcionando correctamente",
  "timestamp": "2026-06-09T12:00:00.000Z",
  "nodeVersion": "v20.11.0",
  "port": 8000,
  "mailConfigured": true
}
```

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `status` | string | Estado general (`ok`) |
| `timestamp` | string | Fecha ISO del chequeo |
| `nodeVersion` | string | Versión de Node en el servidor |
| `port` | number | Puerto en el que escucha la app |
| `mailConfigured` | boolean | `true` si las variables SMTP están completas |

**Ejemplo con curl**

```bash
curl -s localhost:5555/api/health | jq
```

---

### `POST /api/contact`

Recibe un correo desde el formulario de la landing y envía:

1. **Al administrador** (`ADMIN_EMAIL`): notificación con el correo del visitante.
2. **Al visitante**: mensaje de confirmación indicando que se pondrán en contacto.

**Headers**

```
Content-Type: application/json
```

**Body**

```json
{
  "email": "visitante@test.com"
}
```

**Respuesta `201 Created`**

```json
{
  "message": "Gracias. Nos pondremos en contacto contigo pronto."
}
```

**Errores**

| Código | Body | Causa |
|--------|------|-------|
| `400` | `{ "error": "Introduce un correo electrónico válido." }` | Email vacío o formato inválido |
| `503` | `{ "error": "El servicio de correo no está configurado." }` | Faltan variables SMTP |
| `500` | `{ "error": "No pudimos procesar tu solicitud. Inténtalo más tarde." }` | Error al enviar correo |

**Ejemplo con curl**

```bash
curl -X POST localhost:5555/api/contact \
  -H "Content-Type: application/json" \
  -d '{"email":"visitante@ejemplo.com"}'
```

**Ejemplo con fetch (frontend)**

```javascript
const response = await fetch('/api/contact', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'visitante@ejemplo.com' })
});

const data = await response.json();

if (!response.ok) {
  throw new Error(data.error);
}

console.log(data.message);
```

---