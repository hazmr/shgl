"use client";

export const dynamic = "force-dynamic";

import Layout from "../../components/Layout";
import ScrollToTop from "../../components/ScrollToTop";
import ProtectedRoute from "../../components/ProtectedRoute";
import PostJob from "../../screens/PostJob";

export default function PostJobPage() {
  return (
    <Layout>
      <ScrollToTop />
      <ProtectedRoute allowedRoles={["ROLE_EMPLOYER"]}>
        <PostJob />
      </ProtectedRoute>
    </Layout>
  );
}
