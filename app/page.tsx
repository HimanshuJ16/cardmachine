'use client'
import React from 'react'
import UploadDropzone from '@/components/UploadDropzone'
import ResultsPanel from '@/components/ResultsPanel'
import CalendlyEmbed from '@/components/CalendlyEmbed'

export default function Page() {
  const brandBlue = '#5170ff'
  const [data, setData] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(false)
  const [email, setEmail] = React.useState('')
  const [name, setName] = React.useState('')
  const [sending, setSending] = React.useState(false)
  const [sentOk, setSentOk] = React.useState<null | boolean>(null)
  const [error, setError] = React.useState<string>('')

  async function handleFile(f: File) {
    setLoading(true)
    setSentOk(null)
    setError('')
    setData(null) // Clear previous data
    const form = new FormData(); form.append('file', f)

    // --- START MODIFICATION ---
    try {
      const res = await fetch('/api/analyse', { method: 'POST', body: form })
      const json = await res.json()
      
      if (!res.ok) {
        // If API returned an error (like 400), set the error state
        throw new Error(json.error || 'Failed to analyse file.')
      }
      
      // Only set data if res.ok is true
      setData(json)

    } catch (e:any) {
      // Catch network errors or the error thrown above
      setError(e?.message || 'Unexpected error during analysis.')
      setData(null) // Ensure data is null on error
    } finally {
      setLoading(false)
    }
    // --- END MODIFICATION ---
  }

  async function emailQuote() {
    if (!email || !data) return
    setSending(true); setError(''); setSentOk(null)
    try {
      const res = await fetch('/api/send-quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          customerName: name,
          analysePayload: data,
          terminalOption: 'none'
        })
      })
      const js = await res.json()
      if (!res.ok || js.error) throw new Error(js.error || 'Failed to send')
      setSentOk(true)
    } catch (e:any) {
      setError(e?.message || 'Unexpected error'); setSentOk(false)
    } finally {
      setSending(false)
    }
  }

  return (
    <main className="min-h-screen bg-white text-gray-900 font-sans">
      <header className="border-b bg-white/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex justify-center md:justify-between items-center px-6 py-4">
          <div className="flex items-center gap-3">
            <img src="/logo-cmq2.png" alt="CardMachineQuote.com" className="h-14 w-auto object-contain" />
            <span className="sr-only">CardMachineQuote.com</span>
          </div>
          {/* <a href="#upload" className="text-white rounded-lg px-4 py-2 text-sm font-medium" style={{ backgroundColor: brandBlue }}>Get a Quote</a> */}
        </div>
      </header>

      <section className="border-b" style={{ backgroundColor: `${brandBlue}10` }}>
        <div className="max-w-6xl mx-auto px-6 py-16 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h1 className="text-4xl font-bold leading-tight mb-4">Upload your merchant statement. <br /><span style={{ color: brandBlue }}>See your savings</span> in 30 seconds.</h1>
            <p className="text-gray-700 mb-6 text-lg">Our <span style={{ color: brandBlue }}>AI technology</span> analyses your fees line-by-line, looks up the best deal available and shows a clear cost saving comparison for you to switch!</p>
            <ul className="space-y-2 text-gray-700">
              <li>✅ Let <span style={{ color: brandBlue }}>AI technology</span> find the right deal for your business</li>
              <li>✅ Avoid the untrustworthy salespeople</li>
              <li>✅ Rates from <span style={{ color: brandBlue }}>0.25%</span> matched to your business</li>
              <li>✅ All hidden fees identified and removed</li>
              <li>✅ Clear monthly and yearly cost saving <span style={{ color: brandBlue }}>displayed in 30 seconds</span></li>
            </ul>
            {/* <a href="#upload" className="mt-8 inline-flex text-white font-medium px-6 py-3 rounded-xl shadow-sm" style={{ backgroundColor: brandBlue }}>Start Now</a> */}
          </div>
          <div className="bg-white rounded-2xl shadow p-6 border">
            <div id="upload">
              <h2 className="text-lg font-semibold mb-2">Upload Statement</h2>
              <p className="text-sm text-gray-600 mb-4">PDF, JPG, or PNG. We’ll never share your data. Delete anytime.</p>
              <UploadDropzone onFile={handleFile} />
              {loading && <div className="mt-3 text-sm">Analyzing…</div>}
              {/* --- ADD THIS LINE --- */}
              {error && !loading && <div className="mt-3 text-sm text-red-600">{error}</div>}
              {/* --- END ADDITION --- */}
            </div>
          </div>
        </div>
      </section>

      <section className="border-y">
        <div className="max-w-6xl mx-auto px-6 py-6 grid sm:grid-cols-3 gap-4 text-sm text-gray-700">
          <div><span className="font-semibold text-gray-900">Fast answers</span> — instant estimate on upload</div>
          <div><span className="font-semibold text-gray-900">Transparent pricing</span> — one clear breakdown</div>
          <div><span className="font-semibold text-gray-900">UK support</span> — book a callback in minutes</div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-10">
        {data ? (
          <>
            <ResultsPanel data={data} />
            <div className="mt-6 bg-white border rounded-2xl p-6">
              <h4 className="text-lg font-semibold">Email me my quote</h4>
              <p className="text-sm text-gray-600 mb-4">We’ll send a one‑page PDF of your savings. No spam.</p>
              <div className="grid md:grid-cols-3 gap-3">
                <input value={name} onChange={e=>setName(e.target.value)} placeholder="Business name (optional)" className="border rounded-lg px-3 py-2" />
                <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email address" className="border rounded-lg px-3 py-2 md:col-span-1" />
                <button onClick={emailQuote} disabled={!email || sending} className="rounded-lg px-4 py-2 text-white" style={{ backgroundColor: brandBlue }}>{sending ? 'Sending…' : 'Send PDF'}</button>
              </div>
              {sentOk===true && <div className="text-green-600 text-sm mt-2">Sent! Check your inbox for “Your CardMachineQuote.com savings quote”.</div>}
              {sentOk===false && <div className="text-red-600 text-sm mt-2">{error || 'Could not send email.'}</div>}
            </div>
          </>
        ) : (
          <div className="text-center text-gray-600">Your estimate will appear here after you upload a statement.</div>
        )}
      </section>

      <section className="bg-gray-50">
        <div className="max-w-6xl mx-auto px-6 py-10 grid md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-xl font-semibold">FAQs</h3>
            <details className="mt-4 bg-white rounded-xl p-4 border"><summary className="font-medium cursor-pointer">Can you read any statement?</summary><p className="mt-2 text-sm text-gray-700">Yes. We support all major merchant services providers automatically, and our system can read most PDF or image-based statements using AI.</p></details>
            <details className="mt-3 bg-white rounded-xl p-4 border"><summary className="font-medium cursor-pointer">What happens to my data?</summary><p className="mt-2 text-sm text-gray-700">We process your file solely to generate your estimate and produce your personalised quote.</p></details>
            <details className="mt-3 bg-white rounded-xl p-4 border"><summary className="font-medium cursor-pointer">How do I switch to the better deal?</summary><p className="mt-2 text-sm text-gray-700">Use the calendar at the bottom of our homepage — or the link included in your quote email — to book a call. One of our team members will walk you through the switch.</p></details>
            <details className="mt-3 bg-white rounded-xl p-4 border"><summary className="font-medium cursor-pointer">Are there any hidden fees?</summary><p className="mt-2 text-sm text-gray-700">No. There are no hidden fees. Everything you pay will be clearly displayed on your quote email.</p></details>
          </div>
          <div>
            <h3 className="text-xl font-semibold">Book a callback</h3>
            <p className="text-sm text-gray-700">Prefer to talk? Choose a slot that suits you.</p>
            <CalendlyEmbed />
          </div>
        </div>
      </section>

      {/* --- START MODIFICATION --- */}
      <footer className="border-t">
        {/* Main flex container: stacks on mobile, row on desktop */}
        <div className="max-w-6xl mx-auto px-6 py-8 text-sm text-gray-600 flex flex-col items-center gap-4 md:flex-row">
          
          {/* Group 1: Logo + Copyright */}
          {/* Stacks on mobile, row on desktop */}
          <div className="flex flex-col items-center gap-2 md:flex-row md:gap-3">
            <img src="/logo-cmq2.png" alt="CardMachineQuote.com" className="h-6 w-auto object-contain" />
            <span>© {new Date().getFullYear()} CardMachineQuote.com</span>
          </div>
          
          {/* Group 2: Links */}
          {/* Stacks on mobile, row on desktop. Pushes to the right ONLY on desktop */}
          <div className="flex flex-col items-center gap-2 md:flex-row md:ml-auto md:gap-4">
            <a href="/privacy" className="hover:underline">Privacy Policy</a>
            <a href="/terms" className="hover:underline">Terms & Conditions</a>
          </div>

        </div>
      </footer>
      {/* --- END MODIFICATION --- */}
    </main>
  )
}
