import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      item: item.href ? `https://Cineby.vip${item.href}` : null,
    })),
  };

  return (
    <nav className="flex text-xs md:text-sm text-gray-500 font-mono tracking-widest uppercase mb-6 overflow-hidden max-w-full">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ol className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-2">
        <li className="flex items-center gap-2 whitespace-nowrap shrink-0">
          <Link href="/" className="hover:text-white transition-colors flex items-center gap-1"><Home className="w-3 h-3" /> Home</Link>
          <ChevronRight className="w-3 h-3 text-gray-700" />
        </li>
        {items.map((item, index) => (
          <li key={index} className="flex items-center gap-2 whitespace-nowrap shrink-0">
            {item.href ? (
              <Link href={item.href} className="hover:text-white transition-colors hover:text-[#BE185D]">
                {item.label}
              </Link>
            ) : (
              <span className="text-white font-bold truncate max-w-[150px] md:max-w-xs">{item.label}</span>
            )}
            {index < items.length - 1 && <ChevronRight className="w-3 h-3 text-gray-700" />}
          </li>
        ))}
      </ol>
    </nav>
  );
}
