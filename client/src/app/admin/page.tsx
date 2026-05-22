"use client";

export const dynamic = "force-dynamic";

import Layout from "../../components/Layout";
import ScrollToTop from "../../components/ScrollToTop";
import ProtectedRoute from "../../components/ProtectedRoute";
import Dashboard from "../../screens/admin/Dashboard";

export default function AdminDashboardPage() {
  return (
    <Layout>
      <ScrollToTop />
      <ProtectedRoute allowedRoles={["ROLE_ADMIN"]}>
        <Dashboard />
      </ProtectedRoute>
    </Layout>
  );
}
