"use client";

import Layout from "../../../../../components/Layout";
import ScrollToTop from "../../../../../components/ScrollToTop";
import ProtectedRoute from "../../../../../components/ProtectedRoute";
import JobApplicants from "../../../../../screens/JobApplicants";

export const dynamic = "force-dynamic";

export default function JobApplicantsPage() {
  return (
    <Layout>
      <ScrollToTop />
      <ProtectedRoute allowedRoles={["ROLE_EMPLOYER"]}>
        <JobApplicants />
      </ProtectedRoute>
    </Layout>
  );
}
