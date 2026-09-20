import { Metadata } from "next";
import ContactPage from "@/components/ContactPage";

export const metadata: Metadata = {
  title: "Contact Us - Cineby",
  description: "Get in touch with the Cineby team. We'd love to hear from you!",
  robots: {
    index: false,
    follow: true,
  },
  alternates: {
    canonical: "https://cineby.vip/contact",
  },
  openGraph: {
    title: "Contact Us - Cineby",
    description: "Get in touch with the Cineby team. We'd love to hear from you!",
    url: "https://cineby.vip/contact",
    siteName: "Cineby",
    type: "website",
    images: [
      {
        url: "https://cineby.vip/img/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Contact Cineby",
      },
    ],
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact Us - Cineby",
    description: "Get in touch with the Cineby team. We'd love to hear from you!",
    images: ["https://cineby.vip/img/og-image.jpg"],
    site: "@cineby",
    creator: "@cineby",
  },
};

export default function Page() {
  return <ContactPage />;
}