"use client";

export const dynamic = "force-dynamic";

import Layout from "../../../components/Layout";
import ScrollToTop from "../../../components/ScrollToTop";
import CompanyDetail from "../../../screens/CompanyDetail";

export default function CompanyDetailPage() {
  return (
    <Layout>
      <ScrollToTop />
      <CompanyDetail />
    </Layout>
  );
}
