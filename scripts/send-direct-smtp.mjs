import net from 'net';
import tls from 'tls';

export function sendOtpEmail(toEmail, otpCode) {
  return new Promise((resolve, reject) => {
    const user = 'dineshsankar718@gmail.com';
    const pass = 'jtlkggyxqwvwfogk';
    const subject = `TRCE Security Passcode: ${otpCode}`;

    console.log(`Connecting to smtp.gmail.com:587 for recipient: ${toEmail}...`);

    const socket = net.createConnection(587, 'smtp.gmail.com');
    let step = 0;
    let tlsSocket = null;

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
        tlsSocket = tls.connect({ socket, host: 'smtp.gmail.com' }, () => {
          tlsSocket.write('EHLO localhost\r\n');
        });

        tlsSocket.on('data', (td) => {
          const tstr = td.toString();

          if (step === 3 && tstr.includes('250-AUTH')) {
            step = 4;
            const authStr = Buffer.from(`\0${user}\0${pass}`).toString('base64');
            tlsSocket.write(`AUTH PLAIN ${authStr}\r\n`);
          } else if (step === 4 && tstr.startsWith('235')) {
            step = 5;
            tlsSocket.write(`MAIL FROM:<${user}>\r\n`);
          } else if (step === 5 && tstr.startsWith('250')) {
            step = 6;
            tlsSocket.write(`RCPT TO:<${toEmail}>\r\n`);
          } else if (step === 6 && tstr.startsWith('250')) {
            step = 7;
            tlsSocket.write('DATA\r\n');
          } else if (step === 7 && tstr.startsWith('354')) {
            step = 8;
            const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>TRCE Security Code</title>
</head>
<body style="background-color: #050505; color: #FFFFFF; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 40px 20px; margin: 0;">
  <div style="max-width: 480px; margin: 0 auto; background: #0f1015; border: 1px solid #27272a; border-radius: 16px; padding: 32px; box-shadow: 0 20px 40px rgba(0,0,0,0.8);">
    <div style="border-bottom: 1px solid #27272a; padding-bottom: 20px; margin-bottom: 24px;">
      <h2 style="margin: 0; color: #FFFFFF; font-size: 20px; letter-spacing: 2px; text-transform: uppercase;">TRCE Industrial</h2>
      <p style="margin: 4px 0 0 0; color: #a1a1aa; font-size: 12px; letter-spacing: 0.5px;">Operations Intelligence System</p>
    </div>
    <p style="color: #e4e4e7; font-size: 14px; margin: 0 0 16px 0;">Your one-time authentication passcode is:</p>
    <div style="background: #000000; border: 1px solid #3f3f46; border-radius: 12px; padding: 18px; text-align: center; margin-bottom: 24px;">
      <span style="font-family: monospace; font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #FFFFFF;">${otpCode}</span>
    </div>
    <p style="color: #71717a; font-size: 12px; line-height: 1.6; margin: 0;">
      This code is valid for 10 minutes. If you did not request this security code, please ignore this email.
    </p>
  </div>
</body>
</html>
            `.trim();

            const message = [
              `From: "TRCE Identity" <${user}>`,
              `To: <${toEmail}>`,
              `Subject: ${subject}`,
              'MIME-Version: 1.0',
              'Content-Type: text/html; charset=UTF-8',
              '',
              htmlBody,
              '.\r\n'
            ].join('\r\n');

            tlsSocket.write(message);
          } else if (step === 8 && tstr.startsWith('250')) {
            console.log(`[PASS] Email dispatched successfully to ${toEmail}!`);
            tlsSocket.write('QUIT\r\n');
            resolve(true);
          } else if (tstr.startsWith('5') || tstr.startsWith('4')) {
            reject(new Error(`SMTP Error: ${tstr.trim()}`));
          }
        });

        tlsSocket.on('error', reject);
      }
    });

    socket.on('error', reject);
  });
}

// Direct test run
if (process.argv[1]?.endsWith('send-direct-smtp.mjs')) {
  const target = process.argv[2] || 'dineshsankar718@gmail.com';
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  sendOtpEmail(target, code)
    .then(() => console.log('Test completed successfully!'))
    .catch((err) => console.error('Test failed:', err));
}

