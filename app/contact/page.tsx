import Link from "next/link";

export default function Contact() {
  return (
    <main className="legal-shell">
      <Link className="legal-back" href="/">← Asanib</Link>
      <p className="eyebrow">SUPPORT</p>
      <h1>Contact Asanib</h1>
      <section>
        <h2>Customer support</h2>
        <p>For order, payment, delivery, privacy or account questions, email <a href="mailto:support@asanib.com">support@asanib.com</a>. Include your order reference when contacting us about a purchase.</p>
      </section>
      <section>
        <h2>After-hours delivery</h2>
        <p>For a delivery that cannot wait and needs coordinating after 10:00 PM, call <a href="tel:+971585235595">+971 58 523 5595</a>. Gia will coordinate the delivery personally.</p>
      </section>
      <section>
        <h2>Operator</h2>
        <p>Asanib is operated by JS Ventures LLC, Sharjah Media City (Shams), United Arab Emirates. Commercial licence no. 2648139.</p>
      </section>
    </main>
  );
}
