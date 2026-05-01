import { Resend } from "resend";
import crypto from "crypto";

const resend = new Resend(process.env.RESEND_API_KEY);

// genera token seguro
function generateToken() {
  return crypto.randomBytes(32).toString("hex");
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Email requerido" });
  }

  // 1. crear token
  const token = generateToken();

  // 2. guardar usuario (SIMULADO - aquí va tu DB)
  console.log("Usuario creado:", { email, token });

  // 3. link de activación
  const link = `https://tuweb.com/activate.html?token=${token}`;

  // 4. enviar email
  try {
    await resend.emails.send({
      from: "Mi App <noreply@tudominio.com>",
      to: email,
      subject: "Activa tu cuenta",
      html: `
        <h1>Bienvenido</h1>
        <p>Haz clic para activar tu cuenta:</p>
        <a href="${link}">Activar cuenta</a>
      `
    });

    res.status(200).json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
