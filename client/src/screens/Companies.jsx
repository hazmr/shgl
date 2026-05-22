"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useCompanies } from "../contexts/CompaniesContext";
import { useJobsData } from "../contexts/JobsDataContext";

const isTechCompany = (company) => {
  const haystack = `${company.name || ""} ${company.industry || ""}`.toLowerCase();
  return /tech|software|fintech|saas|cloud|data|ai|cyber|it|platform|digital/.test(haystack);
};

const Companies = () => {
  const { companies, loading, error, refetch } = useCompanies();
  const { jobs } = useJobsData();
  const [searchTerm, setSearchTerm] = useState("");
  const [sizeFilter, setSizeFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [ratingFilter, setRatingFilter] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [currentPage, setCurrentPage] = useState(1);
  const companiesPerPage = 12;

  const techCompanies = useMemo(() => companies.filter(isTechCompany), [companies]);
  const sizes = [...new Set(techCompanies.map((company) => company.size))].sort();

  const enhancedCompanies = useMemo(() => {
    return techCompanies.map((company) => {
      const jobCount = jobs.filter((job) => job.company === company.name).length;
      return { ...company, jobCount };
    });
  }, [techCompanies, jobs]);

  const filteredCompanies = useMemo(() => {
    const filtered = enhancedCompanies.filter((company) => {
      const matchesSearch =
        (company.name || "").toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSize = !sizeFilter || company.size === sizeFilter;
      const matchesLocation =
        !locationFilter ||
        (company.locations || []).some((loc) =>
          loc.toLowerCase().includes(locationFilter.toLowerCase())
        );
      const matchesRating = !ratingFilter || company.rating >= parseFloat(ratingFilter);

      return (
        matchesSearch &&
        matchesSize &&
        matchesLocation &&
        matchesRating
      );
    });

    switch (sortBy) {
      case "name":
        filtered.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
        break;
      case "rating":
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case "jobs":
        filtered.sort((a, b) => (b.jobCount || 0) - (a.jobCount || 0));
        break;
      case "founded":
        filtered.sort((a, b) => (b.founded || 0) - (a.founded || 0));
        break;
      default:
        break;
    }

    return filtered;
  }, [
    enhancedCompanies,
    searchTerm,
    sizeFilter,
    locationFilter,
    ratingFilter,
    sortBy,
  ]);

  const totalPages = Math.ceil(filteredCompanies.length / companiesPerPage);
  const paginatedCompanies = filteredCompanies.slice(
    (currentPage - 1) * companiesPerPage,
    currentPage * companiesPerPage
  );

  const resetFilters = () => {
    setSearchTerm("");
    setSizeFilter("");
    setLocationFilter("");
    setRatingFilter("");
    setCurrentPage(1);
  };

  const monogram = (name = "") => {
    return name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((segment) => segment[0])
      .join("")
      .toUpperCase();
  };

  const resolveLogo = (logo) => {
    if (!logo) return "";
    if (logo.startsWith("http://") || logo.startsWith("https://") || logo.startsWith("/")) {
      return logo;
    }
    return `/${logo}`;
  };

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const stars = [];

    for (let i = 0; i < fullStars; i += 1) {
      stars.push(
        <span key={i} aria-hidden>
          ★
        </span>
      );
    }

    if (hasHalfStar) {
      stars.push(
        <span key="half" aria-hidden>
          ☆
        </span>
      );
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i += 1) {
      stars.push(
        <span key={`empty-${i}`} aria-hidden>
          ☆
        </span>
      );
    }

    return stars;
  };

  if (loading) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div className="mx-auto max-w-7xl rounded-[40px] border border-[#BFBFBF]/50 dark:border-[#404040]/70 bg-[#BFBFBF]/20 dark:bg-[#404040]/30 p-6 sm:p-8 lg:p-10">
          <div className="h-5 w-52 rounded-full bg-[#BFBFBF]/60 dark:bg-[#404040]/70 animate-pulse" />
          <div className="mt-5 h-10 w-full max-w-xl rounded-2xl bg-[#BFBFBF]/50 dark:bg-[#404040]/60 animate-pulse" />
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div
                key={idx}
                className="h-56 rounded-3xl border border-[#BFBFBF]/50 dark:border-[#404040]/70 bg-[#F2F2F2]/75 dark:bg-[#0D0D0D]/60 animate-pulse"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div className="mx-auto max-w-3xl rounded-3xl border border-[#BFBFBF]/60 dark:border-[#404040]/70 bg-[#F2F2F2]/80 dark:bg-[#0D0D0D]/70 p-8 text-center">
          <h2 className="text-2xl font-semibold text-[#0D0D0D] dark:text-[#F2F2F2]">Error Loading Companies</h2>
          <p className="mt-2 text-[#404040] dark:text-[#BFBFBF]">{error}</p>
          <button
            onClick={refetch}
            className="mt-5 inline-flex min-h-11 items-center rounded-full bg-[#0D0D0D] px-6 text-sm font-medium text-[#F2F2F2] dark:bg-[#F2F2F2] dark:text-[#0D0D0D] hover:bg-[#0D0D0D]/90 dark:hover:bg-[#F2F2F2]/90 active:scale-95 transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)]"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      <section className="relative mx-auto max-w-7xl rounded-[40px] border border-[#BFBFBF]/50 dark:border-[#404040]/70 bg-[#BFBFBF]/20 dark:bg-[#404040]/30 p-6 sm:p-8 lg:p-10 shadow-sm">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden rounded-[40px]">
          <div className="absolute -top-24 right-10 h-56 w-56 rounded-full bg-[#8C8C8C]/20 blur-3xl" />
          <div className="absolute bottom-0 left-10 h-52 w-52 rounded-full bg-[#0D0D0D]/10 dark:bg-[#F2F2F2]/5 blur-3xl" />
        </div>

        <div className="relative">
          <p className="inline-flex items-center rounded-full border border-[#BFBFBF]/70 dark:border-[#404040]/80 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.15em] text-[#8C8C8C]">
            Companies / Directory
          </p>

          <h1 className="mt-5 text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight leading-[1.12] text-[#0D0D0D] dark:text-[#F2F2F2]">
            Tech companies hiring in EMEA.
          </h1>

          <p className="mt-4 max-w-3xl text-base sm:text-lg leading-relaxed text-[#404040] dark:text-[#BFBFBF]">
            Discover {techCompanies.length} leading technology companies hiring across Europe, the Middle East, and Africa.
          </p>

          <div className="mt-6 rounded-3xl border border-[#BFBFBF]/60 dark:border-[#404040]/70 bg-[#F2F2F2]/75 dark:bg-[#0D0D0D]/60 p-4 sm:p-5 lg:p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="relative">
                <svg
                  className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#8C8C8C]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <input
                  type="text"
                  placeholder="Company name"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-14 w-full rounded-t-lg border-b-2 border-[#BFBFBF] dark:border-[#404040] bg-[#F2F2F2] dark:bg-[#0D0D0D] pl-11 pr-4 text-sm text-[#0D0D0D] dark:text-[#F2F2F2] placeholder:text-[#8C8C8C] focus:outline-none focus:border-[#0D0D0D] dark:focus:border-[#F2F2F2] focus-visible:ring-2 focus-visible:ring-[#0D0D0D]/20 dark:focus-visible:ring-[#F2F2F2]/20 transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)]"
                />
              </div>

              <div className="relative">
                <svg
                  className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#8C8C8C]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <input
                  type="text"
                  placeholder="Location"
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className="h-14 w-full rounded-t-lg border-b-2 border-[#BFBFBF] dark:border-[#404040] bg-[#F2F2F2] dark:bg-[#0D0D0D] pl-11 pr-4 text-sm text-[#0D0D0D] dark:text-[#F2F2F2] placeholder:text-[#8C8C8C] focus:outline-none focus:border-[#0D0D0D] dark:focus:border-[#F2F2F2] focus-visible:ring-2 focus-visible:ring-[#0D0D0D]/20 dark:focus-visible:ring-[#F2F2F2]/20 transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)]"
                />
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <select
                value={sizeFilter}
                onChange={(e) => setSizeFilter(e.target.value)}
                className="h-14 w-full rounded-t-lg border-b-2 border-[#BFBFBF] dark:border-[#404040] bg-[#F2F2F2] dark:bg-[#0D0D0D] px-4 text-sm text-[#0D0D0D] dark:text-[#F2F2F2] focus:outline-none focus:border-[#0D0D0D] dark:focus:border-[#F2F2F2] transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)]"
              >
                <option value="">All Sizes</option>
                {sizes.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>

              <select
                value={ratingFilter}
                onChange={(e) => setRatingFilter(e.target.value)}
                className="h-14 w-full rounded-t-lg border-b-2 border-[#BFBFBF] dark:border-[#404040] bg-[#F2F2F2] dark:bg-[#0D0D0D] px-4 text-sm text-[#0D0D0D] dark:text-[#F2F2F2] focus:outline-none focus:border-[#0D0D0D] dark:focus:border-[#F2F2F2] transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)]"
              >
                <option value="">All Ratings</option>
                <option value="4.5">4.5+</option>
                <option value="4.0">4.0+</option>
                <option value="3.5">3.5+</option>
                <option value="3.0">3.0+</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="h-14 w-full rounded-t-lg border-b-2 border-[#BFBFBF] dark:border-[#404040] bg-[#F2F2F2] dark:bg-[#0D0D0D] px-4 text-sm text-[#0D0D0D] dark:text-[#F2F2F2] focus:outline-none focus:border-[#0D0D0D] dark:focus:border-[#F2F2F2] transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)]"
              >
                <option value="name">Sort by Name</option>
                <option value="rating">Sort by Rating</option>
                <option value="jobs">Sort by Jobs</option>
                <option value="founded">Sort by Founded</option>
              </select>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <button
                onClick={resetFilters}
                className="inline-flex min-h-11 items-center rounded-full border border-[#BFBFBF] dark:border-[#404040] px-5 text-sm font-medium text-[#404040] dark:text-[#F2F2F2] hover:bg-[#0D0D0D]/10 dark:hover:bg-[#F2F2F2]/10 active:scale-95 transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D0D0D] dark:focus-visible:ring-[#F2F2F2]"
              >
                Clear Filters
              </button>

              <div className="text-sm text-[#8C8C8C]">{filteredCompanies.length} companies found</div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto mt-8 max-w-7xl">
        <div>
          <h2 className="text-2xl font-semibold text-[#0D0D0D] dark:text-[#F2F2F2]">
            {filteredCompanies.length} Companies Found
          </h2>
          <p className="mt-1 text-sm text-[#8C8C8C]">
            Showing {filteredCompanies.length === 0 ? 0 : (currentPage - 1) * companiesPerPage + 1} -{" "}
            {Math.min(currentPage * companiesPerPage, filteredCompanies.length)} of {filteredCompanies.length}
          </p>
        </div>

        {paginatedCompanies.length === 0 ? (
          <div className="mt-6 rounded-3xl border border-[#BFBFBF]/60 dark:border-[#404040]/70 bg-[#F2F2F2]/80 dark:bg-[#0D0D0D]/70 p-8 text-center">
            <p className="text-lg font-medium text-[#0D0D0D] dark:text-[#F2F2F2]">No companies match your filters.</p>
            <p className="mt-2 text-sm text-[#8C8C8C]">Try broadening your search criteria.</p>
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 items-stretch">
            {paginatedCompanies.map((company) => (
              <Link
                key={company.name}
                href={`/companies/${company.name
                  .toLowerCase()
                  .replace(/\s+/g, "-")
                  .replace(/[^a-z0-9-]/g, "")}`}
                className="group flex h-full flex-col rounded-3xl border border-[#BFBFBF]/60 dark:border-[#404040]/70 bg-[#F2F2F2]/80 dark:bg-white/5 p-5 shadow-sm hover:shadow-md hover:scale-[1.01] transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D0D0D] dark:focus-visible:ring-[#F2F2F2]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-[#BFBFBF]/45 dark:bg-[#404040]/75">
                    {company.logo ? (
                      <>
                        <img
                          src={resolveLogo(company.logo)}
                          alt={`${company.name} logo`}
                          className="h-full w-full object-cover"
                          onError={(event) => {
                            event.currentTarget.style.display = "none";
                            event.currentTarget.nextSibling.style.display = "flex";
                          }}
                        />
                        <span className="hidden h-full w-full items-center justify-center text-sm font-semibold text-[#0D0D0D] dark:text-[#F2F2F2]">
                          {monogram(company.name)}
                        </span>
                      </>
                    ) : (
                      <span className="flex h-full w-full items-center justify-center text-sm font-semibold text-[#0D0D0D] dark:text-[#F2F2F2]">
                        {monogram(company.name)}
                      </span>
                    )}
                  </div>

                  <div className="rounded-full bg-[#0D0D0D]/10 dark:bg-[#F2F2F2]/10 px-3 py-1 text-xs font-medium text-[#404040] dark:text-[#BFBFBF]">
                    {company.jobCount || 0} roles
                  </div>
                </div>

                <h3 className="mt-5 truncate text-lg font-semibold text-[#0D0D0D] dark:text-[#F2F2F2]">
                  {company.name}
                </h3>
                <p className="mt-1 text-sm text-[#404040] dark:text-[#BFBFBF] line-clamp-2">
                  {company.industry || "Technology"}
                </p>

                <div className="mt-4 grid grid-cols-2 gap-3 text-xs text-[#8C8C8C]">
                  <div className="rounded-2xl bg-[#BFBFBF]/25 dark:bg-[#404040]/45 px-3 py-2">
                    <p>Size</p>
                    <p className="mt-1 font-medium text-[#404040] dark:text-[#BFBFBF]">{company.size || "N/A"}</p>
                  </div>
                  <div className="rounded-2xl bg-[#BFBFBF]/25 dark:bg-[#404040]/45 px-3 py-2">
                    <p>Founded</p>
                    <p className="mt-1 font-medium text-[#404040] dark:text-[#BFBFBF]">{company.founded || "N/A"}</p>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between gap-2">
                  <div className="text-xs text-[#8C8C8C]">{renderStars(company.rating || 0)}</div>
                  <div className="text-sm text-[#404040] dark:text-[#BFBFBF]">
                    Rating {(company.rating || 0).toFixed(1)}
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {(company.locations || []).slice(0, 3).map((location, idx) => (
                    <span
                      key={`${company.name}-${idx}`}
                      className="inline-flex items-center rounded-full border border-[#BFBFBF]/70 dark:border-[#404040]/80 px-3 py-1 text-xs text-[#8C8C8C]"
                    >
                      {location}
                    </span>
                  ))}
                  {(company.locations || []).length > 3 && (
                    <span className="inline-flex items-center rounded-full border border-[#BFBFBF]/70 dark:border-[#404040]/80 px-3 py-1 text-xs text-[#8C8C8C]">
                      +{(company.locations || []).length - 3}
                    </span>
                  )}
                </div>

                <div className="mt-auto pt-4">
                  <div className="h-px w-full bg-[#BFBFBF]/55 dark:bg-[#404040]/75" />
                </div>
              </Link>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="inline-flex min-h-11 items-center rounded-full border border-[#BFBFBF] dark:border-[#404040] px-5 text-sm font-medium text-[#404040] dark:text-[#F2F2F2] disabled:opacity-45 disabled:cursor-not-allowed hover:bg-[#0D0D0D]/10 dark:hover:bg-[#F2F2F2]/10 transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)]"
            >
              Prev
            </button>

            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const start = Math.min(Math.max(1, currentPage - 2), Math.max(1, totalPages - 4));
              const pageNum = start + i;
              if (pageNum > totalPages) return null;

              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`inline-flex h-11 w-11 items-center justify-center rounded-full text-sm font-medium transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)] ${
                    currentPage === pageNum
                      ? "bg-[#0D0D0D] text-[#F2F2F2] dark:bg-[#F2F2F2] dark:text-[#0D0D0D]"
                      : "border border-[#BFBFBF] dark:border-[#404040] text-[#404040] dark:text-[#F2F2F2] hover:bg-[#0D0D0D]/10 dark:hover:bg-[#F2F2F2]/10"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="inline-flex min-h-11 items-center rounded-full border border-[#BFBFBF] dark:border-[#404040] px-5 text-sm font-medium text-[#404040] dark:text-[#F2F2F2] disabled:opacity-45 disabled:cursor-not-allowed hover:bg-[#0D0D0D]/10 dark:hover:bg-[#F2F2F2]/10 transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)]"
            >
              Next
            </button>
          </div>
        )}
      </section>
    </div>
  );
};

export default Companies;
