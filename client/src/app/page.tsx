"use client";

export const dynamic = "force-dynamic";

import Layout from "../components/Layout";
import ScrollToTop from "../components/ScrollToTop";
import Home from "../screens/Home";

export default function HomePage() {
  return (
    <Layout>
      <ScrollToTop />
      <Home />
    </Layout>
  );
}
