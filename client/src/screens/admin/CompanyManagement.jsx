"use client";

import { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useCompanies } from '../../contexts/CompaniesContext';
import httpClient from '../../config/httpClient';
import { API_ENDPOINTS } from '../../config/api';

const CompanyManagement = () => {
  const { theme } = useTheme();
  const { companies: contextCompanies, loading: contextLoading, refetch } = useCompanies();
  const [editingCompanyId, setEditingCompanyId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    logo: '',
    industry: '',
    size: '',
    rating: '',
    locations: '',
    founded: '',
    description: '',
    employees: '',
    website: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState(null);

  // Use companies from context - no need to fetch separately
  const companies = contextCompanies;
  const isLoading = contextLoading;

  const handleSubmit = async (e, companyId = null) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      setIsSaving(true);
      // Prepare data for backend
      const dataToSend = {
        ...formData,
        rating: formData.rating ? parseFloat(formData.rating) : null,
        founded: formData.founded ? parseInt(formData.founded) : null,
        employees: formData.employees ? parseInt(formData.employees) : null
      };

      if (companyId) {
        // Update existing company
        await httpClient.put(
          API_ENDPOINTS.COMPANY_BY_ID(companyId),
          dataToSend
        );
        setSuccess('Company updated successfully');
      } else {
        // Create new company
        await httpClient.post(API_ENDPOINTS.COMPANIES, dataToSend);
        setSuccess('Company created successfully');
      }

      // Reset form
      resetForm();
      setEditingCompanyId(null);
      setIsAddingNew(false);

      // Refresh companies data from backend to get latest
      await refetch();

      // Hide success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error saving company:', err);
      setError(err.response?.data?.message || 'Failed to save company');
      // Hide error message after 5 seconds
      setTimeout(() => setError(''), 5000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (company) => {
    setEditingCompanyId(company.id);
    setIsAddingNew(false);
    setFormData({
      name: company.name || '',
      logo: company.logo || '',
      industry: company.industry || '',
      size: company.size || '',
      rating: company.rating || '',
      locations: company.locations || '',
      founded: company.founded || '',
      description: company.description || '',
      employees: company.employees || '',
      website: company.website || ''
    });
    setError('');
    setSuccess('');
  };

  const handleAddNew = () => {
    setIsAddingNew(true);
    setEditingCompanyId(null);
    resetForm();
  };

  const handleCancel = () => {
    setEditingCompanyId(null);
    setIsAddingNew(false);
    resetForm();
    setError('');
  };

  const handleDeleteClick = (company) => {
    setDeleteConfirmation(company);
  };

  const confirmDelete = async () => {
    if (!deleteConfirmation) return;

    try {
      await httpClient.delete(API_ENDPOINTS.COMPANY_BY_ID(deleteConfirmation.id));
      setSuccess('Company deleted successfully');
      setDeleteConfirmation(null);

      // Refresh companies data from backend to get latest
      await refetch();
    } catch (err) {
      console.error('Error deleting company:', err);
      setError(err.response?.data?.message || 'Failed to delete company');
      setDeleteConfirmation(null);
    }
  };

  const cancelDelete = () => {
    setDeleteConfirmation(null);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      logo: '',
      industry: '',
      size: '',
      rating: '',
      locations: '',
      founded: '',
      description: '',
      employees: '',
      website: ''
    });
    setError('');
  };

  return (
    <div>
      <div>
        {/* Header */}
        <div>
          <div>
            <h1>
              Company Management
            </h1>
            <p>
              Create and manage companies in the system
            </p>
          </div>
          <button
            onClick={handleAddNew}
            disabled={isAddingNew || editingCompanyId !== null}
           
          >
            + Add New Company
          </button>
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

        {/* Companies Table */}
        {isLoading ? (
          <div>
            <div></div>
          </div>
        ) : (
          <div>
            <div>
              <table>
                <thead>
                  <tr>
                    <th>
                      Company
                    </th>
                    <th>
                      Industry
                    </th>
                    <th>
                      Size
                    </th>
                    <th>
                      Rating
                    </th>
                    <th>
                      Founded
                    </th>
                    <th>
                      Employees
                    </th>
                    <th>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {/* Add New Company Row */}
                  {isAddingNew && (
                    <tr>
                      <td colSpan="7">
                        <h3>Add New Company</h3>
                        <form onSubmit={(e) => handleSubmit(e, null)}>
                          <div>
                            <div>
                              <label>
                                Company Name *
                              </label>
                              <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                               
                                placeholder="Enter company name"
                              />
                            </div>
                            <div>
                              <label>
                                Industry
                              </label>
                              <input
                                type="text"
                                value={formData.industry}
                                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                               
                                placeholder="e.g. Technology"
                              />
                            </div>
                            <div>
                              <label>
                                Size
                              </label>
                              <input
                                type="text"
                                value={formData.size}
                                onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                               
                                placeholder="e.g. Medium"
                              />
                            </div>
                            <div>
                              <label>
                                Rating
                              </label>
                              <input
                                type="number"
                                step="0.1"
                                min="0"
                                max="5"
                                value={formData.rating}
                                onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                               
                                placeholder="0-5"
                              />
                            </div>
                            <div>
                              <label>
                                Founded
                              </label>
                              <input
                                type="number"
                                min="1800"
                                max={new Date().getFullYear()}
                                value={formData.founded}
                                onChange={(e) => setFormData({ ...formData, founded: e.target.value })}
                               
                                placeholder="Year"
                              />
                            </div>
                            <div>
                              <label>
                                Employees
                              </label>
                              <input
                                type="number"
                                min="1"
                                value={formData.employees}
                                onChange={(e) => setFormData({ ...formData, employees: e.target.value })}
                               
                                placeholder="Number"
                              />
                            </div>
                          </div>
                          <div>
                            <div>
                              <label>
                                Logo Path
                              </label>
                              <input
                                type="text"
                                value={formData.logo}
                                onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                               
                                placeholder="/logos/company.png"
                              />
                            </div>
                            <div>
                              <label>
                                Locations
                              </label>
                              <input
                                type="text"
                                value={formData.locations}
                                onChange={(e) => setFormData({ ...formData, locations: e.target.value })}
                               
                                placeholder="e.g. New York, London"
                              />
                            </div>
                            <div>
                              <label>
                                Website
                              </label>
                              <input
                                type="url"
                                value={formData.website}
                                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                               
                                placeholder="https://example.com"
                              />
                            </div>
                          </div>
                          <div>
                            <label>
                              Description
                            </label>
                            <textarea
                              rows={2}
                              value={formData.description}
                              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                             
                              placeholder="Company description"
                            />
                          </div>
                          <div>
                            <button
                              type="submit"
                              disabled={isSaving}
                             
                            >
                              {isSaving ? 'Saving...' : 'Save'}
                            </button>
                            <button
                              type="button"
                              onClick={handleCancel}
                             
                            >
                              Cancel
                            </button>
                          </div>
                        </form>
                      </td>
                    </tr>
                  )}

                  {companies.length === 0 && !isAddingNew ? (
                    <tr>
                      <td colSpan="7">
                        No companies found. Click "Add New Company" to create one.
                      </td>
                    </tr>
                  ) : (
                    companies.map((company) => (
                      <>
                        {/* View Mode Row (always show) */}
                        <tr key={company.id}>
                          {/* Company (Logo + Name) */}
                          <td>
                            <div>
                              {company.logo ? (
                                <img
                                  src={company.logo}
                                  alt={company.name}
                                 
                                />
                              ) : (
                                <div>
                                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                  </svg>
                                </div>
                              )}
                              <div>
                                {company.name}
                              </div>
                            </div>
                          </td>

                          {/* Industry */}
                          <td>
                            {company.industry || 'N/A'}
                          </td>

                          {/* Size */}
                          <td>
                            {company.size || 'N/A'}
                          </td>

                          {/* Rating */}
                          <td>
                            {company.rating ? (
                              <div>
                                <svg fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                                <span>{parseFloat(company.rating).toFixed(1)}</span>
                              </div>
                            ) : (
                              'N/A'
                            )}
                          </td>

                          {/* Founded */}
                          <td>
                            {company.founded || 'N/A'}
                          </td>

                          {/* Employees */}
                          <td>
                            {company.employees ? company.employees.toLocaleString() : 'N/A'}
                          </td>

                          {/* Actions */}
                          <td>
                            <div>
                              <button
                                onClick={() => handleEdit(company)}
                                disabled={editingCompanyId !== null || isAddingNew}
                               
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteClick(company)}
                                disabled={editingCompanyId !== null || isAddingNew}
                               
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                        {/* Edit Mode Form (show below summary row if editing) */}
                        {editingCompanyId === company.id && (
                          <tr>
                            <td colSpan="7">
                              <h3>Edit Company</h3>
                              <form onSubmit={(e) => handleSubmit(e, company.id)}>
                                <div>
                                  <div>
                                    <label>
                                      Company Name *
                                    </label>
                                    <input
                                      type="text"
                                      required
                                      value={formData.name}
                                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                     
                                      placeholder="Enter company name"
                                    />
                                  </div>
                                  <div>
                                    <label>
                                      Industry
                                    </label>
                                    <input
                                      type="text"
                                      value={formData.industry}
                                      onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                                     
                                      placeholder="e.g. Technology"
                                    />
                                  </div>
                                  <div>
                                    <label>
                                      Size
                                    </label>
                                    <input
                                      type="text"
                                      value={formData.size}
                                      onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                                     
                                      placeholder="e.g. Medium"
                                    />
                                  </div>
                                  <div>
                                    <label>
                                      Rating
                                    </label>
                                    <input
                                      type="number"
                                      step="0.1"
                                      min="0"
                                      max="5"
                                      value={formData.rating}
                                      onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                                     
                                      placeholder="0-5"
                                    />
                                  </div>
                                  <div>
                                    <label>
                                      Founded
                                    </label>
                                    <input
                                      type="number"
                                      min="1800"
                                      max={new Date().getFullYear()}
                                      value={formData.founded}
                                      onChange={(e) => setFormData({ ...formData, founded: e.target.value })}
                                     
                                      placeholder="Year"
                                    />
                                  </div>
                                  <div>
                                    <label>
                                      Employees
                                    </label>
                                    <input
                                      type="number"
                                      min="1"
                                      value={formData.employees}
                                      onChange={(e) => setFormData({ ...formData, employees: e.target.value })}
                                     
                                      placeholder="Number"
                                    />
                                  </div>
                                </div>
                                <div>
                                  <div>
                                    <label>
                                      Logo Path
                                    </label>
                                    <input
                                      type="text"
                                      value={formData.logo}
                                      onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                                     
                                      placeholder="/logos/company.png"
                                    />
                                  </div>
                                  <div>
                                    <label>
                                      Locations
                                    </label>
                                    <input
                                      type="text"
                                      value={formData.locations}
                                      onChange={(e) => setFormData({ ...formData, locations: e.target.value })}
                                     
                                      placeholder="e.g. New York, London"
                                    />
                                  </div>
                                  <div>
                                    <label>
                                      Website
                                    </label>
                                    <input
                                      type="url"
                                      value={formData.website}
                                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                                     
                                      placeholder="https://example.com"
                                    />
                                  </div>
                                </div>
                                <div>
                                  <label>
                                    Description
                                  </label>
                                  <textarea
                                    rows={2}
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                   
                                    placeholder="Company description"
                                  />
                                </div>
                                <div>
                                  <button
                                    type="submit"
                                    disabled={isSaving}
                                   
                                  >
                                    {isSaving ? 'Saving...' : 'Update'}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={handleCancel}
                                   
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </form>
                            </td>
                          </tr>
                        )}
                      </>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteConfirmation && (
          <div>
            <div>
              <div>
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>

              <h2>
                Delete Company
              </h2>

              <p>
                Are you sure you want to delete <span>{deleteConfirmation.name}</span>? This action cannot be undone.
              </p>

              <div>
                <button
                  onClick={cancelDelete}
                 
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                 
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompanyManagement;
