import crypto from 'crypto';

const OTP_SECRET = 'trce-super-secure-otp-hmac-key-2026';

function createOtpChallenge(email, code) {
  const cleanEmail = email.trim().toLowerCase();
  const expiresAt = Date.now() + 10 * 60 * 1000;
  const payload = `${cleanEmail}|${code}|${expiresAt}`;
  const hmac = crypto.createHmac('sha256', OTP_SECRET).update(payload).digest('hex');
  return Buffer.from(`${payload}|${hmac}`).toString('base64');
}

function verifyOtpChallenge(email, inputCode, token) {
  try {
    const raw = Buffer.from(token, 'base64').toString('utf-8');
    const parts = raw.split('|');
    if (parts.length !== 4) return { valid: false, reason: 'Malformed challenge token' };

    const [tokenEmail, tokenCode, expiresAtStr, tokenHmac] = parts;
    const expiresAt = parseInt(expiresAtStr, 10);

    if (Date.now() > expiresAt) {
      return { valid: false, reason: 'Security code has expired.' };
    }

    const cleanEmail = email.trim().toLowerCase();
    if (cleanEmail !== tokenEmail.toLowerCase()) {
      return { valid: false, reason: 'Email does not match OTP challenge' };
    }

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
    return { valid: false, reason: 'Verification failed' };
  }
}

// Tests
const email = 'dineshsankar718@gmail.com';
const code = '654321';
const token = createOtpChallenge(email, code);

console.log('1. Valid code test:');
const res1 = verifyOtpChallenge(email, '654321', token);
console.log('Expected: true, Got:', res1.valid);
if (!res1.valid) process.exit(1);

console.log('2. Invalid code test:');
const res2 = verifyOtpChallenge(email, '111111', token);
console.log('Expected: false, Got:', res2.valid, 'Reason:', res2.reason);
if (res2.valid) process.exit(1);

console.log('3. Wrong email test:');
const res3 = verifyOtpChallenge('other@trce.io', '654321', token);
console.log('Expected: false, Got:', res3.valid, 'Reason:', res3.reason);
if (res3.valid) process.exit(1);

console.log('ALL TESTS PASSED WITH 100% SUCCESS!');
