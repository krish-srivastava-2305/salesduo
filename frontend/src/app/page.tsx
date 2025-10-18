"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import axios from "axios";

export default function Home() {
  const router = useRouter();
  const [asin, setAsin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function extractErrorMessage(err: unknown): string {
    if (axios.isAxiosError(err)) {
      const data = err.response?.data as unknown;
      if (typeof data === "string") return data;
      if (data && typeof data === "object" && "message" in (data as Record<string, unknown>)) {
        const maybe = (data as Record<string, unknown>).message;
        if (typeof maybe === "string") return maybe;
      }
      return err.message || "Something went wrong.";
    }
    if (err instanceof Error) return err.message;
    return "Something went wrong.";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const trimmed = asin.trim();
    if (!trimmed) {
      setError("Please enter an ASIN.");
      return;
    }
    try {
      setLoading(true);
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/scrape-analyzer`, {
        asin: trimmed,
      });
      // Persist data for the next page to consume
      if (typeof window !== "undefined") {
        try {
          sessionStorage.setItem("optimizedPayload", JSON.stringify(res.data));
        } catch { }
      }
      router.push("/optimized-listing");
    } catch (err: unknown) {
      const message = extractErrorMessage(err);
      setError(String(message));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
      <h1 className="text-xl font-semibold tracking-tight">Enter ASIN</h1>
      <form onSubmit={handleSubmit} className="w-full max-w-md flex items-center gap-2">
        <input
          type="text"
          inputMode="text"
          placeholder="e.g. B08N5WRWNW"
          value={asin}
          onChange={(e) => setAsin(e.target.value)}
          className="flex-1 rounded-md border border-black/15 dark:border-white/15 bg-transparent px-3 py-2 outline-none focus:ring-2 focus:ring-black/20 dark:focus:ring-white/20 transition-shadow"
          aria-label="ASIN"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-foreground text-background px-4 py-2 text-sm font-medium transition-transform hover:opacity-90 active:scale-[0.98] disabled:opacity-60"
        >
          {loading ? "Submitting..." : "Submit"}
        </button>
      </form>
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}
