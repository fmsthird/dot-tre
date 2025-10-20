import Papa from 'papaparse';
import { Provider } from '@/types/provider';

const SHEET_ID = '1ST5Hu6tJl-IbIacORyA_rBuLEBPmqSOqpRkH9xt9Z2o';

const PROVINCE_FILES = [
  {
    id: 'agusan-norte',
    name: 'Agusan del Norte',
    file: `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&gid=1484185172`,
  },
  {
    id: 'agusan-sur',
    name: 'Agusan del Sur',
    file: `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&gid=1899865792`,
  },
  {
    id: 'dinagat',
    name: 'Dinagat Islands',
    file: `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&gid=1686352904`,
  },
  {
    id: 'surigao-norte',
    name: 'Surigao del Norte',
    file: `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&gid=291833559`,
  },
  {
    id: 'surigao-sur',
    name: 'Surigao del Sur',
    file: `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&gid=22341524`,
  },
];

export interface Province {
  id: string;
  name: string;
  file: string;
}

export interface ProviderResponse {
  providers: Provider[];
  error?: string;
  asOfDate?: string;
}

export const getProvinces = (): Province[] => PROVINCE_FILES;

export async function fetchProviders(
  provinceId?: string,
): Promise<ProviderResponse> {
  try {
    const filesToFetch = provinceId
      ? [PROVINCE_FILES.find((p) => p.id === provinceId)!.file]
      : PROVINCE_FILES.map((p) => p.file);

    const responses = await Promise.all(filesToFetch.map((file) => fetch(file)));
    const csvDataArray = await Promise.all(responses.map((res) => res.text()));

    // Extract the date from the first sheet text
    let asOfDate = '';
    if (csvDataArray[0]) {
      const match = csvDataArray[0].match(/As of (.*?)\./);
      if (match) asOfDate = match[1].trim();
    }

    let allProviders: Provider[] = [];

    for (const csvData of csvDataArray) {
      const providers = await new Promise<Provider[]>((resolve) => {
        const parsedProviders: Provider[] = [];
        let currentLocation = '';
        let hasStarted = false;

        Papa.parse<string[]>(csvData, {
          header: false,
          skipEmptyLines: 'greedy',
          quoteChar: '"',
          dynamicTyping: false,
          delimiter: ',',
          complete: (results) => {
            results.data.forEach((rawRow, index) => {
              // Normalize: remove leading empty cells and trim
              const row = rawRow.map((c) => (c || '').trim());
              while (row.length && !row[0]) row.shift(); // Remove leading blanks

              if (!hasStarted) {
                if (row.some((c) => /Enterprise Name/i.test(c))) {
                  hasStarted = true;
                }
                return;
              }

              // Skip empty/junk rows
              if (row.every((c) => !c)) return;

              // Detect location rows (like BUTUAN CITY)
              if (
                row.length === 1 ||
                (row.filter(Boolean).length === 1 && !/^\d+$/.test(row[0]))
              ) {
                currentLocation = row[0]?.trim() || row[1]?.trim() || '';
                return;
              }

              // Pad to consistent column length
              while (row.length < 9) row.push('');

              // Column alignment fix: 
              // If the first cell is numeric, assume it’s the “No.” column.
              // Otherwise shift everything right.
              let [
                no,
                enterpriseType,
                name,
                address,
                contact,
                email,
                accNo,
                validity,
                status,
              ] = row;

              if (!/^\d+$/.test(no)) {
                // Shift if first cell isn't numeric
                [enterpriseType, name, address, contact, email, accNo, validity, status] =
                  row;
                no = '';
              }

              if (!name) return;

              parsedProviders.push({
                id: `provider-${index}-${(name || '')
                  .toLowerCase()
                  .replace(/[^a-z0-9]+/g, '-')}`,
                location: currentLocation,
                enterpriseType,
                name,
                address,
                phone: contact,
                email,
                accreditationNo: accNo,
                validity,
                status,
              });
            });

            resolve(parsedProviders);
          },
          error: (error: Error) => {
            console.error('Error parsing CSV:', error);
            resolve([]);
          },
        });
      });

      allProviders = [...allProviders, ...providers];
    }

    return { providers: allProviders, asOfDate };
  } catch (error) {
    console.error('Failed to fetch providers:', error);
    return {
      providers: [],
      error: 'Failed to fetch providers data',
      asOfDate: '',
    };
  }
}
