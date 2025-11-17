import Navbar from '@/components/Navbar'
import React from 'react'

export default function TermsPage() {
  return (
    <main className="max-w-4xl mx-auto px-6 pb-12">
      <Navbar />
      <h1 className="text-3xl font-bold mb-6">Website Terms & Conditions - CardMachineQuote.com</h1>
      <div className="space-y-6 prose">
        <p>These Terms & Conditions govern your use of the website CardMachineQuote.com, operated by EFG Group Ltd t/a CardMachine Quote.com ("we", "us", "our"). By accessing or using this website, you agree to these Terms.</p>

        <section>
          <h2 className="text-xl font-semibold">1. Who We Are</h2>
          <p>EFG Group Ltd t/a CardMachine Quote.com Registered in England & Wales: Company Number 16558737. Registered Office: Ground Floor, 5 North Court, Armstrong Road, Maidstone, England, ME15 6JZ.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">2. Purpose of the Website</h2>
          <p>CardMachine Quote.com is intended for business users. The website provides tools to analyse merchant service statements, estimate potential savings, generate indicative quotes, and present information about card machine and payment processing options.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">3. No Financial Advice</h2>
          <p>Any savings figures or quotes provided on the website are estimates based on the information you upload or supply. They do not constitute financial advice. Final terms, rates, and approvals are always subject to underwriting and verification by the relevant provider.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">4. Accuracy of Information</h2>
          <p>You are responsible for ensuring that any information or statements you upload or submit (including merchant service statements) are accurate and belong to your business. We are not responsible for any incorrect results or estimates that arise from inaccurate, incomplete or misleading information.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">5. Uploading Statements</h2>
          <p>By uploading a statement or other documentation, you confirm that you have the legal right and authority to share it. You agree not to upload any content that is unlawful, harmful, infringing, or otherwise inappropriate. You consent to us analysing and securely storing the statement in order to generate your quote and provide our services.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">6. Service Availability</h2>
          <p>We aim to keep the website available and functioning reliably, but we do not guarantee uninterrupted access. We may suspend, withdraw, or modify the website or any part of it for maintenance, updates, or other reasons at any time.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">7. Intellectual Property</h2>
          <p>All content on CardMachine Quote.com, including text, graphics, logos, branding and design, is owned by or licensed to EFG Group Ltd t/a CardMachine Quote.com. You may not copy, reproduce, modify, or distribute any part of the site without our prior written consent, except as permitted by law.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">8. Limitation of Liability</h2>
          <p>To the fullest extent permitted by law, we will not be liable for any loss, damage, or costs arising out of or in connection with your use of this website, reliance on any estimates or information provided, or any inability to use the website. Your use of the website is at your own risk.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">9. Third-Party Links</h2>
          <p>The website may contain links to external websites or services which are not operated by us. We have no control over the content or practices of those third parties and are not responsible for them. Following such links is at your discretion.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">10. Switching Providers</h2>
          <p>If you choose to proceed with switching provider after receiving a quote, you will enter into a separate agreement with the relevant payment provider or acquirer. We act only as an introducer and are not a party to that agreement. Final pricing, terms, and approval decisions rest with the provider.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">11. Prohibited Use</h2>
          <p>You agree not to misuse the website, including (without limitation) by attempting to gain unauthorised access, introducing malicious code, scraping data, or using the site for any unlawful or fraudulent purpose.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">12. Governing Law</h2>
          <p>These Terms & Conditions are governed by and construed in accordance with the laws of England & Wales. Any disputes shall be subject to the exclusive jurisdiction of the courts of England & Wales.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">13. Contact</h2>
          <p>If you have any questions about these Terms & Conditions, please contact:<br />
          EFG Group Ltd t/a CardMachine Quote.com<br />
          Ground Floor, 5 North Court, Armstrong Road, Maidstone, England, ME15 6JZ<br />
          Email: quotes@cardmachinequote.com</p>
        </section>
      </div>
    </main>
  )
}