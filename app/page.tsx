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
    const form = new FormData(); form.append('file', f)
    const res = await fetch('/api/analyse', { method: 'POST', body: form })
    const json = await res.json(); setData(json); setLoading(false)
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
        <div className="max-w-6xl mx-auto flex justify-between items-center px-6 py-4">
          <div className="flex items-center gap-3">
            <img src="/logo-cmq.png" alt="CardMachineQuote.com" className="h-8 w-auto object-contain" />
            <span className="sr-only">CardMachineQuote.com</span>
          </div>
          <a href="#upload" className="text-white rounded-lg px-4 py-2 text-sm font-medium" style={{ backgroundColor: brandBlue }}>Get a Quote</a>
        </div>
      </header>

      <section className="border-b" style={{ backgroundColor: `${brandBlue}10` }}>
        <div className="max-w-6xl mx-auto px-6 py-16 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h1 className="text-4xl font-bold leading-tight mb-4">Upload your merchant statement. <br /><span style={{ color: brandBlue }}>See your savings</span> in 30 seconds.</h1>
            <p className="text-gray-700 mb-6 text-lg">We analyse your fees line-by-line and show a clear comparison against CardMachineQuote.com standard rates. No obligation.</p>
            <ul className="space-y-2 text-gray-700">
              <li>✅ 0.79% all cards ≤ £15k/mo</li>
              <li>✅ From 0.35% debit above £15k</li>
              <li>✅ From 0.25% debit above £30k</li>
              <li>✅ £0 PCI & £0 MMF</li>
              <li>✅ Terminals: £20/mo or £99 buy-out</li>
            </ul>
            <a href="#upload" className="mt-8 inline-flex text-white font-medium px-6 py-3 rounded-xl shadow-sm" style={{ backgroundColor: brandBlue }}>Start Now</a>
          </div>
          <div className="bg-white rounded-2xl shadow p-6 border">
            <div id="upload">
              <h2 className="text-lg font-semibold mb-2">Upload Statement</h2>
              <p className="text-sm text-gray-600 mb-4">PDF, JPG, or PNG. We’ll never share your data. Delete anytime.</p>
              <UploadDropzone onFile={handleFile} />
              {loading && <div className="mt-3 text-sm">Analyzing…</div>}
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
            <details className="mt-4 bg-white rounded-xl p-4 border"><summary className="font-medium cursor-pointer">Can you read any statement?</summary><p className="mt-2 text-sm text-gray-700">Yes. We support common providers automatically and use OCR + smart mapping for everything else. If anything is unclear, you can tweak fields before we finalise your quote.</p></details>
            <details className="mt-3 bg-white rounded-xl p-4 border"><summary className="font-medium cursor-pointer">What happens to my data?</summary><p className="mt-2 text-sm text-gray-700">We process your file solely to generate your estimate. By default we don’t retain files; you can consent to let a specialist review if you’d like.</p></details>
            <details className="mt-3 bg-white rounded-xl p-4 border"><summary className="font-medium cursor-pointer">Do you charge PCI/MMF?</summary><p className="mt-2 text-sm text-gray-700">PCI and MMF are £0 on our standard packages. Terminal is £20/mo (12‑month) or £99 buy‑out.</p></details>
          </div>
          <div>
            <h3 className="text-xl font-semibold">Book a callback</h3>
            <p className="text-sm text-gray-700">Prefer to talk? Choose a slot that suits you.</p>
            <CalendlyEmbed />
          </div>
        </div>
      </section>

      <footer className="border-t">
        <div className="max-w-6xl mx-auto px-6 py-8 text-sm text-gray-600 flex items-center gap-3">
          <img src="/logo-cmq.png" alt="CardMachineQuote.com" className="h-6 w-auto object-contain" />
          <span>© {new Date().getFullYear()} CardMachineQuote.com</span>
        </div>
      </footer>
    </main>
  )
}
