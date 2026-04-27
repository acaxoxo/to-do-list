const nodemailer = require('nodemailer');

function getTransporter() {
    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT || 2525);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    const secure = String(process.env.SMTP_SECURE || '').toLowerCase() === 'true';

    if (!host || !user || !pass) {
        throw new Error('SMTP configuration is missing');
    }

    return nodemailer.createTransport({
        host,
        port,
        secure,
        auth: {
            user,
            pass,
        },
    });
}

async function sendPasswordResetEmail({ to, resetUrl }) {
    const from = process.env.SMTP_FROM || 'no-reply@todo.local';
    const transporter = getTransporter();

    await transporter.sendMail({
        from,
        to,
        subject: 'Reset your password',
        text: `You requested a password reset.\n\nOpen this link to reset your password: ${resetUrl}\n\nIf you did not request this, you can ignore this email.`,
    });
}

module.exports = {
    sendPasswordResetEmail,
};
