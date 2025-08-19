const COOLDOWN_MS = 60_000;
let lastSent = 0;

export const secondsRemaining = () => {
  const diff = Date.now() - lastSent;
  return diff < COOLDOWN_MS ? Math.ceil((COOLDOWN_MS - diff) / 1000) : 0;
};

export async function sendOtp(phone: string) {
  if (secondsRemaining() > 0) {
    throw new Error('Please wait before requesting another OTP');
  }
  const res = await fetch('/api/sms/send-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone })
  });
  if (!res.ok) throw new Error('Failed to send OTP');
  lastSent = Date.now();
  return res.json();
}

export async function verifyOtp(phone: string, code: string) {
  const res = await fetch('/api/sms/verify-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, code })
  });
  if (!res.ok) throw new Error('Failed to verify OTP');
  return res.json();
}

export default { sendOtp, verifyOtp, secondsRemaining };
