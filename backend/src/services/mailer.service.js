import nodemailer from 'nodemailer';

const getTransporter = () => {
    // 1. Prioridad: Gmail SMTP configurado con App Password
    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
        return nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
    }
    // 2. Prioridad: Mailtrap Sandbox
    if (process.env.MAILTRAP_USER && process.env.MAILTRAP_PASS) {
        return nodemailer.createTransport({
            host: process.env.MAILTRAP_HOST || 'sandbox.smtp.mailtrap.io',
            port: parseInt(process.env.MAILTRAP_PORT) || 2525,
            auth: {
                user: process.env.MAILTRAP_USER,
                pass: process.env.MAILTRAP_PASS,
            },
        });
    }
    return null;
};

/**
 * Renders the Quantify-branded HTML email template.
 */
const buildResetEmailHTML = (userName, otp) => `
<!doctype html>
<html lang="es">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Restablecer contraseña · Quantify</title>
</head>
<body style="margin:0;padding:0;background-color:#0a0a0a;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#111111;border-radius:24px;overflow:hidden;border:1px solid rgba(255,255,255,0.06);">
          <tr>
            <td height="4" style="background:linear-gradient(90deg,#00c2ff,#7b61ff,#00c2ff);"></td>
          </tr>
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
          <tr>
            <td style="padding:0 40px 32px;">
              <h1 style="margin:0 0 8px;font-size:26px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">
                Restablece tu contraseña
              </h1>
              <p style="margin:0 0 24px;font-size:14px;color:#888888;line-height:1.6;">
                Hola, <strong style="color:#cccccc;">${userName}</strong>. Recibimos una solicitud para restablecer la contraseña de tu cuenta.
                Usa el código de verificación de abajo. Es válido por <strong style="color:#cccccc;">15 minutos</strong>.
              </p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding:28px;background:#0d0d0d;border:1px solid rgba(255,255,255,0.08);border-radius:16px;margin-bottom:24px;">
                    <p style="margin:0 0 8px;font-size:11px;font-weight:700;letter-spacing:4px;color:#555555;text-transform:uppercase;">Tu código de recuperación</p>
                    <span style="display:inline-block;font-size:52px;font-weight:900;letter-spacing:12px;color:#ffffff;line-height:1;">
                      ${otp}
                    </span>
                  </td>
                </tr>
              </table>
              <p style="margin:24px 0 0;font-size:12px;color:#555555;line-height:1.6;">
                Si no solicitaste este cambio, puedes ignorar este correo. Tu contraseña no se modificará.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

const buildVerificationEmailHTML = (userName, otp) => `
<!doctype html>
<html lang="es">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verificación de Correo · Quantify</title>
</head>
<body style="margin:0;padding:0;background-color:#0a0a0a;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#111111;border-radius:24px;overflow:hidden;border:1px solid rgba(255,255,255,0.06);">
          <tr>
            <td height="4" style="background:linear-gradient(90deg,#00c2ff,#7b61ff,#00c2ff);"></td>
          </tr>
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
          <tr>
            <td style="padding:0 40px 32px;">
              <h1 style="margin:0 0 8px;font-size:26px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">
                Verifica tu correo electrónico
              </h1>
              <p style="margin:0 0 24px;font-size:14px;color:#888888;line-height:1.6;">
                Hola, <strong style="color:#cccccc;">${userName}</strong>. Ingresa el código a continuación para verificar tu correo. Este código es válido por <strong style="color:#cccccc;">15 minutos</strong>.
              </p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding:28px;background:#0d0d0d;border:1px solid rgba(255,255,255,0.08);border-radius:16px;margin-bottom:24px;">
                    <p style="margin:0 0 8px;font-size:11px;font-weight:700;letter-spacing:4px;color:#555555;text-transform:uppercase;">Tu código de verificación</p>
                    <span style="display:inline-block;font-size:52px;font-weight:900;letter-spacing:12px;color:#ffffff;line-height:1;">
                      ${otp}
                    </span>
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
`;

export const sendPasswordResetEmail = async (toEmail, userName, otp) => {
    console.log(`🔑 [EMAIL RESET OTP] Enviando a ${toEmail}: ${otp}`);
    const transporter = getTransporter();
    if (!transporter) {
        console.warn('⚠️ No SMTP or Mailtrap auth found. Using fallback console OTP mode.');
        return;
    }
    try {
        await transporter.sendMail({
            from: process.env.SMTP_FROM || process.env.MAILTRAP_FROM || 'Quantify <no-reply@quantify.app>',
            to: toEmail,
            subject: `${otp} — Tu código de recuperación Quantify`,
            text: `Hola ${userName},\n\nTu código de recuperación es: ${otp}\nEste código expira en 15 minutos.\n\nSi no lo solicitaste, ignora este mensaje.`,
            html: buildResetEmailHTML(userName, otp),
        });
        console.log(`✅ Correo de recuperación enviado con éxito a ${toEmail}`);
    } catch (err) {
        console.error('❌ Error al enviar correo por SMTP:', err.message);
    }
};

export const sendVerificationEmail = async (toEmail, userName, otp) => {
    console.log(`🔑 [EMAIL VERIFY OTP] Enviando a ${toEmail}: ${otp}`);
    const transporter = getTransporter();
    if (!transporter) {
        console.warn('⚠️ No SMTP or Mailtrap auth found. Using fallback console OTP mode.');
        return;
    }
    try {
        await transporter.sendMail({
            from: process.env.SMTP_FROM || process.env.MAILTRAP_FROM || 'Quantify <no-reply@quantify.app>',
            to: toEmail,
            subject: `${otp} — Verifica tu cuenta de Quantify`,
            text: `Hola ${userName},\n\nTu código de verificación es: ${otp}\nEste código expira en 15 minutos.`,
            html: buildVerificationEmailHTML(userName, otp),
        });
        console.log(`✅ Correo de verificación enviado con éxito a ${toEmail}`);
    } catch (err) {
        console.error('❌ Error al enviar correo por SMTP:', err.message);
    }
};
