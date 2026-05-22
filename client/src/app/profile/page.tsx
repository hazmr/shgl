"use client";

export const dynamic = "force-dynamic";

import Layout from "../../components/Layout";
import ScrollToTop from "../../components/ScrollToTop";
import ProtectedRoute from "../../components/ProtectedRoute";
import Profile from "../../screens/Profile";

export default function ProfilePage() {
  return (
    <Layout>
      <ScrollToTop />
      <ProtectedRoute allowedRoles={["ROLE_JOB_SEEKER"]}>
        <Profile />
      </ProtectedRoute>
    </Layout>
  );
}
