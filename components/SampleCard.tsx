import Image from 'next/image';
import Link from 'next/link';
import type { Sample } from '@/content/samples';

export default function SampleCard({ sample }: { sample: Sample }) {
  const isLive = sample.href !== '#';
  const isInternal = sample.href.startsWith('/');

  return (
    <article className="card flex h-full flex-col overflow-hidden p-0">
      <div className="relative aspect-[8/5] w-full bg-navy-50 dark:bg-white/10">
        <Image
          src={sample.image}
          alt={`${sample.title} preview`}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover"
        />
        <span className="absolute left-3 top-3 rounded-full bg-navy/90 px-3 py-1 text-xs font-semibold text-white">
          {sample.type}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-teal-700 dark:text-teal">
          {sample.profession}
        </p>
        <h3 className="mt-1.5 text-lg">{sample.title}</h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-navy-700/80 dark:text-slate-300">
          {sample.summary}
        </p>

        <div className="mt-4 flex items-center justify-between gap-3">
          {sample.result ? (
            <span className="rounded-full bg-teal/10 px-3 py-1 text-xs font-semibold text-teal-700 dark:bg-teal/20 dark:text-teal">
              {sample.result}
            </span>
          ) : (
            <span />
          )}
          {isLive && isInternal ? (
            <Link
              href={sample.href}
              className="text-sm font-semibold text-teal-700 hover:underline dark:text-teal"
            >
              View sample →
            </Link>
          ) : isLive ? (
            <a
              href={sample.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-semibold text-teal-700 hover:underline dark:text-teal"
            >
              View sample →
            </a>
          ) : (
            <span className="text-xs text-navy-700/70 dark:text-slate-400">Demo coming soon</span>
          )}
        </div>
      </div>
    </article>
  );
}
