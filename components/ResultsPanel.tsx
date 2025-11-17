import React from 'react'

export default function ResultsPanel({ data }: { data: any }) {
  // 1. Update the check to look for 'result' instead of 'quote'
  // The new API response format is: { status: 'ok', result: { ... } }
  if (!data || !data.result) return null

  // 2. Extract the result object
  const r = data.result

  // 3. Map the fields from the new 'SavingsResult' shape (defined in the PDF)
  const current = r.currentMonthlyCost ?? 0
  const newCost = r.newMonthlyCost ?? 0
  const monthlySaving = r.monthlySaving ?? 0
  const annualSaving = r.annualSaving ?? 0

  return (
    <div className="max-w-3xl mx-auto bg-[#5170ff10] border border-gray-200 rounded-2xl p-6 shadow-sm">
      <h3 className="text-xl font-semibold text-gray-900">Estimated savings</h3>
      <p className="mt-1 text-sm text-gray-600">
        Based on the statement you uploaded and CardMachineQuote.com standard rates.
      </p>
      <dl className="mt-4 space-y-1 text-sm text-gray-800">
        <div className="flex justify-between">
          <dt className="font-medium">Current monthly cost</dt>
          <dd>£{current.toFixed(2)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="font-medium">New monthly cost</dt>
          <dd>£{newCost.toFixed(2)}</dd>
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