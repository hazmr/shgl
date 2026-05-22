"use client";

export const dynamic = "force-dynamic";

import Layout from "../../components/Layout";
import ScrollToTop from "../../components/ScrollToTop";
import ProtectedRoute from "../../components/ProtectedRoute";
import AppliedJobs from "../../screens/AppliedJobs";

export default function AppliedJobsPage() {
  return (
    <Layout>
      <ScrollToTop />
      <ProtectedRoute allowedRoles={["ROLE_JOB_SEEKER"]}>
        <AppliedJobs />
      </ProtectedRoute>
    </Layout>
  );
}
