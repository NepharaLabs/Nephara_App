import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export function PrimaryButton({ href, children, icon = true, className = '' }) {
  const baseClasses =
    'group flex items-center gap-2 bg-gradient-primary px-8 py-4 font-semibold text-white shadow-lg shadow-primary-lg transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-primary-xl';

  const content = (
    <>
      {children}
      {icon && <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />}
    </>
  );

  if (href.startsWith('/')) {
    return (
      <Link href={href} className={`${baseClasses} ${className}`}>
        {content}
      </Link>
    );
  }

  return (
    <a href={href} className={`${baseClasses} ${className}`}>
      {content}
    </a>
  );
}

export function SecondaryButton({ href, children, icon = false, className = '' }) {
  const baseClasses =
    'group flex items-center gap-2 border-2 border-purple-500/30 bg-purple-900/20 backdrop-blur-sm px-8 py-4 font-semibold text-gray-200 transition-all duration-300 hover:border-primary hover:bg-purple-900/30';

  const content = (
    <>
      {children}
      {icon && <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />}
    </>
  );

  if (href.startsWith('/') || href.startsWith('#')) {
    return (
      <a href={href} className={`${baseClasses} ${className}`}>
        {content}
      </a>
    );
  }

  return (
    <a href={href} className={`${baseClasses} ${className}`}>
      {content}
    </a>
  );
}

export function OutlineButton({ href, children, icon = true, className = '' }) {
  const baseClasses =
    'inline-flex items-center gap-3 border-2 border-primary bg-gradient-primary px-8 py-4 font-semibold text-white transition-all duration-300 hover:border-primary-bright';

  const content = (
    <>
      {children}
      {icon && <ArrowRight className="h-5 w-5" />}
    </>
  );

  if (href.startsWith('/')) {
    return (
      <Link href={href} className={`${baseClasses} ${className}`}>
        {content}
      </Link>
    );
  }

  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={`${baseClasses} ${className}`}>
      {content}
    </a>
  );
}

export function NavButton({ href, children, className = '' }) {
  const baseClasses =
    'bg-gradient-primary px-6 py-3 font-semibold text-white text-sm transition-all duration-300 hover:scale-105 hover:shadow hover:shadow-primary-xl';

  if (href.startsWith('/')) {
    return (
      <Link href={href} className={`${baseClasses} ${className}`}>
        {children}
      </Link>
    );
  }

  return (
    <a href={href} className={`${baseClasses} ${className}`}>
      {children}
    </a>
  );
}
