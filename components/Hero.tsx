import React from 'react'
import UploadDropzone from './UploadDropzone';
import { createWorker } from 'tesseract.js'

const CheckCircleFilled = ({className, ...props}: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    {...props}
  >
    <circle cx="12" cy="12" r="10" className="fill-blue-600" />
    <path
      d="M8 12L11 15L16 9"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const Hero = () => {
  const brandBlue = '#5170ff'
  const CALENDLY_URL = process.env.NEXT_PUBLIC_CALENDLY_URL || 'https://calendly.com/les-cardmachinequote/30min'

  const [data, setData] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(false)
  const [statusText, setStatusText] = React.useState('')
  const [email, setEmail] = React.useState('')
  const [name, setName] = React.useState('')
  const [sending, setSending] = React.useState(false)
  const [sentOk, setSentOk] = React.useState<null | boolean>(null)
  const [error, setError] = React.useState<string>('')
  const [currentFile, setCurrentFile] = React.useState<File | null>(null)

  const isManualReview = data?.manualRequired === true

  async function performClientSideOCR(file: File): Promise<string> {
    setStatusText("Initializing OCR engine...")
    const worker = await createWorker("eng")
    setStatusText("Scanning image text...")
    const ret = await worker.recognize(file)
    const text = ret.data.text
    await worker.terminate()
    return text
  }

  async function handleFile(f: File) {
    setLoading(true)
    setSentOk(null)
    setError('')
    setData(null)
    setCurrentFile(f)
    setStatusText('Analyzing...')

    try {
      const form = new FormData()
      form.append('file', f)
      form.append('terminalOption', 'none')
      form.append('terminalsCount', '1')

      if (f.type.startsWith("image/")) {
        console.log("Image detected. Running Client-Side OCR...")
        const extractedText = await performClientSideOCR(f)
        if (extractedText.length < 20) throw new Error("OCR failed: Image text not readable")
        form.append('extractedText', extractedText)
        setStatusText("Analyzing data...")
      } else {
        setStatusText("Uploading PDF...")
      }

      const res = await fetch('/api/analyse', { method: 'POST', body: form })
      const json = await res.json()
      
      if (!res.ok) {
        throw new Error(json.error || json.message || 'Failed to analyse file.')
      }
      setData(json.result) 

    } catch (e:any) {
      console.error(e)
      setError(e?.message || 'Unexpected error during analysis.')
      setData(null)
    } finally {
      setLoading(false)
      setStatusText('')
    }
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

  async function sendManualReview() {
    if (!email || !currentFile) return
    setSending(true)
    setError('')
    setSentOk(null)

    try {
      const form = new FormData()
      form.append('file', currentFile)
      form.append('email', email)
      form.append('businessName', name)

      const res = await fetch('/api/manual-review', { 
        method: 'POST', 
        body: form 
      })
      
      if (!res.ok) throw new Error("Failed to submit review")
      
      setSentOk(true)
    } catch (e) {
      console.error(e)
      setError("Could not send request. Please try again.")
      setSentOk(false)
    } finally {
      setSending(false)
    }
  }

  function closeModal() {
    setData(null)
    setSentOk(null)
    setEmail('')
    setName('')
  }

  return (
    <section className="relative w-full pb-12 sm:pb-16 lg:pb-20 pt-4 sm:pt-6 lg:pt-8 px-4 sm:px-6 lg:px-8 overflow-visible">
      {/* --- BACKGROUND LAYERS --- */}
      <div className="absolute inset-0 overflow-hidden z-0 pointer-events-none">
        {/* Gradient Background */}
        <div className="absolute w-full h-[800px] sm:h-[1200px] lg:h-[1656px] left-0 top-[200px] sm:top-[300px] lg:top-[400px] bg-linear-to-r from-[#1100FF] to-[#55BEFF] opacity-20 sm:opacity-25 lg:opacity-[0.33] blur-[60px] sm:blur-[80px] lg:blur-[100px]" />

        {/* 3D Grid - Hidden on mobile, visible on tablet+ */}
        <div
          className="hidden sm:block absolute left-0 right-0 top-[150px] sm:top-[200px] lg:top-[250px] bottom-0 w-full"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(255, 255, 255, 0.2) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(255, 255, 255, 0.2) 1px, transparent 1px)
            `,
            backgroundSize: "18px 18px",
            transform: "perspective(500px) rotateX(60deg) scale(2)",
            transformOrigin: "top center",
            opacity: 1,
            maskImage: "linear-gradient(to bottom, transparent 0%, black 20%, black 80%, transparent 100%)",
            WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 20%, black 80%, transparent 100%)",
          }}
        />    
      </div>

      <div className="max-w-6xl mx-auto flex flex-col items-center relative z-10">
        {/* Headline */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tighter text-slate-900 text-center leading-[1.15] sm:leading-[1.1] mb-4 sm:mb-5 lg:mb-6 max-w-4xl px-4">
          Upload your Merchant{" "}
          <br className="hidden sm:block" />
          Statement. <span className="text-[#5F85FF]">See your Savings</span>
          <br className="hidden sm:block" />
          {" "}in 30 Seconds.
        </h1>

        {/* Subheadline */}
        <p className="text-slate-600 text-center max-w-2xl mb-6 sm:mb-8 lg:mb-10 text-sm sm:text-base lg:text-lg leading-relaxed px-4">
          Our <span className="text-blue-600 font-semibold">AI technology</span>{" "}
          analyses your fees line-by-line, looks up the best{" "}
          <br className="hidden md:block" />
          deal available and shows a clear cost saving comparison for you to switch!
        </p>

        {/* Trust Pills */}
        <div className="flex flex-col items-start lg:items-center gap-2 sm:gap-4 mb-10 sm:mb-12 lg:mb-14 max-w-7xl mx-auto px-4">
          {/* First row - 3 pills on mobile stack, horizontal on tablet+ */}
          <div className="w-full flex flex-col lg:flex-row justify-start lg:justify-center items-start lg:items-center gap-3 sm:gap-4">
            <div className="flex items-center bg-transparent text-xs sm:text-sm lg:text-base text-slate-900">
              <CheckCircleFilled className="w-4 h-4 sm:w-5 sm:h-5 mr-2 shrink-0" />
              <span>
                Let <span className="font-semibold text-blue-600">AI technology</span>{" "}
                find the right deal for your business
              </span>
            </div>
                
            <div className="flex items-center bg-transparent text-xs sm:text-sm lg:text-base text-slate-900">
              <CheckCircleFilled className="w-4 h-4 sm:w-5 sm:h-5 mr-2 shrink-0" />
              <span>Avoid the untrustworthy salespeople</span>
            </div>
                
            <div className="flex items-center bg-transparent text-xs sm:text-sm lg:text-base text-slate-900">
              <CheckCircleFilled className="w-4 h-4 sm:w-5 sm:h-5 mr-2 shrink-0" />
              <span>
                Rates from <span className="font-semibold text-blue-600">0.25%</span> matched to your business
              </span>
            </div>
          </div>
                
          {/* Second row - 2 pills centered */}
          <div className="w-full flex flex-col lg:flex-row justify-start lg:justify-center items-start lg:items-center gap-3 sm:gap-4">
            <div className="flex items-center bg-transparent text-xs sm:text-sm lg:text-base text-slate-900">
              <CheckCircleFilled className="w-4 h-4 sm:w-5 sm:h-5 mr-2 shrink-0" />
              <span>Clear monthly and yearly cost saving displayed in 30 seconds</span>
            </div>
                
            <div className="flex items-center bg-transparent text-xs sm:text-sm lg:text-base text-slate-900">
              <CheckCircleFilled className="w-4 h-4 sm:w-5 sm:h-5 mr-2 shrink-0" />
              <span>All hidden fees identified and removed</span>
            </div>
          </div>
        </div>

        <div id='upload' className="w-full flex justify-center">
          <div className='w-full sm:w-[90vw] md:w-[70vw] lg:w-[50vw] xl:w-[35vw] 
            h-auto bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl 
            p-4 sm:p-6 md:p-8 
            text-center transition-all duration-300 
            shadow-[0_10px_30px_-5px_rgba(0,0,0,0.1)] sm:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)]'
          >
            <UploadDropzone onFile={handleFile} />         
            {loading && <div className="mt-3 text-xs sm:text-sm font-medium text-blue-600">{statusText || 'Processing...'}</div>}
            {error && !loading && <div className="mt-3 text-xs sm:text-sm text-red-600 px-4 text-center">{error}</div>}
          </div>
        </div>

        <div className="mt-6 w-full flex justify-center">
          <a
            href="/statements-download"
            className="inline-flex items-center justify-center rounded-full px-6 py-2 text-sm sm:text-base text-blue-600 font-medium border-2 border-blue-100 bg-white hover:bg-blue-50 transition-colors shadow-sm"
          >
            Download Your Merchant Service Statement
          </a>
        </div>

        {/* --- FLOATING SAVINGS CARDS --- */}
        {/* Left Card - Hidden on mobile/tablet, visible on large desktop */}
        <div className="hidden xl:block absolute -left-12 2xl:-left-16 top-[75%] -translate-y-1/2 -rotate-12 hover:rotate-0 transition-transform duration-500 z-20">
          <div className="bg-white p-3 rounded-xl shadow-[0_20px_40px_-12px_rgba(0,0,0,0.25)] w-56 2xl:w-60 border border-slate-100">
            <div className="mb-2">
              <p className="text-sm text-slate-900 font-bold mb-0.5">Estimated savings</p>
              <p className="text-[9px] text-slate-500 leading-tight">Based on the statement you uploaded</p>
            </div>
            <div className="space-y-1 mb-2">
              <div className="flex justify-between text-[10px] text-slate-500 items-center">
                <span>Current monthly</span>
                <span className="font-medium text-slate-900">£264.84</span>
              </div>
              <div className="flex justify-between text-[10px] text-slate-500 items-center">
                <span>New monthly</span>
                <span className="font-medium text-slate-900">£128.89</span>
              </div>
              <div className="flex justify-between text-[10px] text-slate-500 items-center">
                <span>Monthly saving</span>
                <span className="font-medium text-slate-900">£135.95</span>
              </div>
            </div>
            <div className="bg-green-50 rounded-lg p-2 flex justify-between items-center">
              <span className="text-[10px] text-green-700 font-medium">Annual saving</span>
              <span className="text-base font-bold text-green-600">£1,643.40</span>
            </div>
          </div>
        </div>

        {/* Right Card - Hidden on mobile/tablet, visible on large desktop */}
        <div className="hidden xl:block absolute -right-12 2xl:-right-16 top-[75%] -translate-y-1/2 rotate-12 hover:rotate-0 transition-transform duration-500 z-20">
          <div className="bg-white p-3 rounded-xl shadow-[0_20px_40px_-12px_rgba(0,0,0,0.25)] w-56 2xl:w-60 border border-slate-100">
            <div className="mb-2">
              <p className="text-sm text-slate-900 font-bold mb-0.5">Estimated savings</p>
              <p className="text-[9px] text-slate-500 leading-tight">Based on the statement you uploaded</p>
            </div>
            <div className="space-y-1 mb-2">
              <div className="flex justify-between text-[10px] text-slate-500 items-center">
                <span>Current monthly</span>
                <span className="font-medium text-slate-900">£264.84</span>
              </div>
              <div className="flex justify-between text-[10px] text-slate-500 items-center">
                <span>New monthly</span>
                <span className="font-medium text-slate-900">£128.89</span>
              </div>
              <div className="flex justify-between text-[10px] text-slate-500 items-center">
                <span>Monthly saving</span>
                <span className="font-medium text-slate-900">£135.95</span>
              </div>
            </div>
            <div className="bg-green-50 rounded-lg p-2 flex justify-between items-center">
              <span className="text-[10px] text-green-700 font-medium">Annual saving</span>
              <span className="text-base font-bold text-green-600">£1,643.40</span>
            </div>
          </div>
        </div>
      </div>

      {/* --------------------------------------------- */}
      {/* RESULTS POPUP MODAL - RESPONSIVE             */}
      {/* --------------------------------------------- */}
      {data && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div 
            className="bg-white w-full max-w-xs sm:max-w-lg md:max-w-2xl lg:max-w-3xl max-h-[90vh] overflow-y-auto rounded-xl sm:rounded-2xl shadow-2xl relative flex flex-col animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={closeModal}
              className="absolute top-3 right-3 sm:top-4 sm:right-4 p-1.5 sm:p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors text-gray-600 z-10"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>

            <div className="p-4 sm:p-6 md:p-8 lg:p-10">
              
              {isManualReview ? (
                <div className="flex flex-col items-center text-center py-4 sm:py-6">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-yellow-50 rounded-full flex items-center justify-center mb-3 sm:mb-4">
                    <svg className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Unable to read statement</h2>
                  <p className="text-sm sm:text-base text-gray-600 max-w-md mx-auto mb-4 sm:mb-6 px-2">
                    We couldn't automatically analyse this file. Please enter your email below and our team will manually review it for you.
                  </p>

                  {sentOk === true ? (
                    <div className="bg-green-50 text-green-800 px-4 sm:px-6 py-3 sm:py-4 rounded-xl border border-green-100">
                      <p className="font-semibold text-base sm:text-lg">Request Sent! ✓</p>
                      <p className="text-xs sm:text-sm mt-1">We will be in touch shortly.</p>
                      <button onClick={closeModal} className="mt-3 sm:mt-4 text-xs sm:text-sm underline text-green-700 hover:text-green-900">Close</button>
                    </div>
                  ) : (
                    <div className="w-full max-w-sm text-left">
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Your Email Address</label>
                      <input 
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="name@company.com"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm sm:text-base focus:ring-2 focus:ring-blue-500 outline-none mb-3"
                      />
                      <button 
                        onClick={sendManualReview}
                        disabled={!email || sending}
                        className="w-full rounded-lg px-4 py-2.5 sm:py-3 text-sm sm:text-base text-white font-medium transition-opacity hover:opacity-90 disabled:opacity-50"
                        style={{ backgroundColor: brandBlue }}
                      >
                        {sending ? 'Sending Request...' : 'Request Manual Quote'}
                      </button>
                      {error && <p className="text-red-600 text-xs sm:text-sm mt-2 text-center">{error}</p>}
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <div className="text-center mb-6 sm:mb-8">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Analysis Complete</h2>
                    <p className="text-sm sm:text-base text-gray-600 mt-1">Here is what we found from your statement.</p>
                  </div>

                  <div className="bg-[#5170ff10] border border-blue-100 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm mb-6 sm:mb-8">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-1">Estimated savings</h3>
                    <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">Based on the statement you uploaded and standard rates.</p>
                    <dl className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-gray-800">
                      <div className="flex justify-between py-2 border-b border-blue-200/50">
                        <dt className="font-medium">Current monthly cost</dt>
                        <dd>£{data.currentMonthlyCost.toFixed(2)}</dd>
                      </div>
                      <div className="flex justify-between py-2 border-b border-blue-200/50">
                        <dt className="font-medium">New monthly cost</dt>
                        <dd>£{data.newMonthlyCost.toFixed(2)}</dd>
                      </div>
                      <div className="flex justify-between py-2 text-green-700 font-semibold text-sm sm:text-base">
                        <dt>Monthly saving</dt>
                        <dd>£{data.monthlySaving.toFixed(2)}</dd>
                      </div>
                      <div className="flex justify-between py-2 text-green-700 font-bold text-base sm:text-lg bg-green-50 rounded px-3 -mx-3">
                        <dt>Annual saving</dt>
                        <dd>£{data.annualSaving.toFixed(2)}</dd>
                      </div>
                    </dl>
                  </div>

                  <div className="bg-gray-50 border rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-4 sm:mb-6">
                    <h4 className="text-base sm:text-lg font-semibold mb-1">Email me my quote</h4>
                    <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">We'll send a one‑page PDF of your savings. No spam.</p>
                    
                    <div className="flex flex-col sm:grid sm:grid-cols-2 gap-3">
                      <input 
                        value={name} 
                        onChange={e=>setName(e.target.value)} 
                        placeholder="Business name (optional)" 
                        className="border rounded-lg px-3 py-2 text-sm sm:text-base w-full focus:ring-2 focus:ring-blue-500 outline-none" 
                      />
                      <input 
                        value={email} 
                        onChange={e=>setEmail(e.target.value)} 
                        placeholder="Email address" 
                        className="border rounded-lg px-3 py-2 text-sm sm:text-base w-full focus:ring-2 focus:ring-blue-500 outline-none" 
                      />
                    </div>
                    
                    <button 
                      onClick={emailQuote} 
                      disabled={!email || sending} 
                      className="w-full mt-3 sm:mt-4 rounded-lg px-4 py-2.5 sm:py-3 text-sm sm:text-base text-white font-medium transition-opacity hover:opacity-90 disabled:opacity-50" 
                      style={{ backgroundColor: brandBlue }}
                    >
                      {sending ? 'Sending PDF…' : 'Send Quote PDF'}
                    </button>

                    {sentOk === true && (
                      <div className="bg-green-50 text-green-700 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg mt-3 sm:mt-4 text-xs sm:text-sm border border-green-100 flex items-center gap-2">
                        <span>✓</span> Sent! Check your inbox for "Your savings quote".
                      </div>
                    )}
                    {sentOk === false && (
                      <div className="bg-red-50 text-red-700 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg mt-3 sm:mt-4 text-xs sm:text-sm border border-red-100">
                        {error || 'Could not send email. Please try again.'}
                      </div>
                    )}
                  </div>

                  <div className="text-center">
                    <p className="text-gray-600 text-xs sm:text-sm mb-2 sm:mb-3">Prefer to discuss these savings with a human?</p>
                    <a 
                      href={CALENDLY_URL} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="block w-full text-center rounded-lg px-4 py-2.5 sm:py-3 border-2 border-gray-200 text-sm sm:text-base text-gray-700 font-semibold hover:border-blue-500 hover:text-blue-600 transition-all"
                    >
                      Book a Call Now
                    </a>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Hero
