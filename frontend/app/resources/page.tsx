'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/authContext';
import { getResources, searchResources } from '@/lib/api';
import { ACTIVE_CITY_FILTERS, ACTIVE_REGION } from '@/lib/cities';
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
    <div style={{
      backgroundColor: 'white',
      borderLeft: '12px solid var(--umeed-orange-500)',
      borderRadius: '4px',
      padding: '20px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
      transition: 'all 300ms cubic-bezier(0.22, 1, 0.36, 1)',
      cursor: 'pointer',
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.boxShadow = '0 8px 16px rgba(244, 107, 31, 0.15)';
      e.currentTarget.style.transform = 'translateY(-2px)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.08)';
      e.currentTarget.style.transform = 'translateY(0)';
    }}
    >
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: '12px',
        marginBottom: '8px',
      }}>
        <h3 style={{
          fontSize: '18px',
          fontWeight: 700,
          color: 'var(--umeed-ink-900)',
          margin: 0,
        }}>
          {resource.name}
        </h3>
        <span style={{
          backgroundColor: 'var(--umeed-green-600)',
          color: 'white',
          padding: '4px 12px',
          borderRadius: '9999px',
          fontSize: '12px',
          fontWeight: 700,
          whiteSpace: 'nowrap',
        }}>
          {TYPE_LABELS[resource.type]}
        </span>
      </div>

      {resource.city && (
        <p style={{
          fontSize: '14px',
          color: 'var(--umeed-ink-500)',
          margin: '0 0 8px 0',
        }}>
          {resource.city}
        </p>
      )}

      {resource.verified === false && (
        <span style={{
          display: 'inline-block',
          backgroundColor: '#FEF3C7',
          color: '#92400E',
          padding: '4px 12px',
          borderRadius: '9999px',
          fontSize: '12px',
          fontWeight: 700,
          marginBottom: '8px',
        }}>
          Needs verification
        </span>
      )}

      {resource.description && (
        <p style={{
          fontSize: '14px',
          color: 'var(--umeed-ink-500)',
          margin: '8px 0',
          lineHeight: 1.5,
        }}>
          {resource.description}
        </p>
      )}

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        marginTop: '12px',
      }}>
        {resource.phone && (
          <a
            href={`tel:${resource.phone}`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '16px',
              fontWeight: 700,
              color: 'var(--umeed-orange-500)',
              textDecoration: 'none',
              transition: 'color 300ms',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--umeed-orange-700)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--umeed-orange-500)';
            }}
            aria-label={`Call ${resource.name} at ${resource.phone}`}
          >
            📞 {resource.phone}
          </a>
        )}

        {resource.web && (
          <a
            href={resource.web}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '14px',
              fontWeight: 600,
              color: 'var(--umeed-orange-500)',
              textDecoration: 'none',
              transition: 'color 300ms',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--umeed-orange-700)';
              e.currentTarget.style.textDecoration = 'underline';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--umeed-orange-500)';
              e.currentTarget.style.textDecoration = 'none';
            }}
          >
            Visit website →
          </a>
        )}
      </div>
    </div>
  );
}

function ResourceCardSkeleton() {
  return (
    <div className="animate-pulse rounded-card bg-surface dark:bg-surface-darker border border-primary-100 dark:border-primary-900/40 p-5 space-y-3">
      <div className="h-5 w-2/5 rounded-pill bg-gradient-to-r from-primary-100 to-secondary-100 dark:from-primary-900/40 dark:to-secondary-900/20" />
      <div className="h-3 w-1/4 rounded-pill bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-primary-900/30 dark:to-secondary-900/10" />
      <div className="h-3 w-full rounded-pill bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-primary-900/30 dark:to-secondary-900/10" />
      <div className="h-3 w-2/3 rounded-pill bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-primary-900/30 dark:to-secondary-900/10" />
    </div>
  );
}

export default function ResourcesPage() {
  const { user } = useAuth();
  const userId = user?.id;

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
        if (userId) params.userId = userId;

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
  }, [selectedCity, debouncedSearch, userId]);

  const isSearching = search.trim().length >= 2;

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--umeed-beige-50)',
      paddingLeft: '80px',
      paddingBottom: '60px',
    }}>
      {/* Header */}
      <div style={{
        padding: '40px 40px 24px',
        borderBottom: '1px solid var(--umeed-orange-100)',
      }}>
        <h1 style={{
          fontSize: '44px',
          fontFamily: "'Fraunces', Georgia, serif",
          fontWeight: 700,
          color: 'var(--umeed-ink-900)',
          margin: '0 0 8px 0',
        }}>
          Support Resources
        </h1>
        <p style={{
          fontSize: '16px',
          color: 'var(--umeed-ink-500)',
          margin: 0,
        }}>
          Crisis lines, counselors, and support groups in your region.
        </p>
      </div>

      {/* Search */}
      <div style={{
        padding: '24px 40px',
      }}>
        <label htmlFor="resource-search" className="sr-only">
          Search resources
        </label>
        <input
          id="resource-search"
          type="text"
          placeholder="Search by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: '100%',
            padding: '12px 16px',
            borderRadius: '9999px',
            border: `1px solid var(--umeed-orange-100)`,
            backgroundColor: 'white',
            color: 'var(--umeed-ink-900)',
            fontSize: '16px',
            fontFamily: 'Inter, system-ui, sans-serif',
            transition: 'all 300ms cubic-bezier(0.22, 1, 0.36, 1)',
            outline: 'none',
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = 'var(--umeed-orange-500)';
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = 'var(--umeed-orange-100)';
          }}
        />
      </div>

      {/* City filters */}
      <div style={{
        display: 'flex',
        gap: '8px',
        overflowX: 'auto',
        paddingLeft: '40px',
        paddingRight: '40px',
        paddingBottom: '24px',
      }} role="group" aria-label="Filter by city">
        <button
          type="button"
          disabled={isSearching}
          onClick={() => setSelectedCity(null)}
          style={{
            padding: '8px 16px',
            borderRadius: '9999px',
            border: selectedCity === null ? 'none' : `1px solid var(--umeed-orange-100)`,
            backgroundColor: selectedCity === null ? 'var(--umeed-orange-500)' : 'white',
            color: selectedCity === null ? 'white' : 'var(--umeed-ink-900)',
            fontSize: '14px',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 300ms',
            whiteSpace: 'nowrap',
            opacity: isSearching ? 0.5 : 1,
          }}
        >
          All
        </button>
        {ACTIVE_CITY_FILTERS.map((city) => (
          <button
            key={city.code}
            type="button"
            disabled={isSearching}
            onClick={() => setSelectedCity(city.code)}
            style={{
              padding: '8px 16px',
              borderRadius: '9999px',
              border: selectedCity === city.code ? 'none' : `1px solid var(--umeed-orange-100)`,
              backgroundColor: selectedCity === city.code ? 'var(--umeed-orange-500)' : 'white',
              color: selectedCity === city.code ? 'white' : 'var(--umeed-ink-900)',
              fontSize: '14px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 300ms',
              whiteSpace: 'nowrap',
              opacity: isSearching ? 0.5 : 1,
            }}
          >
            {city.label}
          </button>
        ))}
      </div>

      {/* Resources list */}
      <div style={{
        maxWidth: '900px',
        marginLeft: 'auto',
        marginRight: 'auto',
        paddingLeft: '40px',
        paddingRight: '40px',
      }}>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }} role="status">
            {Array.from({ length: 5 }, (_, i) => (
              <ResourceCardSkeleton key={i} />
            ))}
          </div>
        ) : matched.length === 0 && other.length === 0 ? (
          <div style={{
            textAlign: 'center',
            paddingTop: '40px',
            paddingBottom: '40px',
          }}>
            <p style={{
              fontSize: '16px',
              color: 'var(--umeed-ink-500)',
              margin: 0,
            }}>
              No resources found for your selection. Try a different city or search term.
            </p>
          </div>
        ) : (
          <>
            {matched.length > 0 && (
              <section style={{ marginBottom: '40px' }}>
                <h2 style={{
                  fontSize: '28px',
                  fontFamily: "'Fraunces', Georgia, serif",
                  fontWeight: 700,
                  color: 'var(--umeed-ink-900)',
                  margin: '0 0 16px 0',
                }}>
                  Matched to your preferences
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {matched.map((resource) => (
                    <ResourceCard key={resource.id} resource={resource} />
                  ))}
                </div>
              </section>
            )}

            {other.length > 0 && (
              <section>
                {matched.length > 0 && (
                  <h2 style={{
                    fontSize: '28px',
                    fontFamily: "'Fraunces', Georgia, serif",
                    fontWeight: 700,
                    color: 'var(--umeed-ink-900)',
                    margin: '0 0 16px 0',
                  }}>
                    Other resources
                  </h2>
                )}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {other.map((resource) => (
                    <ResourceCard key={resource.id} resource={resource} />
                  ))}
                </div>
              </section>
            )}
          </>
        )}

        <p style={{
          textAlign: 'center',
          fontSize: '14px',
          color: 'var(--umeed-ink-500)',
          marginTop: '40px',
          paddingBottom: '20px',
        }}>
          Need immediate help? Call your local crisis hotline or emergency services.
        </p>
      </div>
    </div>
  );
}
