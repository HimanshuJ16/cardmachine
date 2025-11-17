import Navbar from '@/components/Navbar'
import React from 'react'

export default function PrivacyPage() {
  return (
    <main className="max-w-4xl mx-auto px-6 pb-12">
      <Navbar />
      <h1 className="text-3xl font-bold mb-6">Privacy Policy - CardMachineQuote.com</h1>
      <div className="space-y-6 prose">
        <p>EFG Group Ltd t/a CardMachine Quote.com ("we", "us", "our") is committed to protecting your privacy and ensuring that your personal data is handled safely, securely, and transparently.</p>

        <section>
          <h2 className="text-xl font-semibold">1. Who We Are</h2>
          <p>EFG Group Ltd t/a CardMachineQuote.com Registered in England & Wales: Company Number 16558737. Registered Office: Ground Floor, 5 North Court, Armstrong Road, Maidstone, England, ME15 6JZ. We act as the data controller for the personal data you provide to us.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">2. Information We Collect</h2>
          <p>We may collect and process the following information:</p>
          <ul>
            <li><strong>Information you provide directly:</strong> such as your name, email address, phone number, business name and industry, uploaded merchant service statements (PDF or image files), and any messages or communications sent via our forms.</li>
            <li><strong>Automatically collected data:</strong> such as IP address, device information, browser type, and website usage data (including analytics and page activity).</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold">3. How We Use Your Information</h2>
          <p>We process your information in order to:</p>
          <ul>
            <li>Provide you with an estimated quote and savings report</li>
            <li>Analyse your uploaded merchant service statement</li>
            <li>Email you your quote and savings summary</li>
            <li>Contact you about switching provider if you request it</li>
            <li>Improve our website, tools, and services</li>
            <li>Comply with our legal obligations</li>
          </ul>
          <p>We do not sell your data to third parties.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">4. Statement Uploads</h2>
          <p>When you upload a merchant service statement, we process it solely to generate your savings estimate and provide you with a personalised quote. We may use secure Al/OCR tools to extract fee information from your statement. You give us permission to store the uploaded statement securely in order to generate your quote, resolve support queries, and verify calculations where necessary.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">5. Lawful Bases (UK GDPR)</h2>
          <p>We rely on the following lawful bases for processing your personal data:</p>
          <ul>
            <li><strong>Legitimate interest:</strong> to analyse statements and provide savings estimates</li>
            <li><strong>Contractual necessity:</strong> to supply a quote or information you have requested</li>
            <li><strong>Consent:</strong> for any marketing communications where you have explicitly opted in</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold">6. Data Sharing</h2>
          <p>We may share your data with secure third-party service providers (such as Al processing tools, email platforms, and hosting providers) and prospective payment/acquirer partners where you choose to proceed with a switch. We may also share data with regulators or authorities where required by law. We never sell or rent your personal data.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">7. Data Storage & Security</h2>
          <p>We store your data in secure, access-controlled systems and take appropriate technical and organisational measures to protect it, including encryption, secure servers, and restricted access only to those who need it for legitimate purposes.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">8. Your Rights</h2>
          <p>Under UK data protection law, you have the right to:</p>
          <ul>
            <li>Request access to the personal data we hold about you.</li>
            <li>Request correction of inaccurate or incomplete data.</li>
            <li>Request deletion of your data in certain circumstances.</li>
            <li>Restrict or object to our processing of your data in certain circumstances.</li>
            <li>Request data portability where applicable.</li>
          </ul>
          <p>To exercise these rights, please contact us at: quotes@cardmachinequote.com</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">9. Retention</h2>
          <p>We retain uploaded statements and related quote data only for as long as necessary to provide your quote, handle any follow-up queries, and meet our legal and regulatory obligations.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">10. Contact Us</h2>
          <p>If you have any questions or concerns about this Privacy Policy or how we handle your data, please contact:<br />
          EFG Group Ltd t/a CardMachineQuote.com<br />
          Ground Floor, 5 North Court, Armstrong Road, Maidstone, England, ME15 6JZ<br />
          Email: quotes@cardmachinequote.com</p>
        </section>
      </div>
    </main>
  )
}