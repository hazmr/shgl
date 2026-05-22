import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import httpClient from "../../config/httpClient";
import { API_ENDPOINTS } from "../../config/api";
import CornerAccents from "../../components/CornerAccents";

const ContactMessages = () => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedMessageId, setExpandedMessageId] = useState(null);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [messageToClose, setMessageToClose] = useState(null);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortDir, setSortDir] = useState("desc"); // Default to desc to see newest first

  // Pagination state
  const [pageNumber, setPageNumber] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  useEffect(() => {
    console.log("ContactMessages component mounted, fetching messages...");
    fetchMessages();
  }, [sortBy, sortDir, pageNumber, pageSize]);

  const fetchMessages = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        setError("You are not authenticated. Please login again.");
        setMessages([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      const response = await httpClient.get(API_ENDPOINTS.ADMIN_CONTACTS_PAGE, {
        params: {
          pageNumber: pageNumber,
          pageSize: pageSize,
          sortBy: sortBy,
          sortDir: sortDir
        }
      });

      if (
        typeof response.data === "string" &&
        response.data.includes("<!DOCTYPE html>")
      ) {
        setError("Authentication failed. Please login again.");
        setMessages([]);
        localStorage.removeItem("authToken");
        localStorage.removeItem("clientUser");
        return;
      }

      const pageData = response.data;
      const contactsData = Array.isArray(pageData.content) ? pageData.content : [];

      setMessages(contactsData);
      setTotalPages(pageData.totalPages);
      setTotalElements(pageData.totalElements);
      setError("");
    } catch (err) {
      console.error("Error fetching contact messages:", err);
      setError("Failed to fetch contact messages. Please try again.");
      setMessages([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRowClick = (messageId) => {
    setExpandedMessageId(expandedMessageId === messageId ? null : messageId);
  };

  const handleCloseMessage = (messageId, event) => {
    if (event) {
      event.stopPropagation();
    }
    setMessageToClose(messageId);
    setShowConfirmModal(true);
  };

  const confirmCloseMessage = async () => {
    if (!messageToClose) return;

    try {
      await httpClient.patch(
        API_ENDPOINTS.UPDATE_CONTACT_STATUS(messageToClose)
      );

      await fetchMessages();

      if (expandedMessageId === messageToClose) {
        setExpandedMessageId(null);
      }

      setSuccessMessage("Message status successfully updated to CLOSED.");
      setError("");

      setTimeout(() => {
        setSuccessMessage("");
      }, 5000);

      setShowConfirmModal(false);
      setMessageToClose(null);
    } catch (err) {
      console.error("Error closing message:", err);
      setError("Failed to close message. Please try again.");
      setSuccessMessage("");

      setTimeout(() => {
        setError("");
      }, 5000);

      setShowConfirmModal(false);
      setMessageToClose(null);
    }
  };

  const cancelCloseMessage = () => {
    setShowConfirmModal(false);
    setMessageToClose(null);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).toUpperCase();
  };

  const getStatusBadgeClass = (status) => {
    if (status === "OPEN") {
      return "border border-blue-500/30 text-blue-500 bg-blue-500/5";
    }
    return "border border-fg/20 text-fg/40 bg-fg/5";
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
            // ADMINISTRATIVE_PORTAL / CONTACT_MESSAGES_LOG
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold font-sans uppercase text-fg tracking-tight mb-2">
            Contact Messages
          </h1>
          <p className="text-xs font-mono text-[#5C5C5E] dark:text-[#8C8C8E] uppercase tracking-wider">
            Review, expand, and close user contact form submissions.
          </p>
        </div>

        {/* Notifications */}
        {successMessage && (
          <div className="p-4 mb-6 bg-fg/5 border border-fg/15 flex items-start gap-3">
            <svg className="w-5 h-5 text-fg flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-xs font-mono text-fg uppercase tracking-wider">{successMessage}</span>
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

        {/* Controls Panel */}
        <div className="border border-[#0A0A0B]/10 dark:border-[#ECECEC]/10 bg-[#FFFFFF] dark:bg-[#18181B] p-4 mb-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-6">
            
            {/* Sort By */}
            <div className="flex items-center gap-2">
              <label className="font-mono text-[9px] text-[#8C8C8E] uppercase tracking-wider">// SORT_BY</label>
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value);
                    setPageNumber(0);
                  }}
                  className="bg-transparent border border-[#0A0A0B]/15 dark:border-[#ECECEC]/15 p-2 pr-8 font-mono text-xs uppercase text-fg focus:outline-none appearance-none cursor-pointer"
                >
                  <option value="createdAt" className="bg-[#FFFFFF] dark:bg-[#18181B] text-fg">Date Created</option>
                  <option value="name" className="bg-[#FFFFFF] dark:bg-[#18181B] text-fg">Name</option>
                  <option value="email" className="bg-[#FFFFFF] dark:bg-[#18181B] text-fg">Email</option>
                  <option value="subject" className="bg-[#FFFFFF] dark:bg-[#18181B] text-fg">Subject</option>
                  <option value="status" className="bg-[#FFFFFF] dark:bg-[#18181B] text-fg">Status</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-fg">
                  <svg className="fill-current h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Direction */}
            <div className="flex items-center gap-2">
              <label className="font-mono text-[9px] text-[#8C8C8E] uppercase tracking-wider">// DIRECTION</label>
              <div className="relative">
                <select
                  value={sortDir}
                  onChange={(e) => {
                    setSortDir(e.target.value);
                    setPageNumber(0);
                  }}
                  className="bg-transparent border border-[#0A0A0B]/15 dark:border-[#ECECEC]/15 p-2 pr-8 font-mono text-xs uppercase text-fg focus:outline-none appearance-none cursor-pointer"
                >
                  <option value="asc" className="bg-[#FFFFFF] dark:bg-[#18181B] text-fg">Ascending</option>
                  <option value="desc" className="bg-[#FFFFFF] dark:bg-[#18181B] text-fg">Descending</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-fg">
                  <svg className="fill-current h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Per Page */}
            <div className="flex items-center gap-2">
              <label className="font-mono text-[9px] text-[#8C8C8E] uppercase tracking-wider">// PER_PAGE</label>
              <div className="relative">
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setPageNumber(0);
                  }}
                  className="bg-transparent border border-[#0A0A0B]/15 dark:border-[#ECECEC]/15 p-2 pr-8 font-mono text-xs uppercase text-fg focus:outline-none appearance-none cursor-pointer"
                >
                  <option value="5" className="bg-[#FFFFFF] dark:bg-[#18181B] text-fg">5</option>
                  <option value="10" className="bg-[#FFFFFF] dark:bg-[#18181B] text-fg">10</option>
                  <option value="25" className="bg-[#FFFFFF] dark:bg-[#18181B] text-fg">25</option>
                  <option value="50" className="bg-[#FFFFFF] dark:bg-[#18181B] text-fg">50</option>
                  <option value="100" className="bg-[#FFFFFF] dark:bg-[#18181B] text-fg">100</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-fg">
                  <svg className="fill-current h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                  </svg>
                </div>
              </div>
            </div>

          </div>

          <div className="font-mono text-[10px] text-fg/60 uppercase tracking-wider">
            Showing <span className="text-fg font-bold">{messages.length}</span> of <span className="text-fg font-bold">{totalElements}</span> logs
          </div>
        </div>

        {/* Message Logs Table */}
        {isLoading ? (
          <div className="border border-[#0A0A0B]/10 dark:border-[#ECECEC]/10 bg-[#FFFFFF] dark:bg-[#18181B] py-20 flex flex-col items-center gap-4 relative">
            <CornerAccents className="text-fg/20" />
            <div className="w-8 h-8 border-2 border-fg border-t-transparent animate-spin"></div>
            <p className="font-mono text-xs uppercase tracking-widest text-[#8C8C8E]">FETCHING LOG_REGISTRY...</p>
          </div>
        ) : (
          <div className="border border-[#0A0A0B]/10 dark:border-[#ECECEC]/10 bg-[#FFFFFF] dark:bg-[#18181B] overflow-hidden relative group">
            <CornerAccents className="text-fg/15 group-hover:text-fg/30" />
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#0A0A0B]/15 dark:border-[#ECECEC]/15 bg-[#0A0A0B]/5 dark:bg-[#ECECEC]/5">
                    <th className="p-4 font-mono text-[10px] font-bold text-[#8C8C8E] uppercase tracking-wider">// NAME</th>
                    <th className="p-4 font-mono text-[10px] font-bold text-[#8C8C8E] uppercase tracking-wider">// EMAIL</th>
                    <th className="p-4 font-mono text-[10px] font-bold text-[#8C8C8E] uppercase tracking-wider">// USER_TYPE</th>
                    <th className="p-4 font-mono text-[10px] font-bold text-[#8C8C8E] uppercase tracking-wider">// SUBJECT</th>
                    <th className="p-4 font-mono text-[10px] font-bold text-[#8C8C8E] uppercase tracking-wider">// MESSAGE_PREVIEW</th>
                    <th className="p-4 font-mono text-[10px] font-bold text-[#8C8C8E] uppercase tracking-wider">// STATUS</th>
                    <th className="p-4 font-mono text-[10px] font-bold text-[#8C8C8E] uppercase tracking-wider">// DATE</th>
                    <th className="p-4 font-mono text-[10px] font-bold text-[#8C8C8E] uppercase tracking-wider text-right">// ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#0A0A0B]/10 dark:divide-[#ECECEC]/10">
                  {messages.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="p-12 text-center font-mono text-xs text-[#8C8C8E] uppercase tracking-widest">
                        NULL_REGISTRY: NO MESSAGES FILED
                      </td>
                    </tr>
                  ) : (
                    messages.map((message) => {
                      const isExpanded = expandedMessageId === message.id;
                      return (
                        <optgroup key={message.id} label={message.name} className="contents">
                          {/* Row Summary */}
                          <tr
                            onClick={() => handleRowClick(message.id)}
                            className={`cursor-pointer transition-colors ${
                              isExpanded ? "bg-[#0A0A0B]/5 dark:bg-[#ECECEC]/5" : "hover:bg-[#0A0A0B]/5 dark:hover:bg-[#ECECEC]/5"
                            }`}
                          >
                            <td className="p-4 font-bold uppercase text-fg text-xs tracking-wide">
                              {message.name}
                            </td>
                            <td className="p-4 font-mono text-xs text-fg/80">
                              {message.email}
                            </td>
                            <td className="p-4 font-mono text-xs text-fg/80 uppercase">
                              {message.userType || "N/A"}
                            </td>
                            <td className="p-4 font-mono text-xs text-fg/80 uppercase">
                              {message.subject}
                            </td>
                            <td className="p-4 font-mono text-xs text-fg/60 max-w-[200px] truncate">
                              {message.message}
                            </td>
                            <td className="p-4">
                              <span className={`px-2 py-0.5 font-mono text-[10px] font-bold tracking-wider uppercase ${getStatusBadgeClass(message.status)}`}>
                                {message.status}
                              </span>
                            </td>
                            <td className="p-4 font-mono text-[10px] text-fg/60 whitespace-nowrap">
                              {formatDate(message.createdAt)}
                            </td>
                            <td className="p-4 text-right">
                              {message.status === "OPEN" && (
                                <button
                                  onClick={(e) => handleCloseMessage(message.id, e)}
                                  className="group/cbtn relative inline-flex items-center justify-center border border-red-500/30 text-red-500 bg-transparent px-3 py-1 font-mono text-[10px] uppercase font-bold tracking-wider hover:bg-red-500 hover:text-white transition-all duration-300"
                                >
                                  <CornerAccents className="opacity-0 group-hover/cbtn:opacity-100" />
                                  <span>CLOSE</span>
                                </button>
                              )}
                            </td>
                          </tr>

                          {/* Row Expanded Details */}
                          {isExpanded && (
                            <tr className="bg-[#0A0A0B]/5 dark:bg-[#ECECEC]/5">
                              <td colSpan="8" className="p-6">
                                <div className="border border-fg/10 bg-[#FFFFFF] dark:bg-[#18181B] p-6 relative group/detail">
                                  <CornerAccents className="text-fg/20" />
                                  
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4 pb-4 border-b border-fg/10">
                                    <div className="font-mono text-xs">
                                      <span className="text-[#8C8C8E] uppercase mr-2">// SENDER:</span>
                                      <span className="text-fg font-bold uppercase">{message.name}</span>
                                    </div>
                                    <div className="font-mono text-xs">
                                      <span className="text-[#8C8C8E] uppercase mr-2">// EMAIL:</span>
                                      <span className="text-fg font-bold">{message.email}</span>
                                    </div>
                                    <div className="font-mono text-xs">
                                      <span className="text-[#8C8C8E] uppercase mr-2">// USER_TYPE:</span>
                                      <span className="text-fg font-bold uppercase">{message.userType || "N/A"}</span>
                                    </div>
                                    <div className="font-mono text-xs">
                                      <span className="text-[#8C8C8E] uppercase mr-2">// LOG_DATE:</span>
                                      <span className="text-fg font-bold">{formatDate(message.createdAt)}</span>
                                    </div>
                                  </div>

                                  <div className="mb-4">
                                    <div className="font-mono text-[9px] text-[#8C8C8E] uppercase tracking-wider mb-1">// SUBJECT</div>
                                    <div className="font-sans text-sm font-bold uppercase text-fg">{message.subject}</div>
                                  </div>

                                  <div>
                                    <div className="font-mono text-[9px] text-[#8C8C8E] uppercase tracking-wider mb-2">// DETAILED_MESSAGE</div>
                                    <div className="font-mono text-xs text-fg/80 leading-relaxed bg-[#0A0A0B]/5 dark:bg-[#ECECEC]/5 p-4 border border-fg/5 whitespace-pre-wrap">
                                      {message.message}
                                    </div>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </optgroup>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {!isLoading && totalPages > 0 && (
              <div className="border-t border-[#0A0A0B]/15 dark:border-[#ECECEC]/15 bg-[#0A0A0B]/5 dark:bg-[#ECECEC]/5 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="font-mono text-xs text-fg/60 uppercase tracking-wider">
                  Page <span className="text-fg font-bold">{pageNumber + 1}</span> of <span className="text-fg font-bold">{totalPages}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  {/* First */}
                  <button
                    onClick={() => setPageNumber(0)}
                    disabled={pageNumber === 0}
                    className="w-9 h-9 border border-[#0A0A0B]/15 dark:border-[#ECECEC]/15 bg-transparent hover:bg-fg hover:text-surface flex items-center justify-center font-mono text-xs disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-fg transition-all cursor-pointer"
                  >
                    «
                  </button>

                  {/* Previous */}
                  <button
                    onClick={() => setPageNumber(pageNumber - 1)}
                    disabled={pageNumber === 0}
                    className="w-9 h-9 border border-[#0A0A0B]/15 dark:border-[#ECECEC]/15 bg-transparent hover:bg-fg hover:text-surface flex items-center justify-center font-mono text-xs disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-fg transition-all cursor-pointer"
                  >
                    ‹
                  </button>

                  {/* Page Numbers */}
                  {(() => {
                    const pages = [];
                    const maxPagesToShow = 5;
                    let startPage = Math.max(0, pageNumber - Math.floor(maxPagesToShow / 2));
                    let endPage = Math.min(totalPages - 1, startPage + maxPagesToShow - 1);

                    if (endPage - startPage < maxPagesToShow - 1) {
                      startPage = Math.max(0, endPage - maxPagesToShow + 1);
                    }

                    for (let i = startPage; i <= endPage; i++) {
                      const isActive = i === pageNumber;
                      pages.push(
                        <button
                          key={i}
                          onClick={() => setPageNumber(i)}
                          className={`w-9 h-9 border font-mono text-xs flex items-center justify-center transition-all cursor-pointer ${
                            isActive
                              ? "border-fg bg-fg text-surface"
                              : "border-[#0A0A0B]/15 dark:border-[#ECECEC]/15 bg-transparent hover:bg-fg/5 text-fg"
                          }`}
                        >
                          {i + 1}
                        </button>
                      );
                    }
                    return pages;
                  })()}

                  {/* Next */}
                  <button
                    onClick={() => setPageNumber(pageNumber + 1)}
                    disabled={pageNumber >= totalPages - 1}
                    className="w-9 h-9 border border-[#0A0A0B]/15 dark:border-[#ECECEC]/15 bg-transparent hover:bg-fg hover:text-surface flex items-center justify-center font-mono text-xs disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-fg transition-all cursor-pointer"
                  >
                    ›
                  </button>

                  {/* Last */}
                  <button
                    onClick={() => setPageNumber(totalPages - 1)}
                    disabled={pageNumber >= totalPages - 1}
                    className="w-9 h-9 border border-[#0A0A0B]/15 dark:border-[#ECECEC]/15 bg-transparent hover:bg-fg hover:text-surface flex items-center justify-center font-mono text-xs disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-fg transition-all cursor-pointer"
                  >
                    »
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Confirmation Modal */}
        {showConfirmModal && (
          <div
            className="fixed inset-0 bg-[#0A0A0B]/60 dark:bg-[#0A0A0B]/85 backdrop-blur-sm flex items-center justify-center p-4"
            style={{ zIndex: 10000 }}
            onClick={cancelCloseMessage}
          >
            <div
              className="w-full max-w-md border border-red-500/35 bg-[#FFFFFF] dark:bg-[#18181B] p-8 sm:p-10 transition-all duration-300 relative group text-center"
              onClick={(e) => e.stopPropagation()}
            >
              <CornerAccents className="text-red-500/30" />
              
              <div className="w-12 h-12 border border-red-500/35 bg-red-500/5 flex items-center justify-center text-red-500 mx-auto mb-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>

              <h2 className="text-xl font-bold font-sans uppercase mb-2 text-fg">
                CLOSE MESSAGE LOG
              </h2>

              <p className="font-mono text-xs text-[#5C5C5E] dark:text-[#8C8C8E] mb-6 uppercase tracking-wider leading-relaxed">
                Confirm that this message ticket has been handled and can be archived.
              </p>

              <div className="flex gap-4">
                <button
                  onClick={cancelCloseMessage}
                  className="flex-1 group/btn relative inline-flex min-h-11 items-center justify-center border border-[#0A0A0B]/15 dark:border-[#ECECEC]/15 bg-transparent text-fg px-4 py-2 font-mono text-xs uppercase font-bold tracking-wider hover:bg-fg hover:text-surface transition-all duration-300"
                >
                  <CornerAccents className="opacity-0 group-hover/btn:opacity-100" />
                  <span>CANCEL</span>
                </button>
                <button
                  onClick={confirmCloseMessage}
                  className="flex-1 group/btn relative inline-flex min-h-11 items-center justify-center border border-red-500 bg-red-500 text-white px-4 py-2 font-mono text-xs uppercase font-bold tracking-wider hover:bg-transparent hover:text-red-500 transition-all duration-300"
                >
                  <CornerAccents className="opacity-0 group-hover/btn:opacity-100" />
                  <span>CLOSE MESSAGES</span>
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default ContactMessages;
