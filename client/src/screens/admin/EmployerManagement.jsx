import { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useCompanies } from '../../contexts/CompaniesContext';
import httpClient from '../../config/httpClient';
import { API_ENDPOINTS } from '../../config/api';

const EmployerManagement = () => {
  const { theme } = useTheme();
  const { companies: contextCompanies, loading: companiesLoading } = useCompanies();
  const [selectedCompanyId, setSelectedCompanyId] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // State for user search and elevation
  const [searchEmail, setSearchEmail] = useState('');
  const [searchedUser, setSearchedUser] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);

  // Use companies from context
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

  // New functions for user search and elevation
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
      // Pre-populate company dropdown if user already has a company assigned
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
    <div>
      <div>
        {/* Header */}
        <div>
          <h1>
            Employer Management
          </h1>
          <p>
            Search users, elevate to employer role, and assign companies
          </p>
        </div>

        {/* User Search and Elevation Section */}
        <div>
          <h2>
            Search and Elevate User
          </h2>

          <form onSubmit={handleSearchUser}>
            <div>
              <div>
                <input
                  type="email"
                  value={searchEmail}
                  onChange={(e) => setSearchEmail(e.target.value)}
                  placeholder="Enter user email address"
                 
                  disabled={isSearching}
                />
              </div>
              <button
                type="submit"
                disabled={isSearching}
               
              >
                {isSearching ? 'Searching...' : 'Search User'}
              </button>
            </div>
          </form>

          {/* Search Error */}
          {searchError && (
            <div>
              {searchError}
            </div>
          )}

          {/* Searched User Result */}
          {searchedUser && (
            <div>
              <h3>
                User Found
              </h3>

              <div>
                <div>
                  <p>Name</p>
                  <p>
                    {searchedUser.name}
                  </p>
                </div>
                <div>
                  <p>Email</p>
                  <p>
                    {searchedUser.email}
                  </p>
                </div>
                <div>
                  <p>Mobile Number</p>
                  <p>
                    {searchedUser.mobileNumber || 'N/A'}
                  </p>
                </div>
                <div>
                  <p>Current Role</p>
                  <p>
                    <span>
                      {searchedUser.role}
                    </span>
                  </p>
                </div>
                {searchedUser.companyName && (
                  <div>
                    <p>Assigned Company</p>
                    <p>
                      {searchedUser.companyName}
                    </p>
                  </div>
                )}
                {searchedUser.createdAt && (
                  <div>
                    <p>Member Since</p>
                    <p>
                      {new Date(searchedUser.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                )}
              </div>

              <div>
                {searchedUser.role === 'ROLE_JOB_SEEKER' && (
                  <button
                    onClick={() => handleElevateToEmployer(searchedUser.userId)}
                   
                  >
                    Elevate to Employer
                  </button>
                )}

                {searchedUser.role === 'ROLE_EMPLOYER' && (
                  <div>
                    <div>
                      <label>
                        {searchedUser.companyId ? 'Reassign Company' : 'Assign Company'}
                      </label>
                      <div>
                        <select
                          value={selectedCompanyId}
                          onChange={(e) => setSelectedCompanyId(e.target.value)}
                         
                          disabled={isAssigning || companiesLoading}
                        >
                          <option value="">-- Select a company --</option>
                          {companies.map((company) => (
                            <option key={company.id} value={company.id}>
                              {company.name}
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={handleAssignCompany}
                          disabled={!selectedCompanyId || isAssigning}
                         
                        >
                          {isAssigning ? 'Assigning...' : 'Assign'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {searchedUser.role === 'ROLE_ADMIN' && (
                  <div>
                    Admin users cannot be elevated or assigned to companies
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div>
            {success}
          </div>
        )}
        {error && (
          <div>
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployerManagement;
