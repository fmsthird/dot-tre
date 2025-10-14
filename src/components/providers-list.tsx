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
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
        <div className="container mx-auto p-4">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center w-full gap-4">
            <div className="text-center md:text-left space-y-1">
              <h1 className="text-3xl font-bold text-center bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                ACCREDITED TREs PER LGU
              </h1>
              <p className="text-muted-foreground">As of August 31, 2025</p>
            </div>

            <div className="flex gap-2 w-full md:w-auto">
              <Input
                type="text"
                placeholder="Search by name, location, or accreditation no..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full md:w-[400px] py-6 bg-background"
              />
              <Button
                variant="outline"
                onClick={() => setSearchTerm('')}
                className="p-6 min-w-[100px] bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
              >
                Clear
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto p-4 space-y-6 pt-6">

      {Object.entries(groupedProviders).map(([location, locationProviders]) => (
        <div key={location} className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground/80 border-b border-border pb-3">{location}</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {locationProviders.map((provider) => (
              <Card
                key={provider.id}
                className="group hover:shadow-lg transition-all duration-300 bg-card hover:bg-accent/5 border-border"
              >
                <CardHeader className="space-y-2">
                  <CardTitle className="text-lg font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                    {provider.name}
                  </CardTitle>
                  <p className="text-sm font-medium text-muted-foreground border border-border/50 rounded-full px-3 py-1 w-fit">
                    {provider.enterpriseType}
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <p className="text-muted-foreground flex gap-2 items-start">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5">
                        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                      <span>{provider.address}</span>
                    </p>
                    <p className="flex gap-2 items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                      </svg>
                      <a
                        href={`tel:${provider.phone}`}
                        className="text-primary hover:underline"
                      >
                        {provider.phone}
                      </a>
                    </p>
                    {provider.email && (
                      <p className="flex gap-2 items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect width="20" height="16" x="2" y="4" rx="2" />
                          <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                        </svg>
                        <a
                          href={`mailto:${provider.email}`}
                          className="text-primary hover:underline"
                        >
                          {provider.email}
                        </a>
                      </p>
                    )}
                    <div className="pt-2 border-t border-border/50 mt-4 space-y-2">
                      <p className="flex gap-2 items-center text-muted-foreground">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M9 12h6" />
                          <path d="M12 9v6" />
                          <path d="M4 6v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2Z" />
                        </svg>
                        <span>Accreditation: {provider.accreditationNo}</span>
                      </p>
                      <p className="flex gap-2 items-center text-muted-foreground">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                          <line x1="16" x2="16" y1="2" y2="6" />
                          <line x1="8" x2="8" y1="2" y2="6" />
                          <line x1="3" x2="21" y1="10" y2="10" />
                        </svg>
                        <span>Valid until: {provider.validity}</span>
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}

      {Object.keys(groupedProviders).length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground/50 mb-4">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <p className="text-xl font-medium text-muted-foreground">
            No results found matching your search.
          </p>
          <p className="text-sm text-muted-foreground/60 mt-1">
            Try adjusting your search terms or filters.
          </p>
        </div>
      )}
      </div>
    </div>
  );
}
