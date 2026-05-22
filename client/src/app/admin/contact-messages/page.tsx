"use client";

export const dynamic = "force-dynamic";

import Layout from "../../../components/Layout";
import ScrollToTop from "../../../components/ScrollToTop";
import ProtectedRoute from "../../../components/ProtectedRoute";
import ContactMessages from "../../../screens/admin/ContactMessages";

export default function AdminContactMessagesPage() {
  return (
    <Layout>
      <ScrollToTop />
      <ProtectedRoute allowedRoles={["ROLE_ADMIN"]}>
        <ContactMessages />
      </ProtectedRoute>
    </Layout>
  );
}
