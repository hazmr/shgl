"use client";

export const dynamic = "force-dynamic";

import Layout from "../../components/Layout";
import ScrollToTop from "../../components/ScrollToTop";
import Jobs from "../../screens/Jobs";

export default function JobsPage() {
  return (
    <Layout>
      <ScrollToTop />
      <Jobs />
    </Layout>
  );
}
