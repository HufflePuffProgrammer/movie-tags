import Link from "next/link";
import { ReactNode } from "react";

export interface SidebarLink {
  label: string;
  href: string;
  icon?: ReactNode;
}

interface SidebarNavigationProps {
  links: SidebarLink[];
  title?: string;
  className?: string;
  query?: string;
  byMovies?: string;
  byTVShows?: string;
  }

export default function SidebarNavigation({
  links,
  title,
  query,
  className = "",
}: SidebarNavigationProps) {
  return (
    <aside className={`w-64 flex-shrink-0 ${className}`}>
      <nav className="bg-white rounded-lg shadow-sm border border-gray-200">
        {title && (
          <div className="px-5 py-4 border-b border-gray-200">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
              {title}
            </h2>
          </div>
        )}
        <ul className="divide-y divide-gray-200">
          {links.map((link) => {
            const querySuffix =
              query && query.trim().length > 0
                ? `${link.href.includes('?') ? '&' : '?'}q=${encodeURIComponent(query)}`
                : '';
            return (
            <li key={link.label}>
              <Link
                href={`${link.href}${querySuffix}`}
                className="block px-5 py-4 text-gray-700 hover:bg-yellow-50 hover:text-yellow-600 transition-colors"
              >
                <span className="flex items-center gap-2">
                  {link.icon && <span className="text-gray-500">{link.icon}</span>}
                  {link.label}
                </span>
              </Link>
            </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}

