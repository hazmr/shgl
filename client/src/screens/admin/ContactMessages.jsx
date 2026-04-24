import { useState, useEffect } from "react";
import { useTheme } from "../../context/ThemeContext";
import httpClient from "../../config/httpClient";
import { API_ENDPOINTS } from "../../config/api";

const ContactMessages = () => {
  const { theme } = useTheme();
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedMessageId, setExpandedMessageId] = useState(null);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [messageToClose, setMessageToClose] = useState(null);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortDir, setSortDir] = useState("asc");

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
      console.log("Starting fetchMessages...");
      console.log("API Endpoint:", API_ENDPOINTS.ADMIN_CONTACTS);

      // Check if user is authenticated
      const token = localStorage.getItem("authToken");
      const userStr = localStorage.getItem("shglUser");
      const user = userStr ? JSON.parse(userStr) : null;

      console.log("Auth token exists:", !!token);
      console.log(
        "Auth token value:",
        token ? token.substring(0, 20) + "..." : "null"
      );
      console.log("User string:", userStr);
      console.log("User object:", user);

      if (!token) {
        console.error("No auth token found - user needs to login");
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

      // Check if we got HTML instead of JSON (authentication failed)
      if (
        typeof response.data === "string" &&
        response.data.includes("<!DOCTYPE html>")
      ) {
        console.error(
          "Received HTML login page instead of JSON - authentication failed"
        );
        setError("Authentication failed. Please login again.");
        setMessages([]);
        // Clear invalid token
        localStorage.removeItem("authToken");
        localStorage.removeItem("shglUser");
        return;
      }

      // The backend returns a Page object with pagination info
      const pageData = response.data;
      const contactsData = Array.isArray(pageData.content) ? pageData.content : [];

      console.log("Fetched contacts count:", contactsData.length);
      console.log("Total elements:", pageData.totalElements);
      console.log("Total pages:", pageData.totalPages);

      setMessages(contactsData);
      setTotalPages(pageData.totalPages);
      setTotalElements(pageData.totalElements);
      setError("");
    } catch (err) {
      console.error("Error fetching contact messages:", err);
      console.error("Error details:", err.response || err.message);
      setError("Failed to fetch contact messages. Please try again.");
      setMessages([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRowClick = (messageId) => {
    // Toggle expanded state - if clicking the same row, collapse it
    setExpandedMessageId(expandedMessageId === messageId ? null : messageId);
  };

  const handleCloseMessage = (messageId, event) => {
    // Stop event propagation to prevent row expansion
    if (event) {
      event.stopPropagation();
    }

    // Show confirmation modal
    setMessageToClose(messageId);
    setShowConfirmModal(true);
  };

  const confirmCloseMessage = async () => {
    if (!messageToClose) return;

    try {
      await httpClient.patch(
        API_ENDPOINTS.UPDATE_CONTACT_STATUS(messageToClose)
      );

      // Refresh the entire table by fetching fresh data from the server
      await fetchMessages();

      // Collapse the expanded row if it was the one that was closed
      if (expandedMessageId === messageToClose) {
        setExpandedMessageId(null);
      }

      // Show success notification
      setSuccessMessage("Message has been successfully closed.");
      setError("");

      // Auto-hide success message after 5 seconds
      setTimeout(() => {
        setSuccessMessage("");
      }, 5000);

      // Close modal
      setShowConfirmModal(false);
      setMessageToClose(null);
    } catch (err) {
      console.error("Error closing message:", err);
      setError("Failed to close message. Please try again.");
      setSuccessMessage("");

      // Auto-hide error message after 5 seconds
      setTimeout(() => {
        setError("");
      }, 5000);

      // Close modal
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
    });
  };

  return (
    <div>
      <div>
        {/* Header */}
        <div>
          <h1>
            Contact Messages
          </h1>
          <p>
            View all contact form submissions
          </p>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div>
            <div>
              <svg
               
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span>{successMessage}</span>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div>
            <div>
              <svg
               
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Sorting and Pagination Controls */}
        <div>
          <div>
            <div>
              <label>
                Sort By:
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
               
              >
                <option value="createdAt">Date Created</option>
                <option value="name">Name</option>
                <option value="email">Email</option>
                <option value="subject">Subject</option>
                <option value="status">Status</option>
              </select>
            </div>

            <div>
              <label>
                Direction:
              </label>
              <select
                value={sortDir}
                onChange={(e) => setSortDir(e.target.value)}
               
              >
                <option value="asc">Ascending</option>
                <option value="desc">Descending</option>
              </select>
            </div>

            <div>
              <label>
                Per Page:
              </label>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPageNumber(0); // Reset to first page when changing page size
                }}
               
              >
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
            </div>

            <div>
              Showing <span>{messages.length}</span> of{" "}
              <span>{totalElements}</span> messages
            </div>
          </div>
        </div>

        {/* Messages List */}
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
                      Name
                    </th>
                    <th>
                      Email
                    </th>
                    <th>
                      User Type
                    </th>
                    <th>
                      Subject
                    </th>
                    <th>
                      Message Preview
                    </th>
                    <th>
                      Status
                    </th>
                    <th>
                      Date
                    </th>
                    <th>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {messages.length === 0 ? (
                    <tr>
                      <td
                        colSpan="8"
                       
                      >
                        No contact messages found
                      </td>
                    </tr>
                  ) : (
                    messages.map((message) => (
                      <>
                        <tr
                          key={message.id}
                          onClick={() => handleRowClick(message.id)}
                         
                        >
                          <td>
                            {message.name}
                          </td>
                          <td>
                            {message.email}
                          </td>
                          <td>
                            <span>
                              {message.userType || "N/A"}
                            </span>
                          </td>
                          <td>
                            {message.subject}
                          </td>
                          <td>
                            <div>
                              {message.message}
                            </div>
                          </td>
                          <td>
                            <span
                             
                            >
                              {message.status}
                            </span>
                          </td>
                          <td>
                            {formatDate(message.createdAt)}
                          </td>
                          <td>
                            {message.status === "OPEN" && (
                              <button
                                onClick={(e) =>
                                  handleCloseMessage(message.id, e)
                                }
                               
                              >
                                Close
                              </button>
                            )}
                          </td>
                        </tr>
                        {expandedMessageId === message.id && (
                          <tr
                            key={`${message.id}-details`}
                           
                          >
                            <td colSpan="8">
                              <div>
                                <div>
                                  <div>
                                    <label>
                                      Name
                                    </label>
                                    <p>
                                      {message.name}
                                    </p>
                                  </div>
                                  <div>
                                    <label>
                                      Email
                                    </label>
                                    <p>
                                      {message.email}
                                    </p>
                                  </div>
                                </div>

                                <div>
                                  <div>
                                    <label>
                                      User Type
                                    </label>
                                    <p>
                                      <span>
                                        {message.userType || "N/A"}
                                      </span>
                                    </p>
                                  </div>
                                  <div>
                                    <label>
                                      Status
                                    </label>
                                    <p>
                                      <span
                                       
                                      >
                                        {message.status}
                                      </span>
                                    </p>
                                  </div>
                                </div>

                                <div>
                                  <label>
                                    Date Submitted
                                  </label>
                                  <p>
                                    {formatDate(message.createdAt)}
                                  </p>
                                </div>

                                <div>
                                  <label>
                                    Subject
                                  </label>
                                  <p>
                                    {message.subject}
                                  </p>
                                </div>

                                <div>
                                  <label>
                                    Message
                                  </label>
                                  <div>
                                    <p>
                                      {message.message}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {!isLoading && totalPages > 0 && (
              <div>
                <div>
                  {/* Page Info */}
                  <div>
                    Page <span>{pageNumber + 1}</span> of{" "}
                    <span>{totalPages}</span>
                  </div>

                  {/* Pagination Buttons */}
                  <div>
                    {/* First Page Button */}
                    <button
                      onClick={() => setPageNumber(0)}
                      disabled={pageNumber === 0}
                     
                    >
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                      </svg>
                    </button>

                    {/* Previous Page Button */}
                    <button
                      onClick={() => setPageNumber(pageNumber - 1)}
                      disabled={pageNumber === 0}
                     
                    >
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
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
                        pages.push(
                          <button
                            key={i}
                            onClick={() => setPageNumber(i)}
                           
                          >
                            {i + 1}
                          </button>
                        );
                      }
                      return pages;
                    })()}

                    {/* Next Page Button */}
                    <button
                      onClick={() => setPageNumber(pageNumber + 1)}
                      disabled={pageNumber >= totalPages - 1}
                     
                    >
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>

                    {/* Last Page Button */}
                    <button
                      onClick={() => setPageNumber(totalPages - 1)}
                      disabled={pageNumber >= totalPages - 1}
                     
                    >
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Confirmation Modal */}
        {showConfirmModal && (
          <div>
            <div>
              <div>
                <div>
                  <svg
                   
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
                <h3>
                  Confirm Close Message
                </h3>
                <p>
                  Please confirm that this message has been handled by the
                  operations team.
                </p>
                <p>
                  Are you sure you want to close this message?
                </p>
              </div>

              <div>
                <button
                  onClick={cancelCloseMessage}
                 
                >
                  Cancel
                </button>
                <button
                  onClick={confirmCloseMessage}
                 
                >
                  Yes, Close Message
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
