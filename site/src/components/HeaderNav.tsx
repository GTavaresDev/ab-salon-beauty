"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type NavItem = {
  href: string;
  label: string;
};

type HeaderNavProps = {
  items: NavItem[];
};

export function HeaderNav({ items }: HeaderNavProps) {
  const [activeHref, setActiveHref] = useState<string>(items[0]?.href ?? "#hero");

  const sectionIds = useMemo(() => items.map((item) => item.href.replace("#", "")), [items]);

  useEffect(() => {
    const updateFromHash = () => {
      if (window.location.hash && items.some((item) => item.href === window.location.hash)) {
        setActiveHref(window.location.hash);
      }
    };

    updateFromHash();
    window.addEventListener("hashchange", updateFromHash);

    const sections = sectionIds
      .map((id) => document.getElementById(id))
      .filter((section): section is HTMLElement => section !== null);

    if (sections.length === 0) {
      return () => window.removeEventListener("hashchange", updateFromHash);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visible[0]) {
          setActiveHref(`#${visible[0].target.id}`);
        }
      },
      {
        rootMargin: "-35% 0px -45% 0px",
        threshold: [0.2, 0.4, 0.6, 0.8],
      }
    );

    sections.forEach((section) => observer.observe(section));

    return () => {
      window.removeEventListener("hashchange", updateFromHash);
      observer.disconnect();
    };
  }, [items, sectionIds]);

  return (
    <ul className="hidden items-center gap-2 text-sm text-blush-50/90 md:flex">
      {items.map((item) => {
        const isActive = activeHref === item.href;

        return (
          <li key={item.href}>
            <Link
              href={item.href}
              className={[
                "rounded-full px-3 py-2 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white",
                isActive
                  ? "bg-white/25 text-white shadow-sm"
                  : "text-blush-50/90 hover:bg-white/12 hover:text-white",
              ].join(" ")}
              aria-current={isActive ? "page" : undefined}
            >
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
