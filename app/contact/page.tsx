import Link from "next/link";

export default function Contact() {
  return (
    <main className="legal-shell">
      <Link className="legal-back" href="/">← Asanib</Link>
      <p className="eyebrow">SUPPORT</p><h1>Contact Asanib</h1>
      <section><h2>Customer support</h2><p>For orders, payments, delivery, privacy or account questions, email <a href="mailto:support@asanib.com">support@asanib.com</a>. Include your order reference where available.</p></section>
      <section><h2>Urgent after-hours coordination</h2><p>For a delivery that cannot wait after 10:00 PM GST, call <a href="tel:+971585235595">+971 58 523 5595</a>. The Asanib owner will coordinate personally where possible. This is a request for manual coordination, not a guaranteed standard delivery slot; timing, availability and any additional price must be confirmed with you first.</p></section>
      <section><h2>Operator</h2><p>Asanib is operated by JS Ventures LLC, Sharjah Media City (Shams), United Arab Emirates. Commercial licence no. 2648139.</p></section>
    </main>
  );
}
