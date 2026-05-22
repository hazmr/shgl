"use client";

export const dynamic = "force-dynamic";

import Layout from "../../../components/Layout";
import ScrollToTop from "../../../components/ScrollToTop";
import ProtectedRoute from "../../../components/ProtectedRoute";
import CompanyManagement from "../../../screens/admin/CompanyManagement";

export default function AdminCompaniesPage() {
  return (
    <Layout>
      <ScrollToTop />
      <ProtectedRoute allowedRoles={["ROLE_ADMIN"]}>
        <CompanyManagement />
      </ProtectedRoute>
    </Layout>
  );
}
