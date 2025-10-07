"use client";
import { NAV_ITEMS } from "@/lib/constants";
import { usePathname } from "next/navigation";
import React from "react";
import Link from "next/link";

const NavItems = () => {
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path;
  };
  return (
    <ul className="flex flex-col sm:flex-row p.2 gap-3 sm:gap-10 font-medium">
      {NAV_ITEMS.map(({ href, label }) => (
        <li key={href}>
          <Link
            href={href}
            className={`hover:text-yellow-500 transition-colors ${
              isActive(href) ? "text-grey-100" : ""
            }`}
          >
            {label}
          </Link>
        </li>
      ))}
    </ul>
  );
};

export default NavItems;
