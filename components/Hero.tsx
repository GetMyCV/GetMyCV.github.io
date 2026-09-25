import Image from 'next/image';
import Link from 'next/link';
import { packages, formatPrice } from '@/content/pricing';
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
        className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 animate-drift rounded-full bg-teal/20 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-32 left-1/3 h-80 w-80 animate-drift rounded-full bg-sky-400/10 blur-3xl [animation-delay:-7s]"
      />
      <div className="container-page relative grid gap-10 py-14 sm:py-20 lg:grid-cols-2 lg:items-center lg:gap-16">
        <div>
          <p className="eyebrow animate-fade-up text-teal">CV writing &amp; portfolio websites</p>
          <h1 className="mt-3 animate-fade-up text-3xl leading-tight text-white [animation-delay:80ms] sm:text-4xl lg:text-5xl">
            Get your CV and portfolio <span className="hero-underline text-teal">done right</span>
          </h1>
          <p className="mt-5 max-w-xl animate-fade-up text-base leading-relaxed text-slate-200 [animation-delay:160ms] sm:text-lg">
            We write ATS-friendly CVs, cover letters and LinkedIn profiles — and build the
            portfolio website that makes recruiters stop scrolling. From{' '}
            {formatPrice(cheapest.price)}.
          </p>

          <div className="mt-8 flex animate-fade-up flex-col gap-3 [animation-delay:240ms] sm:flex-row">
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

          <p className="mt-4 animate-fade-up text-sm text-slate-300 [animation-delay:300ms]">
            Prefer to do it yourself?{' '}
            <Link href="/cv-builder/" className="font-semibold text-teal underline-offset-4 hover:underline">
              Try the free CV builder →
            </Link>
          </p>

          <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-200">
            {trustPoints.map((point, index) => (
              <li
                key={point}
                className="flex animate-fade-up items-center gap-2"
                style={{ animationDelay: `${340 + index * 90}ms` }}
              >
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

        <div className="relative mx-auto w-full max-w-sm animate-fade-up [animation-delay:250ms] lg:max-w-none">
          {/* Two small result badges drift around the card. Decorative only. */}
          <div
            aria-hidden="true"
            className="absolute -left-4 -top-5 z-10 flex animate-float items-center gap-2 rounded-xl bg-white px-3 py-2 text-xs font-semibold text-navy shadow-xl sm:-left-8"
          >
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-teal/15 text-teal-700">✓</span>
            ATS check passed
          </div>
          <div
            aria-hidden="true"
            className="absolute -bottom-5 -right-3 z-10 flex animate-float items-center gap-2 rounded-xl bg-white px-3 py-2 text-xs font-semibold text-navy shadow-xl [animation-delay:-3s] sm:-right-6"
          >
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-amber/20 text-amber-600">★</span>
            Interview booked
          </div>

          <div className="animate-float-slow rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/20 backdrop-blur">
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
              ].map((item, index) => (
                <li
                  key={item}
                  className="flex animate-fade-up gap-2.5"
                  style={{ animationDelay: `${450 + index * 110}ms` }}
                >
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
