"use client";

export const dynamic = "force-dynamic";

import Layout from "../../components/Layout";
import ScrollToTop from "../../components/ScrollToTop";
import Contact from "../../screens/Contact";

export default function ContactPage() {
  return (
    <Layout>
      <ScrollToTop />
      <Contact />
    </Layout>
  );
}
