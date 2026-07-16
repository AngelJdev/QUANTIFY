import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
    host: process.env.MAILTRAP_HOST,
    port: process.env.MAILTRAP_PORT,
    auth: {
        user: process.env.MAILTRAP_USER,
        pass: process.env.MAILTRAP_PASS
    }
});

/**
 * Envía un correo de confirmación de ticket al usuario con estilo Engineering Aesthetic
 */
export const sendSupportConfirmation = async (ticketData) => {
    const { email, asunto, ticketId, prioridad } = ticketData;

    const mailOptions = {
        from: process.env.MAILTRAP_FROM,
        to: email,
        subject: `${ticketId} — Confirmación de Soporte Quantify`,
        html: `
<!doctype html>
<html lang="es">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Soporte Técnico · Quantify</title>
</head>
<body style="margin:0;padding:0;background-color:#0a0a0a;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#111111;border-radius:24px;overflow:hidden;border:1px solid rgba(255,255,255,0.06);">

          <!-- Header gradient bar -->
          <tr>
            <td height="4" style="background:linear-gradient(90deg,#00c2ff,#7b61ff,#00c2ff);"></td>
          </tr>

          <!-- Logo + Brand -->
          <tr>
            <td align="center" style="padding:40px 40px 24px;">
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:#ffffff10;border:1px solid rgba(255,255,255,0.1);border-radius:14px;padding:10px 16px;">
                    <span style="font-size:20px;font-weight:900;letter-spacing:-1px;color:#ffffff;">QUANTIFY</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding:0 40px 32px;">
              <h1 style="margin:0 0 8px;font-size:26px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">
                Ticket de Soporte Abierto
              </h1>
              <p style="margin:0 0 24px;font-size:14px;color:#888888;line-height:1.6;">
                Hola, hemos recibido tu requerimiento técnico. Tu caso ha sido registrado bajo el siguiente identificador único:
              </p>

              <!-- Ticket Info Box -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding:28px;background:#0d0d0d;border:1px solid rgba(255,255,255,0.08);border-radius:16px;margin-bottom:24px;">
                    <p style="margin:0 0 8px;font-size:11px;font-weight:700;letter-spacing:4px;color:#555555;text-transform:uppercase;">ID de tu Ticket</p>
                    <span style="display:inline-block;font-size:42px;font-weight:900;letter-spacing:4px;color:#ffffff;line-height:1;">
                      #${ticketId}
                    </span>
                  </td>
                </tr>
              </table>

              <div style="margin-top:24px;padding:20px;background:#ffffff05;border:1px solid rgba(255,255,255,0.05);border-radius:12px;">
                <p style="margin:0 0 10px;font-size:13px;color:#888888;">
                  <strong style="color:#cccccc;">Asunto:</strong> ${asunto}
                </p>
                <p style="margin:0;font-size:13px;color:#888888;">
                  <strong style="color:#cccccc;">Prioridad:</strong> ${prioridad}
                </p>
              </div>

              <p style="margin:24px 0 0;font-size:13px;color:#888888;line-height:1.6;">
                Nuestro equipo de ingeniería revisará los detalles y te contactará a través de este correo electrónico.
              </p>
            </td>
          </tr>

          <!-- Security Notice -->
          <tr>
            <td style="padding:0 40px 32px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:16px;background:#ffffff05;border:1px solid rgba(255,255,255,0.05);border-radius:12px;">
                    <p style="margin:0;font-size:11px;color:#555555;line-height:1.6;">
                      🔒 <strong style="color:#777777;">Aviso de Soporte:</strong> Nunca compartas tus credenciales de acceso con nadie, incluso si dicen ser del equipo técnico de Quantify.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px;border-top:1px solid rgba(255,255,255,0.05);">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <p style="margin:0;font-size:11px;color:#444444;">
                      © ${new Date().getFullYear()} Quantify Intelligence · Ingeniería Personal Bio-Sincrónica
                    </p>
                  </td>
                  <td align="right">
                    <p style="margin:0;font-size:11px;color:#444444;">
                      No responder a este correo
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
        `
    };

    return transporter.sendMail(mailOptions);
};
