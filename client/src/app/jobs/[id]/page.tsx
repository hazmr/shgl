"use client";

export const dynamic = "force-dynamic";

import Layout from "../../../components/Layout";
import ScrollToTop from "../../../components/ScrollToTop";
import JobDetail from "../../../screens/JobDetail";

export default function JobDetailPage() {
  return (
    <Layout>
      <ScrollToTop />
      <JobDetail />
    </Layout>
  );
}
