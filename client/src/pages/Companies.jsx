import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useCompanies } from "../contexts/CompaniesContext";
import { useJobsData } from "../contexts/JobsDataContext";
import CornerAccents from "../components/CornerAccents";

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

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="relative border border-[#0A0A0B]/15 dark:border-[#ECECEC]/15 bg-[#FFFFFF] dark:bg-[#18181B] p-10 group mb-8">
          <CornerAccents className="text-fg/30" />
          <div className="h-4 w-40 bg-fg/10 animate-pulse mb-4" />
          <div className="h-8 w-2/3 bg-fg/10 animate-pulse mb-4" />
          <div className="h-4 w-full bg-fg/10 animate-pulse" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div
              key={idx}
              className="h-56 border border-[#0A0A0B]/15 dark:border-[#ECECEC]/15 bg-[#FFFFFF] dark:bg-[#18181B] animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="relative border border-[#0A0A0B]/15 dark:border-[#ECECEC]/15 bg-[#FFFFFF] dark:bg-[#18181B] p-12 text-center group">
          <CornerAccents className="text-fg/30" />
          <div className="font-mono text-[10px] text-muted uppercase tracking-wider mb-2">// DIRECTORY_ERROR</div>
          <h2 className="text-2xl font-bold uppercase text-fg mb-4">Error Loading Companies</h2>
          <p className="font-mono text-xs text-secondary mb-8">{error}</p>
          <button
            onClick={refetch}
            className="group/btn relative inline-flex min-h-11 items-center justify-center border border-[#0A0A0B] dark:border-[#ECECEC] bg-[#0A0A0B] text-[#ECECEC] dark:bg-[#ECECEC] dark:text-[#0A0A0B] px-6 font-mono text-xs uppercase font-bold tracking-wider hover:bg-transparent hover:text-fg transition-all duration-300 cursor-pointer"
          >
            <CornerAccents className="opacity-0 group-hover/btn:opacity-100" />
            <span>Try Again</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Directory Hero panel */}
      <section className="relative border border-[#0A0A0B]/15 dark:border-[#ECECEC]/15 bg-[#FFFFFF] dark:bg-[#18181B] p-8 lg:p-10 mb-8 transition-all duration-300 group">
        <CornerAccents className="text-fg/30 group-hover:text-fg/50" />
        <div className="relative z-10">
          <p className="font-mono text-[10px] uppercase tracking-wider text-muted mb-2">
            // Curated Teams
          </p>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-sans text-fg uppercase tracking-tight leading-none mb-4">
            Hiring workspaces in EMEA
          </h1>
          <p className="max-w-3xl font-mono text-xs sm:text-sm text-secondary leading-relaxed mb-8">
            Discover {techCompanies.length} verified technology teams currently open for applications across Europe, the Middle East, and Africa.
          </p>

          {/* Search and Filters grid */}
          <div className="border-t border-[#0A0A0B]/10 dark:border-[#ECECEC]/10 pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {/* Search company input */}
              <div className="relative border border-[#0A0A0B]/15 dark:border-[#ECECEC]/15 focus-within:border-fg bg-[#FFFFFF] dark:bg-[#18181B] transition-all duration-300 group/search">
                <CornerAccents className="opacity-0 group-focus-within/search:opacity-100" />
                <input
                  type="text"
                  placeholder="Search by company name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-12 w-full bg-transparent border-none text-fg px-4 font-mono text-xs focus:ring-0 focus:outline-none placeholder:text-muted"
                />
              </div>

              {/* Search location input */}
              <div className="relative border border-[#0A0A0B]/15 dark:border-[#ECECEC]/15 focus-within:border-fg bg-[#FFFFFF] dark:bg-[#18181B] transition-all duration-300 group/loc">
                <CornerAccents className="opacity-0 group-focus-within/loc:opacity-100" />
                <input
                  type="text"
                  placeholder="Filter by city or country..."
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className="h-12 w-full bg-transparent border-none text-fg px-4 font-mono text-xs focus:ring-0 focus:outline-none placeholder:text-muted"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Size Select */}
              <div className="relative border border-[#0A0A0B]/15 dark:border-[#ECECEC]/15 focus-within:border-fg bg-[#FFFFFF] dark:bg-[#18181B] transition-all duration-300 group/size">
                <CornerAccents className="opacity-0 group-focus-within/size:opacity-100" />
                <select
                  value={sizeFilter}
                  onChange={(e) => setSizeFilter(e.target.value)}
                  className="h-12 w-full bg-transparent border-none text-fg px-4 font-mono text-xs uppercase cursor-pointer focus:ring-0 focus:outline-none"
                >
                  <option value="" className="bg-elevated text-fg">ALL COMPANY SIZES</option>
                  {sizes.map((size) => (
                    <option key={size} value={size} className="bg-elevated text-fg">
                      {size.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>

              {/* Rating Select */}
              <div className="relative border border-[#0A0A0B]/15 dark:border-[#ECECEC]/15 focus-within:border-fg bg-[#FFFFFF] dark:bg-[#18181B] transition-all duration-300 group/rate">
                <CornerAccents className="opacity-0 group-focus-within/rate:opacity-100" />
                <select
                  value={ratingFilter}
                  onChange={(e) => setRatingFilter(e.target.value)}
                  className="h-12 w-full bg-transparent border-none text-fg px-4 font-mono text-xs uppercase cursor-pointer focus:ring-0 focus:outline-none"
                >
                  <option value="" className="bg-elevated text-fg">ALL RATINGS</option>
                  <option value="4.5" className="bg-elevated text-fg">4.5+ OVERALL</option>
                  <option value="4.0" className="bg-elevated text-fg">4.0+ OVERALL</option>
                  <option value="3.5" className="bg-elevated text-fg">3.5+ OVERALL</option>
                  <option value="3.0" className="bg-elevated text-fg">3.0+ OVERALL</option>
                </select>
              </div>

              {/* Sort By Select */}
              <div className="relative border border-[#0A0A0B]/15 dark:border-[#ECECEC]/15 focus-within:border-fg bg-[#FFFFFF] dark:bg-[#18181B] transition-all duration-300 group/sort">
                <CornerAccents className="opacity-0 group-focus-within/sort:opacity-100" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="h-12 w-full bg-transparent border-none text-fg px-4 font-mono text-xs uppercase cursor-pointer focus:ring-0 focus:outline-none"
                >
                  <option value="name" className="bg-elevated text-fg">SORT BY NAME (A-Z)</option>
                  <option value="rating" className="bg-elevated text-fg">SORT BY RATING</option>
                  <option value="jobs" className="bg-elevated text-fg">SORT BY OPEN ROLES</option>
                  <option value="founded" className="bg-elevated text-fg">SORT BY FOUNDED DATE</option>
                </select>
              </div>
            </div>

            {/* Clear Filters / Summary Row */}
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-[#0A0A0B]/10 dark:border-[#ECECEC]/10 pt-5">
              <button
                onClick={resetFilters}
                className="group/cbtn relative inline-flex min-h-9 items-center border border-[#0A0A0B]/15 dark:border-[#ECECEC]/15 bg-transparent px-4 font-mono text-[10px] uppercase font-bold tracking-wider text-[#5C5C5E] dark:text-[#8C8C8E] hover:border-fg hover:text-fg transition-all duration-300 cursor-pointer"
              >
                <CornerAccents className="opacity-0 group-hover/cbtn:opacity-100" />
                Clear Filters
              </button>

              <span className="font-mono text-[10px] text-muted uppercase tracking-wider">
                {filteredCompanies.length} RECORDS MATCHED
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Directory Grid Section */}
      <section>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between px-2 mb-6">
          <div>
            <h2 className="text-xl font-bold font-mono text-fg uppercase tracking-tight">
              {filteredCompanies.length} Directory Items
            </h2>
            <p className="mt-1 font-mono text-xs text-[#8C8C8E] uppercase">
              Showing {filteredCompanies.length === 0 ? 0 : (currentPage - 1) * companiesPerPage + 1} -{" "}
              {Math.min(currentPage * companiesPerPage, filteredCompanies.length)} of {filteredCompanies.length} records
            </p>
          </div>
        </div>

        {paginatedCompanies.length === 0 ? (
          <div className="relative border border-[#0A0A0B]/15 dark:border-[#ECECEC]/15 bg-[#FFFFFF] dark:bg-[#18181B] p-12 text-center group">
            <CornerAccents className="text-fg/30" />
            <p className="font-mono text-xs text-[#5C5C5E] dark:text-[#8C8C8E]">
              // NO_RECORDS_FOUND_FOR_CURRENT_QUERY
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
            {paginatedCompanies.map((company) => (
              <Link
                key={company.name}
                to={`/companies/${company.name
                  .toLowerCase()
                  .replace(/\s+/g, "-")
                  .replace(/[^a-z0-9-]/g, "")}`}
                className="group flex flex-col relative border border-[#0A0A0B]/15 dark:border-[#ECECEC]/15 bg-[#FFFFFF] dark:bg-[#18181B] p-6 hover:border-fg hover:shadow-[0_4px_20px_rgba(0,0,0,0.05)] dark:hover:shadow-[0_4px_25px_rgba(0,0,0,0.3)] transition-all duration-300 cursor-pointer"
              >
                <CornerAccents className="opacity-0 group-hover:opacity-100" />
                
                {/* Logo and Roles count */}
                <div className="flex items-start justify-between gap-3 mb-6">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center border border-[#0A0A0B]/10 dark:border-[#ECECEC]/10 bg-[#0A0A0B]/5 dark:bg-[#ECECEC]/5">
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
                        <span className="hidden h-full w-full items-center justify-center font-mono text-sm font-bold text-fg">
                          {monogram(company.name)}
                        </span>
                      </>
                    ) : (
                      <span className="flex h-full w-full items-center justify-center font-mono text-sm font-bold text-fg">
                        {monogram(company.name)}
                      </span>
                    )}
                  </div>

                  <span className="font-mono text-[9px] uppercase font-bold tracking-wider border border-[#0A0A0B]/10 dark:border-[#ECECEC]/10 px-2 py-1 text-muted">
                    {company.jobCount || 0} OPEN ROLES
                  </span>
                </div>

                {/* Company Name & Details */}
                <h3 className="text-lg font-bold font-sans text-fg uppercase tracking-tight mb-1 truncate">
                  {company.name}
                </h3>
                <p className="font-mono text-[10px] text-secondary uppercase tracking-wider mb-4">
                  // {company.industry || "TECHNOLOGY"}
                </p>

                {/* Overview Row Grid */}
                <div className="grid grid-cols-2 gap-3 text-xs mb-4">
                  <div className="border border-[#0A0A0B]/5 dark:border-[#ECECEC]/5 bg-[#0A0A0B]/2 dark:bg-[#ECECEC]/2 p-2">
                    <span className="font-mono text-[9px] uppercase tracking-wider text-[#8C8C8E] block mb-1">SIZE</span>
                    <span className="font-mono text-[10px] font-bold text-fg uppercase">{company.size || "N/A"}</span>
                  </div>
                  <div className="border border-[#0A0A0B]/5 dark:border-[#ECECEC]/5 bg-[#0A0A0B]/2 dark:bg-[#ECECEC]/2 p-2">
                    <span className="font-mono text-[9px] uppercase tracking-wider text-[#8C8C8E] block mb-1">FOUNDED</span>
                    <span className="font-mono text-[10px] font-bold text-fg uppercase">{company.founded || "N/A"}</span>
                  </div>
                </div>

                <div className="mt-auto pt-4 border-t border-[#0A0A0B]/5 dark:border-[#ECECEC]/5 flex items-center justify-between text-xs">
                  <span className="font-mono text-[9px] uppercase tracking-wider text-[#8C8C8E]">OVERALL SCORE</span>
                  <span className="font-mono text-xs font-bold text-fg">
                    {(company.rating || 0).toFixed(1)} / 5.0
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination Panel */}
        {totalPages > 1 && (
          <div className="mt-12 flex items-center justify-center gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="group/prevbtn relative inline-flex min-h-10 items-center justify-center border border-[#0A0A0B]/15 dark:border-[#ECECEC]/15 bg-transparent px-4 font-mono text-[10px] uppercase font-bold tracking-wider text-fg disabled:opacity-40 disabled:cursor-not-allowed hover:border-fg transition-all duration-300 cursor-pointer"
            >
              <CornerAccents className="opacity-0 group-hover/prevbtn:opacity-100" />
              <span>Prev</span>
            </button>

            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const start = Math.min(Math.max(1, currentPage - 2), Math.max(1, totalPages - 4));
              const pageNum = start + i;
              if (pageNum > totalPages) return null;

              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`group/pagebtn relative inline-flex h-10 w-10 items-center justify-center border font-mono text-[10px] uppercase font-bold transition-all duration-300 cursor-pointer ${
                    currentPage === pageNum
                      ? "border-fg bg-[#0A0A0B] text-[#ECECEC] dark:bg-[#ECECEC] dark:text-[#0A0A0B]"
                      : "border-[#0A0A0B]/15 dark:border-[#ECECEC]/15 bg-transparent text-fg hover:border-fg"
                  }`}
                >
                  <CornerAccents className="opacity-0 group-hover/pagebtn:opacity-100" />
                  <span>{pageNum}</span>
                </button>
              );
            })}

            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="group/nextbtn relative inline-flex min-h-10 items-center justify-center border border-[#0A0A0B]/15 dark:border-[#ECECEC]/15 bg-transparent px-4 font-mono text-[10px] uppercase font-bold tracking-wider text-fg disabled:opacity-40 disabled:cursor-not-allowed hover:border-fg transition-all duration-300 cursor-pointer"
            >
              <CornerAccents className="opacity-0 group-hover/nextbtn:opacity-100" />
              <span>Next</span>
            </button>
          </div>
        )}
      </section>
    </div>
  );
};

export default Companies;
