import { Link } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useCompanies } from '../../contexts/CompaniesContext';

const Dashboard = () => {
  const { theme } = useTheme();
  const { companies } = useCompanies();

  const adminCards = [
    {
      title: 'Company Management',
      description: 'Create, edit, and manage companies in the system',
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
          />
        </svg>
      ),
      link: '/admin/companies',
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      textColor: 'text-blue-600 dark:text-blue-400',
      count: companies.length,
      countLabel: 'Total Companies'
    },
    {
      title: 'Employer Management',
      description: 'Assign employers to companies and manage relationships',
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
      ),
      link: '/admin/employers',
      color: 'from-gray-500 to-gray-600',
      bgColor: 'bg-gray-50 dark:bg-gray-900/20',
      textColor: 'text-gray-600 dark:text-gray-400'
    },
    {
      title: 'Contact Messages',
      description: 'View and manage contact form submissions',
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
      ),
      link: '/admin/contact-messages',
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      textColor: 'text-green-600 dark:text-green-400'
    }
  ];

  return (
    <div>
      <div>
        {/* Header */}
        <div>
          <h1>
            Admin Dashboard
          </h1>
          <p>
            Welcome to the administration panel
          </p>
        </div>

        {/* Admin Cards */}
        <div>
          {adminCards.map((card, index) => (
            <Link
              key={index}
              to={card.link}
             
            >
              <div>
                <div>
                  {card.icon}
                </div>
              </div>

              <h3>
                {card.title}
              </h3>

              <p>
                {card.description}
              </p>

              {card.count !== undefined && (
                <div>
                  <div>
                    {card.count}
                  </div>
                  <div>
                    {card.countLabel}
                  </div>
                </div>
              )}

              <div>
                <span>Manage</span>
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ))}
        </div>

        {/* Quick Info */}
        <div>
          <div>
            <div>
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3>
                Admin Privileges
              </h3>
              <p>
                As an administrator, you have full access to manage companies, employers, and view all contact messages. Use these tools responsibly to maintain the platform.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
