'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Provider } from '@/types/provider';
import { fetchProviders, getProvinces } from '@/lib/providers';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function ProvidersList() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [asOfDate, setAsOfDate] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeProvince, setActiveProvince] = useState<string>('agusan-norte');
  const provinces = getProvinces();

  useEffect(() => {
    setLoading(true);
    fetchProviders(activeProvince)
      .then((data) => {
        setProviders(data.providers || []);
        setAsOfDate(data.asOfDate || '');
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Failed to fetch providers');
        setLoading(false);
      });
  }, [activeProvince]);

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
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/banner-horizontal.svg" className="w-full pointer-events-none" alt="festive banner" />
      <div className="bg-gradient-to-b from-primary/5 to-background border-b border-border">
        <div className="container mx-auto p-4">
          <div className="flex flex-col gap-6">
            <div className="text-center space-y-4">
              <div className="flex flex-col items-center justify-center relative">
                <div className="flex justify-center items-center w-full md:w-1/2 pt-4 gap-2 md:gap-6 mb-4">
                  <div className="w-full relative h-24 max-w-[180px]">
                    <Image
                      src="/love-caraga.png"
                      alt="LOVE Caraga"
                      fill
                      className="object-contain"
                      priority
                    />
                  </div>
                  <div className="w-24 h-24 relative animate-bounce-slow">
                    <Image
                      src="/logo.svg"
                      alt="DOT Logo"
                      fill
                      className="object-contain"
                      priority
                    />
                  </div>
                  <div className="w-full relative h-24 max-w-[150px]">
                    <Image
                      src="/love-ph.png"
                      alt="LOVE PH"
                      fill
                      className="object-contain"
                      priority
                    />
                  </div>
                </div>
              </div>
              <div className="relative">
                <h1 className="text-4xl leading-normal font-['Barbara'] text-center bg-gradient-to-r from-pink-500 via-blue-500 to-purple-500 bg-clip-text text-transparent tracking-wider">
                  ACCREDITED TRES PER LGU
                </h1>
                <p className="text-muted-foreground -mt-2 text-lg">
                  As of {asOfDate}
                </p>
              </div>
            </div>

            <Tabs
              defaultValue={activeProvince}
              className="w-full"
              onValueChange={(value) => setActiveProvince(value)}
            >
              <div className="flex items-center w-full justify-center">
                <TabsList className="bg-blue-500 inline-flex h-auto min-h-[2.25rem] flex-wrap items-center justify-center rounded-lg p-2 text-white w-fit gap-1">
                  {provinces.map((province) => (
                    <TabsTrigger
                      key={province.id}
                      value={province.id}
                      className="ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm h-8 rounded-md px-3 hover:bg-background/50 transition-colors whitespace-nowrap cursor-pointer"
                    >
                      {province.name}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>

              <div className="flex gap-2 w-full justify-center mt-4">
                <Input
                  type="text"
                  placeholder="Search by name, location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full max-w-[600px] py-6 bg-background"
                />
                <Button
                  variant="outline"
                  onClick={() => setSearchTerm('')}
                  className="p-6 min-w-[100px] bg-primary text-primary-foreground bg-gradient-to-br from-purple-600 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm cursor-pointer hover:text-white"
                >
                  Clear
                </Button>
              </div>
            </Tabs>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-4 space-y-6 pt-6">
        <Tabs defaultValue={activeProvince}>
          <TabsList className="hidden">
            {provinces.map((province) => (
              <TabsTrigger key={province.id} value={province.id}>
                {province.name}
              </TabsTrigger>
            ))}
          </TabsList>
          {provinces.map((province) => (
            <TabsContent key={province.id} value={province.id} className="my-6">
              {Object.entries(groupedProviders).map(
                ([location, locationProviders]) => (
                  <div key={location} className="mt-8 space-y-4">
                    <h2 className="text-2xl uppercase leading-normal font-['Barbara'] border-b border-border pb-3 bg-gradient-to-r from-blue-500 via-pink-500 to-purple-500 bg-clip-text text-transparent tracking-wide">
                      {location}
                    </h2>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                      {locationProviders.map((provider) => (
                        <Card
                          key={provider.id}
                          className="group hover:shadow-xl transition-all duration-300 bg-gradient-to-b from-background to-accent/5 hover:scale-[1.02] border-border relative overflow-hidden"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-pink-500/10 via-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                          <CardHeader className="space-y-3 relative">
                            <CardTitle className="text-xl font-bold bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                              {provider.name}
                            </CardTitle>
                            <p className="text-sm font-medium bg-gradient-to-r from-pink-500/20 to-purple-500/20 border-none rounded-full px-4 py-1.5 w-fit">
                              {provider.enterpriseType}
                            </p>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3 text-sm relative">
                              <p className="text-muted-foreground flex gap-2 items-start group/item hover:text-pink-500 transition-colors">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="16"
                                  height="16"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  className="mt-0.5 group-hover/item:text-pink-500 transition-colors"
                                >
                                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                                  <circle cx="12" cy="10" r="3" />
                                </svg>
                                <span>{provider.address}</span>
                              </p>
                              <p className="flex gap-2 items-center group/item hover:text-blue-500 transition-colors">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="16"
                                  height="16"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  className="group-hover/item:text-blue-500 transition-colors"
                                >
                                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                                </svg>
                                <a
                                  href={`tel:${provider.phone}`}
                                  className="text-blue-500 hover:text-blue-600 hover:underline transition-colors"
                                >
                                  {provider.phone}
                                </a>
                              </p>
                              {provider.email && (
                                <p className="flex gap-2 items-center group/item hover:text-purple-500 transition-colors">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="group-hover/item:text-purple-500 transition-colors"
                                  >
                                    <rect
                                      width="20"
                                      height="16"
                                      x="2"
                                      y="4"
                                      rx="2"
                                    />
                                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                                  </svg>
                                  <a
                                    href={`mailto:${provider.email}`}
                                    className="text-purple-500 hover:text-purple-600 hover:underline transition-colors"
                                  >
                                    {provider.email}
                                  </a>
                                </p>
                              )}
                              <div className="pt-4 mt-4 space-y-2 relative">
                                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
                                <p className="flex gap-2 items-center text-muted-foreground group/item hover:text-pink-500/80 transition-colors">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="group-hover/item:text-pink-500/80 transition-colors"
                                  >
                                    <path d="M9 12h6" />
                                    <path d="M12 9v6" />
                                    <path d="M4 6v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2Z" />
                                  </svg>
                                  <span className="group-hover/item:text-pink-500/80 transition-colors">
                                    Accreditation: {provider.accreditationNo}
                                  </span>
                                </p>
                                <p className="flex gap-2 items-center text-muted-foreground group/item hover:text-purple-500/80 transition-colors">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="group-hover/item:text-purple-500/80 transition-colors"
                                  >
                                    <rect
                                      width="18"
                                      height="18"
                                      x="3"
                                      y="4"
                                      rx="2"
                                      ry="2"
                                    />
                                    <line x1="16" x2="16" y1="2" y2="6" />
                                    <line x1="8" x2="8" y1="2" y2="6" />
                                    <line x1="3" x2="21" y1="10" y2="10" />
                                  </svg>
                                  <span className="group-hover/item:text-purple-500/80 transition-colors">
                                    Valid until: {provider.validity}
                                  </span>
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                ),
              )}

              {Object.keys(groupedProviders).length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="48"
                    height="48"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-muted-foreground/50 mb-4"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.3-4.3" />
                  </svg>
                  <p className="text-xl font-medium text-muted-foreground">
                    No results found in {province.name}
                  </p>
                  <p className="text-sm text-muted-foreground/60 mt-1">
                    Try adjusting your search terms or checking another
                    province.
                  </p>
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}
