export interface Provider {
  id: string
  location: string
  enterpriseType: string
  name: string
  address: string
  phone: string
  email?: string
  accreditationNo: string
  validity: string
  status: string
}

export interface ProviderResponse {
  providers: Provider[]
  error?: string
}