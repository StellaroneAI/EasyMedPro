import { Link } from 'react-router-dom';
import { Trans, useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';

export default function HomePage() {
  const { t } = useTranslation(['common', 'auth']);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground">
      <header className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">{t('appName', { ns: 'common' })}</h1>
        <nav>
          <Button asChild variant="outline">
            <Link to="/login">{t('login', { ns: 'auth' })}</Link>
          </Button>
        </nav>
      </header>

      <main className="text-center p-4">
        <h2 className="text-4xl md:text-6xl font-extrabold mb-4">
          <Trans
            t={t}
            i18nKey="auth:home.welcome"
            values={{ appName: t('appName', { ns: 'common' }) }}
            components={[<span className="text-primary" />]}
          />
        </h2>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
          {t('home.tagline', { ns: 'auth' })}
        </p>
        <Button asChild size="lg">
          <Link to="/login">{t('getStarted', { ns: 'auth' })}</Link>
        </Button>
      </main>
    </div>
  );
}