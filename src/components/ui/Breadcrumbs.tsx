'use client';

import Link from 'next/link';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav className="flex items-center gap-2 text-sm mb-4">
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          {index > 0 && (
            <span className="text-[var(--muted)]">/</span>
          )}
          {item.href ? (
            <Link 
              href={item.href}
              className="text-[var(--brand)] hover:text-[var(--brand-hover)] font-medium transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-[var(--muted)] font-medium">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  );
}
