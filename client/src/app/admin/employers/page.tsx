"use client";

export const dynamic = "force-dynamic";

import Layout from "../../../components/Layout";
import ScrollToTop from "../../../components/ScrollToTop";
import ProtectedRoute from "../../../components/ProtectedRoute";
import EmployerManagement from "../../../screens/admin/EmployerManagement";

export default function AdminEmployersPage() {
  return (
    <Layout>
      <ScrollToTop />
      <ProtectedRoute allowedRoles={["ROLE_ADMIN"]}>
        <EmployerManagement />
      </ProtectedRoute>
    </Layout>
  );
}
