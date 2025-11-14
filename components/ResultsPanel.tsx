import React from 'react'

export default function ResultsPanel({ data }:{ data:any }){
  if(!data) return null
  const q = data.quote
  return (
    <div className="max-w-3xl mx-auto bg-white border rounded-2xl p-6">
      <h3 className="text-xl font-semibold">Estimated savings</h3>
      <div className="mt-2 text-sm">Monthly with CardMachineQuote.com: £{q.cmqMonthly?.toFixed?.(2)}</div>
      {q.monthlySaving!=null && <div className="mt-1 text-sm">Monthly saving: £{q.monthlySaving.toFixed(2)}</div>}
      {q.annualSaving!=null && <div className="mt-1 text-sm">Annual saving: £{q.annualSaving.toFixed(2)}</div>}
    </div>
  )
}
