import React from 'react'
export default function CalendlyEmbed(){
  const url = process.env.NEXT_PUBLIC_CALENDLY_URL || ''
  return (
    <div className="w-full h-[420px] bg-gray-100 rounded-lg flex items-center justify-center">
      {url ? <iframe src={url} className="w-full h-full rounded-lg" /> : <span className="text-gray-500">Calendly Embed</span>}
    </div>
  )
}
