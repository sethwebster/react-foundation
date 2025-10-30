/**
 * Search Tester Component
 * Test vector search to see what the chatbot can find
 */

'use client';

import { useState } from 'react';
import { RFDS } from '@/components/rfds';

interface SearchResult {
  id: string;
  source: string;
  score: number;
  contentPreview: string;
  contentLength: number;
}

interface SearchResponse {
  query: string;
  resultCount: number;
  results: SearchResult[];
}

const SAMPLE_QUERIES = [
  'How do I start a community?',
  'Do you have a guide for starting a community?',
  'What is RIS?',
  'How do I become a contributor?',
  'What products are in the store?',
];

export function SearchTester() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<SearchResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const res = await fetch('/api/admin/search-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery, k: 5 }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Search failed');
      }

      const data: SearchResponse = await res.json();
      setResponse(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <RFDS.SemanticCard variant="outlined" className="p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">
        🔍 Search Tester
      </h3>
      <p className="text-sm text-muted-foreground mb-4">
        Test what the chatbot can find in the vector store. Uses the same search that powers chatbot responses.
      </p>

      {/* Search Input */}
      <div className="space-y-3 mb-6">
        <div className="flex gap-2">
          <RFDS.SearchInput
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch(query)}
            placeholder="Enter search query..."
            className="flex-1"
          />
          <RFDS.SemanticButton
            variant="primary"
            onClick={() => handleSearch(query)}
            disabled={loading || !query.trim()}
          >
            {loading ? 'Searching...' : 'Search'}
          </RFDS.SemanticButton>
        </div>

        {/* Sample Queries */}
        <div className="flex flex-wrap gap-2">
          {SAMPLE_QUERIES.map((sampleQuery) => (
            <button
              key={sampleQuery}
              type="button"
              onClick={() => {
                setQuery(sampleQuery);
                handleSearch(sampleQuery);
              }}
              className="cursor-pointer"
            >
              <RFDS.Pill>{sampleQuery}</RFDS.Pill>
            </button>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <RFDS.SemanticAlert variant="destructive" className="mb-4">
          {error}
        </RFDS.SemanticAlert>
      )}

      {/* Results */}
      {response && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span>
              Found <strong className="text-foreground">{response.resultCount}</strong> results for:
            </span>
            <code className="px-2 py-1 bg-muted rounded text-foreground">
              {response.query}
            </code>
          </div>

          {response.resultCount === 0 ? (
            <RFDS.SemanticAlert variant="warning">
              No results found. The vector store may be empty or the query didn't match any content.
            </RFDS.SemanticAlert>
          ) : (
            <div className="space-y-3">
              {response.results.map((result, index) => (
                <RFDS.SemanticCard
                  key={result.id}
                  variant="outlined"
                  className="p-4 hover:border-primary/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono text-muted-foreground">
                          #{index + 1}
                        </span>
                        <a
                          href={result.source.startsWith('http') ? result.source : `https://react.foundation${result.source}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-medium text-primary hover:underline"
                        >
                          {result.source}
                        </a>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {result.contentLength} chars • Score: {result.score.toFixed(4)}
                      </p>
                    </div>
                    <RFDS.SemanticBadge variant={result.score > 0.8 ? 'default' : 'outline'}>
                      {result.score > 0.8 ? 'High' : result.score > 0.6 ? 'Med' : 'Low'} relevance
                    </RFDS.SemanticBadge>
                  </div>
                  <div className="text-sm text-muted-foreground bg-muted/30 p-3 rounded">
                    {result.contentPreview}
                  </div>
                </RFDS.SemanticCard>
              ))}
            </div>
          )}
        </div>
      )}
    </RFDS.SemanticCard>
  );
}
