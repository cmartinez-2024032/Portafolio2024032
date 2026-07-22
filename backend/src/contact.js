import nodemailer from "nodemailer";

const CONTACT_TO = process.env.CONTACT_TO || "dannym2407@gmail.com";

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function sanitize(value, max = 500) {
  return String(value || "")
    .trim()
    .slice(0, max);
}

function smtpConfigured() {
  return Boolean(process.env.SMTP_USER && process.env.SMTP_PASS);
}

async function sendWithSmtp({ name, email, subject, message }) {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT || 587),
    secure: false,
    auth: { user, pass },
  });

  await transporter.sendMail({
    from: `"Portafolio CM" <${user}>`,
    to: CONTACT_TO,
    replyTo: email,
    subject: `[Portafolio] ${subject}`,
    text: `Nombre: ${name}\nCorreo: ${email}\nAsunto: ${subject}\n\n${message}`,
    html: `
      <h2>Nuevo mensaje desde el portafolio</h2>
      <p><strong>Nombre:</strong> ${name}</p>
      <p><strong>Correo:</strong> ${email}</p>
      <p><strong>Asunto:</strong> ${subject}</p>
      <hr />
      <p>${message.replace(/\n/g, "<br/>")}</p>
    `,
  });

  return { via: "smtp" };
}

async function sendWithFormSubmit({ name, email, subject, message }) {
  const origin = process.env.PUBLIC_SITE_URL || "http://localhost:5173";
  const res = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(CONTACT_TO)}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Origin: origin,
      Referer: `${origin}/`,
    },
    body: JSON.stringify({
      name,
      email,
      _replyto: email,
      _subject: `[Portafolio] ${subject}`,
      message,
      _template: "table",
      _captcha: "false",
    }),
  });

  const raw = await res.text();
  let data = {};
  try {
    data = JSON.parse(raw);
  } catch {
    data = { message: raw };
  }

  const successFlag = data.success === true || data.success === "true";
  const msg = String(data.message || "");
  const needsActivation = /activat|verif/i.test(msg);

  if (needsActivation) {
    return {
      via: "formsubmit",
      needsActivation: true,
      message:
        `FormSubmit necesita verificar ${CONTACT_TO}. ` +
        "Revisa ese correo (y Spam/Promociones), abre el enlace de verificación y luego vuelve a enviar el formulario.",
    };
  }

  if (!res.ok || !successFlag) {
    throw new Error(msg || `FormSubmit error: ${res.status} ${raw}`);
  }

  return { via: "formsubmit", needsActivation: false };
}

export async function handleContact(req, res) {
  try {
    const name = sanitize(req.body?.name, 120);
    const email = sanitize(req.body?.email, 180);
    const subject = sanitize(req.body?.subject, 200);
    const message = sanitize(req.body?.message, 4000);

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: "Completa nombre, correo, asunto y mensaje." });
    }
    if (!isValidEmail(email)) {
      return res.status(400).json({ error: "El correo no es válido." });
    }

    const payload = { name, email, subject, message };

    // Prefer SMTP if configured; otherwise FormSubmit
    let result;
    if (smtpConfigured()) {
      result = await sendWithSmtp(payload);
    } else {
      result = await sendWithFormSubmit(payload);
    }

    if (result.needsActivation) {
      return res.status(202).json({
        ok: false,
        needsActivation: true,
        via: result.via,
        message: result.message,
      });
    }

    return res.json({
      ok: true,
      via: result.via,
      message: "Mensaje enviado. Te responderé pronto.",
    });
  } catch (err) {
    console.error("Contact error:", err);
    return res.status(502).json({
      error: err.message || "No se pudo enviar el mensaje. Intenta de nuevo.",
    });
  }
}
