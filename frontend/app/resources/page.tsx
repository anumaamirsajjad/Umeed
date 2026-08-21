'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ROUTES, REGIONS } from '@/lib/constants';
import { getResources } from '@/lib/api';
import type { CrisisResource } from '@/lib/types';

export default function ResourcesPage() {
  const [resources, setResources] = useState<CrisisResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRegion, setSelectedRegion] = useState('north-america');
  const [selectedType, setSelectedType] = useState('');

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const params: any = { region: selectedRegion };
        if (selectedType) {
          params.type = selectedType;
        }
        const data = await getResources(params);
        setResources(data);
      } catch (error) {
        console.error('Error fetching resources:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchResources();
  }, [selectedRegion, selectedType]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-accent-50 p-4">
      <div className="max-w-4xl mx-auto">
        <Link href={ROUTES.home} className="text-primary-700 hover:text-primary-900 font-semibold mb-6 inline-block">
          ← Home
        </Link>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-primary-900 mb-2">
            Crisis & Support Resources
          </h1>
          <p className="text-gray-600 mb-8">
            Find crisis hotlines, professional services, and support resources in your region.
          </p>

          {/* Filters */}
          <div className="grid md:grid-cols-2 gap-4 mb-8">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Region</label>
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500"
              >
                {REGIONS.map(region => (
                  <option key={region.code} value={region.code}>
                    {region.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Type</label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500"
              >
                <option value="">All Types</option>
                <option value="crisis_hotline">Crisis Hotline</option>
                <option value="professional">Professional Services</option>
                <option value="support_group">Support Group</option>
                <option value="online_resource">Online Resource</option>
              </select>
            </div>
          </div>

          {/* Resources List */}
          {loading ? (
            <div className="text-center text-gray-500">Loading resources...</div>
          ) : resources.length === 0 ? (
            <div className="text-center text-gray-500">No resources found for your selection.</div>
          ) : (
            <div className="space-y-4">
              {resources.map(resource => (
                <div key={resource.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold text-primary-900">{resource.name}</h3>
                    <span className="bg-accent-100 text-accent-800 px-3 py-1 rounded-full text-xs font-semibold">
                      {resource.type.replace('_', ' ')}
                    </span>
                  </div>

                  {resource.description && (
                    <p className="text-gray-600 text-sm mb-4">{resource.description}</p>
                  )}

                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    {resource.phone && (
                      <div>
                        <span className="text-xs font-semibold text-gray-500 uppercase">Phone</span>
                        <p className="text-primary-700 font-semibold">{resource.phone}</p>
                      </div>
                    )}
                    <div>
                      <span className="text-xs font-semibold text-gray-500 uppercase">Availability</span>
                      <p className="text-gray-900 font-semibold">{resource.availability}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs font-semibold text-gray-500">Languages:</span>
                    <div className="flex gap-1">
                      {resource.languages.slice(0, 3).map(lang => (
                        <span key={lang} className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {lang}
                        </span>
                      ))}
                      {resource.languages.length > 3 && (
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                          +{resource.languages.length - 3}
                        </span>
                      )}
                    </div>
                  </div>

                  {resource.web && (
                    <a
                      href={resource.web}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accent-600 hover:text-accent-700 font-semibold text-sm"
                    >
                      Visit Website →
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer note */}
        <div className="mt-8 text-center text-sm text-gray-600">
          <p>Need immediate help? Call your local crisis hotline or emergency services.</p>
        </div>
      </div>
    </div>
  );
}
