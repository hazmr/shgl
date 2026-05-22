import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCompanies } from '../../contexts/CompaniesContext';
import httpClient from '../../config/httpClient';
import { API_ENDPOINTS } from '../../config/api';
import CornerAccents from '../../components/CornerAccents';

const CompanyManagement = () => {
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

  const companies = contextCompanies;
  const isLoading = contextLoading;

  const handleSubmit = async (e, companyId = null) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      setIsSaving(true);
      const dataToSend = {
        ...formData,
        rating: formData.rating ? parseFloat(formData.rating) : null,
        founded: formData.founded ? parseInt(formData.founded) : null,
        employees: formData.employees ? parseInt(formData.employees) : null
      };

      if (companyId) {
        await httpClient.put(
          API_ENDPOINTS.COMPANY_BY_ID(companyId),
          dataToSend
        );
        setSuccess('Company updated successfully');
      } else {
        await httpClient.post(API_ENDPOINTS.COMPANIES, dataToSend);
        setSuccess('Company created successfully');
      }

      resetForm();
      setEditingCompanyId(null);
      setIsAddingNew(false);

      await refetch();

      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error saving company:', err);
      setError(err.response?.data?.message || 'Failed to save company');
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
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#0A0A0B]/15 dark:border-[#ECECEC]/15 pb-6 mb-8">
          <div>
            <div className="text-[10px] font-bold font-mono text-[#8C8C8E] uppercase tracking-wider mb-2">
              // ADMINISTRATIVE_PORTAL / COMPANY_REGISTRY
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold font-sans uppercase text-fg tracking-tight mb-2">
              Company Management
            </h1>
            <p className="text-xs font-mono text-[#5C5C5E] dark:text-[#8C8C8E] uppercase tracking-wider">
              Create, audit, and manage database company profiles.
            </p>
          </div>
          <button
            onClick={handleAddNew}
            disabled={isAddingNew || editingCompanyId !== null}
            className="group/btn relative inline-flex min-h-11 items-center justify-center border border-[#0A0A0B] dark:border-[#ECECEC] bg-[#0A0A0B] text-[#ECECEC] dark:bg-[#ECECEC] dark:text-[#0A0A0B] px-6 py-3 font-mono text-xs uppercase font-bold tracking-wider hover:bg-transparent hover:text-fg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <CornerAccents className="opacity-0 group-hover/btn:opacity-100" />
            <span>ADD NEW COMPANY</span>
          </button>
        </div>

        {/* Success/Error Notifications */}
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

        {/* Add or Edit Panel (Conditionally Rendered) */}
        {(isAddingNew || editingCompanyId !== null) && (
          <div className="border border-[#0A0A0B]/15 dark:border-[#ECECEC]/15 bg-[#FFFFFF] dark:bg-[#18181B] p-6 sm:p-8 mb-8 transition-all duration-300 relative group">
            <CornerAccents className="text-fg/20" />
            <h3 className="text-lg font-bold font-sans uppercase text-fg tracking-wide mb-6">
              {isAddingNew ? '// 01. CREATE_NEW_COMPANY' : `// 02. EDIT_COMPANY_REGISTRY (ID: ${editingCompanyId})`}
            </h3>
            
            <form onSubmit={(e) => handleSubmit(e, editingCompanyId)} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                
                {/* Name */}
                <div className="border border-[#0A0A0B]/15 dark:border-[#ECECEC]/15 focus-within:border-fg bg-[#0A0A0B]/5 dark:bg-[#ECECEC]/5 transition-all duration-300 relative group/field">
                  <CornerAccents className="opacity-0 group-focus-within/field:opacity-100" />
                  <label className="pt-3 px-4 block text-[9px] font-mono text-[#8C8C8E] uppercase tracking-wider">Company Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-transparent px-4 pb-3 pt-1 font-mono text-xs uppercase text-fg focus:outline-none"
                    placeholder="Enter company name"
                  />
                </div>

                {/* Industry */}
                <div className="border border-[#0A0A0B]/15 dark:border-[#ECECEC]/15 focus-within:border-fg bg-[#0A0A0B]/5 dark:bg-[#ECECEC]/5 transition-all duration-300 relative group/field">
                  <CornerAccents className="opacity-0 group-focus-within/field:opacity-100" />
                  <label className="pt-3 px-4 block text-[9px] font-mono text-[#8C8C8E] uppercase tracking-wider">Industry</label>
                  <input
                    type="text"
                    value={formData.industry}
                    onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                    className="w-full bg-transparent px-4 pb-3 pt-1 font-mono text-xs uppercase text-fg focus:outline-none"
                    placeholder="e.g. Technology"
                  />
                </div>

                {/* Size */}
                <div className="border border-[#0A0A0B]/15 dark:border-[#ECECEC]/15 focus-within:border-fg bg-[#0A0A0B]/5 dark:bg-[#ECECEC]/5 transition-all duration-300 relative group/field">
                  <CornerAccents className="opacity-0 group-focus-within/field:opacity-100" />
                  <label className="pt-3 px-4 block text-[9px] font-mono text-[#8C8C8E] uppercase tracking-wider">Size</label>
                  <input
                    type="text"
                    value={formData.size}
                    onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                    className="w-full bg-transparent px-4 pb-3 pt-1 font-mono text-xs uppercase text-fg focus:outline-none"
                    placeholder="e.g. Medium"
                  />
                </div>

                {/* Rating */}
                <div className="border border-[#0A0A0B]/15 dark:border-[#ECECEC]/15 focus-within:border-fg bg-[#0A0A0B]/5 dark:bg-[#ECECEC]/5 transition-all duration-300 relative group/field">
                  <CornerAccents className="opacity-0 group-focus-within/field:opacity-100" />
                  <label className="pt-3 px-4 block text-[9px] font-mono text-[#8C8C8E] uppercase tracking-wider">Rating (0.0 - 5.0)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="5"
                    value={formData.rating}
                    onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                    className="w-full bg-transparent px-4 pb-3 pt-1 font-mono text-xs uppercase text-fg focus:outline-none"
                    placeholder="e.g. 4.5"
                  />
                </div>

                {/* Founded */}
                <div className="border border-[#0A0A0B]/15 dark:border-[#ECECEC]/15 focus-within:border-fg bg-[#0A0A0B]/5 dark:bg-[#ECECEC]/5 transition-all duration-300 relative group/field">
                  <CornerAccents className="opacity-0 group-focus-within/field:opacity-100" />
                  <label className="pt-3 px-4 block text-[9px] font-mono text-[#8C8C8E] uppercase tracking-wider">Founded (Year)</label>
                  <input
                    type="number"
                    min="1800"
                    max={new Date().getFullYear()}
                    value={formData.founded}
                    onChange={(e) => setFormData({ ...formData, founded: e.target.value })}
                    className="w-full bg-transparent px-4 pb-3 pt-1 font-mono text-xs uppercase text-fg focus:outline-none"
                    placeholder="e.g. 2012"
                  />
                </div>

                {/* Employees */}
                <div className="border border-[#0A0A0B]/15 dark:border-[#ECECEC]/15 focus-within:border-fg bg-[#0A0A0B]/5 dark:bg-[#ECECEC]/5 transition-all duration-300 relative group/field">
                  <CornerAccents className="opacity-0 group-focus-within/field:opacity-100" />
                  <label className="pt-3 px-4 block text-[9px] font-mono text-[#8C8C8E] uppercase tracking-wider">Employees</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.employees}
                    onChange={(e) => setFormData({ ...formData, employees: e.target.value })}
                    className="w-full bg-transparent px-4 pb-3 pt-1 font-mono text-xs uppercase text-fg focus:outline-none"
                    placeholder="e.g. 250"
                  />
                </div>

                {/* Logo Path */}
                <div className="border border-[#0A0A0B]/15 dark:border-[#ECECEC]/15 focus-within:border-fg bg-[#0A0A0B]/5 dark:bg-[#ECECEC]/5 transition-all duration-300 relative group/field">
                  <CornerAccents className="opacity-0 group-focus-within/field:opacity-100" />
                  <label className="pt-3 px-4 block text-[9px] font-mono text-[#8C8C8E] uppercase tracking-wider">Logo Path</label>
                  <input
                    type="text"
                    value={formData.logo}
                    onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                    className="w-full bg-transparent px-4 pb-3 pt-1 font-mono text-xs text-fg focus:outline-none"
                    placeholder="/logos/company.png"
                  />
                </div>

                {/* Locations */}
                <div className="border border-[#0A0A0B]/15 dark:border-[#ECECEC]/15 focus-within:border-fg bg-[#0A0A0B]/5 dark:bg-[#ECECEC]/5 transition-all duration-300 relative group/field">
                  <CornerAccents className="opacity-0 group-focus-within/field:opacity-100" />
                  <label className="pt-3 px-4 block text-[9px] font-mono text-[#8C8C8E] uppercase tracking-wider">Locations</label>
                  <input
                    type="text"
                    value={formData.locations}
                    onChange={(e) => setFormData({ ...formData, locations: e.target.value })}
                    className="w-full bg-transparent px-4 pb-3 pt-1 font-mono text-xs uppercase text-fg focus:outline-none"
                    placeholder="e.g. New York, London"
                  />
                </div>

                {/* Website */}
                <div className="border border-[#0A0A0B]/15 dark:border-[#ECECEC]/15 focus-within:border-fg bg-[#0A0A0B]/5 dark:bg-[#ECECEC]/5 transition-all duration-300 relative group/field">
                  <CornerAccents className="opacity-0 group-focus-within/field:opacity-100" />
                  <label className="pt-3 px-4 block text-[9px] font-mono text-[#8C8C8E] uppercase tracking-wider">Website URL</label>
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    className="w-full bg-transparent px-4 pb-3 pt-1 font-mono text-xs text-fg focus:outline-none"
                    placeholder="https://example.com"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="border border-[#0A0A0B]/15 dark:border-[#ECECEC]/15 focus-within:border-fg bg-[#0A0A0B]/5 dark:bg-[#ECECEC]/5 transition-all duration-300 relative group/field">
                <CornerAccents className="opacity-0 group-focus-within/field:opacity-100" />
                <label className="pt-3 px-4 block text-[9px] font-mono text-[#8C8C8E] uppercase tracking-wider">Description</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-transparent px-4 pb-3 pt-1 font-mono text-xs text-fg focus:outline-none resize-none"
                  placeholder="Provide quantitative profile description..."
                />
              </div>

              {/* Form Buttons */}
              <div className="flex justify-end gap-4 border-t border-[#0A0A0B]/10 dark:border-[#ECECEC]/10 pt-6">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="group/btn relative inline-flex min-h-11 items-center justify-center border border-[#0A0A0B]/15 dark:border-[#ECECEC]/15 bg-transparent text-fg px-6 py-3 font-mono text-xs uppercase font-bold tracking-wider hover:bg-fg hover:text-surface transition-all duration-300"
                >
                  <CornerAccents className="opacity-0 group-hover/btn:opacity-100" />
                  <span>CANCEL</span>
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="group/btn relative inline-flex min-h-11 items-center justify-center border border-[#0A0A0B] dark:border-[#ECECEC] bg-[#0A0A0B] text-[#ECECEC] dark:bg-[#ECECEC] dark:text-[#0A0A0B] px-6 py-3 font-mono text-xs uppercase font-bold tracking-wider hover:bg-transparent hover:text-fg transition-all duration-300"
                >
                  <CornerAccents className="opacity-0 group-hover/btn:opacity-100" />
                  <span>{isSaving ? 'SAVING...' : 'SAVE CHANGES'}</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Companies Registry Table */}
        {isLoading ? (
          <div className="border border-[#0A0A0B]/10 dark:border-[#ECECEC]/10 bg-[#FFFFFF] dark:bg-[#18181B] py-20 flex flex-col items-center gap-4 relative">
            <CornerAccents className="text-fg/20" />
            <div className="w-8 h-8 border-2 border-fg border-t-transparent animate-spin"></div>
            <p className="font-mono text-xs uppercase tracking-widest text-[#8C8C8E]">RETRIEVING DB_COMPANIES...</p>
          </div>
        ) : (
          <div className="border border-[#0A0A0B]/10 dark:border-[#ECECEC]/10 bg-[#FFFFFF] dark:bg-[#18181B] overflow-hidden transition-all duration-300 relative group">
            <CornerAccents className="text-fg/15 group-hover:text-fg/30" />
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#0A0A0B]/15 dark:border-[#ECECEC]/15 bg-[#0A0A0B]/5 dark:bg-[#ECECEC]/5">
                    <th className="p-4 font-mono text-[10px] font-bold text-[#8C8C8E] uppercase tracking-wider">// COMPANY</th>
                    <th className="p-4 font-mono text-[10px] font-bold text-[#8C8C8E] uppercase tracking-wider">// INDUSTRY</th>
                    <th className="p-4 font-mono text-[10px] font-bold text-[#8C8C8E] uppercase tracking-wider">// SIZE</th>
                    <th className="p-4 font-mono text-[10px] font-bold text-[#8C8C8E] uppercase tracking-wider">// RATING</th>
                    <th className="p-4 font-mono text-[10px] font-bold text-[#8C8C8E] uppercase tracking-wider">// FOUNDED</th>
                    <th className="p-4 font-mono text-[10px] font-bold text-[#8C8C8E] uppercase tracking-wider">// EMPLOYEES</th>
                    <th className="p-4 font-mono text-[10px] font-bold text-[#8C8C8E] uppercase tracking-wider text-right">// ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#0A0A0B]/10 dark:divide-[#ECECEC]/10">
                  {companies.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="p-12 text-center font-mono text-xs text-[#8C8C8E] uppercase tracking-widest">
                        NULL_REGISTRY: NO COMPANIES DETECTED
                      </td>
                    </tr>
                  ) : (
                    companies.map((company) => (
                      <tr key={company.id} className="hover:bg-[#0A0A0B]/5 dark:hover:bg-[#ECECEC]/5 transition-colors">
                        
                        {/* Company Logo + Name */}
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 border border-[#0A0A0B]/10 dark:border-[#ECECEC]/10 flex items-center justify-center bg-[#0A0A0B]/5 dark:bg-[#ECECEC]/5 font-mono text-xs font-bold text-fg flex-shrink-0 relative overflow-hidden">
                              {company.logo ? (
                                <img src={company.logo} alt={company.name} className="w-full h-full object-contain" />
                              ) : (
                                <span>{company.name?.charAt(0) || 'C'}</span>
                              )}
                            </div>
                            <span className="font-bold uppercase text-fg font-sans text-sm tracking-wide">{company.name}</span>
                          </div>
                        </td>

                        {/* Industry */}
                        <td className="p-4 font-mono text-xs text-fg/80 uppercase tracking-wider">
                          {company.industry || 'N/A'}
                        </td>

                        {/* Size */}
                        <td className="p-4 font-mono text-xs text-fg/80 uppercase tracking-wider">
                          {company.size || 'N/A'}
                        </td>

                        {/* Rating */}
                        <td className="p-4 font-mono text-xs text-fg/80">
                          {company.rating ? (
                            <div className="flex items-center gap-1.5 text-yellow-500">
                              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                              <span className="font-bold text-fg">{parseFloat(company.rating).toFixed(1)}</span>
                            </div>
                          ) : (
                            <span className="text-fg/40">N/A</span>
                          )}
                        </td>

                        {/* Founded */}
                        <td className="p-4 font-mono text-xs text-fg/80">
                          {company.founded || <span className="text-fg/40">N/A</span>}
                        </td>

                        {/* Employees */}
                        <td className="p-4 font-mono text-xs text-fg/80">
                          {company.employees ? company.employees.toLocaleString() : <span className="text-fg/40">N/A</span>}
                        </td>

                        {/* Actions */}
                        <td className="p-4 text-right">
                          <div className="inline-flex gap-2">
                            <button
                              onClick={() => handleEdit(company)}
                              disabled={editingCompanyId !== null || isAddingNew}
                              className="group/ebtn relative inline-flex items-center justify-center border border-[#0A0A0B]/15 dark:border-[#ECECEC]/15 bg-transparent text-fg px-3 py-1.5 font-mono text-[10px] uppercase font-bold tracking-wider hover:bg-fg hover:text-surface transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                              <CornerAccents className="opacity-0 group-hover/ebtn:opacity-100" />
                              <span>EDIT</span>
                            </button>
                            <button
                              onClick={() => handleDeleteClick(company)}
                              disabled={editingCompanyId !== null || isAddingNew}
                              className="group/dbtn relative inline-flex items-center justify-center border border-red-500/30 text-red-500 bg-transparent px-3 py-1.5 font-mono text-[10px] uppercase font-bold tracking-wider hover:bg-red-500 hover:text-white transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                              <CornerAccents className="opacity-0 group-hover/dbtn:opacity-100" />
                              <span>DELETE</span>
                            </button>
                          </div>
                        </td>

                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteConfirmation && (
          <div
            className="fixed inset-0 bg-[#0A0A0B]/60 dark:bg-[#0A0A0B]/85 backdrop-blur-sm flex items-center justify-center p-4"
            style={{ zIndex: 10000 }}
            onClick={cancelDelete}
          >
            <div
              className="w-full max-w-md border border-red-500/30 bg-[#FFFFFF] dark:bg-[#18181B] p-8 sm:p-10 transition-all duration-300 relative group text-center"
              onClick={(e) => e.stopPropagation()}
            >
              <CornerAccents className="text-red-500/30" />
              
              <div className="w-12 h-12 border border-red-500/35 bg-red-500/5 flex items-center justify-center text-red-500 mx-auto mb-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>

              <h2 className="text-xl font-bold font-sans uppercase mb-2 text-fg">
                DELETE COMPANY REGISTRY
              </h2>

              <p className="font-mono text-xs text-[#5C5C5E] dark:text-[#8C8C8E] mb-6 uppercase tracking-wider leading-relaxed">
                Confirm termination of <span className="text-red-500 font-bold">{deleteConfirmation.name}</span>.<br />
                This database action cannot be rolled back.
              </p>

              <div className="flex gap-4">
                <button
                  onClick={cancelDelete}
                  className="flex-1 group/btn relative inline-flex min-h-11 items-center justify-center border border-[#0A0A0B]/15 dark:border-[#ECECEC]/15 bg-transparent text-fg px-4 py-2 font-mono text-xs uppercase font-bold tracking-wider hover:bg-fg hover:text-surface transition-all duration-300"
                >
                  <CornerAccents className="opacity-0 group-hover/btn:opacity-100" />
                  <span>CANCEL</span>
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 group/btn relative inline-flex min-h-11 items-center justify-center border border-red-500 bg-red-500 text-white px-4 py-2 font-mono text-xs uppercase font-bold tracking-wider hover:bg-transparent hover:text-red-500 transition-all duration-300"
                >
                  <CornerAccents className="opacity-0 group-hover/btn:opacity-100" />
                  <span>TERMINATE</span>
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
