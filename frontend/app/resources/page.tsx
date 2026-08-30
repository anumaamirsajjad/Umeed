'use client';

import { useState, useEffect } from 'react';
import { getResources, searchResources } from '@/lib/api';
import { ACTIVE_CITY_FILTERS, ACTIVE_REGION } from '@/lib/cities';
import { Chip } from '@/components/ui/Chip';
import { Icon } from '@/components/ui/Icon';
import type { CrisisResource } from '@/lib/types';

const TYPE_LABELS: Record<CrisisResource['type'], string> = {
  crisis_hotline: 'Crisis Line',
  professional: 'Counselling',
  support_group: 'Support Group',
  online_resource: 'Online Resource',
};

function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timeout = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timeout);
  }, [value, delayMs]);
  return debounced;
}

function ResourceCard({ resource }: { resource: CrisisResource }) {
  return (
    <div className="rounded-2xl bg-surface dark:bg-surface-darker border border-primary-100 dark:border-primary-900/40 shadow-sm p-5 transition-all duration-quick ease-umeed hover:shadow-md hover:-translate-y-0.5">
      <div className="flex justify-between items-start gap-3 mb-2">
        <h3 className="text-lg font-bold text-ink-light dark:text-ink-dark">{resource.name}</h3>
        <span className="bg-accent-700 text-white px-3 py-1 rounded-pill text-xs font-bold whitespace-nowrap">
          {TYPE_LABELS[resource.type]}
        </span>
      </div>

      {resource.city && <p className="text-sm text-ink-muted mb-2 flex items-center gap-1"><Icon name="location" className="h-3.5 w-3.5" />{resource.city}</p>}

      {resource.verified === false && (
        <span className="inline-block bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300 px-3 py-1 rounded-pill text-xs font-bold mb-2">
          Needs verification
        </span>
      )}

      {resource.description && <p className="text-sm text-ink-muted my-2 leading-relaxed">{resource.description}</p>}

      <div className="flex flex-col gap-2 mt-3">
        {resource.phone && (
          <a
            href={`tel:${resource.phone}`}
            className="inline-flex items-center gap-2 text-base font-bold text-primary-700 dark:text-primary-300 hover:text-primary-800 dark:hover:text-primary-200 transition-colors duration-quick ease-umeed"
            aria-label={`Call ${resource.name} at ${resource.phone}`}
          >
            <Icon name="phone" className="icon-inline" />
            {resource.phone}
          </a>
        )}

        {resource.web && (
          <a
            href={resource.web}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-700 dark:text-primary-300 hover:underline"
          >
            Visit website
            <Icon name="external" className="h-3.5 w-3.5" />
          </a>
        )}
      </div>
    </div>
  );
}

function ResourceCardSkeleton() {
  return (
    <div className="animate-pulse rounded-card bg-surface dark:bg-surface-darker border border-primary-100 dark:border-primary-900/40 p-5 space-y-3">
      <div className="h-5 w-2/5 rounded-pill bg-primary-100 dark:bg-primary-900/40" />
      <div className="h-3 w-1/4 rounded-pill bg-primary-50 dark:bg-primary-900/20" />
      <div className="h-3 w-full rounded-pill bg-primary-50 dark:bg-primary-900/20" />
      <div className="h-3 w-2/3 rounded-pill bg-primary-50 dark:bg-primary-900/20" />
    </div>
  );
}

export default function ResourcesPage() {
  const [matched, setMatched] = useState<CrisisResource[]>([]);
  const [other, setOther] = useState<CrisisResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCity, setSelectedCity] = useState<string | null>(null); // null = "All"
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, 300);

  useEffect(() => {
    const trimmed = debouncedSearch.trim();
    setLoading(true);

    const fetchResources = async () => {
      try {
        if (trimmed.length >= 2) {
          const results = await searchResources(trimmed);
          setMatched([]);
          setOther(results);
          return;
        }

        const params: any = { region: ACTIVE_REGION };
        if (selectedCity) params.city = selectedCity;

        const data = await getResources(params);
        setMatched(data.matched);
        setOther(data.other);
      } catch (error) {
        console.error('Error fetching resources:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchResources();
  }, [selectedCity, debouncedSearch]);

  const isSearching = search.trim().length >= 2;

  return (
    <div className="min-h-[100dvh] bg-surface-light dark:bg-surface-dark pb-16">
      <div className="relative jali-bg px-6 md:px-10 pt-10 pb-6 border-b border-primary-100 dark:border-primary-900/40">
        <h1 className="font-display text-hero font-bold text-ink-light dark:text-ink-dark mb-2">Support Resources</h1>
        <p className="text-base text-ink-muted">Crisis lines, counselors, and support groups in your region.</p>
      </div>

      <div className="px-6 md:px-10 py-6">
        <label htmlFor="resource-search" className="sr-only">
          Search resources
        </label>
        <div className="relative max-w-lg">
          <Icon name="search" className="icon-inline absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted" />
          <input
            id="resource-search"
            type="text"
            placeholder="Search by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-pill border border-primary-100 dark:border-primary-900/40 bg-surface dark:bg-surface-darker pl-11 pr-4 py-3 text-base text-ink-light dark:text-ink-dark outline-none transition-colors duration-quick ease-umeed focus:border-primary-500"
          />
        </div>
      </div>

      <div className="px-6 md:px-10 pb-6">
        {/* The right-edge fade is the only cue that more cities exist beyond
            the viewport; without it the list looked complete at six. */}
        <div className="relative">
          <div
            className="flex gap-2 overflow-x-auto pb-1 pr-6 [scrollbar-width:thin]"
            role="group"
            aria-label="Filter by city"
          >
            <Chip selected={selectedCity === null} disabled={isSearching} onClick={() => setSelectedCity(null)}>
              All
            </Chip>
            {ACTIVE_CITY_FILTERS.map((city) => (
              <Chip
                key={city.code}
                selected={selectedCity === city.code}
                disabled={isSearching}
                onClick={() => setSelectedCity(city.code)}
              >
                {city.label}
              </Chip>
            ))}
          </div>
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-surface-light dark:from-surface-dark to-transparent"
          />
        </div>
        {isSearching && (
          <p className="mt-2 text-xs text-ink-muted" role="status">
            City filters are paused while you search. Clear the search box to use them.
          </p>
        )}
      </div>

      <div className="max-w-3xl mx-auto px-6 md:px-10">
        {loading ? (
          <div className="flex flex-col gap-4" role="status">
            {Array.from({ length: 5 }, (_, i) => (
              <ResourceCardSkeleton key={i} />
            ))}
          </div>
        ) : matched.length === 0 && other.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-base text-ink-muted">No resources found for your selection. Try a different city or search term.</p>
          </div>
        ) : (
          <>
            {matched.length > 0 && (
              <section className="mb-10">
                <h2 className="font-display text-2xl font-bold text-ink-light dark:text-ink-dark mb-4">
                  Matched to your preferences
                </h2>
                <div className="flex flex-col gap-4">
                  {matched.map((resource) => (
                    <ResourceCard key={resource.id} resource={resource} />
                  ))}
                </div>
              </section>
            )}

            {other.length > 0 && (
              <section>
                {matched.length > 0 && (
                  <h2 className="font-display text-2xl font-bold text-ink-light dark:text-ink-dark mb-4">
                    Other resources
                  </h2>
                )}
                <div className="flex flex-col gap-4">
                  {other.map((resource) => (
                    <ResourceCard key={resource.id} resource={resource} />
                  ))}
                </div>
              </section>
            )}
          </>
        )}

        <p className="text-center text-sm text-ink-muted mt-10 pb-5">
          Need immediate help? Call your local crisis hotline or emergency services.
        </p>
      </div>
    </div>
  );
}
