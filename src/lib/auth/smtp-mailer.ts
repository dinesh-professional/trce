import net from 'net';
import tls from 'tls';
import crypto from 'crypto';

const SMTP_HOST = process.env.SMTP_HOST || 'smtp.gmail.com';
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587', 10);
const SMTP_USER = process.env.SMTP_USER || 'dineshsankar718@gmail.com';
const SMTP_PASS = (process.env.SMTP_PASS || 'jtlkggyxqwvwfogk').replace(/\s+/g, '');
const OTP_SECRET = process.env.OTP_SECRET || 'trce-super-secure-otp-hmac-key-2026';

export interface SendOtpResult {
  success: boolean;
  message: string;
  challengeToken?: string;
}

/**
 * Dispatches a 6-digit OTP code over SMTP protocol using native Node TLS/Net
 */
export function sendSmtpEmail(toEmail: string, otpCode: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const subject = `TRCE Security Code: ${otpCode}`;

    const socket = net.createConnection(SMTP_PORT, SMTP_HOST);
    socket.setTimeout(12000, () => {
      socket.destroy();
      reject(new Error('SMTP connection timed out after 12s'));
    });

    let step = 0;
    let tlsSocket: tls.TLSSocket | null = null;

    socket.on('data', (d) => {
      const str = d.toString();

      if (step === 0 && str.startsWith('220')) {
        step = 1;
        socket.write('EHLO localhost\r\n');
      } else if (step === 1 && str.includes('250-STARTTLS')) {
        step = 2;
        socket.write('STARTTLS\r\n');
      } else if (step === 2 && str.startsWith('220')) {
        step = 3;
        tlsSocket = tls.connect({ socket, host: SMTP_HOST }, () => {
          tlsSocket?.write('EHLO localhost\r\n');
        });

        tlsSocket.on('data', (td) => {
          const tstr = td.toString();

          if (step === 3 && tstr.includes('250-AUTH')) {
            step = 4;
            const authStr = Buffer.from(`\0${SMTP_USER}\0${SMTP_PASS}`).toString('base64');
            tlsSocket?.write(`AUTH PLAIN ${authStr}\r\n`);
          } else if (step === 4 && tstr.startsWith('235')) {
            step = 5;
            tlsSocket?.write(`MAIL FROM:<${SMTP_USER}>\r\n`);
          } else if (step === 5 && tstr.startsWith('250')) {
            step = 6;
            tlsSocket?.write(`RCPT TO:<${toEmail}>\r\n`);
          } else if (step === 6 && tstr.startsWith('250')) {
            step = 7;
            tlsSocket?.write('DATA\r\n');
          } else if (step === 7 && tstr.startsWith('354')) {
            step = 8;
            const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="background-color: #050505; color: #FFFFFF; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 40px 20px; margin: 0;">
  <div style="max-width: 480px; margin: 0 auto; background: #0b0c10; border: 1px solid #27272a; border-radius: 16px; padding: 32px; box-shadow: 0 20px 40px rgba(0,0,0,0.8);">
    <div style="border-bottom: 1px solid #27272a; padding-bottom: 20px; margin-bottom: 24px;">
      <h2 style="margin: 0; color: #FFFFFF; font-size: 20px; letter-spacing: 2px; text-transform: uppercase;">TRCE Industrial</h2>
      <p style="margin: 4px 0 0 0; color: #a1a1aa; font-size: 12px; letter-spacing: 0.5px;">Operations Intelligence System</p>
    </div>
    <p style="color: #e4e4e7; font-size: 14px; margin: 0 0 16px 0;">Your one-time authentication passcode is:</p>
    <div style="background: #000000; border: 1px solid #3f3f46; border-radius: 12px; padding: 18px; text-align: center; margin-bottom: 24px;">
      <span style="font-family: monospace; font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #FFFFFF;">${otpCode}</span>
    </div>
    <p style="color: #71717a; font-size: 12px; line-height: 1.6; margin: 0;">
      This code is valid for 10 minutes. If you did not request this code, you can safely ignore this email.
    </p>
  </div>
</body>
</html>`.trim();

            const message = [
              `From: "TRCE Security" <${SMTP_USER}>`,
              `To: <${toEmail}>`,
              `Subject: ${subject}`,
              'MIME-Version: 1.0',
              'Content-Type: text/html; charset=UTF-8',
              '',
              html,
              '.\r\n'
            ].join('\r\n');

            tlsSocket?.write(message);
          } else if (step === 8 && tstr.startsWith('250')) {
            tlsSocket?.write('QUIT\r\n');
            resolve(true);
          } else if (tstr.startsWith('5') || tstr.startsWith('4')) {
            reject(new Error(`SMTP Protocol Error: ${tstr.trim()}`));
          }
        });

        tlsSocket.on('error', reject);
      }
    });

    socket.on('error', reject);
  });
}

/**
 * Creates a cryptographically signed OTP challenge token
 */
export function createOtpChallenge(email: string, code: string): string {
  const cleanEmail = email.trim().toLowerCase();
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes
  const payload = `${cleanEmail}|${code}|${expiresAt}`;
  const hmac = crypto.createHmac('sha256', OTP_SECRET).update(payload).digest('hex');
  return Buffer.from(`${payload}|${hmac}`).toString('base64');
}

/**
 * Validates a signed OTP challenge token
 */
export function verifyOtpChallenge(email: string, inputCode: string, token: string): { valid: boolean; reason?: string } {
  try {
    const raw = Buffer.from(token, 'base64').toString('utf-8');
    const parts = raw.split('|');
    if (parts.length !== 4) return { valid: false, reason: 'Malformed challenge token' };

    const [tokenEmail, tokenCode, expiresAtStr, tokenHmac] = parts;
    const expiresAt = parseInt(expiresAtStr, 10);

    if (Date.now() > expiresAt) {
      return { valid: false, reason: 'Security code has expired. Please request a new one.' };
    }

    const cleanEmail = email.trim().toLowerCase();
    if (cleanEmail !== tokenEmail.toLowerCase()) {
      return { valid: false, reason: 'Email does not match OTP challenge' };
    }

    // Verify cryptographic signature
    const expectedPayload = `${tokenEmail}|${tokenCode}|${expiresAtStr}`;
    const expectedHmac = crypto.createHmac('sha256', OTP_SECRET).update(expectedPayload).digest('hex');

    if (!crypto.timingSafeEqual(Buffer.from(tokenHmac), Buffer.from(expectedHmac))) {
      return { valid: false, reason: 'Invalid signature on security challenge' };
    }

    if (inputCode.trim() !== tokenCode.trim()) {
      return { valid: false, reason: 'Incorrect 6-digit security code' };
    }

    return { valid: true };
  } catch {
    return { valid: false, reason: 'Verification verification failed' };
  }
}
