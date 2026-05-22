import { Link } from "react-router-dom";
import { useCompanies } from '../../contexts/CompaniesContext';
import CornerAccents from '../../components/CornerAccents';

const Dashboard = () => {
  const { companies } = useCompanies();

  const adminCards = [
    {
      title: 'COMPANY MANAGEMENT',
      description: 'Create, edit, and audit companies within the quantitative recruitment system.',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
          />
        </svg>
      ),
      link: '/admin/companies',
      count: companies.length,
      countLabel: 'REGISTERED COMPANIES'
    },
    {
      title: 'EMPLOYER MANAGEMENT',
      description: 'Assign, elevate, and authorize employers to company dashboards.',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
      ),
      link: '/admin/employers',
    },
    {
      title: 'CONTACT MESSAGES',
      description: 'Review contact logs, general inquiries, and technical support requests.',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
      ),
      link: '/admin/contact-messages',
    }
  ];

  return (
    <div className="min-h-screen bg-[#ECECEC] dark:bg-[#0A0A0B] py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden transition-colors duration-300">
      {/* Decorative Grid Overlay */}
      <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Header */}
        <div className="border-b border-[#0A0A0B]/15 dark:border-[#ECECEC]/15 pb-6 mb-8">
          <div className="text-[10px] font-bold font-mono text-[#8C8C8E] uppercase tracking-wider mb-2">
            // ADMINISTRATIVE_PORTAL / CORE_DASHBOARD
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold font-sans uppercase text-fg tracking-tight mb-2">
            Admin Dashboard
          </h1>
          <p className="text-xs font-mono text-[#5C5C5E] dark:text-[#8C8C8E] uppercase tracking-wider">
            Access, modify, and audit system-wide registries and incoming communication lines.
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {adminCards.map((card, index) => (
            <Link
              key={index}
              to={card.link}
              className="border border-[#0A0A0B]/10 dark:border-[#ECECEC]/10 bg-[#FFFFFF] dark:bg-[#18181B] p-6 hover:border-fg transition-all duration-300 relative group flex flex-col justify-between min-h-[220px]"
            >
              <CornerAccents className="opacity-0 group-hover:opacity-100" />
              
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="w-10 h-10 border border-fg/10 bg-fg/5 flex items-center justify-center text-fg">
                    {card.icon}
                  </span>
                  {card.count !== undefined && (
                    <div className="text-right">
                      <div className="text-xl font-bold font-mono text-fg">{card.count}</div>
                      <div className="text-[8px] font-mono text-[#8C8C8E] tracking-wider uppercase">{card.countLabel}</div>
                    </div>
                  )}
                </div>

                <h3 className="text-lg font-bold font-sans uppercase text-fg tracking-wide mb-2">
                  {card.title}
                </h3>
                
                <p className="font-mono text-xs text-[#5C5C5E] dark:text-[#8C8C8E] uppercase tracking-wider leading-relaxed">
                  {card.description}
                </p>
              </div>

              <div className="mt-6 flex items-center gap-1.5 font-mono text-[10px] uppercase font-bold tracking-wider text-fg/60 group-hover:text-fg transition-colors">
                <span>MANAGE</span>
                <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">→</span>
              </div>
            </Link>
          ))}
        </div>

        {/* Privileged Access Alert Box */}
        <div className="border border-fg/10 bg-fg/5 p-6 relative">
          <div className="flex items-start gap-4">
            <span className="w-8 h-8 border border-fg/10 bg-surface flex items-center justify-center text-fg flex-shrink-0 mt-0.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </span>
            <div>
              <h3 className="font-mono text-xs font-bold uppercase text-fg tracking-wider mb-1 flex items-center gap-1.5">
                <span>// PRIVILEGED_ACCESS_DECLARATION</span>
                <span className="telemetry-cursor" />
              </h3>
              <p className="font-mono text-[11px] text-[#5C5C5E] dark:text-[#8C8C8E] uppercase tracking-wider leading-relaxed">
                As an authorized administrator, you possess elevated permissions to reassign database objects, elevate account permissions, and retrieve contact log messages. Proceed with quantitative caution and respect system integrity.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
