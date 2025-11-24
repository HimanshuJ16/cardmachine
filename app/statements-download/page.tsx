import Navbar from '@/components/Navbar'
import React from 'react'

const ProviderSection = ({ title, children }: { title: string, children: React.ReactNode }) => (
  <section className="mt-4">
    <h2 className="text-xl font-semibold mb-2 text-gray-900">{title}</h2>
    <ul className="list-disc list-inside space-y-1 ml-4 text-gray-700">
      {children}
    </ul>
  </section>
);

export default function StatementDownloadPage() {
  return (
    <main className="max-w-4xl mx-auto px-6 pb-12 bg-white text-black min-h-screen">
      <Navbar />
      <h1 className="text-3xl font-bold mb-6 pt-10 text-gray-900">How to Download Your Merchant Service Statement</h1>
      <div className="space-y-6 prose max-w-none">
        <p className="text-lg font-medium text-gray-700">Every provider stores statements in a different place. Find your card machine provider below and follow the quick steps to download your statement or transaction report.</p>

        <ProviderSection title="Worldpay">
          <li>Log in to your Worldpay Dashboard.</li>
          <li>Go to Transactions.</li>
          <li>Select your date range.</li>
          <li>Click Download transactions (CSV) or go to Invoices/Billing for PDF statements.</li>
        </ProviderSection>

        <ProviderSection title="Barclaycard Merchant Services">
          <li>Log in to your Barclaycard Business Online Servicing account.</li>
          <li>Click Statements & Documents.</li>
          <li>Choose your statement month.</li>
          <li>Download the statement as a PDF.</li>
        </ProviderSection>

        <ProviderSection title="Lloyds Cardnet">
          <li>Log in to your Cardnet Merchant Portal (use the link provided in your welcome email).</li>
          <li>Go to Reports or Statements.</li>
          <li>Select the date range.</li>
          <li>Download your statement as a PDF or CSV.</li>
        </ProviderSection>

        <ProviderSection title="Global Payments">
          <li>Log in to the Global Payments Merchant Portal.</li>
          <li>Go to Account Management → Statements.</li>
          <li>Choose the month you need.</li>
          <li>Download your statement or export multiple at once.</li>
        </ProviderSection>

        <ProviderSection title="Elavon / RMS">
          <li>Log in to Elavon Connect.</li>
          <li>Click Your Statements.</li>
          <li>Select the month.</li>
          <li>Download the PDF statement.</li>
          <li className="list-none italic mt-2 text-sm text-gray-500">(If your provider is Retail Merchant Services, you normally still use Elavon Connect.)</li>
        </ProviderSection>

        <ProviderSection title="takepayments / takepaymentsplus">
          <li>Depending on your setup you may use:</li>
          <ul className="list-disc list-inside ml-6 my-1">
            <li>takepaymentsplus Web Portal, or</li>
            <li>MMS (Merchant Management System), or</li>
            <li>Elavon Connect (for billing and statements)</li>
          </ul>
          <p className="font-medium mt-3 mb-1 text-gray-800">Steps:</p>
          <li>Log in to your portal.</li>
          <li>Go to Reports, Statements, or Transaction History.</li>
          <li>Select your dates.</li>
          <li>Download as CSV or PDF.</li>
        </ProviderSection>

        <ProviderSection title="Dojo (formerly Paymentsense)">
          <li>Log in to the Dojo app or web dashboard.</li>
          <li>Go to Account → Billing.</li>
          <li>Open your invoices.</li>
          <li>Download each invoice as a PDF.</li>
        </ProviderSection>

        <ProviderSection title="Teya (formerly SaltPay / StorePay)">
          <li>Log in to the Teya Business Portal or open the Teya app.</li>
          <li>Go to Statements and Billing.</li>
          <li>Select the statement you need.</li>
          <li>Download the PDF.</li>
          <li className="list-none mt-2 text-gray-800">For transaction reports:</li>
          <ul className="list-disc list-inside ml-6 my-1">
            <li>Go to Transactions.</li>
            <li>Filter the date range.</li>
            <li>Download/export the report.</li>
          </ul>
        </ProviderSection>

        <ProviderSection title="Square">
          <li>Log in to your Square Dashboard.</li>
          <li>Go to Reports → Transactions.</li>
          <li>Choose the date range.</li>
          <li>Click Export to download a CSV.</li>
          <li className="list-none mt-2 text-gray-800">For payouts:</li>
          <ul className="list-disc list-inside ml-6 my-1">
            <li>Go to Balance → Transfers.</li>
            <li>Export transfer history.</li>
          </ul>
        </ProviderSection>

        <ProviderSection title="Zettle by PayPal">
          <li>Log in at my.zettle.com.</li>
          <li>Go to Reports or Account Statement.</li>
          <li>Pick your date range.</li>
          <li>Download the statement (PDF/CSV).</li>
        </ProviderSection>

        <ProviderSection title="SumUp">
          <li>Log in to your SumUp Dashboard or open the app.</li>
          <li>Go to Download Centre or Reports.</li>
          <li>Select Payout Reports or Payment Reports.</li>
          <li>Download the file as PDF or CSV.</li>
        </ProviderSection>

        <ProviderSection title="Stripe (for card terminals and online payments)">
          <li>Log in to the Stripe Dashboard.</li>
          <li>Go to Payments or Payouts.</li>
          <li>Choose your date range.</li>
          <li>Click Export to download a CSV report.</li>
        </ProviderSection>

        <section className="mt-8 pt-4 border-t border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">If Your Provider Isn’t Listed</h2>
          <ul className="list-disc list-inside space-y-1 ml-4 text-gray-700">
            <li>No problem — just follow these simple steps:</li>
            <li>Log in to your provider’s merchant portal (the link is usually in your welcome email).</li>
            <li>Look for menu options like:</li>
            <ul className="list-disc list-inside ml-6 my-1">
              <li>Statements</li>
              <li>Invoices</li>
              <li>Billing</li>
              <li>Reports</li>
              <li>Transactions</li>
            </ul>
            <li>Choose the month or date range.</li>
            <li>Download the PDF statement or CSV report.</li>
          </ul>
        </section>
      </div>
    </main>
  )
}

// import Navbar from '@/components/Navbar'
// import Footer from '@/components/Footer'
// import React from 'react'

// interface ProviderData {
//   title: string;
//   logoPath: string;
//   loginUrl: string;
//   steps: React.ReactNode;
// }

// const providersData: ProviderData[] = [
//   {
//     title: "Worldpay",
//     logoPath: "/logos/worldpay.svg",
//     loginUrl: "https://merchantportal.worldpay.com/",
//     steps: (
//       <ul className="list-disc list-inside space-y-1.5 ml-1">
//         <li>Log in to your <strong>Worldpay Dashboard</strong>.</li>
//         <li>Go to <strong>Transactions</strong>.</li>
//         <li>Select your date range.</li>
//         <li>Click <strong>Download transactions</strong> (CSV) or go to <strong>Invoices/Billing</strong> for PDF statements.</li>
//       </ul>
//     ),
//   },
//   {
//     title: "Barclaycard",
//     logoPath: "/logos/barclaycard.svg",
//     loginUrl: "https://www.barclaycard.co.uk/business/login-interstitial",
//     steps: (
//       <ul className="list-disc list-inside space-y-1.5 ml-1">
//         <li>Log in to your <strong>Barclaycard Business</strong> account.</li>
//         <li>Click <strong>Statements & Documents</strong>.</li>
//         <li>Choose your <strong>statement month</strong>.</li>
//         <li>Download the statement as a <strong>PDF</strong>.</li>
//       </ul>
//     ),
//   },
//   {
//     title: "Lloyds Cardnet",
//     logoPath: "/logos/lloydscardnet.svg",
//     loginUrl: "https://www.lloydsbank.com/business/take-payments-with-cardnet/additional-services/reporting.html",
//     steps: (
//       <ul className="list-disc list-inside space-y-1.5 ml-1">
//         <li>Log in to your <strong>Cardnet Merchant Portal</strong>.</li>
//         <li>Go to <strong>Reports</strong> or <strong>Statements</strong>.</li>
//         <li>Select the <strong>date range</strong>.</li>
//         <li>Download your statement as a <strong>PDF</strong> or <strong>CSV</strong>.</li>
//       </ul>
//     ),
//   },
//   {
//     title: "Global Payments",
//     logoPath: "/logos/globalpayments.svg",
//     loginUrl: "https://www.globalpayments.com/en-gb/business-tools/merchant-portal",
//     steps: (
//       <ul className="list-disc list-inside space-y-1.5 ml-1">
//         <li>Log in to the <strong>Merchant Portal</strong>.</li>
//         <li>Go to <strong>Account Management</strong> → <strong>Statements</strong>.</li>
//         <li>Choose the month you need.</li>
//         <li>Download your statement or export multiple at once.</li>
//       </ul>
//     ),
//   },
//   {
//     title: "Elavon / RMS",
//     logoPath: "/logos/elavon.svg",
//     loginUrl: "https://www.elavonconnect.com/mfe/",
//     steps: (
//       <ul className="list-disc list-inside space-y-1.5 ml-1">
//         <li>Log in to <strong>Elavon Connect</strong>.</li>
//         <li>Click <strong>Your Statements</strong>.</li>
//         <li>Select the month.</li>
//         <li>Download the <strong>PDF</strong> statement.</li>
//         <li className='list-none italic text-xs text-slate-400 mt-2'>*RMS customers normally use Elavon Connect.</li>
//       </ul>
//     ),
//   },
//   {
//     title: "takepayments",
//     logoPath: "/logos/takepayments.svg",
//     loginUrl: "https://mms.tponlinepayments2.com/",
//     steps: (
//       <div className="space-y-2">
//         <p className="text-sm text-slate-600">Depending on your setup:</p>
//         <ul className="list-disc list-inside space-y-1 ml-1 text-slate-500 text-xs">
//           <li>takepaymentsplus Web Portal</li>
//           <li>MMS (Merchant Management System)</li>
//           <li>Elavon Connect</li>
//         </ul>
//         <p className="font-semibold text-sm text-slate-800 mt-2">Steps:</p>
//         <ul className="list-disc list-inside space-y-1 ml-1">
//             <li>Log in to your portal.</li>
//             <li>Go to <strong>Reports</strong> or <strong>Statements</strong>.</li>
//             <li>Download as <strong>CSV</strong> or <strong>PDF</strong>.</li>
//         </ul>
//       </div>
//     ),
//   },
//   {
//     title: "Dojo",
//     logoPath: "/logos/dojo.svg",
//     loginUrl: "https://account.dojo.tech/",
//     steps: (
//       <ul className="list-disc list-inside space-y-1.5 ml-1">
//         <li>Log in to the <strong>Dojo app</strong> or dashboard.</li>
//         <li>Go to <strong>Account</strong> → <strong>Billing</strong>.</li>
//         <li>Open your invoices.</li>
//         <li>Download each invoice as a <strong>PDF</strong>.</li>
//       </ul>
//     ),
//   },
//   {
//     title: "Teya",
//     logoPath: "/logos/teya.svg",
//     loginUrl: "https://b-online.teya.com/",
//     steps: (
//       <div className="space-y-2">
//         <ul className="list-disc list-inside space-y-1 ml-1">
//           <li>Log in to <strong>Teya Business Portal</strong>.</li>
//           <li>Go to <strong>Statements and Billing</strong>.</li>
//           <li>Download the <strong>PDF</strong>.</li>
//         </ul>
//         <p className="text-xs font-semibold text-slate-700 mt-2">For Transaction Reports:</p>
//         <ul className="list-disc list-inside space-y-1 ml-1 text-xs">
//           <li>Go to <strong>Transactions</strong>.</li>
//           <li>Filter date range & Export.</li>
//         </ul>
//       </div>
//     ),
//   },
//   {
//     title: "Square",
//     logoPath: "/logos/square.svg",
//     loginUrl: "https://app.squareup.com/login",
//     steps: (
//       <div className="space-y-2">
//         <ul className="list-disc list-inside space-y-1 ml-1">
//           <li>Log in to <strong>Square Dashboard</strong>.</li>
//           <li>Go to <strong>Reports</strong> → <strong>Transactions</strong>.</li>
//           <li>Click <strong>Export</strong> (CSV).</li>
//         </ul>
//         <p className="text-xs font-semibold text-slate-700 mt-2">For Payouts:</p>
//         <ul className="list-disc list-inside space-y-1 ml-1 text-xs">
//           <li>Go to <strong>Balance</strong> → <strong>Transfers</strong>.</li>
//           <li>Export transfer history.</li>
//         </ul>
//       </div>
//     ),
//   },
//   {
//     title: "Zettle",
//     logoPath: "/logos/zettle.svg",
//     loginUrl: "https://my.zettle.com/",
//     steps: (
//       <ul className="list-disc list-inside space-y-1.5 ml-1">
//         <li>Log in at <strong>my.zettle.com</strong>.</li>
//         <li>Go to <strong>Reports</strong> or <strong>Account Statement</strong>.</li>
//         <li>Pick your date range.</li>
//         <li>Download the statement (PDF/CSV).</li>
//       </ul>
//     ),
//   },
//   {
//     title: "SumUp",
//     logoPath: "/logos/sumup.svg",
//     loginUrl: "https://sumup.me/",
//     steps: (
//       <ul className="list-disc list-inside space-y-1.5 ml-1">
//         <li>Log in to <strong>SumUp Dashboard</strong>.</li>
//         <li>Go to <strong>Download Centre</strong> or <strong>Reports</strong>.</li>
//         <li>Select <strong>Payout</strong> or <strong>Payment Reports</strong>.</li>
//         <li>Download as <strong>PDF</strong> or <strong>CSV</strong>.</li>
//       </ul>
//     ),
//   },
//   {
//     title: "Stripe",
//     logoPath: "/logos/stripe.svg",
//     loginUrl: "https://dashboard.stripe.com/login",
//     steps: (
//       <ul className="list-disc list-inside space-y-1.5 ml-1">
//         <li>Log in to the <strong>Stripe Dashboard</strong>.</li>
//         <li>Go to <strong>Payments</strong> or <strong>Payouts</strong>.</li>
//         <li>Choose your date range.</li>
//         <li>Click <strong>Export</strong> to download CSV.</li>
//       </ul>
//     ),
//   },
// ];

// const ProviderCard: React.FC<ProviderData> = ({ title, logoPath, loginUrl, steps }) => (
//   <div className="group relative bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col h-full">
//     <div className="p-6 flex-1">
//       {/* Header */}
//       <div className="flex items-center justify-between mb-5 pb-4 border-b border-slate-50">
//         <div className="flex items-center gap-4">
//           <div className="w-12 h-12 flex items-center justify-center bg-slate-50 rounded-xl p-2 border border-slate-100">
//              <img 
//                src={logoPath} 
//                alt={`${title} Logo`} 
//                className="w-full h-full object-contain" 
//              />
//           </div>
//           <h3 className="text-lg font-bold text-slate-900 leading-tight">
//             {title}
//           </h3>
//         </div>
        
//         {/* External Link Icon */}
//         <a 
//           href={loginUrl} 
//           target="_blank" 
//           rel="noopener noreferrer"
//           className="text-slate-400 hover:text-blue-600 transition-colors"
//           title="Go to login"
//         >
//           <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
//           </svg>
//         </a>
//       </div>

//       {/* Steps */}
//       <div className="text-sm text-slate-600 leading-relaxed">
//         {steps}
//       </div>
//     </div>

//     {/* Footer Action */}
//     <div className="p-4 bg-slate-50/50 border-t border-slate-100 rounded-b-2xl">
//        <a
//           href={loginUrl}
//           target="_blank"
//           rel="noopener noreferrer"
//           className="flex items-center justify-center w-full py-2.5 text-sm font-semibold text-blue-600 bg-white border border-blue-100 rounded-lg hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all shadow-sm"
//         >
//           Login to Portal
//         </a>
//     </div>
//   </div>
// );

// export default function StatementDownloadPage() {
//   return (
//     <div className="min-h-screen bg-white font-sans text-slate-900 flex flex-col">
//       <Navbar />
      
//       <main className="flex-grow">
//         {/* Hero Section */}
//         <section className="relative py-16 sm:py-20 lg:py-24 px-4 overflow-hidden">
//            {/* Subtle background gradient to match main Hero */}
//            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-50/50 via-white to-white z-0 pointer-events-none" />
           
//            <div className="relative z-10 max-w-3xl mx-auto text-center">
//              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 mb-6">
//                Download Your <span className="text-[#5170ff]">Statement</span>
//              </h1>
//              <p className="text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
//                Every provider hides their statements in a different place. 
//                Find your card machine provider below and follow the quick steps to download your files.
//              </p>
//            </div>
//         </section>

//         {/* Grid Section */}
//         <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
//             {providersData.map((provider) => (
//               <ProviderCard key={provider.title} {...provider} />
//             ))}
//           </div>
//         </section>

//         {/* Fallback Section */}
//         <section className="bg-[#f6faff] py-16 px-4 border-t border-slate-100">
//           <div className="max-w-3xl mx-auto text-center">
//             <h2 className="text-2xl font-bold text-slate-900 mb-4">Can't find your provider?</h2>
//             <p className="text-slate-600 mb-8">
//               Most merchant portals work the same way. Log in to the portal link found in your welcome email and look for these common keywords:
//             </p>
            
//             <div className="flex flex-wrap justify-center gap-3">
//               {['Statements', 'Invoices', 'Billing', 'Reports', 'Transaction History'].map((tag) => (
//                 <span key={tag} className="px-4 py-2 bg-white text-slate-700 font-medium rounded-full shadow-sm border border-slate-200 text-sm">
//                   {tag}
//                 </span>
//               ))}
//             </div>
//           </div>
//         </section>
//       </main>

//       <Footer />
//     </div>
//   )
// }