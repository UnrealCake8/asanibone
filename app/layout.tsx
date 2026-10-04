import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ServiceWorkerRegister } from "@/components/service-worker-register";

export const metadata: Metadata = {
  title: "Asanib",
  description: "Get anything from almost any local shop delivered.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Asanib",
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  themeColor: "#0b0b0c",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <ServiceWorkerRegister />
        {children}
        <footer className="global-operator-footer"><div><span>Asanib is operated by <strong>JS Ventures LLC</strong> in the United Arab Emirates.</span><nav><a href="/about">About Asanib</a><a href="/contact">Contact</a><a href="/privacy">Privacy Policy</a><a href="/terms">Terms &amp; Conditions</a><a href="/cookies">Cookie Policy</a><a href="/refunds">Refund Policy</a><a href="/delivery-policy">Delivery Policy</a><a href="/provider">For providers</a></nav><small>© {new Date().getFullYear()} JS Ventures LLC. All rights reserved.</small></div></footer>
      </body>
    </html>
  );
}
