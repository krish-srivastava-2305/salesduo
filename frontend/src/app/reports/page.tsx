"use client";

import axios from "axios";
import { useEffect, useMemo, useState } from "react";

type ReportItem = {
    asin: string;
    originalDocument: {
        asin?: string;
        title?: string;
        bullet_points?: string[];
        description?: string;
    };
    analyzedData: {
        improved_title?: string;
        rewritten_bullet_points?: string[];
        enhanced_description?: string; // HTML
        keyword_suggestions?: string[];
    };
    createdAt: string;
};

type ReportsResponse = {
    reports: ReportItem[];
};

export default function ReportsPage() {
    const [reports, setReports] = useState<ReportItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [query, setQuery] = useState("");

    function extractErrorMessage(err: unknown): string {
        if (axios.isAxiosError(err)) {
            const data = err.response?.data as unknown;
            if (typeof data === "string") return data;
            if (data && typeof data === "object" && "message" in (data as Record<string, unknown>)) {
                const maybe = (data as Record<string, unknown>).message;
                if (typeof maybe === "string") return maybe;
            }
            return err.message || "Failed to load reports.";
        }
        if (err instanceof Error) return err.message;
        return "Failed to load reports.";
    }

    useEffect(() => {
        let ignore = false;
        async function load() {
            setError(null);
            setLoading(true);
            try {
                console.log("Fetching reports from:", process.env.NEXT_PUBLIC_API_URL);
                const res = await axios.get<ReportsResponse>(`${process.env.NEXT_PUBLIC_API_URL}/reports`);
                if (!ignore) setReports(res.data?.reports || []);
            } catch (err: unknown) {
                const msg = extractErrorMessage(err);
                if (!ignore) setError(String(msg));
            } finally {
                if (!ignore) setLoading(false);
            }
        }
        load();
        return () => {
            ignore = true;
        };
    }, []);

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return reports;
        return reports.filter((r) => {
            const inAsin = (r.asin || "").toLowerCase().includes(q);
            const orig = r.originalDocument || {};
            const ana = r.analyzedData || ({} as ReportItem["analyzedData"]);
            const haystack = [
                orig.title || "",
                (orig.bullet_points || []).join(" \n "),
                orig.description || "",
                ana.improved_title || "",
                (ana.rewritten_bullet_points || []).join(" \n "),
                ana.enhanced_description || "",
                (ana.keyword_suggestions || []).join(", "),
            ]
                .join(" \n ")
                .toLowerCase();
            return inAsin || haystack.includes(q);
        });
    }, [reports, query]);

    return (
        <div className="py-6">
            <div className="flex items-end justify-between gap-4 flex-wrap">
                <div>
                    <h1 className="text-xl font-semibold">Reports</h1>
                    <p className="mt-1 text-sm opacity-80">Browse and search your analysis history.</p>
                </div>
                <div className="w-full sm:w-auto min-w-64">
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search by ASIN or text..."
                        className="w-full rounded-md border border-black/15 dark:border-white/15 bg-transparent px-3 py-2 outline-none focus:ring-2 focus:ring-black/20 dark:focus:ring-white/20 transition-shadow"
                        aria-label="Search reports"
                    />
                </div>
            </div>

            {loading && <p className="mt-4 text-sm opacity-80">Loading reports...</p>}
            {error && <p className="mt-4 text-sm text-red-600 dark:text-red-400">{error}</p>}

            {!loading && !error && (
                <div className="mt-6 space-y-4">
                    <div className="text-xs opacity-70">{filtered.length} result(s)</div>
                    {filtered.length === 0 && (
                        <div className="rounded-md border border-black/10 dark:border-white/10 p-4 text-sm opacity-80">
                            No reports found.
                        </div>
                    )}
                    {filtered.map((r, idx) => (
                        <article key={`${r.asin}-${idx}`} className="rounded-lg border border-black/10 dark:border-white/10 p-4 transition-colors hover:bg-black/[0.02] dark:hover:bg-white/[0.03]">
                            <div className="flex items-center justify-between gap-2 flex-wrap">
                                <div className="text-sm">
                                    <div className="opacity-70">ASIN</div>
                                    <div className="font-mono text-base">{r.asin}</div>
                                </div>
                                <div className="text-xs opacity-70">
                                    {new Date(r.createdAt).toLocaleString()}
                                </div>
                            </div>

                            <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
                                <section>
                                    <h3 className="text-sm font-semibold">Original</h3>
                                    <div className="mt-2 space-y-2 text-sm">
                                        <div>
                                            <div className="opacity-70">Title</div>
                                            <div>{r.originalDocument.title || "-"}</div>
                                        </div>
                                        <div>
                                            <div className="opacity-70">Bullet Points</div>
                                            <ul className="list-disc ml-5 space-y-1">
                                                {(r.originalDocument.bullet_points || []).map((bp, i) => (
                                                    <li key={i}>{bp}</li>
                                                ))}
                                                {(!r.originalDocument.bullet_points || r.originalDocument.bullet_points.length === 0) && (
                                                    <li className="list-none opacity-70">-</li>
                                                )}
                                            </ul>
                                        </div>
                                        <div>
                                            <div className="opacity-70">Description</div>
                                            <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: r.originalDocument.description || "" }} />
                                            {!r.originalDocument.description && <div className="opacity-70">-</div>}
                                        </div>
                                    </div>
                                </section>

                                <section>
                                    <h3 className="text-sm font-semibold">Analyzed</h3>
                                    <div className="mt-2 space-y-2 text-sm">
                                        <div>
                                            <div className="opacity-70">Improved Title</div>
                                            <div>{r.analyzedData.improved_title || "-"}</div>
                                        </div>
                                        <div>
                                            <div className="opacity-70">Rewritten Bullet Points</div>
                                            <ul className="list-disc ml-5 space-y-1">
                                                {(r.analyzedData.rewritten_bullet_points || []).map((bp, i) => (
                                                    <li key={i}>{bp}</li>
                                                ))}
                                                {(!r.analyzedData.rewritten_bullet_points || r.analyzedData.rewritten_bullet_points.length === 0) && (
                                                    <li className="list-none opacity-70">-</li>
                                                )}
                                            </ul>
                                        </div>
                                        <div>
                                            <div className="opacity-70">Enhanced Description</div>
                                            <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: r.analyzedData.enhanced_description || "" }} />
                                            {!r.analyzedData.enhanced_description && <div className="opacity-70">-</div>}
                                        </div>
                                        {r.analyzedData.keyword_suggestions && r.analyzedData.keyword_suggestions.length > 0 && (
                                            <div>
                                                <div className="opacity-70">Keyword Suggestions</div>
                                                <div className="flex flex-wrap gap-2">
                                                    {r.analyzedData.keyword_suggestions.map((kw, i) => (
                                                        <span key={i} className="text-xs rounded-full border border-black/15 dark:border-white/15 px-2 py-1">
                                                            {kw}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </section>
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </div>
    );
}
