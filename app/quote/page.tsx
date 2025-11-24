'use client'

import React, { useState } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { PhoneInput } from 'react-international-phone'
import 'react-international-phone/style.css'

export default function QuotePage() {
  const [submitting, setSubmitting] = useState(false)
  
  // Form State
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    businessName: '',
    email: '',
    phone: '',
    turnover: '',
    transaction: ''
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSelection = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const response = await fetch('/api/quote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong')
      }

      alert("Thank you! One of our team will be in touch shortly.")
      
      // Optional: Reset form
      setFormData({
        firstName: '',
        lastName: '',
        businessName: '',
        email: '',
        phone: '',
        turnover: '',
        transaction: ''
      })

    } catch (error) {
      console.error('Error submitting quote:', error)
      alert("Sorry, we couldn't send your request. Please try again or email us directly.")
    } finally {
      setSubmitting(false)
    }
  }

  // Options for the "Button" style inputs
  const turnoverOptions = [
    "£5,000 - £10,000",
    "£10,000 - £20,000",
    "£20,000 - £30,000",
    "£30,000 - £40,000",
    "£40,000 - £50,000",
    "£50,000+"
  ]

  const transactionOptions = [
    "£1 - £10",
    "£10 - £20",
    "£20 - £30",
    "£30+"
  ]

  return (
    <main className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 py-10 sm:py-16">
        
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 mb-4">
            Get Your <span className="text-blue-600">Free Quote</span>
          </h1>
          <p className="text-lg text-slate-600">
            Tell us a little about your business and we'll find the best rates for you.
          </p>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
          <div className="p-6 sm:p-10">
            <form onSubmit={handleSubmit} className="space-y-8">

              {/* Section 1: Personal Details */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    What is your full name?
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input
                      type="text"
                      name="firstName"
                      required
                      placeholder="First Name"
                      value={formData.firstName}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                    />
                    <input
                      type="text"
                      name="lastName"
                      required
                      placeholder="Last Name"
                      value={formData.lastName}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    What is the name of your business?
                  </label>
                  <input
                    type="text"
                    name="businessName"
                    required
                    placeholder="e.g. Joe's Coffee Shop"
                    value={formData.businessName}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Section 2: Contact Info */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    What is your email address?
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="name@company.com"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    What is your mobile number?
                  </label>
                  <PhoneInput
                    defaultCountry="gb"
                    value={formData.phone}
                    onChange={(value) => setFormData(prev => ({ ...prev, phone: value }))}
                    inputClassName="w-full rounded-lg border-none bg-white px-4 py-3 text-slate-800 placeholder:text-slate-500 outline-none"
                    placeholder="Enter your phone number"
                  />
                </div>
              </div>

              {/* Section 3: Business Details (Buttons) */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">
                    What is your monthly card turnover?
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {turnoverOptions.map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => handleSelection('turnover', option)}
                        className={`px-4 py-3 rounded-lg text-sm font-medium border transition-all duration-200 ${
                          formData.turnover === option
                            ? 'bg-blue-600 border-blue-600 text-white shadow-md transform scale-[1.02]'
                            : 'bg-white border-slate-200 text-slate-600 hover:border-blue-400 hover:text-blue-600'
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">
                    What is your average transaction size?
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {transactionOptions.map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => handleSelection('transaction', option)}
                        className={`px-4 py-3 rounded-lg text-sm font-medium border transition-all duration-200 ${
                          formData.transaction === option
                            ? 'bg-blue-600 border-blue-600 text-white shadow-md transform scale-[1.02]'
                            : 'bg-white border-slate-200 text-slate-600 hover:border-blue-400 hover:text-blue-600'
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg py-4 rounded-xl shadow-lg shadow-blue-600/20 transition-all hover:shadow-blue-600/40 hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Processing...' : 'Get My Quote'}
                </button>
                <p className="text-center text-xs text-slate-400 mt-4">
                  By clicking above, you agree to our Terms & Conditions and Privacy Policy.
                </p>
              </div>

            </form>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}