import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowRight,
  BrainCircuit,
  CheckCircle2,
  Globe2,
  HeartPulse,
  LockKeyhole,
  Mic,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react';

const features = [
  {
    icon: BrainCircuit,
    title: '24/7 AI Health Assistant',
    text: 'Get instant guidance for symptoms, medications, and everyday health questions.',
    className: 'bg-blue-50 border-blue-100',
    iconClass: 'bg-blue-100 text-blue-600',
  },
  {
    icon: Sparkles,
    title: 'Smart Health Insights',
    text: 'Turn your health information into simple, useful insights you can understand.',
    className: 'bg-emerald-50 border-emerald-100',
    iconClass: 'bg-emerald-100 text-emerald-600',
  },
  {
    icon: Globe2,
    title: 'Multilingual Care',
    text: 'Connect with healthcare services in languages that feel natural to you.',
    className: 'bg-violet-50 border-violet-100',
    iconClass: 'bg-violet-100 text-violet-600',
  },
  {
    icon: HeartPulse,
    title: 'Care That Fits Your Life',
    text: 'Manage appointments, records, medicines, and family health from one place.',
    className: 'bg-amber-50 border-amber-100',
    iconClass: 'bg-amber-100 text-amber-600',
  },
];

const highlights = [
  { icon: Mic, title: 'Voice-enabled AI', text: 'Speak your symptoms instead of typing.' },
  { icon: ShieldCheck, title: 'Secure by design', text: 'Privacy-conscious healthcare workflows.' },
  { icon: Users, title: 'Family Health Hub', text: 'Keep your family’s care connected.' },
];

export default function HomePage() {
  const { t } = useTranslation('common');

  return (
    <div className="min-h-screen overflow-x-hidden bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
          <Link to="/" className="flex items-center gap-3" aria-label="EasyMedPro home">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-violet-600 text-white shadow-lg shadow-blue-200">
              <HeartPulse className="h-6 w-6" strokeWidth={2.4} />
            </div>
            <div>
              <div className="text-xl font-extrabold tracking-tight text-blue-600">EASYMED</div>
              <div className="-mt-1 text-[11px] font-semibold tracking-wide text-slate-500">SMARTER HEALTHCARE</div>
            </div>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            <button className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 shadow-sm transition hover:border-blue-200 hover:text-blue-600 sm:flex">
              <Globe2 className="h-4 w-4" />
              English
            </button>
            <Link
              to="/login"
              className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-blue-200 transition hover:bg-blue-700 active:scale-[.98] sm:px-5"
            >
              {t('login', { defaultValue: 'Login' })}
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="relative isolate overflow-hidden bg-white">
          <div className="absolute -left-24 top-10 -z-10 h-72 w-72 rounded-full bg-blue-100/60 blur-3xl" />
          <div className="absolute -right-24 top-24 -z-10 h-80 w-80 rounded-full bg-violet-100/70 blur-3xl" />

          <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 pb-16 pt-14 sm:px-8 lg:grid-cols-[1.08fr_.92fr] lg:pb-24 lg:pt-20">
            <div className="max-w-3xl">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-sm font-bold text-blue-700">
                <Sparkles className="h-4 w-4" />
                AI-powered healthcare for everyone
              </div>

              <h1 className="text-4xl font-black leading-[1.08] tracking-[-0.04em] text-slate-950 sm:text-5xl lg:text-6xl">
                Intelligent healthcare,
                <span className="block bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
                  instantly accessible.
                </span>
              </h1>

              <p className="mt-6 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
                Welcome to EasyMed — your connected healthcare companion for AI guidance,
                appointments, medicines, health records, and family care, all in one place.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-6 py-3.5 text-base font-extrabold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700 hover:shadow-xl"
                >
                  Get Started
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <a
                  href="#features"
                  className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 py-3.5 text-base font-bold text-slate-700 transition hover:border-blue-200 hover:text-blue-600"
                >
                  Explore EasyMed
                </a>
              </div>

              <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm font-semibold text-slate-500">
                <span className="inline-flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Patient-first experience</span>
                <span className="inline-flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Connected care</span>
                <span className="inline-flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Built for India</span>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-xl">
              <div className="absolute -inset-5 rounded-[2.5rem] bg-gradient-to-br from-blue-100 via-white to-violet-100 blur-2xl" />
              <div className="relative rounded-[2rem] border border-slate-200 bg-white p-5 shadow-2xl shadow-slate-200/80 sm:p-7">
                <div className="flex items-center justify-between border-b border-slate-100 pb-5">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">EasyMed</p>
                    <h2 className="mt-1 text-xl font-extrabold text-slate-900">Your health, one simple view.</h2>
                  </div>
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                    <HeartPulse className="h-6 w-6" />
                  </div>
                </div>

                <div className="mt-5 rounded-2xl bg-slate-50 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-violet-600 text-white">
                      <BrainCircuit className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-sm font-extrabold text-slate-900">AI Health Assistant</p>
                      <p className="text-xs text-slate-500">Ready to help you understand your symptoms</p>
                    </div>
                    <span className="ml-auto h-2.5 w-2.5 rounded-full bg-emerald-500" />
                  </div>
                  <div className="mt-4 rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-600">
                    “How are you feeling today?”
                  </div>
                  <div className="mt-3 flex items-center gap-2 text-xs font-bold text-blue-600">
                    <Mic className="h-4 w-4" /> Voice enabled
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
                    <p className="text-xs font-bold text-blue-600">Appointments</p>
                    <p className="mt-2 text-lg font-black text-slate-900">Manage care</p>
                  </div>
                  <div className="rounded-2xl border border-violet-100 bg-violet-50 p-4">
                    <p className="text-xs font-bold text-violet-600">Records</p>
                    <p className="mt-2 text-lg font-black text-slate-900">Stay organized</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="bg-slate-50 px-5 py-16 sm:px-8 lg:py-20">
          <div className="mx-auto max-w-7xl">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-blue-600">Everything in one place</p>
              <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">Healthcare made simpler.</h2>
              <p className="mt-4 text-slate-600">Designed to make getting and managing healthcare feel less complicated.</p>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {features.map(({ icon: Icon, title, text, className, iconClass }) => (
                <article key={title} className={`rounded-3xl border p-6 transition hover:-translate-y-1 hover:shadow-lg ${className}`}>
                  <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${iconClass}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-5 text-lg font-extrabold text-slate-900">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
                </article>
              ))}
            </div>

            <div className="mt-8 rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 p-7 text-white shadow-xl shadow-blue-200 sm:p-9">
              <div className="grid gap-7 md:grid-cols-3">
                {highlights.map(({ icon: Icon, title, text }) => (
                  <div key={title} className="flex gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/15">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-extrabold">{title}</h3>
                      <p className="mt-1 text-sm leading-5 text-blue-100">{text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white px-5 py-16 sm:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <LockKeyhole className="h-7 w-7" />
            </div>
            <h2 className="mt-5 text-3xl font-black tracking-tight text-slate-950">Ready to make healthcare easier?</h2>
            <p className="mx-auto mt-3 max-w-2xl text-slate-600">Sign in to your EasyMed account and continue your healthcare journey.</p>
            <Link to="/login" className="mt-7 inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-7 py-3.5 font-extrabold text-white shadow-lg shadow-blue-200 hover:bg-blue-700">
              Continue to EasyMed <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-slate-50 px-5 py-7 text-center text-sm text-slate-500">
        © {new Date().getFullYear()} EasyMed. Smarter healthcare, made accessible.
      </footer>
    </div>
  );
}
