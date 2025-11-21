'use client'
import React, { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Navbar from '@/components/Navbar'
import 'react-international-phone/style.css'
import { PhoneInput } from 'react-international-phone'

// Main Form Component
function OrderForm() {
  const brandBlue = '#5170ff'
  const searchParams = useSearchParams()
  
  // Form State
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState('')
  const [showValidation, setShowValidation] = useState(false)

  // Define Bands
  const BANDS = [
    { id: 1, label: "£5000 to £15,000 - RATE: 0.79% all cards", value: "£5000 to £15,000 - RATE: 0.79% all cards" },
    { id: 2, label: "£15,000 to £30,000 - RATE: 0.35% debit/0.49% credit", value: "£15,000 to £30,000 - RATE: 0.35% debit/0.49% credit", note: "(Proof of turnover required)" },
    { id: 3, label: "£30,000 and over - RATE: 0.25% debit/0.45% credit", value: "£30,000 and over - RATE: 0.25% debit/0.45% credit", note: "(Proof of turnover required)" }
  ]

  const [formData, setFormData] = useState({
    // Step 1
    companyName: '',
    businessAddress: '',
    businessPostalCode: '',
    email: '',
    phone: '',
    companyType: '',
    
    // Step 2
    firstName: '',
    lastName: '',
    dobDay: '',
    dobMonth: '',
    dobYear: '',
    residentialAddress: '',
    residentialPostalCode: '',

    // Step 3
    terminalChoice: '',
    turnoverBand: '', 
  })

  // Effect: Handle URL Parameter ?option=X
  useEffect(() => {
    const option = searchParams.get('option')
    if (option) {
      const index = parseInt(option) - 1 // 1-based index
      if (BANDS[index]) {
        // Automatically select the band derived from the URL
        setFormData(prev => ({ ...prev, turnoverBand: BANDS[index].value }))
      }
    }
  }, [searchParams])

  // Filter bands to display
  // If 'option' param exists, show ONLY that band. Otherwise show ALL.
  const optionParam = searchParams.get('option')
  const visibleBands = optionParam 
    ? BANDS.filter(b => b.id === parseInt(optionParam))
    : BANDS

  // Handlers
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const nextStep = () => {
    // --- STEP 1 VALIDATION ---
    if (step === 1) {
      const isStep1Valid = 
        formData.companyName && 
        formData.businessAddress && 
        formData.businessPostalCode &&
        formData.email && 
        formData.phone && 
        formData.companyType;

      if (!isStep1Valid) {
        setShowValidation(true)
        window.scrollTo(0, 0)
        return
      }
    }

    // --- STEP 2 VALIDATION ---
    if (step === 2) {
      const isStep2Valid = 
        formData.firstName && 
        formData.lastName && 
        formData.dobDay && 
        formData.dobMonth && 
        formData.dobYear && 
        formData.residentialAddress &&
        formData.residentialPostalCode;

      if (!isStep2Valid) {
        setShowValidation(true)
        window.scrollTo(0, 0)
        return
      }
    }

    setShowValidation(false)
    setStep(prev => prev + 1)
    window.scrollTo(0, 0)
  }

  const prevStep = () => {
    setShowValidation(false)
    setStep(prev => prev - 1)
    window.scrollTo(0, 0)
  }

  const handleSubmit = async () => {
    // --- STEP 3 VALIDATION ---
    if (!formData.terminalChoice || !formData.turnoverBand) {
      setShowValidation(true)
      return alert("Please select both a terminal option and confirm your rate.")
    }

    setIsSubmitting(true)
    setError('')

    try {
      const res = await fetch('/api/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const json = await res.json()
      if (!res.ok) throw new Error(json.message || 'Failed to submit order')
      
      setIsSuccess(true)
      window.scrollTo(0, 0)
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Helpers
  const getInputClass = (hasError: boolean) => {
    return `w-full rounded-lg border bg-white px-4 py-3 text-slate-800 placeholder:text-slate-500 outline-none transition-all ${
      hasError 
        ? 'border-red-400 bg-red-50 focus:ring-2 focus:ring-red-200' 
        : 'border-transparent focus:ring-2 focus:ring-blue-500'
    }`
  }

  const days = Array.from({ length: 31 }, (_, i) => i + 1)
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 100 }, (_, i) => currentYear - 18 - i)

  if (isSuccess) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-16 text-center">
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-green-100">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Received!</h2>
          <p className="text-gray-600 mb-6">Thank you for your order.<br /> Our team will be in touch shortly to finalise your setup.</p>
          <a href="/" className="inline-block px-6 py-3 rounded-lg text-white font-medium" style={{ backgroundColor: brandBlue }}>Return Home</a>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-3xl md:text-4xl font-bold text-black text-center mb-8">Card Terminal Order Form</h1>
      
      <div className="rounded-3xl p-6 md:p-10 shadow-xl" style={{ backgroundColor: `${brandBlue}10` }}>
        
        {/* --- STEP 1: Application --- */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-xl font-normal text-slate-700 border-b border-slate-300 pb-2">Application</h2>
            
            {/* Company Name */}
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Company name *</label>
              <input name="companyName" value={formData.companyName} onChange={handleChange} placeholder="Enter a company name" className={getInputClass(showValidation && !formData.companyName)} />
              {showValidation && !formData.companyName && <p className="text-red-500 text-xs mt-1">ⓘ Company name is required.</p>}
            </div>

            {/* Business Address */}
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Business Address *</label>
              <input name="businessAddress" value={formData.businessAddress} onChange={handleChange} placeholder="Enter your address" className={getInputClass(showValidation && !formData.businessAddress)} />
              {showValidation && !formData.businessAddress && <p className="text-red-500 text-xs mt-1">ⓘ Business address is required.</p>}
            </div>

            {/* Business Postcode */}
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Business Postcode *</label>
              <input name="businessPostalCode" value={formData.businessPostalCode} onChange={handleChange} placeholder="e.g. SW1A 1AA" className={getInputClass(showValidation && !formData.businessPostalCode)} />
              {showValidation && !formData.businessPostalCode && <p className="text-red-500 text-xs mt-1">ⓘ Business postcode is required.</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Email *</label>
              <input name="email" type="email" value={formData.email} onChange={handleChange} placeholder="Email" className={getInputClass(showValidation && !formData.email)} />
              {showValidation && !formData.email && <p className="text-red-500 text-xs mt-1">ⓘ Email is required.</p>}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Phone *</label>
              <PhoneInput
                defaultCountry="gb"
                value={formData.phone}
                onChange={(value) => setFormData(prev => ({ ...prev, phone: value }))}
                inputClassName="w-full rounded-lg border-none bg-white px-4 py-3 text-slate-800 placeholder:text-slate-500 outline-none"
                className={getInputClass(showValidation && !formData.email)}
                placeholder="Enter your phone number"
              />
              {showValidation && !formData.phone && <p className="text-red-500 text-xs mt-1">ⓘ Phone number is required.</p>}
            </div>

            {/* Company Type */}
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Company type *</label>
              <div className="relative">
                <select name="companyType" value={formData.companyType} onChange={handleChange} className={`w-full appearance-none rounded-lg border bg-white px-4 py-3 text-slate-800 outline-none pr-10 transition-all ${showValidation && !formData.companyType ? 'border-red-400 bg-red-50 focus:ring-2 focus:ring-red-200' : 'border-transparent focus:ring-2 focus:ring-blue-500'}`}>
                  <option value="" disabled>Choose one</option>
                  <option value="Limited Company">Limited Company</option>
                  <option value="Sole Trader">Sole Trader</option>
                  <option value="Partnership">Partnership</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500"><svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg></div>
              </div>
              {showValidation && !formData.companyType && <p className="text-red-500 text-xs mt-1">ⓘ Choose an option.</p>}
            </div>

            <div className="flex justify-end pt-4">
              <button onClick={nextStep} className="px-8 py-3 bg-[#6384FF] text-white rounded-full font-medium hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/30">Next</button>
            </div>
          </div>
        )}

        {/* --- STEP 2: Owner Details --- */}
        {step === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
            
            {/* Names */}
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">First name *</label>
              <input name="firstName" value={formData.firstName} onChange={handleChange} placeholder="Enter your first name" className={getInputClass(showValidation && !formData.firstName)} />
              {showValidation && !formData.firstName && <p className="text-red-500 text-xs mt-1">ⓘ First name is required.</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Last name *</label>
              <input name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Enter your last name" className={getInputClass(showValidation && !formData.lastName)} />
              {showValidation && !formData.lastName && <p className="text-red-500 text-xs mt-1">ⓘ Last name is required.</p>}
            </div>

            {/* DOB */}
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Date Of Birth *</label>
              <div className="grid grid-cols-3 gap-3">
                <select name="dobDay" value={formData.dobDay} onChange={handleChange} className={`rounded-lg border bg-white px-4 py-3 text-slate-800 outline-none ${showValidation && !formData.dobDay ? 'border-red-400 bg-red-50' : 'border-transparent'}`}><option value="">Day</option>{days.map(d => <option key={d} value={d}>{d}</option>)}</select>
                <select name="dobMonth" value={formData.dobMonth} onChange={handleChange} className={`rounded-lg border bg-white px-4 py-3 text-slate-800 outline-none ${showValidation && !formData.dobMonth ? 'border-red-400 bg-red-50' : 'border-transparent'}`}><option value="">Month</option>{months.map(m => <option key={m} value={m}>{m}</option>)}</select>
                <select name="dobYear" value={formData.dobYear} onChange={handleChange} className={`rounded-lg border bg-white px-4 py-3 text-slate-800 outline-none ${showValidation && !formData.dobYear ? 'border-red-400 bg-red-50' : 'border-transparent'}`}><option value="">Year</option>{years.map(y => <option key={y} value={y}>{y}</option>)}</select>
              </div>
              {showValidation && (!formData.dobDay || !formData.dobMonth || !formData.dobYear) && <p className="text-red-500 text-xs mt-1">ⓘ Complete date of birth is required.</p>}
            </div>

            {/* Residential Address */}
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Residential Address *</label>
              <input name="residentialAddress" value={formData.residentialAddress} onChange={handleChange} placeholder="Enter your address" className={getInputClass(showValidation && !formData.residentialAddress)} />
              {showValidation && !formData.residentialAddress && <p className="text-red-500 text-xs mt-1">ⓘ Residential address is required.</p>}
            </div>

            {/* Residential Postcode */}
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Residential Postcode *</label>
              <input name="residentialPostalCode" value={formData.residentialPostalCode} onChange={handleChange} placeholder="e.g. SW1A 1AA" className={getInputClass(showValidation && !formData.residentialPostalCode)} />
              {showValidation && !formData.residentialPostalCode && <p className="text-red-500 text-xs mt-1">ⓘ Residential postcode is required.</p>}
            </div>

            <div className="flex justify-between pt-4">
              <button onClick={prevStep} className="px-8 py-3 bg-[#6384FF] text-white rounded-full font-medium hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/30">Back</button>
              <button onClick={nextStep} className="px-8 py-3 bg-[#6384FF] text-white rounded-full font-medium hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/30">Next</button>
            </div>
          </div>
        )}

        {/* --- STEP 3: Order Choice --- */}
        {step === 3 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
            <h2 className="text-lg text-slate-700 mb-4">Your order choice:</h2>
            
            {showValidation && (!formData.terminalChoice || !formData.turnoverBand) && (
               <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4 text-sm flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  Please select both a terminal option and your rate.
               </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-600 mb-3">Buy or rent your terminal? *</label>
              <div className="space-y-3">
                <label className={`flex items-center gap-3 p-3 rounded-lg border hover:bg-white/50 cursor-pointer transition-colors has-checked:bg-blue-50 has-checked:border-blue-400 ${showValidation && !formData.terminalChoice ? 'border-red-300 bg-red-50/50' : 'border-slate-300'}`}>
                  <input type="radio" name="terminalChoice" value="Buy outright for £99" checked={formData.terminalChoice === "Buy outright for £99"} onChange={handleChange} className="w-5 h-5 text-blue-600" />
                  <span className="text-slate-700">Buy outright for £99</span>
                </label>
                <label className={`flex items-center gap-3 p-3 rounded-lg border hover:bg-white/50 cursor-pointer transition-colors has-checked:bg-blue-50 has-checked:border-blue-400 ${showValidation && !formData.terminalChoice ? 'border-red-300 bg-red-50/50' : 'border-slate-300'}`}>
                  <input type="radio" name="terminalChoice" value="Rent for £20 per month (12 month contract)" checked={formData.terminalChoice === "Rent for £20 per month (12 month contract)"} onChange={handleChange} className="w-5 h-5 text-blue-600" />
                  <span className="text-slate-700">Rent for £20 per month (12 month contract)</span>
                </label>
              </div>
            </div>
            
            {/* Turnover Band / Rate - Filtered by ?option=X if present */}
            <div className="pt-2">
              <label className="block text-sm font-medium text-slate-600 mb-3">
                {visibleBands.length === 1 ? 'Your qualified rate:' : 'Confirm your expected monthly card takings and rate. *'}
              </label>
              <div className="space-y-3">
                {visibleBands.map((band) => (
                  <label key={band.id} className={`flex items-start gap-3 p-3 rounded-lg border hover:bg-white/50 cursor-pointer transition-colors has-checked:bg-blue-50 has-checked:border-blue-400 ${showValidation && !formData.turnoverBand ? 'border-red-300 bg-red-50/50' : 'border-slate-300'}`}>
                    <input 
                      type="radio" 
                      name="turnoverBand" 
                      value={band.value}
                      checked={formData.turnoverBand === band.value}
                      onChange={handleChange}
                      className="w-5 h-5 text-blue-600 mt-0.5"
                    />
                    <div className="text-sm text-slate-700">
                      <span className="block">{band.value}</span>
                      {band.note && <span className="text-slate-500 text-xs">{band.note}</span>}
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="text-xs text-slate-500 space-y-1 pt-2">
              <p>*£0.025 authorisation fee applies</p>
              <p>*Reduced rates for customers processing over £15,000 per month need to provide an existing card machine statement showing takings level to qualify</p>
            </div>

            {error && <div className="bg-red-100 text-red-700 p-3 rounded-lg text-sm">{error}</div>}

            <div className="flex justify-between pt-4">
              <button onClick={prevStep} className="px-8 py-3 bg-[#6384FF] text-white rounded-full font-medium hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/30" disabled={isSubmitting}>Back</button>
              <button onClick={handleSubmit} disabled={isSubmitting} className="px-8 py-3 bg-[#6384FF] text-white rounded-full font-medium hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/30 disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2">
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Export wrapped in Suspense for useSearchParams
export default function OrderPage() {
  return (
    <main className="min-h-screen bg-white font-sans pb-20">
      <Navbar />
      <Suspense fallback={<div className="p-10 text-center">Loading form...</div>}>
        <OrderForm />
      </Suspense>
    </main>
  )
}