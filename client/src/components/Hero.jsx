import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import CornerAccents from "./CornerAccents";
import TextScramble from "./TextScramble";

const Hero = () => {
  const containerRef = useRef(null);
  const [activeTab, setActiveTab] = useState("capabilities");
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [logs, setLogs] = useState([
    "Indexer // Synchronizing active job registries...",
    "Database // Loaded 142 verified company listings.",
    "Gateway // Connection response times: 12ms",
    "Match Engine // Filtering duplicate and expired listings.",
  ]);

  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    containerRef.current.style.setProperty("--mouse-x", `${x}px`);
    containerRef.current.style.setProperty("--mouse-y", `${y}px`);
  };

  useEffect(() => {
    if (activeTab !== "telemetry") return;

    const logTemplates = [
      "Indexer // Re-indexing software engineering roles...",
      "Database // Cleaned 4 stale job entries.",
      "Gateway // Connection response times: 11ms",
      "Match Engine // Ranked 14 active company profiles.",
      "Auth // Client session verification successful.",
      "Search // Pre-cached filters for location and stack.",
      "Parser // Parsing incoming markdown profile data...",
    ];

    const interval = setInterval(() => {
      const randomTemplate = logTemplates[Math.floor(Math.random() * logTemplates.length)];
      const timestamp = new Date().toLocaleTimeString().split(" ")[0]; // HH:MM:SS
      setLogs((prev) => [...prev.slice(-5), `[${timestamp}] ${randomTemplate}`]);
    }, 1500);

    return () => clearInterval(interval);
  }, [activeTab]);

  return (
    <section className="px-4 sm:px-6 lg:px-8 pt-10 pb-16 sm:pt-14 sm:pb-20 lg:pb-24">
      <div 
        ref={containerRef}
        onMouseMove={handleMouseMove}
        className="relative mx-auto max-w-7xl border border-[#0A0A0B]/10 dark:border-[#ECECEC]/10 bg-[#FFFFFF] dark:bg-[#18181B] px-6 sm:px-10 lg:px-14 py-12 sm:py-16 lg:py-20 transition-all duration-300 group"
      >
        <CornerAccents className="text-fg/30 group-hover:text-fg/50" />
        
        {/* Absolute decorative grid background */}
        <div className="absolute inset-0 grid-bg opacity-20 pointer-events-none" />

        {/* Mouse glow flashlight layer */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[radial-gradient(500px_circle_at_var(--mouse-x,0px)_var(--mouse-y,0px),rgba(10,10,11,0.035),transparent_60%)] dark:bg-[radial-gradient(500px_circle_at_var(--mouse-x,0px)_var(--mouse-y,0px),rgba(236,236,236,0.025),transparent_60%)]" 
        />

        <div className="relative grid gap-10 lg:grid-cols-[1.25fr_0.9fr] lg:items-end z-10">
          <div>
            <p className="inline-flex items-center border border-[#0A0A0B]/10 dark:border-[#ECECEC]/10 px-4 py-1.5 text-[10px] font-bold font-mono uppercase tracking-[0.16em] text-[#5C5C5E] dark:text-[#8C8C8E] bg-[#0A0A0B]/5 dark:bg-[#ECECEC]/5">
              // Verified Tech Roles / EMEA
            </p>

            <h1 className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.08] text-[#0A0A0B] dark:text-[#ECECEC] font-sans uppercase">
              <TextScramble text="Where engineering" speed={15} />
              <span className="block text-[#5C5C5E] dark:text-[#8C8C8E]">
                <TextScramble text="teams find" speed={15} delay={200} />
              </span>
              <span className="block">
                <TextScramble text="their peers." speed={15} delay={400} />
              </span>
            </h1>

            <p className="mt-6 max-w-2xl text-xs sm:text-sm leading-relaxed text-[#5C5C5E] dark:text-[#8C8C8E] font-mono">
              We curate open roles in software engineering, systems infrastructure, and product management at companies we respect. No recruiters, no noise—just direct applications.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row sm:items-center gap-3">
              <Link
                to="/jobs"
                className="group relative inline-flex min-h-11 items-center justify-center gap-2 border border-[#0A0A0B] dark:border-[#ECECEC] bg-transparent px-7 py-3 text-xs font-bold font-mono uppercase tracking-wider text-fg hover:bg-[#0A0A0B] hover:text-[#ECECEC] dark:hover:bg-[#ECECEC] dark:hover:text-[#0A0A0B] transition-all duration-300 group/btn"
              >
                <CornerAccents className="opacity-0 group-hover/btn:opacity-100" />
                Explore Roles
                <span aria-hidden className="transition-transform duration-300 group-hover/btn:translate-x-0.5">→</span>
              </Link>

              <Link
                to="/companies"
                className="group relative inline-flex min-h-11 items-center justify-center gap-2 border border-[#0A0A0B]/20 dark:border-[#ECECEC]/20 bg-transparent px-7 py-3 text-xs font-bold font-mono uppercase tracking-wider text-[#5C5C5E] dark:text-[#8C8C8E] hover:border-[#0A0A0B] dark:hover:border-[#ECECEC] hover:text-[#0A0A0B] dark:hover:text-[#ECECEC] transition-all duration-300 group/btn2"
              >
                <CornerAccents className="opacity-0 group-hover/btn2:opacity-100" />
                Browse Teams
              </Link>
            </div>
          </div>

          <aside className="relative border border-[#0A0A0B]/10 dark:border-[#ECECEC]/10 bg-[#0A0A0B]/5 dark:bg-[#ECECEC]/5 p-6 sm:p-8 group/aside flex flex-col min-h-[360px]">
            <CornerAccents className="opacity-50" />
            
            {/* Tab Buttons */}
            <div className="flex border-b border-[#0A0A0B]/10 dark:border-[#ECECEC]/10 mb-5 pb-2 gap-4">
              <button
                onClick={() => setActiveTab("capabilities")}
                className={`font-mono text-[10px] uppercase font-bold tracking-widest cursor-pointer transition-colors duration-250 ${
                  activeTab === "capabilities"
                    ? "text-[#0A0A0B] dark:text-[#ECECEC] border-b border-[#0A0A0B] dark:border-[#ECECEC] pb-1.5 -mb-2"
                    : "text-[#8C8C8E] hover:text-[#0A0A0B] dark:hover:text-[#ECECEC]"
                }`}
              >
                // Why use QNTM
              </button>
              <button
                onClick={() => setActiveTab("telemetry")}
                className={`font-mono text-[10px] uppercase font-bold tracking-widest cursor-pointer transition-colors duration-250 ${
                  activeTab === "telemetry"
                    ? "text-[#0A0A0B] dark:text-[#ECECEC] border-b border-[#0A0A0B] dark:border-[#ECECEC] pb-1.5 -mb-2"
                    : "text-[#8C8C8E] hover:text-[#0A0A0B] dark:hover:text-[#ECECEC]"
                }`}
              >
                // Platform Log
              </button>
            </div>

            {activeTab === "capabilities" ? (
              <ul className="space-y-4 flex-1">
                {[
                  {
                    title: "Filter by track, stack, and location—without the noise.",
                    metric: "99.8% ACC"
                  },
                  {
                    title: "Deep-dive into team structures and verified active listings.",
                    metric: "142 TEAMS"
                  },
                  {
                    title: "Apply with a single profile designed to engineering standards.",
                    metric: "0.2s LAT"
                  }
                ].map((cap, idx) => (
                  <li 
                    key={idx}
                    onMouseEnter={() => setHoveredIndex(idx)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    className="border border-[#0A0A0B]/10 dark:border-[#ECECEC]/10 bg-[#FFFFFF] dark:bg-[#18181B] px-4 py-3 text-xs font-mono text-[#5C5C5E] dark:text-[#8C8C8E] relative transition-all duration-300 hover:border-[#0A0A0B] dark:hover:border-[#ECECEC] hover:text-fg"
                  >
                    <div className="absolute top-2 left-2 w-1.5 h-1.5 bg-[#0A0A0B] dark:bg-[#ECECEC] opacity-35" />
                    <div className="pl-3">
                      <span className="block">{cap.title}</span>
                      {/* Telemetry bar that lights up when hovered */}
                      <div className="mt-2.5 flex items-center justify-between gap-3 text-[9px] text-[#8C8C8E]">
                        <span className="text-[8px] uppercase tracking-wider font-bold">Performance Metric</span>
                        <span className="font-bold text-fg">{cap.metric}</span>
                      </div>
                      <div className="mt-1.5 h-1 w-full bg-[#0A0A0B]/5 dark:bg-[#ECECEC]/5 relative overflow-hidden">
                        <div 
                          className="absolute top-0 left-0 h-full bg-[#0A0A0B] dark:bg-[#ECECEC] transition-all duration-700 ease-out"
                          style={{ width: hoveredIndex === idx ? "100%" : "30%" }}
                        />
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex-1 flex flex-col font-mono text-[10px] text-[#5C5C5E] dark:text-[#8C8C8E] bg-[#0A0A0B] dark:bg-[#ECECEC]/5 p-4 border border-[#0A0A0B]/15 dark:border-[#ECECEC]/15 h-full">
                <div className="flex items-center justify-between text-[8px] text-[#8C8C8E] border-b border-[#ECECEC]/10 dark:border-[#0A0A0B]/15 pb-1 mb-2 font-bold uppercase tracking-wider">
                  <span>CONSOLE_FEED</span>
                  <span className="flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                    LIVE_CONNECTION
                  </span>
                </div>
                <div className="space-y-1.5 overflow-hidden flex-1 select-none">
                  {logs.map((log, idx) => (
                    <div key={idx} className="truncate">
                      <span className="text-[#8C8C8E] mr-1.5">&gt;</span>
                      <span className="text-[#ECECEC] dark:text-fg">{log}</span>
                    </div>
                  ))}
                  <div className="inline-block w-1.5 h-3.5 bg-[#ECECEC] dark:bg-fg animate-pulse align-middle ml-1" />
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>
    </section>
  );
};

export default Hero;
