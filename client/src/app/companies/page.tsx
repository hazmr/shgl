"use client";

export const dynamic = "force-dynamic";

import Layout from "../../components/Layout";
import ScrollToTop from "../../components/ScrollToTop";
import Companies from "../../screens/Companies";

export default function CompaniesPage() {
  return (
    <Layout>
      <ScrollToTop />
      <Companies />
    </Layout>
  );
}
