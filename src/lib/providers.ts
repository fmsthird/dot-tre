import Papa from 'papaparse'
import { Provider, ProviderResponse } from '@/types/provider'

const CSV_FILE = '/accredited-providers.csv'

export async function fetchProviders(): Promise<ProviderResponse> {
  try {
    // Fetch the CSV file
    const response = await fetch(CSV_FILE)
    const csvData = await response.text()
    console.log(csvData)
    
    return new Promise<ProviderResponse>((resolve, reject) => {
      Papa.parse<string[]>(csvData, {
        skipEmptyLines: 'greedy',
        complete: (results) => {
          let currentLocation = ''
          const providers = results.data.reduce<Provider[]>((acc, row, index) => {
            // Skip first 4 rows (headers)
            if (index < 4) return acc
            
            // Skip empty rows
            if (row.every(cell => !cell)) return acc
            
            // Check if this is a location marker row (starts with comma and has location name)
            if (row[0] === '' && row.length > 1 && row[1]?.trim() && !row[2]) {
              currentLocation = row[1].trim()
              return acc
            }
            
            // Process provider rows (has index number, enterprise type and name)
            if (row[0] && row[1] && row[2]) {
              acc.push({
                id: `provider-${currentLocation.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${index}-${row[2].toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
                location: currentLocation,
                enterpriseType: row[1],
                name: row[2],
                address: row[3] || '',
                phone: row[4] || '',
                email: row[5] || '',
                accreditationNo: row[6] || '',
                validity: row[7] || '',
                status: row[8] || ''
              })
            }
            
            return acc
          }, [])
          
          resolve({ providers })
        },
        error: (error: Error) => {
          reject({ error: error.message, providers: [] })
        }
      })
    })
  } catch (error) {
    console.error('Failed to fetch providers:', error)
    return { providers: [], error: 'Failed to fetch providers data' }
  }
}