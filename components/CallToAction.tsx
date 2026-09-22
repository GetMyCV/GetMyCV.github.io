import Link from 'next/link';
import { whatsappLink } from '@/content/site';

type Props = {
  title?: string;
  body?: string;
};

export default function CallToAction({
  title = 'Ready to stop being ignored?',
  body = 'Pick a package, tell us about the job you want, and we will take it from there.',
}: Props) {
  return (
    <section className="py-14 sm:py-20">
      <div className="container-page">
        <div className="relative overflow-hidden rounded-3xl bg-navy px-6 py-12 text-center sm:px-12">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-20 -left-16 h-64 w-64 rounded-full bg-teal/20 blur-3xl"
          />
          <div className="relative">
            <h2 className="text-2xl text-white sm:text-3xl">{title}</h2>
            <p className="mx-auto mt-3 max-w-xl text-slate-200">{body}</p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link href="/order/" className="btn-primary sm:px-8">
                Order now
              </Link>
              <a href={whatsappLink()} className="btn border border-white/25 text-white hover:bg-white/10">
                Chat on WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
