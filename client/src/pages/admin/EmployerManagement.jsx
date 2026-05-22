import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCompanies } from '../../contexts/CompaniesContext';
import httpClient from '../../config/httpClient';
import { API_ENDPOINTS } from '../../config/api';
import CornerAccents from '../../components/CornerAccents';

const EmployerManagement = () => {
  const { companies: contextCompanies, loading: companiesLoading } = useCompanies();
  const [selectedCompanyId, setSelectedCompanyId] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [searchEmail, setSearchEmail] = useState('');
  const [searchedUser, setSearchedUser] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);

  const companies = contextCompanies;

  const handleAssignCompany = async () => {
    setError('');
    setSuccess('');

    if (!searchedUser || !selectedCompanyId) {
      setError('Please select a company');
      return;
    }

    try {
      setIsAssigning(true);
      const response = await httpClient.put(API_ENDPOINTS.ASSIGN_COMPANY_TO_EMPLOYER(searchedUser.userId), {
        companyId: parseInt(selectedCompanyId)
      });
      setSuccess(`Successfully assigned company to ${searchedUser.name}`);
      setSearchedUser(response.data);
    } catch (err) {
      console.error('Error assigning company:', err);
      setError(err.response?.data?.message || 'Failed to assign company');
    } finally {
      setIsAssigning(false);
    }
  };

  const handleSearchUser = async (e) => {
    e.preventDefault();
    setSearchError('');
    setSearchedUser(null);
    setError('');
    setSuccess('');
    setSelectedCompanyId('');

    if (!searchEmail.trim()) {
      setSearchError('Please enter an email address');
      return;
    }

    try {
      setIsSearching(true);
      const response = await httpClient.get(API_ENDPOINTS.SEARCH_USER_BY_EMAIL, {
        params: { email: searchEmail }
      });
      setSearchedUser(response.data);
      if (response.data.companyId) {
        setSelectedCompanyId(response.data.companyId.toString());
      }
      setSearchError('');
    } catch (err) {
      console.error('Error searching user:', err);
      if (err.response?.status === 404) {
        setSearchError('User not found with this email address');
      } else {
        setSearchError(err.response?.data?.message || 'Failed to search user');
      }
      setSearchedUser(null);
    } finally {
      setIsSearching(false);
    }
  };

  const handleElevateToEmployer = async (userId) => {
    setError('');
    setSuccess('');

    try {
      const response = await httpClient.put(API_ENDPOINTS.ELEVATE_TO_EMPLOYER(userId));
      setSuccess(`Successfully elevated ${response.data.name} to ROLE_EMPLOYER`);
      setSearchedUser(response.data);
    } catch (err) {
      console.error('Error elevating user:', err);
      setError(err.response?.data?.message || 'Failed to elevate user to employer');
    }
  };

  return (
    <div className="min-h-screen bg-[#ECECEC] dark:bg-[#0A0A0B] py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden transition-colors duration-300">
      <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Navigation */}
        <div className="mb-6">
          <Link
            to="/admin"
            className="group/link inline-flex items-center gap-2 font-mono text-[10px] uppercase font-bold tracking-wider text-fg/60 hover:text-fg transition-colors"
          >
            <span className="inline-block transition-transform duration-300 group-hover/link:-translate-x-1">←</span>
            <span>Back to Dashboard</span>
          </Link>
        </div>

        {/* Header */}
        <div className="border-b border-[#0A0A0B]/15 dark:border-[#ECECEC]/15 pb-6 mb-8">
          <div className="text-[10px] font-bold font-mono text-[#8C8C8E] uppercase tracking-wider mb-2">
            // ADMINISTRATIVE_PORTAL / EMPLOYER_ADMINISTRATION
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold font-sans uppercase text-fg tracking-tight mb-2">
            Employer Management
          </h1>
          <p className="text-xs font-mono text-[#5C5C5E] dark:text-[#8C8C8E] uppercase tracking-wider">
            Query user registry, elevate user roles, and establish organizational affiliations.
          </p>
        </div>

        {/* Success/Error alerts */}
        {success && (
          <div className="p-4 mb-6 bg-fg/5 border border-fg/15 flex items-start gap-3">
            <svg className="w-5 h-5 text-fg flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-xs font-mono text-fg uppercase tracking-wider">{success}</span>
          </div>
        )}
        {error && (
          <div className="p-4 mb-6 bg-red-500/10 border border-red-500/35 flex items-start gap-3">
            <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span className="text-xs font-mono text-red-500 uppercase tracking-wider">{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Search & Result */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Search Input Box */}
            <div className="border border-[#0A0A0B]/10 dark:border-[#ECECEC]/10 bg-[#FFFFFF] dark:bg-[#18181B] p-6 transition-all duration-300 relative group">
              <CornerAccents className="text-fg/20 group-hover:text-fg/40" />
              
              <h2 className="text-sm font-bold font-mono text-fg uppercase tracking-wider mb-4">// QUERY_USER_DATABASE</h2>
              
              <form onSubmit={handleSearchUser} className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 border border-[#0A0A0B]/15 dark:border-[#ECECEC]/15 focus-within:border-fg bg-[#0A0A0B]/5 dark:bg-[#ECECEC]/5 transition-all duration-300 relative group/field">
                  <CornerAccents className="opacity-0 group-focus-within/field:opacity-100" />
                  <label htmlFor="search-email" className="pt-3 px-4 block text-[9px] font-mono text-[#8C8C8E] uppercase tracking-wider">
                    USER EMAIL ADDRESS *
                  </label>
                  <input
                    id="search-email"
                    type="email"
                    value={searchEmail}
                    onChange={(e) => setSearchEmail(e.target.value)}
                    placeholder="Enter email to search..."
                    className="w-full bg-transparent px-4 pb-3 pt-1 font-mono text-xs text-fg focus:outline-none"
                    disabled={isSearching}
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSearching}
                  className="group/btn relative inline-flex min-h-11 items-center justify-center border border-[#0A0A0B] dark:border-[#ECECEC] bg-[#0A0A0B] text-[#ECECEC] dark:bg-[#ECECEC] dark:text-[#0A0A0B] px-6 py-3 font-mono text-xs uppercase font-bold tracking-wider hover:bg-transparent hover:text-fg transition-all duration-300 disabled:opacity-50"
                >
                  <CornerAccents className="opacity-0 group-hover/btn:opacity-100" />
                  <span>{isSearching ? 'SEARCHING...' : 'RUN_QUERY'}</span>
                </button>
              </form>

              {searchError && (
                <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 font-mono text-xs text-red-500 uppercase tracking-wider">
                  ERROR: {searchError}
                </div>
              )}
            </div>

            {/* User Search Result Card */}
            {searchedUser && (
              <div className="border border-[#0A0A0B]/10 dark:border-[#ECECEC]/10 bg-[#FFFFFF] dark:bg-[#18181B] p-6 transition-all duration-300 relative group">
                <CornerAccents className="text-fg/20" />
                
                <h3 className="text-sm font-bold font-mono text-fg uppercase tracking-wider mb-6">// QUERY_MATCH_FOUND</h3>
                
                <div className="border border-fg/10 bg-[#0A0A0B]/5 dark:bg-[#ECECEC]/5 divide-y divide-fg/10 font-mono text-xs mb-6">
                  
                  {/* Name */}
                  <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <span className="text-[#8C8C8E] uppercase">// NAME</span>
                    <span className="text-fg font-bold uppercase">{searchedUser.name}</span>
                  </div>

                  {/* Email */}
                  <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <span className="text-[#8C8C8E] uppercase">// EMAIL</span>
                    <span className="text-fg break-all font-bold">{searchedUser.email}</span>
                  </div>

                  {/* Phone */}
                  <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <span className="text-[#8C8C8E] uppercase">// MOBILE_NUMBER</span>
                    <span className="text-fg font-bold">{searchedUser.mobileNumber || 'N/A'}</span>
                  </div>

                  {/* Role */}
                  <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <span className="text-[#8C8C8E] uppercase">// CURRENT_ROLE</span>
                    <span className="px-2 py-0.5 border border-fg/20 text-[10px] font-bold text-fg bg-fg/10">
                      {searchedUser.role}
                    </span>
                  </div>

                  {/* Assigned Company */}
                  {searchedUser.companyName && (
                    <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <span className="text-[#8C8C8E] uppercase">// ASSIGNED_COMPANY</span>
                      <span className="text-fg font-bold uppercase">{searchedUser.companyName}</span>
                    </div>
                  )}

                  {/* Created At */}
                  {searchedUser.createdAt && (
                    <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <span className="text-[#8C8C8E] uppercase">// CREATION_DATE</span>
                      <span className="text-fg font-bold">
                        {new Date(searchedUser.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        }).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>

                {/* Actions Block */}
                <div className="border-t border-fg/10 pt-6">
                  {searchedUser.role === 'ROLE_JOB_SEEKER' && (
                    <div className="flex flex-col items-start gap-3">
                      <p className="font-mono text-[10px] text-[#5C5C5E] dark:text-[#8C8C8E] uppercase tracking-wider leading-relaxed">
                        This user is currently registered as a job seeker. You can elevate their authorization level to write and post listings.
                      </p>
                      <button
                        onClick={() => handleElevateToEmployer(searchedUser.userId)}
                        className="group/btn relative inline-flex min-h-11 items-center justify-center border border-[#0A0A0B] dark:border-[#ECECEC] bg-[#0A0A0B] text-[#ECECEC] dark:bg-[#ECECEC] dark:text-[#0A0A0B] px-6 py-3 font-mono text-xs uppercase font-bold tracking-wider hover:bg-transparent hover:text-fg transition-all duration-300"
                      >
                        <CornerAccents className="opacity-0 group-hover/btn:opacity-100" />
                        <span>ELEVATE TO EMPLOYER ROLE</span>
                      </button>
                    </div>
                  )}

                  {searchedUser.role === 'ROLE_EMPLOYER' && (
                    <div className="border border-fg/10 bg-fg/5 p-4 space-y-4">
                      <h4 className="font-mono text-[10px] font-bold text-fg uppercase tracking-wider">
                        {searchedUser.companyId ? '// REASSIGN_AFFILIATION' : '// ESTABLISH_AFFILIATION'}
                      </h4>
                      <div className="flex flex-col sm:flex-row gap-4">
                        
                        {/* Company Dropdown Select */}
                        <div className="flex-1 border border-[#0A0A0B]/15 dark:border-[#ECECEC]/15 bg-transparent relative">
                          <select
                            value={selectedCompanyId}
                            onChange={(e) => setSelectedCompanyId(e.target.value)}
                            className="w-full bg-transparent p-3 pr-8 font-mono text-xs uppercase text-fg focus:outline-none appearance-none cursor-pointer"
                            disabled={isAssigning || companiesLoading}
                          >
                            <option value="" className="bg-[#FFFFFF] dark:bg-[#18181B] text-fg">-- Select Company --</option>
                            {companies.map((company) => (
                              <option key={company.id} value={company.id} className="bg-[#FFFFFF] dark:bg-[#18181B] text-fg">
                                {company.name}
                              </option>
                            ))}
                          </select>
                          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-fg">
                            <svg className="fill-current h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                            </svg>
                          </div>
                        </div>

                        <button
                          onClick={handleAssignCompany}
                          disabled={!selectedCompanyId || isAssigning}
                          className="group/btn relative inline-flex min-h-11 items-center justify-center border border-[#0A0A0B] dark:border-[#ECECEC] bg-[#0A0A0B] text-[#ECECEC] dark:bg-[#ECECEC] dark:text-[#0A0A0B] px-6 py-3 font-mono text-xs uppercase font-bold tracking-wider hover:bg-transparent hover:text-fg transition-all duration-300 disabled:opacity-50"
                        >
                          <CornerAccents className="opacity-0 group-hover/btn:opacity-100" />
                          <span>{isAssigning ? 'ASSIGNING...' : 'COMMIT_AFFILIATION'}</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {searchedUser.role === 'ROLE_ADMIN' && (
                    <div className="p-4 border border-red-500/20 bg-red-500/5 font-mono text-xs text-red-500 uppercase tracking-wider text-center">
                      SYSTEM_LOCKED: ADMIN PRIVILEGES CANNOT BE ALTERED VIA THIS SUITE.
                    </div>
                  )}
                </div>

              </div>
            )}

          </div>

          {/* Right Column: Information Panel */}
          <div>
            <div className="border border-[#0A0A0B]/10 dark:border-[#ECECEC]/10 bg-[#FFFFFF] dark:bg-[#18181B] p-6 transition-all duration-300 relative group">
              <CornerAccents className="text-fg/20 group-hover:text-fg/45" />
              
              <h2 className="text-lg font-bold uppercase text-fg font-sans tracking-wide mb-2">Elevation Guidelines</h2>
              <p className="font-mono text-xs text-[#5C5C5E] dark:text-[#8C8C8E] uppercase tracking-wider leading-relaxed mb-6">
                Understand the hierarchy and rules of SHGL user elevation before committing changes.
              </p>

              <div className="space-y-4 font-mono text-[11px] leading-relaxed text-fg/80 uppercase">
                <div className="border-l-2 border-fg/20 pl-3">
                  <div className="font-bold text-fg">// ROLE_JOB_SEEKER</div>
                  <div className="text-fg/60 mt-0.5">Initial candidate account state. Permitted to search and apply for jobs.</div>
                </div>

                <div className="border-l-2 border-fg/20 pl-3">
                  <div className="font-bold text-fg">// ROLE_EMPLOYER</div>
                  <div className="text-fg/60 mt-0.5">Authorized business account. Permitted to post job listings, check applicants log, and coordinate. Requires company affiliation.</div>
                </div>

                <div className="border-l-2 border-fg/20 pl-3">
                  <div className="font-bold text-fg">// AFFILIATION_RULES</div>
                  <div className="text-fg/60 mt-0.5">Employers must be bound to exactly one registered company profile before they can publish system jobs.</div>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default EmployerManagement;
