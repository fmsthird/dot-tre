'use client'

import dynamic from 'next/dynamic'

const ProvidersList = dynamic(() => import('@/components/providers-list'), {
  ssr: false
})

export default function Home() {
  return <ProvidersList />
}
