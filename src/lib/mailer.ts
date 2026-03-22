import sgMail from "@sendgrid/mail";

if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

export async function sendColdEmail({ to, subject, text, from = "copilot@yourdomain.com" }: { to: string, subject: string, text: string, from?: string }) {
  if (!process.env.SENDGRID_API_KEY) {
    console.warn("SendGrid API key missing. Mocking email send.");
    console.log(`[MOCK EMAIL] To: ${to}\nSubject: ${subject}\n\n${text}`);
    return { success: true, messageId: "mock-id" };
  }

  const msg = {
    to,
    from,
    subject,
    text,
    trackingSettings: {
      clickTracking: { enable: true },
      openTracking: { enable: true }
    }
  };

  try {
    const response = await sgMail.send(msg);
    return { success: true, response };
  } catch (error: any) {
    console.error("Error sending email via SendGrid:", error);
    if (error.response) {
      console.error(error.response.body);
    }
    throw new Error("Failed to send email");
  }
}
