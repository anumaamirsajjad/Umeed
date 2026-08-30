import Link from 'next/link';
import { ROUTES } from '@/lib/constants';
import { Card } from '@/components/ui/Card';
import { Icon, type IconName } from '@/components/ui/Icon';
import { MoonToggle } from '@/components/common/MoonToggle';

const FEATURES: { icon: IconName; title: string; urdu: string; body: string }[] = [
  {
    icon: 'chat',
    title: 'Talk, your way',
    urdu: 'گفتگو کریں',
    body: "Tell us how you'd rather be supported — family, professional, or working through it solo. We adapt to what you say, never to assumptions about who you are.",
  },
  {
    icon: 'compass',
    title: "A safety plan that's yours",
    urdu: 'منصوبہ بنائیں',
    body: 'Build a plan for hard days — warning signs, coping strategies, people you trust — and export it whenever you need it.',
  },
  {
    icon: 'lifebuoy',
    title: 'Real resources, nearby',
    urdu: 'وسائل',
    body: 'Crisis lines and professional support, filtered to your region — always one tap away, whether or not you’re signed in.',
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-surface-light dark:bg-surface-dark">
      {/* Persistent crisis banner — independent of the auth wall, reachable in under 3 seconds */}
      <div className="sticky top-0 z-50 bg-primary-800 text-white">
        <div className="max-w-5xl mx-auto px-4 py-2 flex items-center justify-between gap-3 text-sm">
          <span className="flex items-center gap-2">
            <Icon name="shield" className="icon-inline" />
            In crisis right now? You don&apos;t have to wait.
          </span>
          <Link href={ROUTES.resources} className="font-semibold underline underline-offset-2 whitespace-nowrap">
            Get help now &rarr;
          </Link>
        </div>
      </div>

      <header className="border-b border-primary-100 dark:border-primary-900/40">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <span className="font-display text-xl font-bold text-ink-light dark:text-ink-dark">Umeed</span>
          <div className="flex items-center gap-2">
            <MoonToggle size="sm" />
            <Link
              href={ROUTES.login}
              className="rounded-lg px-4 py-2 text-sm font-semibold text-primary-800 dark:text-primary-100 hover:bg-primary-100 dark:hover:bg-white/5 transition-colors duration-micro ease-umeed"
            >
              Log in
            </Link>
            <Link
              href={ROUTES.signup}
              className="rounded-lg px-4 py-2 text-sm font-semibold bg-primary-700 hover:bg-primary-800 text-white transition-colors duration-micro ease-umeed"
            >
              Sign up
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="jali-bg">
          <div className="max-w-3xl mx-auto px-4 pt-16 pb-20 text-center space-y-6">
            <h1 className="animate-fade-up font-display text-4xl md:text-hero font-bold text-ink-light dark:text-ink-dark leading-tight">
              Support that meets you <em className="italic text-primary-700 dark:text-primary-300">where you are</em>.
            </h1>
            <p
              className="animate-fade-up font-nastaliq text-xl font-bold text-primary-700 dark:text-primary-300"
              style={{ animationDelay: '40ms' }}
              lang="ur"
              dir="rtl"
            >
              امید سے بات کریں
            </p>
            <p
              className="animate-fade-up text-lead text-ink-muted max-w-xl mx-auto"
              style={{ animationDelay: '90ms' }}
            >
              Culturally-sensitive AI support that remembers your preferences, paired with a safety plan that&apos;s
              actually yours.
            </p>
            <div className="animate-fade-up" style={{ animationDelay: '160ms' }}>
              <Link
                href={ROUTES.signup}
                className="inline-flex items-center gap-2 justify-center rounded-pill bg-primary-700 hover:bg-primary-800 text-white font-semibold text-lg px-8 py-3.5 transition-colors duration-micro ease-umeed"
              >
                Get started
                <Icon name="arrowRight" className="icon-inline" />
              </Link>
            </div>
            <p
              className="animate-fade-up text-caption text-ink-muted"
              style={{ animationDelay: '220ms' }}
            >
              Free to use. No demographic questions — ever.
            </p>
          </div>
        </section>

        <section className="max-w-5xl mx-auto px-4 pb-20">
          <div className="grid gap-6 md:grid-cols-3">
            {FEATURES.map((f, i) => (
              <Card
                key={f.title}
                padding="lg"
                className="animate-fade-up space-y-3 hover:-translate-y-1 hover:shadow-md transition-all duration-quick ease-umeed"
                style={{ animationDelay: `${260 + i * 80}ms` }}
              >
                <div
                  aria-hidden="true"
                  className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center text-primary-700 dark:text-primary-300"
                >
                  <Icon name={f.icon} className="icon-inline" />
                </div>
                <h2 className="font-display text-lg font-semibold text-ink-light dark:text-ink-dark flex items-baseline gap-2">
                  {f.title}
                  <span className="font-nastaliq text-sm text-primary-600 dark:text-primary-300" lang="ur" dir="rtl">
                    {f.urdu}
                  </span>
                </h2>
                <p className="text-sm text-ink-muted">{f.body}</p>
              </Card>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-primary-100 dark:border-primary-900/40">
        <div className="max-w-3xl mx-auto px-4 py-12 text-center space-y-4">
          <p className="text-ink-muted">
            Not ready to sign up? Crisis resources are open to everyone.
          </p>
          <Link
            href={ROUTES.resources}
            className="inline-flex items-center justify-center rounded-pill border border-primary-300 dark:border-primary-700 text-primary-700 dark:text-primary-200 font-semibold px-6 py-2.5 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors duration-micro ease-umeed"
          >
            Browse crisis &amp; support resources
          </Link>
        </div>
      </footer>
    </div>
  );
}
