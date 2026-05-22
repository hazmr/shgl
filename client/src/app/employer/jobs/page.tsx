"use client";

export const dynamic = "force-dynamic";

import Layout from "../../../components/Layout";
import ScrollToTop from "../../../components/ScrollToTop";
import ProtectedRoute from "../../../components/ProtectedRoute";
import MyJobs from "../../../screens/MyJobs";

export default function MyJobsPage() {
  return (
    <Layout>
      <ScrollToTop />
      <ProtectedRoute allowedRoles={["ROLE_EMPLOYER"]}>
        <MyJobs />
      </ProtectedRoute>
    </Layout>
  );
}
