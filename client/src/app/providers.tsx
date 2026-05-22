"use client";

import { AuthProvider } from "../context/AuthContext";
import { JobsDataProvider } from "../contexts/JobsDataContext";
import { JobProvider } from "../context/JobContext";
import { CompaniesProvider } from "../contexts/CompaniesContext";
import { ThemeProvider } from "../context/ThemeContext";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <JobsDataProvider>
        <JobProvider>
          <CompaniesProvider>
            <ThemeProvider>{children}</ThemeProvider>
          </CompaniesProvider>
        </JobProvider>
      </JobsDataProvider>
    </AuthProvider>
  );
}
