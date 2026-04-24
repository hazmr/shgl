import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <section className="px-4 sm:px-6 lg:px-8 pt-10 pb-16 sm:pt-14 sm:pb-20 lg:pb-24">
      <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[48px] border border-[#BFBFBF]/50 dark:border-[#404040]/70 bg-[#BFBFBF]/20 dark:bg-[#404040]/30 px-6 sm:px-10 lg:px-14 py-12 sm:py-16 lg:py-20 shadow-sm transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)]">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <div className="absolute -top-28 -left-16 h-72 w-72 rounded-full bg-[#8C8C8C]/20 blur-3xl" />
          <div className="absolute top-1/2 right-0 h-72 w-72 -translate-y-1/2 translate-x-1/3 rounded-full bg-[#404040]/15 dark:bg-[#BFBFBF]/15 blur-3xl" />
          <div className="absolute -bottom-20 left-1/3 h-64 w-64 rounded-full bg-[#0D0D0D]/10 dark:bg-[#F2F2F2]/5 blur-3xl" />
        </div>

        <div className="relative grid gap-10 lg:grid-cols-[1.25fr_0.9fr] lg:items-end">
          <div>
            <p className="inline-flex items-center rounded-full border border-[#BFBFBF]/70 dark:border-[#8C8C8C]/40 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.16em] text-[#404040] dark:text-[#BFBFBF]">
              Technology Careers / EMEA
            </p>

            <h1 className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight leading-[1.08] text-[#0D0D0D] dark:text-[#F2F2F2]">
              Find your next
              <span className="block text-[#404040] dark:text-[#BFBFBF]">technology role</span>
              <span className="block">in EMEA.</span>
            </h1>

            <p className="mt-6 max-w-2xl text-base sm:text-lg leading-relaxed text-[#404040] dark:text-[#BFBFBF]">
              Discover engineering, product, data, and infrastructure jobs at fast-moving teams.
              Built for focused search, clear details, and direct applications.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row sm:items-center gap-3">
              <Link
                to="/jobs"
                className="group inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#0D0D0D] px-7 py-3 text-sm font-semibold tracking-wide text-[#F2F2F2] dark:bg-[#F2F2F2] dark:text-[#0D0D0D] shadow-sm hover:shadow-md hover:bg-[#0D0D0D]/90 dark:hover:bg-[#F2F2F2]/90 active:scale-95 transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D0D0D] dark:focus-visible:ring-[#F2F2F2] focus-visible:ring-offset-2 focus-visible:ring-offset-[#F2F2F2] dark:focus-visible:ring-offset-[#0D0D0D]"
              >
                Explore Roles
                <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-0.5">→</span>
              </Link>

              <Link
                to="/companies"
                className="inline-flex min-h-11 items-center justify-center rounded-full border border-[#BFBFBF] dark:border-[#404040] px-7 py-3 text-sm font-semibold tracking-wide text-[#404040] dark:text-[#F2F2F2] hover:bg-[#0D0D0D]/10 dark:hover:bg-[#F2F2F2]/10 active:scale-95 transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D0D0D] dark:focus-visible:ring-[#F2F2F2]"
              >
                Browse Teams
              </Link>
            </div>
          </div>

          <aside className="rounded-[32px] border border-[#BFBFBF]/60 dark:border-[#404040]/70 bg-[#F2F2F2]/75 dark:bg-[#0D0D0D]/55 p-6 sm:p-8 shadow-sm backdrop-blur-sm">
            <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-[#8C8C8C]">
              What You Can Do
            </h2>

            <ul className="mt-5 space-y-4">
              <li className="rounded-2xl bg-[#BFBFBF]/25 dark:bg-[#404040]/45 px-4 py-3 text-sm text-[#404040] dark:text-[#BFBFBF]">
                Filter by track, location, and work style without visual clutter.
              </li>
              <li className="rounded-2xl bg-[#BFBFBF]/25 dark:bg-[#404040]/45 px-4 py-3 text-sm text-[#404040] dark:text-[#BFBFBF]">
                Review companies and open roles from one consistent directory.
              </li>
              <li className="rounded-2xl bg-[#BFBFBF]/25 dark:bg-[#404040]/45 px-4 py-3 text-sm text-[#404040] dark:text-[#BFBFBF]">
                Save opportunities and apply with a focused, readable flow.
              </li>
            </ul>
          </aside>
        </div>
      </div>
    </section>
  );
};

export default Hero;
