"use client";

export const dynamic = "force-dynamic";

import Layout from "../../components/Layout";
import ScrollToTop from "../../components/ScrollToTop";
import ProtectedRoute from "../../components/ProtectedRoute";
import SavedJobs from "../../screens/SavedJobs";

export default function SavedJobsPage() {
  return (
    <Layout>
      <ScrollToTop />
      <ProtectedRoute allowedRoles={["ROLE_JOB_SEEKER"]}>
        <SavedJobs />
      </ProtectedRoute>
    </Layout>
  );
}
