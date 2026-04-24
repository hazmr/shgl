import { useState } from 'react';
import { useJobsData } from '../contexts/JobsDataContext';
import { useCompanies } from '../contexts/CompaniesContext';

const RefreshButton = ({ showLabel = true, }) => {
  const { forceRefresh: refreshJobs, getCacheAge: getJobsCacheAge, loading: jobsLoading } = useJobsData();
  const { forceRefresh: refreshCompanies, getCacheAge: getCompaniesCacheAge, loading: companiesLoading } = useCompanies();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([refreshJobs(), refreshCompanies()]);
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setTimeout(() => setIsRefreshing(false), 500); // Small delay for visual feedback
    }
  };

  const formatCacheAge = () => {
    const jobsAge = getJobsCacheAge();
    const companiesAge = getCompaniesCacheAge();

    if (!jobsAge && !companiesAge) return 'Never updated';

    const maxAge = Math.max(jobsAge || 0, companiesAge || 0);

    if (maxAge < 60) return `${maxAge}s ago`;
    if (maxAge < 3600) return `${Math.floor(maxAge / 60)}m ago`;
    return `${Math.floor(maxAge / 3600)}h ago`;
  };

  const isLoading = jobsLoading || companiesLoading || isRefreshing;

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        onClick={handleRefresh}
        disabled={isLoading}
        className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[#BFBFBF] dark:border-[#404040] bg-[#F2F2F2]/75 dark:bg-[#0D0D0D]/60 px-5 py-2 text-sm font-medium text-[#404040] dark:text-[#F2F2F2] hover:bg-[#0D0D0D]/10 dark:hover:bg-[#F2F2F2]/10 shadow-sm hover:shadow-md active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D0D0D] dark:focus-visible:ring-[#F2F2F2]"
        title={`Last updated: ${formatCacheAge()}`}
      >
        <svg
          className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
        {showLabel && (
          <span>
            {isLoading ? 'Refreshing' : 'Refresh'}
          </span>
        )}
      </button>

      {showLabel && !isLoading && (
        <span className="text-xs text-[#8C8C8C]">
          Updated {formatCacheAge()}
        </span>
      )}
    </div>
  );
};

export default RefreshButton;
