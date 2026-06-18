import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID;
const fromPhone = process.env.TWILIO_PHONE_NUMBER || '+18598881260';

let client: twilio.Twilio | null = null;

if (accountSid && authToken) {
  client = twilio(accountSid, authToken);
}

/**
 * Sends an SMS message to a specific number
 * @param to - The target phone number (E.164 format)
 * @param body - Message content
 */
export async function sendSMS(to: string, body: string): Promise<boolean> {
  if (!client) {
    console.warn('Twilio credentials missing. SMS simulated:', { to, body });
    return true;
  }

  try {
    const message = await client.messages.create({
      body,
      from: fromPhone,
      to,
    });
    console.log(`SMS dispatched. SID: ${message.sid}`);
    return true;
  } catch (error) {
    console.error('Twilio SMS delivery failed:', error);
    return false;
  }
}

/**
 * Initiates phone number verification OTP
 * @param to - The target phone number (E.164 format)
 */
export async function startVerification(to: string): Promise<boolean> {
  if (!client || !verifyServiceSid) {
    console.warn('Twilio Verify config missing. Verification started (Mock):', to);
    return true;
  }

  try {
    const verification = await client.verify.v2
      .services(verifyServiceSid)
      .verifications.create({ to, channel: 'sms' });
    return verification.status === 'pending';
  } catch (error) {
    console.error('Twilio start verification failed:', error);
    return false;
  }
}

/**
 * Checks verification OTP
 * @param to - The verified phone number
 * @param code - The OTP code inputted
 */
export async function checkVerification(to: string, code: string): Promise<boolean> {
  if (!client || !verifyServiceSid) {
    console.warn('Twilio Verify config missing. Verification checked (Mock):', { to, code });
    return code === '123456'; // Default mock OTP
  }

  try {
    const check = await client.verify.v2
      .services(verifyServiceSid)
      .verificationChecks.create({ to, code });
    return check.status === 'approved';
  } catch (error) {
    console.error('Twilio verification check failed:', error);
    return false;
  }
}

export default client;
