import React from 'react'

// --- START MODIFICATION ---
// Replaced entire component with the new spec [cite: 119-145]
// (and corrected typos from the spec)

export default function ResultsPanel({ data }: { data: any }) {
  if (!data || !data.quote) return null

  const q = data.quote

  const current = q.currentMonthly ?? 0
  const cmq = q.cmqMonthly ?? 0
  const monthlySaving = q.monthlySaving ?? (current - cmq)
  const annualSaving = q.annualSaving ?? monthlySaving * 12

  return (
    <div className="max-w-3xl mx-auto bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
      <h3 className="text-xl font-semibold text-gray-900">Estimated savings</h3>
      <p className="mt-1 text-sm text-gray-600">
        Based on the statement you uploaded and CardMachineQuote.com standard rates.
      </p>
      <dl className="mt-4 space-y-1 text-sm text-gray-800">
        <div className="flex justify-between">
          <dt className="font-medium">Monthly cost with current provider</dt>
          <dd>£{current.toFixed(2)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="font-medium">Monthly with CardMachineQuote.com</dt>
          <dd>£{cmq.toFixed(2)}</dd>
        </div>
        <div className="flex justify-between text-green-700">
          <dt className="font-medium">Monthly saving</dt>
          <dd>£{monthlySaving.toFixed(2)}</dd>
        </div>
        <div className="flex justify-between text-green-700">
          <dt className="font-medium">Annual saving</dt>
          <dd>£{annualSaving.toFixed(2)}</dd>
        </div>
      </dl>
    </div>
  )
}
// --- END MODIFICATION ---