import Image from 'next/image';
import { site } from '@/content/site';

type LogoProps = {
  /** Tailwind height class; the width follows the 368:96 aspect ratio. */
  className?: string;
  /**
   * `auto` swaps the navy wordmark for the white one in dark mode.
   * `white` always uses the white wordmark, for navy panels in either theme.
   */
  variant?: 'auto' | 'white';
  priority?: boolean;
};

const RATIO = 368 / 96;

export default function Logo({ className = 'h-8', variant = 'auto', priority = false }: LogoProps) {
  const alt = `${site.name} logo`;

  if (variant === 'white') {
    return (
      <Image
        src="/brand/logo-white.png"
        alt={alt}
        width={368}
        height={96}
        priority={priority}
        className={`${className} w-auto`}
        style={{ aspectRatio: RATIO }}
      />
    );
  }

  return (
    <>
      <Image
        src="/brand/logo.png"
        alt={alt}
        width={368}
        height={96}
        priority={priority}
        className={`${className} w-auto dark:hidden`}
        style={{ aspectRatio: RATIO }}
      />
      <Image
        src="/brand/logo-white.png"
        alt=""
        aria-hidden="true"
        width={368}
        height={96}
        priority={priority}
        className={`${className} hidden w-auto dark:block`}
        style={{ aspectRatio: RATIO }}
      />
    </>
  );
}
