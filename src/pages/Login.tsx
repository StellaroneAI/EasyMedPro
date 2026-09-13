import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast, Toaster } from 'react-hot-toast';
import {
  ArrowLeft,
  Check,
  ChevronDown,
  Globe2,
  HeartPulse,
  LockKeyhole,
  Mail,
  Phone,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

const copy = {
  en: {
    brandLine: 'Your health, your way.',
    title: 'Welcome to EasyMed',
    subtitle: 'AI for a healthier tomorrow.',
    phone: 'Phone',
    email: 'Email',
    phoneLabel: 'Phone number',
    emailLabel: 'Email address',
    phonePlaceholder: '+91 9876543210',
    emailPlaceholder: 'you@example.com',
    otp: 'Get OTP',
    password: 'Password',
    passwordPlaceholder: 'Enter your password',
    signIn: 'Sign in',
    or: 'or continue with',
    guest: 'Continue as guest',
    newUser: 'New to EasyMed?',
    signUp: 'Create an account',
    privacy: 'By continuing, you agree to our Terms and Privacy Policy.',
    secure: 'Secure healthcare access',
    secureText: 'Your account is protected with secure authentication.',
    back: 'Back to home',
    otpNote: 'We’ll send a one-time verification code to your phone.',
    mockSuccess: 'Demo login successful',
    invalid: 'Please enter your credentials.',
  },
  kn: {
    brandLine: 'ನಿಮ್ಮ ಆರೋಗ್ಯ, ನಿಮ್ಮ ರೀತಿಯಲ್ಲಿ.',
    title: 'EasyMed ಗೆ ಸ್ವಾಗತ',
    subtitle: 'ಉತ್ತಮ ಆರೋಗ್ಯಕ್ಕಾಗಿ AI.',
    phone: 'ಫೋನ್',
    email: 'ಇಮೇಲ್',
    phoneLabel: 'ಫೋನ್ ಸಂಖ್ಯೆ',
    emailLabel: 'ಇಮೇಲ್ ವಿಳಾಸ',
    phonePlaceholder: '+91 9876543210',
    emailPlaceholder: 'you@example.com',
    otp: 'OTP ಕಳುಹಿಸಿ',
    password: 'ಪಾಸ್‌ವರ್ಡ್',
    passwordPlaceholder: 'ನಿಮ್ಮ ಪಾಸ್‌ವರ್ಡ್ ನಮೂದಿಸಿ',
    signIn: 'ಲಾಗಿನ್',
    or: 'ಅಥವಾ ಮುಂದುವರಿಸಿ',
    guest: 'ಅತಿಥಿಯಾಗಿ ಮುಂದುವರಿಸಿ',
    newUser: 'EasyMed ಗೆ ಹೊಸಬರೇ?',
    signUp: 'ಖಾತೆ ರಚಿಸಿ',
    privacy: 'ಮುಂದುವರಿಸುವ ಮೂಲಕ, ನಮ್ಮ ನಿಯಮಗಳು ಮತ್ತು ಗೌಪ್ಯತಾ ನೀತಿಯನ್ನು ಒಪ್ಪುತ್ತೀರಿ.',
    secure: 'ಸುರಕ್ಷಿತ ಆರೋಗ್ಯ ಪ್ರವೇಶ',
    secureText: 'ನಿಮ್ಮ ಖಾತೆಯನ್ನು ಸುರಕ್ಷಿತ ದೃಢೀಕರಣದಿಂದ ರಕ್ಷಿಸಲಾಗಿದೆ.',
    back: 'ಮುಖಪುಟಕ್ಕೆ ಹಿಂತಿರುಗಿ',
    otpNote: 'ನಿಮ್ಮ ಫೋನ್‌ಗೆ ಒಂದು ಬಾರಿ ಬಳಸುವ ಪರಿಶೀಲನಾ ಕೋಡ್ ಕಳುಹಿಸಲಾಗುತ್ತದೆ.',
    mockSuccess: 'ಡೆಮೊ ಲಾಗಿನ್ ಯಶಸ್ವಿಯಾಗಿದೆ',
    invalid: 'ದಯವಿಟ್ಟು ನಿಮ್ಮ ವಿವರಗಳನ್ನು ನಮೂದಿಸಿ.',
  },
};

export default function LoginPage() {
  const navigate = useNavigate();
  const [language, setLanguage] = useState<'en' | 'kn'>('kn');
  const [method, setMethod] = useState<'phone' | 'email'>('phone');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const t = copy[language];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) {
      toast.error(t.invalid);
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      // Preserve the repository's current demo credentials while presenting the new UI.
      if (method === 'email' && identifier === 'patient' && password === 'password') {
        toast.success(t.mockSuccess);
        navigate('/patient/dashboard');
      } else if (method === 'email' && identifier === 'doctor' && password === 'password') {
        toast.success(t.mockSuccess);
        navigate('/doctor/dashboard');
      } else if (method === 'email' && identifier === 'asha' && password === 'password') {
        toast.success(t.mockSuccess);
        navigate('/asha/hub');
      } else if (method === 'email' && identifier === 'admin' && password === 'password') {
        toast.success(t.mockSuccess);
        navigate('/admin/dashboard');
      } else if (method === 'phone') {
        toast.success(language === 'kn' ? 'OTP ಕಳುಹಿಸಲಾಗಿದೆ (ಡೆಮೊ).' : 'OTP sent (demo).');
      } else {
        toast.error(language === 'kn' ? 'ದಯವಿಟ್ಟು ಸರಿಯಾದ ವಿವರಗಳನ್ನು ನಮೂದಿಸಿ.' : 'Please check your credentials.');
      }
      setIsLoading(false);
    }, 700);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/60 text-slate-900">
      <Toaster position="top-center" />

      <header className="absolute left-0 right-0 top-0 z-20">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-violet-600 text-white shadow-lg shadow-blue-200">
              <HeartPulse className="h-6 w-6" strokeWidth={2.4} />
            </div>
            <div>
              <div className="text-xl font-extrabold tracking-tight text-blue-600">EASYMED</div>
              <div className="-mt-1 text-[10px] font-semibold tracking-wide text-slate-500">{t.brandLine}</div>
            </div>
          </Link>

          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white/90 p-1 shadow-sm backdrop-blur">
            <Globe2 className="ml-2 h-4 w-4 text-slate-500" />
            <button
              type="button"
              onClick={() => setLanguage(language === 'kn' ? 'en' : 'kn')}
              className="flex items-center gap-1 rounded-lg px-2.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
              aria-label="Change language"
            >
              {language === 'kn' ? 'ಕನ್ನಡ' : 'English'}
              <ChevronDown className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </header>

      <main className="flex min-h-screen items-center justify-center px-4 pb-10 pt-28 sm:px-6">
        <div className="grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-2xl shadow-slate-200/70 lg:grid-cols-[.82fr_1.18fr]">
          <aside className="hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 p-10 text-white lg:flex lg:flex-col lg:justify-between">
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15">
                <Sparkles className="h-6 w-6" />
              </div>
              <h2 className="mt-7 text-3xl font-black leading-tight">Healthcare that feels closer.</h2>
              <p className="mt-4 text-sm leading-6 text-blue-100">
                Connect to your care, your health information, and intelligent assistance from one secure place.
              </p>
            </div>
            <div className="space-y-4">
              {[['AI-powered assistance', 'Get helpful health guidance when you need it.'], ['Connected care', 'Keep appointments and health information together.'], ['Privacy-conscious', 'Built with secure healthcare workflows in mind.']].map(([title, text]) => (
                <div key={title} className="flex gap-3 rounded-2xl bg-white/10 p-4">
                  <Check className="mt-0.5 h-5 w-5 shrink-0" />
                  <div><p className="text-sm font-extrabold">{title}</p><p className="mt-1 text-xs leading-5 text-blue-100">{text}</p></div>
                </div>
              ))}
            </div>
          </aside>

          <section className="p-6 sm:p-10 lg:p-12">
            <Link to="/" className="mb-8 inline-flex items-center gap-2 text-sm font-bold text-slate-500 transition hover:text-blue-600">
              <ArrowLeft className="h-4 w-4" /> {t.back}
            </Link>

            <div className="mx-auto max-w-md">
              <div className="mb-8 text-center">
                <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-50 to-violet-50 text-blue-600">
                  <HeartPulse className="h-7 w-7" />
                </div>
                <h1 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">{t.title}</h1>
                <p className="mt-2 text-sm font-medium text-slate-500 sm:text-base">{t.subtitle}</p>
              </div>

              <div className="mb-6 grid grid-cols-2 rounded-2xl bg-slate-100 p-1.5">
                {(['phone', 'email'] as const).map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => { setMethod(item); setIdentifier(''); setPassword(''); }}
                    className={`rounded-xl px-4 py-3 text-sm font-extrabold transition ${method === item ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    {item === 'phone' ? t.phone : t.email}
                  </button>
                ))}
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="identifier" className="mb-2 block text-sm font-extrabold text-slate-700">
                    {method === 'phone' ? t.phoneLabel : t.emailLabel}
                  </label>
                  <div className="relative">
                    {method === 'phone' ? <Phone className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" /> : <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />}
                    <input
                      id="identifier"
                      type={method === 'phone' ? 'tel' : 'text'}
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder={method === 'phone' ? t.phonePlaceholder : t.emailPlaceholder}
                      className="h-14 w-full rounded-2xl border border-slate-200 bg-white pl-12 pr-4 text-base font-medium outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {method === 'email' && (
                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <label htmlFor="password" className="text-sm font-extrabold text-slate-700">{t.password}</label>
                      <button type="button" className="text-xs font-bold text-blue-600 hover:underline">Forgot password?</button>
                    </div>
                    <div className="relative">
                      <LockKeyhole className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                      <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder={t.passwordPlaceholder}
                        className="h-14 w-full rounded-2xl border border-slate-200 bg-white pl-12 pr-4 text-base font-medium outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                )}

                {method === 'phone' && <p className="-mt-2 text-xs leading-5 text-slate-500">{t.otpNote}</p>}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex h-14 w-full items-center justify-center rounded-2xl bg-gradient-to-r from-blue-600 to-violet-600 text-base font-extrabold text-white shadow-lg shadow-blue-200 transition hover:from-blue-700 hover:to-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isLoading ? 'Please wait…' : method === 'phone' ? t.otp : t.signIn}
                </button>
              </form>

              <div className="my-7 flex items-center gap-4">
                <div className="h-px flex-1 bg-slate-200" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">{t.or}</span>
                <div className="h-px flex-1 bg-slate-200" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button type="button" className="h-12 rounded-xl border border-slate-200 bg-white text-sm font-extrabold text-slate-700 transition hover:bg-slate-50">Google</button>
                <button type="button" className="h-12 rounded-xl border border-slate-200 bg-white text-sm font-extrabold text-slate-700 transition hover:bg-slate-50">Apple</button>
              </div>

              <button type="button" className="mt-3 h-12 w-full rounded-xl border border-slate-200 bg-white text-sm font-extrabold text-slate-700 transition hover:bg-slate-50">{t.guest}</button>

              <div className="mt-7 flex items-start gap-3 rounded-2xl bg-slate-50 p-4">
                <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                <div><p className="text-xs font-extrabold text-slate-700">{t.secure}</p><p className="mt-1 text-[11px] leading-5 text-slate-500">{t.secureText}</p></div>
              </div>

              <p className="mt-6 text-center text-sm text-slate-500">
                {t.newUser}{' '}
                <button type="button" className="font-extrabold text-blue-600 hover:underline">{t.signUp}</button>
              </p>
              <p className="mt-4 text-center text-[11px] leading-5 text-slate-400">{t.privacy}</p>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
