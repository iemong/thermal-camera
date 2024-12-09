'use client'

import ThermalCanvas from '@/components/ThermalCanvas'
import { useEffect, useState } from 'react'

type ThermalData = number[]

export default function ThermalPage() {
  const [thermalData, setThermalData] = useState<ThermalData | null>(null)

  useEffect(() => {
    const eventSource = new EventSource('/api/thermal')

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data)
      setThermalData(data)
    }

    return () => {
      eventSource.close()
    }
  }, [])

  if (!thermalData) {
    return <div>データ待機中...</div>
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">サーマルデータ</h1>
      <ThermalCanvas data={thermalData} />
      <pre className="bg-gray-100 p-4 rounded text-black whitespace-pre-wrap break-all text-xs">
        {JSON.stringify(thermalData)}
      </pre>
    </div>
  )
}