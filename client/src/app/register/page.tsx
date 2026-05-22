"use client";

export const dynamic = "force-dynamic";

import Layout from "../../components/Layout";
import ScrollToTop from "../../components/ScrollToTop";
import Register from "../../screens/Register";

export default function RegisterPage() {
  return (
    <Layout>
      <ScrollToTop />
      <Register />
    </Layout>
  );
}
