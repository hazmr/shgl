"use client";

export const dynamic = "force-dynamic";

import Layout from "../../components/Layout";
import ScrollToTop from "../../components/ScrollToTop";
import Login from "../../screens/Login";

export default function LoginPage() {
  return (
    <Layout>
      <ScrollToTop />
      <Login />
    </Layout>
  );
}
