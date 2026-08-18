import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === 'true',

    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },

    tls: {
        rejectUnauthorized: false,
    },
});

/**
 * Verificar conexión SMTP al iniciar el servidor
 */
transporter.verify((error, success) => {
    if (error) {
        console.error('❌ Error de conexión SMTP:');
        console.error(error);
    } else {
        console.log('✅ Servidor SMTP listo para enviar correos');
    }
});

/**
 * Plantilla HTML
 */
const buildResetEmailHTML = (userName, otp) => `
<!doctype html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0"
    >

    <title>Código de verificación · Quantify</title>
</head>

<body
    style="
        margin:0;
        padding:0;
        background-color:#0a0a0a;
        font-family:Arial, Helvetica, sans-serif;
    "
>

<table
    role="presentation"
    width="100%"
    cellpadding="0"
    cellspacing="0"
    style="
        background:#0a0a0a;
        padding:40px 16px;
    "
>

<tr>

<td align="center">

<table
    role="presentation"
    width="600"
    cellpadding="0"
    cellspacing="0"
    style="
        max-width:600px;
        width:100%;
        background:#111111;
        border-radius:24px;
        overflow:hidden;
        border:1px solid rgba(255,255,255,0.08);
    "
>

<!-- BARRA SUPERIOR -->

<tr>

<td
    height="4"
    style="
        background:#06B6D4;
    "
></td>

</tr>


<!-- LOGO -->

<tr>

<td
    align="center"
    style="
        padding:40px 40px 24px;
    "
>

<div
    style="
        display:inline-block;
        padding:10px 18px;
        border-radius:14px;
        border:1px solid rgba(255,255,255,0.1);
        background:#1a1a1a;
    "
>

<span
    style="
        color:#ffffff;
        font-size:20px;
        font-weight:900;
        letter-spacing:2px;
    "
>
QUANTIFY
</span>

</div>

</td>

</tr>


<!-- CONTENIDO -->

<tr>

<td
    style="
        padding:0 40px 32px;
    "
>

<h1
    style="
        margin:0 0 12px;
        color:#ffffff;
        font-size:26px;
        font-weight:800;
    "
>
Código de verificación
</h1>


<p
    style="
        margin:0 0 24px;
        color:#888888;
        font-size:14px;
        line-height:1.6;
    "
>

Hola,

<strong style="color:#ffffff;">
${userName}
</strong>

<br><br>

Hemos recibido una solicitud para verificar tu cuenta de Quantify.

Tu código de seguridad es:

</p>


<!-- OTP -->

<table
    role="presentation"
    width="100%"
    cellpadding="0"
    cellspacing="0"
>

<tr>

<td
    align="center"
    style="
        padding:30px;
        background:#0d0d0d;
        border:1px solid rgba(255,255,255,0.08);
        border-radius:16px;
    "
>

<p
    style="
        margin:0 0 12px;
        color:#555555;
        font-size:11px;
        font-weight:bold;
        letter-spacing:4px;
        text-transform:uppercase;
    "
>
Código de seguridad
</p>


<span
    style="
        color:#ffffff;
        font-size:48px;
        font-weight:900;
        letter-spacing:10px;
    "
>
${otp}
</span>

</td>

</tr>

</table>


<p
    style="
        margin:24px 0 0;
        color:#666666;
        font-size:12px;
        line-height:1.6;
    "
>

Este código es válido durante

<strong style="color:#aaaaaa;">
15 minutos
</strong>

.

Si tú no solicitaste este código, puedes ignorar este correo.

</p>

</td>

</tr>


<!-- SEGURIDAD -->

<tr>

<td
    style="
        padding:0 40px 32px;
    "
>

<div
    style="
        padding:16px;
        background:#151515;
        border-radius:12px;
        border:1px solid rgba(255,255,255,0.05);
        color:#666666;
        font-size:11px;
        line-height:1.6;
    "
>

🔒

<strong style="color:#888888;">
Consejo de seguridad:
</strong>

Nunca compartas este código con otras personas.

</div>

</td>

</tr>


<!-- FOOTER -->

<tr>

<td
    style="
        padding:24px 40px;
        border-top:1px solid rgba(255,255,255,0.05);
    "
>

<p
    style="
        margin:0;
        color:#444444;
        font-size:11px;
        text-align:center;
    "
>

© ${new Date().getFullYear()} Quantify Intelligence

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


/**
 * Enviar código de verificación
 */
export const sendPasswordResetEmail = async (
    toEmail,
    userName,
    otp
) => {

    try {

        const info = await transporter.sendMail({

            from:
                process.env.SMTP_FROM ||
                'Quantify <no-reply@quantify.app>',

            to: toEmail,

            subject:
                `${otp} — Código de verificación Quantify`,

            text:
                `Hola ${userName},

Tu código de verificación de Quantify es:

${otp}

Este código es válido durante 15 minutos.

Si no solicitaste este código, ignora este mensaje.`,

            html:
                buildResetEmailHTML(
                    userName,
                    otp
                ),
        });

        console.log(
            '✅ Correo enviado:',
            info.messageId
        );

        return info;

    } catch (error) {

        console.error(
            '❌ Error enviando correo SMTP:'
        );

        console.error(error);

        throw error;
    }
};