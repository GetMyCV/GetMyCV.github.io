type SectionProps = {
  id?: string;
  eyebrow?: string;
  title?: string;
  intro?: string;
  children: React.ReactNode;
  className?: string;
  /** Tints the section so alternating bands stay readable in both themes. */
  tone?: 'default' | 'muted' | 'navy';
};

const tones = {
  default: '',
  muted: 'bg-white dark:bg-white/5',
  navy: 'bg-navy text-white dark:bg-navy-800',
};

export default function Section({
  id,
  eyebrow,
  title,
  intro,
  children,
  className = '',
  tone = 'default',
}: SectionProps) {
  return (
    <section id={id} className={`${tones[tone]} py-14 sm:py-20 ${className}`}>
      <div className="container-page">
        {(eyebrow || title || intro) && (
          <div className="mb-10 max-w-2xl">
            {eyebrow && <p className="eyebrow">{eyebrow}</p>}
            {title && (
              <h2 className={`mt-2 text-2xl sm:text-3xl ${tone === 'navy' ? 'text-white' : ''}`}>
                {title}
              </h2>
            )}
            {intro && (
              <p
                className={`mt-3 text-base leading-relaxed ${
                  tone === 'navy' ? 'text-slate-200' : 'text-navy-700/80 dark:text-slate-300'
                }`}
              >
                {intro}
              </p>
            )}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}
