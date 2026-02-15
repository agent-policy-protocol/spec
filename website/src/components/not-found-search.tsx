"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { Search, FileText, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface SearchResult {
  id: string;
  url: string;
  type: "page";
  content: string;
}

export function NotFoundSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = useCallback(async () => {
    const q = query.trim();
    if (!q) return;

    setLoading(true);
    setSearched(true);
    try {
      const res = await fetch(`/api/search?query=${encodeURIComponent(q)}`);
      if (res.ok) {
        const data = await res.json();
        setResults(data.slice(0, 5));
      }
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [query]);

  return (
    <div className="w-full max-w-sm mx-auto mt-8">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSearch();
        }}
        className="flex gap-2"
      >
        <Input
          type="search"
          placeholder="Search the docs…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search documentation"
        />
        <Button type="submit" variant="outline" size="icon" disabled={loading}>
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Search className="h-4 w-4" />
          )}
        </Button>
      </form>

      {searched && !loading && results.length === 0 && (
        <p className="mt-3 text-sm text-muted-foreground text-center">
          No results found. Try a different search term.
        </p>
      )}

      {results.length > 0 && (
        <ul className="mt-3 space-y-1">
          {results.map((result) => (
            <li key={result.id}>
              <Link
                href={result.url}
                className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                <FileText className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{result.content}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
