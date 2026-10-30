import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://pimnkcefqfxnqxgtqevq.supabase.co';
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBpbW5rY2VmcWZ4bnF4Z3RxZXZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMzMzc2NDUsImV4cCI6MjEwODkxMzY0NX0.4nEzPD14hOYjqtHXvDMhgCTNXlWf3kskLtqmi1Kyplc';

const targetEmail = process.argv[2] || 'dinesh.eec24@gmail.com';

console.log('----------------------------------------------------');
console.log('TRCE SMTP & OTP Verification Protocol Test');
console.log('Target Email:', targetEmail);
console.log('Supabase Endpoint:', SUPABASE_URL);
console.log('----------------------------------------------------');

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function run() {
  console.log('[1/2] Initiating signInWithOtp request over SMTP...');
  const startTime = Date.now();
  
  const { data, error } = await supabase.auth.signInWithOtp({
    email: targetEmail,
    options: {
      shouldCreateUser: true,
    },
  });

  const duration = Date.now() - startTime;

  if (error) {
    console.error(`[FAIL] Dispatch failed in ${duration}ms:`);
    console.error('Error Code/Status:', error.status);
    console.error('Error Message:', error.message);
    console.log('\nDiagnostic Advice:');
    if (error.message.includes('Error sending magic link email')) {
      console.log('-> Reason: Supabase SMTP connection rejected by mailer.');
      console.log('-> Fix 1: Ensure Port is 587 (NOT 465) in Supabase SMTP settings.');
      console.log('-> Fix 2: Ensure Sender Email is onboarding@resend.dev (or verified domain).');
      console.log('-> Fix 3: Ensure Username is "resend" and Password is your valid API key (re_...).');
    } else if (error.message.includes('rate limit')) {
      console.log('-> Reason: Email rate limit exceeded on mailer.');
    }
    process.exit(1);
  }

  console.log(`[PASS] OTP dispatched successfully in ${duration}ms!`);
  console.log('Check inbox of', targetEmail, 'for the 6-digit verification code.');
}

run().catch((err) => {
  console.error('[UNEXPECTED ERROR]:', err);
  process.exit(1);
});

