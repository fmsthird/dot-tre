'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Provider } from '@/types/provider';
import { fetchProviders } from '@/lib/providers';

export default function ProvidersList() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchProviders()
      .then((data) => {
        setProviders(data.providers || []);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Failed to fetch providers');
        setLoading(false);
      });
  }, []);

  const filteredProviders =
    searchTerm.trim() === ''
      ? providers
      : providers.filter((provider) => {
          const searchLower = searchTerm.toLowerCase();
          return (
            provider.name.toLowerCase().includes(searchLower) ||
            provider.location.toLowerCase().includes(searchLower) ||
            provider.enterpriseType.toLowerCase().includes(searchLower) ||
            provider.address.toLowerCase().includes(searchLower)
          );
        });

  // Group providers by location
  const groupedProviders = filteredProviders.reduce<Record<string, Provider[]>>(
    (acc, provider) => {
      if (!acc[provider.location]) {
        acc[provider.location] = [];
      }
      acc[provider.location].push(provider);
      return acc;
    },
    {},
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <p className="text-red-500">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center w-full gap-4">
        <h1 className="text-2xl font-bold text-center">
          LIST OF ACCREDITED TREs PER LGU
        </h1>

        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="Search by name, location, or type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-md"
          />
          <Button
            variant="outline"
            onClick={() => setSearchTerm('')}
            className="shrink-0 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Clear
          </Button>
        </div>
      </div>

      {Object.entries(groupedProviders).map(([location, locationProviders]) => (
        <div key={location} className="space-y-4">
          <h2 className="text-xl font-semibold border-b pb-2">{location}</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {locationProviders.map((provider) => (
              <Card
                key={provider.id}
                className="hover:shadow-lg transition-shadow"
              >
                <CardHeader>
                  <CardTitle className="text-lg">{provider.name}</CardTitle>
                  <p className="text-sm text-gray-500">
                    {provider.enterpriseType}
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <p>{provider.address}</p>
                    <p>
                      <strong>Phone:</strong> <a
                          href={`tel:${provider.phone}`}
                          className="text-blue-600 hover:underline"
                        >{provider.phone}</a>
                    </p>
                    {provider.email && (
                      <p>
                        <strong>Email:</strong>{' '}
                        <a
                          href={`mailto:${provider.email}`}
                          className="text-blue-600 hover:underline"
                        >
                          {provider.email}
                        </a>
                      </p>
                    )}
                    <p>
                      <strong>Accreditation:</strong> {provider.accreditationNo}
                    </p>
                    <p>
                      <strong>Valid until:</strong> {provider.validity}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}

      {Object.keys(groupedProviders).length === 0 && (
        <p className="text-center text-gray-500">
          No providers found matching your search.
        </p>
      )}
    </div>
  );
}
