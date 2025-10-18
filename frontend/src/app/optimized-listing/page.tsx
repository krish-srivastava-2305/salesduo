"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import AutoResizeTextarea from "@/components/AutoResizeTextarea";

type ListingPayload = {
    optimizedListing?: {
        improved_title?: string;
        rewritten_bullet_points?: string[];
        enhanced_description?: string; // HTML
        keyword_suggestions?: string[];
    };
    originalListing?: {
        asin?: string;
        title?: string;
        bullet_points?: string[];
        description?: string;
    };
};

export default function OptimizedListingPage() {
    const router = useRouter();
    const [payload, setPayload] = useState<ListingPayload | null>(null);
    const [asin, setAsin] = useState("");

    const [title, setTitle] = useState("");
    const [bullets, setBullets] = useState<string[]>([]);
    const [description, setDescription] = useState("");
    const [keywords, setKeywords] = useState<string[]>([]);
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);
    const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

    useEffect(() => {
        try {
            const raw = sessionStorage.getItem("optimizedPayload");
            if (!raw) return;
            const data: ListingPayload = JSON.parse(raw);
            setPayload(data);
            setAsin(data.originalListing?.asin || "");
            setTitle(
                data.optimizedListing?.improved_title || data.originalListing?.title || ""
            );
            setBullets(
                (data.optimizedListing?.rewritten_bullet_points &&
                    [...data.optimizedListing.rewritten_bullet_points]) ||
                data.originalListing?.bullet_points ||
                []
            );
            setDescription(
                data.optimizedListing?.enhanced_description ||
                data.originalListing?.description ||
                ""
            );
            setKeywords(
                data.optimizedListing?.keyword_suggestions
                    ? [...data.optimizedListing.keyword_suggestions]
                    : []
            );
        } catch {
        }
    }, []);

    const original = useMemo(() => payload?.originalListing, [payload]);

    function updateBullet(i: number, value: string) {
        setBullets((prev) => {
            const next = [...prev];
            next[i] = value;
            return next;
        });
    }

    function addBullet() {
        setBullets((prev) => [...prev, ""]);
    }

    function removeBullet(i: number) {
        setBullets((prev) => prev.filter((_, idx) => idx !== i));
    }

    function updateKeyword(i: number, value: string) {
        setKeywords((prev) => {
            const next = [...prev];
            next[i] = value;
            return next;
        });
    }

    function addKeyword() {
        setKeywords((prev) => [...prev, ""]);
    }

    function removeKeyword(i: number) {
        setKeywords((prev) => prev.filter((_, idx) => idx !== i));
    }

    async function handleSave() {
        setSaveError(null);
        setSaveSuccess(null);
        try {
            setSaving(true);
            const updated = {
                updatedData: {
                    improved_title: title.trim(),
                    rewritten_bullet_points: bullets
                        .map((b) => b.trim())
                        .filter((b) => b.length > 0),
                    enhanced_description: description,
                    keyword_suggestions: keywords
                        .map((k) => k.trim())
                        .filter((k) => k.length > 0),
                },
                asin: asin.trim()
            };
            console.log("Updating listing with data:", process.env.NEXT_PUBLIC_API_URL);
            await axios.patch(`${process.env.NEXT_PUBLIC_API_URL}/update-listing`, updated);
            setSaveSuccess("Listing updated successfully.");
        } catch (err: any) {
            const message =
                (err?.response?.data &&
                    (typeof err.response.data === "string"
                        ? err.response.data
                        : err.response.data?.message)) || err?.message || "Failed to update listing.";
            setSaveError(String(message));
        } finally {
            setSaving(false);
        }
    }

    if (!payload) {
        return (
            <div className="py-8">
                <h1 className="text-xl font-semibold">Optimized Listing</h1>
                <p className="mt-2 text-sm opacity-80">No data found. Please go back and run an analysis.</p>
                <button
                    className="mt-4 rounded-md border px-3 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/10"
                    onClick={() => router.push("/")}
                >
                    Back to Home
                </button>
            </div>
        );
    }

    return (
        <div className="py-6">
            <div className="flex items-baseline justify-between gap-4">
                <h1 className="text-xl font-semibold">Optimized Listing</h1>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="rounded-md bg-foreground text-background px-4 py-2 text-sm font-medium transition-transform hover:opacity-90 active:scale-[0.98] disabled:opacity-60"
                    >
                        {saving ? "Saving..." : "Save"}
                    </button>
                </div>
            </div>

            {(saveError || saveSuccess) && (
                <div className="mt-3 text-sm">
                    {saveError && <p className="text-red-600 dark:text-red-400">{saveError}</p>}
                    {saveSuccess && <p className="text-green-700 dark:text-green-400">{saveSuccess}</p>}
                </div>
            )}

            <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_auto_1fr] lg:gap-10 max-w-none">
                {/* Original side */}
                <section className="self-start rounded-xl border border-black/10 dark:border-white/10 p-5 md:p-6 bg-background/60 backdrop-blur-sm shadow-sm">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                        Original
                        <span className="text-xs rounded-full border border-black/15 dark:border-white/15 px-2 py-0.5 opacity-80">Read-only</span>
                    </h2>
                    <div className="mt-4 space-y-4 text-sm leading-relaxed">
                        <div>
                            <div className="opacity-70">ASIN</div>
                            <div className="font-mono">{original?.asin || "-"}</div>
                        </div>
                        <div>
                            <div className="opacity-70">Title</div>
                            <div>{original?.title || "-"}</div>
                        </div>
                        <div>
                            <div className="opacity-70">Bullet Points</div>
                            <ul className="list-disc ml-5 space-y-1">
                                {(original?.bullet_points || []).map((bp, idx) => (
                                    <li key={idx}>{bp}</li>
                                ))}
                                {(!original?.bullet_points || original.bullet_points.length === 0) && (
                                    <li className="list-none opacity-70">-</li>
                                )}
                            </ul>
                        </div>
                        <div>
                            <div className="opacity-70">Description</div>
                            <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: original?.description || "" }} />
                            {!original?.description && <div className="opacity-70">-</div>}
                        </div>
                    </div>
                </section>

                {/* Separator (mobile: horizontal, desktop: vertical) */}
                <div className="block lg:hidden h-px bg-black/10 dark:bg-white/10" />
                <div className="hidden lg:block w-px bg-black/10 dark:bg-white/10" />

                {/* Optimized editable side */}
                <section className="self-start rounded-xl border border-black/10 dark:border-white/10 p-5 md:p-6 bg-background/60 backdrop-blur-sm shadow-sm">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                        Optimized
                        <span className="text-xs rounded-full border border-black/15 dark:border-white/15 px-2 py-0.5 opacity-80">Editable</span>
                    </h2>
                    <div className="mt-4 space-y-5 text-sm leading-relaxed">
                        <div>
                            <label className="block mb-1 opacity-70" htmlFor="asin">ASIN</label>
                            <input
                                id="asin"
                                type="text"
                                value={asin}
                                onChange={(e) => setAsin(e.target.value)}
                                placeholder={original?.asin || "ASIN"}
                                className="w-full rounded-md border border-black/15 dark:border-white/15 bg-transparent px-3 py-2 outline-none focus:ring-2 focus:ring-black/20 dark:focus:ring-white/20 transition-shadow"
                            />
                        </div>

                        <div>
                            <label className="block mb-1 opacity-70" htmlFor="title">Title</label>
                            <AutoResizeTextarea
                                id="title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                rows={3}
                                className="w-full rounded-md border border-black/15 dark:border-white/15 bg-transparent px-3 py-2 outline-none focus:ring-2 focus:ring-black/20 dark:focus:ring-white/20 transition-shadow"
                            />
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-1">
                                <label className="opacity-70">Bullet Points</label>
                                <button type="button" onClick={addBullet} className="text-xs rounded border px-2 py-1 hover:bg-black/5 dark:hover:bg-white/10">Add</button>
                            </div>
                            <div className="space-y-2">
                                {bullets.map((bp, idx) => (
                                    <div key={idx} className="flex items-start gap-2">
                                        <AutoResizeTextarea
                                            value={bp}
                                            onChange={(e) => updateBullet(idx, e.target.value)}
                                            rows={2}
                                            className="w-full rounded-md border border-black/15 dark:border-white/15 bg-transparent px-3 py-2 outline-none focus:ring-2 focus:ring-black/20 dark:focus:ring-white/20 transition-shadow"
                                        />
                                        <button type="button" onClick={() => removeBullet(idx)} className="text-xs rounded border px-2 py-1 hover:bg-black/5 dark:hover:bg-white/10">Remove</button>
                                    </div>
                                ))}
                                {bullets.length === 0 && (
                                    <p className="opacity-70">No bullets. Click Add to create one.</p>
                                )}
                            </div>
                        </div>

                        <div>
                            <label className="block mb-1 opacity-70" htmlFor="description">Description (HTML supported)</label>
                            <AutoResizeTextarea
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={8}
                                className="w-full rounded-md border border-black/15 dark:border-white/15 bg-transparent px-3 py-2 outline-none focus:ring-2 focus:ring-black/20 dark:focus:ring-white/20 transition-shadow"
                            />
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-1">
                                <label className="opacity-70">Keyword Suggestions</label>
                                <button type="button" onClick={addKeyword} className="text-xs rounded border px-2 py-1 hover:bg-black/5 dark:hover:bg-white/10">Add</button>
                            </div>
                            <div className="space-y-2">
                                {keywords.map((kw, idx) => (
                                    <div key={idx} className="flex items-center gap-2">
                                        <input
                                            type="text"
                                            value={kw}
                                            onChange={(e) => updateKeyword(idx, e.target.value)}
                                            className="w-full rounded-md border border-black/15 dark:border-white/15 bg-transparent px-3 py-2 outline-none focus:ring-2 focus:ring-black/20 dark:focus:ring-white/20 transition-shadow"
                                        />
                                        <button type="button" onClick={() => removeKeyword(idx)} className="text-xs rounded border px-2 py-1 hover:bg-black/5 dark:hover:bg-white/10">Remove</button>
                                    </div>
                                ))}
                                {keywords.length === 0 && (
                                    <p className="opacity-70">No keywords. Click Add to create one.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}

