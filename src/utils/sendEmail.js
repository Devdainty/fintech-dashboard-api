const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async (options) => {
  try {
    const fromAddress = process.env.EMAIL_FROM || "onboarding@resend.dev";

    const data = await resend.emails.send({
      from: `Fintech Dashboard <${fromAddress}>`,
      to: options.email,
      subject: options.subject,
      text: options.message,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 25px; color: #1e293b; background-color: #f8fafc; border-radius: 8px; max-width: 500px; margin: 0 auto; border: 1px solid #e2e8f0;">
          <h2 style="color: #2563eb; margin-top: 0;">Fintech Security Verification</h2>
          <p style="font-size: 16px; line-height: 1.5; color: #334155;">${options.message}</p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
          <p style="font-size: 12px; color: #94a3b8; margin-bottom: 0;">If you did not request this verification code, please ignore this email.</p>
        </div>
      `,
    });

    console.log("Resend Email delivered successfully! ID:", data.id);
    return data;
  } catch (error) {
    console.error("Resend email delivery failed:", error.message);
  }
};

module.exports = sendEmail;
