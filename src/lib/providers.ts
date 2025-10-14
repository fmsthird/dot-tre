import Papa from 'papaparse'
import { Provider, ProviderResponse } from '@/types/provider'

const PROVINCE_FILES = [
  { id: 'agusan-norte', name: 'Agusan del Norte', file: '/list/Agusan-del-Norte.csv' },
  { id: 'agusan-sur', name: 'Agusan del Sur', file: '/list/Agusan-del-Sur.csv' },
  { id: 'dinagat', name: 'Dinagat Islands', file: '/list/Dinagat-Islands.csv' },
  { id: 'surigao-norte', name: 'Surigao del Norte', file: '/list/Surigao-del-Norte.csv' },
  { id: 'surigao-sur', name: 'Surigao del Sur', file: '/list/Surigao-del-Sur.csv' }
]

export interface Province {
  id: string;
  name: string;
  file: string;
}

export const getProvinces = (): Province[] => PROVINCE_FILES

export async function fetchProviders(provinceId?: string): Promise<ProviderResponse> {
  try {
    const filesToFetch = provinceId 
      ? [PROVINCE_FILES.find(p => p.id === provinceId)!.file]
      : PROVINCE_FILES.map(p => p.file);

    // Fetch the CSV files
    const responses = await Promise.all(filesToFetch.map(file => fetch(file)));
    const csvDataArray = await Promise.all(responses.map(response => response.text()));
    
    let allProviders: Provider[] = [];
    
    // Process each CSV file
    for (const csvData of csvDataArray) {
      const result = await new Promise<Provider[]>((resolve) => {
        let providers: Provider[] = [];
        let currentLocation = '';
        
        Papa.parse<string[]>(csvData, {
          skipEmptyLines: 'greedy',
          complete: (results) => {
            providers = results.data.reduce<Provider[]>((acc, row, index) => {
              // Skip first 4 rows (headers)
              if (index < 4) return acc;
              
              // Skip empty rows
              if (row.every(cell => cell === '')) return acc;
              
              // Check if this is a location marker row
              if (row[0] === '' && row[1] && !row[2]) {
                currentLocation = row[1].trim();
                return acc;
              }
              
              // Process provider rows
              if ((row[0] || row[1]) && row[2]) {
                acc.push({
                  id: `provider-${currentLocation.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${index}-${(row[2] || '').toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
                  location: currentLocation,
                  enterpriseType: row[1] || '',
                  name: row[2] || '',
                  address: row[3] || '',
                  phone: row[4] || '',
                  email: row[5] || '',
                  accreditationNo: row[6] || '',
                  validity: row[7] || '',
                  status: row[8] || ''
                });
              }
              
              return acc;
            }, []);
            
            resolve(providers);
          },
          error: (error: Error) => {
            console.error('Error parsing CSV:', error);
            resolve([]);
          }
        });
      });
      
      allProviders = [...allProviders, ...result];
    }
    
    return { providers: allProviders };
  } catch (error) {
    console.error('Failed to fetch providers:', error);
    return { providers: [], error: 'Failed to fetch providers data' };
  }
}