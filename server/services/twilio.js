import twilio from 'twilio';
import dotenv from 'dotenv';

dotenv.config();

let client;
if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
  client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
}

export const sendSMS = async (to, body) => {
  try {
    if (!client) {
      console.warn('Twilio credentials missing. SMS simulation:', { to, body });
      return { sid: 'simulated_sid' };
    }
    const message = await client.messages.create({
      body,
      from: process.env.TWILIO_PHONE_NUMBER,
      to
    });
    console.log(`Twilio SMS sent. SID: ${message.sid}`);
    return message;
  } catch (error) {
    console.error('Twilio SMS error:', error);
    return { sid: 'failed_sid', error: error.message };
  }
};
