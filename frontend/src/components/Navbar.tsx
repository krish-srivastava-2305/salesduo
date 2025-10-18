"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMemo } from "react";

export default function Navbar() {
    const pathname = usePathname();
    const router = useRouter();

    const isHome = useMemo(() => pathname === "/" || pathname === null, [pathname]);

    return (
        <header className="sticky top-0 z-10 bg-background/80 backdrop-blur border-b border-black/10 dark:border-white/10">
            <nav className="w-full px-4 sm:px-6 py-3 flex items-center justify-between">
                {/* Left: Back or Home */}
                <div>
                    {isHome ? (
                        <Link
                            href="/"
                            className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors hover:bg-black/5 dark:hover:bg-white/10"
                            aria-label="Home"
                        >
                            <span className="i-[home] hidden" />
                            <span className="font-medium">Home</span>
                        </Link>
                    ) : (
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-all hover:bg-black/5 dark:hover:bg-white/10 active:scale-[0.98]"
                            aria-label="Go back"
                        >
                            <span aria-hidden className="mr-1">←</span>
                            <span className="font-medium">Back</span>
                        </button>
                    )}
                </div>

                {/* Center: Title */}
                <div className="absolute left-1/2 -translate-x-1/2">
                    <span className="text-sm sm:text-base font-semibold tracking-tight select-none">
                        OptimizeYourListing
                    </span>
                </div>

                {/* Right: Reports link */}
                <div>
                    <Link
                        href="/reports"
                        className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm border border-black/10 dark:border-white/15 transition-colors hover:bg-black/5 dark:hover:bg-white/10"
                    >
                        Reports
                    </Link>
                </div>
            </nav>
        </header>
    );
}
