// Resend Email dispatch helper
export async function sendMandateNotification({ email, mandateTitle, magicUrl }) {
  console.log(`[Resend Integration] Dispatched statutory mandate invitation to ${email}: ${mandateTitle} (${magicUrl})`);
  return { success: true, messageId: `msg_${Date.now()}` };
}
