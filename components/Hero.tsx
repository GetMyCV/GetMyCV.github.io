import Image from 'next/image';
import Link from 'next/link';
import { packages, formatLkr } from '@/content/pricing';
import { whatsappLink } from '@/content/site';

const trustPoints = ['Delivered in 3–5 days', 'ATS-tested formatting', 'Revisions included'];

export default function Hero() {
  const cheapest = packages.reduce((min, p) =>
    (p.price ?? Infinity) < (min.price ?? Infinity) ? p : min,
  );

  return (
    <section className="relative overflow-hidden bg-navy text-white">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-teal/20 blur-3xl"
      />
      <div className="container-page relative grid gap-10 py-14 sm:py-20 lg:grid-cols-2 lg:items-center lg:gap-16">
        <div className="animate-fade-up">
          <p className="eyebrow text-teal">CV writing &amp; portfolio websites</p>
          <h1 className="mt-3 text-3xl leading-tight text-white sm:text-4xl lg:text-5xl">
            Get your CV and portfolio <span className="text-teal">done right</span>
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-200 sm:text-lg">
            We write ATS-friendly CVs, cover letters and LinkedIn profiles — and build the
            portfolio website that makes recruiters stop scrolling. From{' '}
            {formatLkr(cheapest.price)}.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/order/" className="btn-primary sm:px-8">
              Order now
            </Link>
            <a
              href={whatsappLink()}
              className="btn border border-white/25 text-white hover:bg-white/10"
            >
              Ask a question on WhatsApp
            </a>
          </div>

          <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-200">
            {trustPoints.map((point) => (
              <li key={point} className="flex items-center gap-2">
                <svg viewBox="0 0 20 20" className="h-4 w-4 text-teal" fill="currentColor" aria-hidden="true">
                  <path
                    fillRule="evenodd"
                    d="M16.7 5.3a1 1 0 0 1 0 1.4l-7.5 7.5a1 1 0 0 1-1.4 0L3.3 9.7a1 1 0 1 1 1.4-1.4l3.8 3.8 6.8-6.8a1 1 0 0 1 1.4 0Z"
                    clipRule="evenodd"
                  />
                </svg>
                {point}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative mx-auto w-full max-w-sm lg:max-w-none">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
            <Image
              src="/brand/logo-white.png"
              alt=""
              aria-hidden="true"
              width={368}
              height={96}
              priority
              className="h-10 w-auto"
            />
            <p className="mt-6 text-sm uppercase tracking-wide text-teal">What you get</p>
            <ul className="mt-3 space-y-3 text-sm text-slate-100">
              {[
                'A CV that survives the software screen',
                'A cover letter you can reuse',
                'A LinkedIn profile recruiters find',
                'A portfolio site that is yours to keep',
              ].map((item) => (
                <li key={item} className="flex gap-2.5">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-teal" />
                  {item}
                </li>
              ))}
            </ul>
            <p className="mt-6 border-t border-white/10 pt-4 text-xs text-slate-300">
              Three minutes to order. No account needed.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
