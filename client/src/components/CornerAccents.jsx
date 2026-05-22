import React from 'react';

/**
 * CornerAccents draws 4 L-shaped tech corners absolutely positioned at the edges.
 * Make sure the parent container has `relative` positioning (e.g., class `relative`).
 */
const CornerAccents = ({ className = "text-[#0A0A0B]/30 dark:text-[#ECECEC]/30 group-hover:text-[#0A0A0B] dark:group-hover:text-[#ECECEC] transition-colors duration-300" }) => {
  const cornerSvg = (
    <svg className="w-[9px] h-[9px]" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M0.5 0.2L0.5 9.2M0.2 0.5L9.2 0.5" stroke="currentColor" strokeWidth="1.2"/>
    </svg>
  );

  return (
    <>
      {/* Top-Left Corner */}
      <div className={`absolute top-0 left-0 -translate-x-[1px] -translate-y-[1px] select-none pointer-events-none ${className}`}>
        {cornerSvg}
      </div>
      {/* Top-Right Corner */}
      <div className={`absolute top-0 right-0 translate-x-[1px] -translate-y-[1px] rotate-90 select-none pointer-events-none ${className}`}>
        {cornerSvg}
      </div>
      {/* Bottom-Left Corner */}
      <div className={`absolute bottom-0 left-0 -translate-x-[1px] translate-y-[1px] -rotate-90 select-none pointer-events-none ${className}`}>
        {cornerSvg}
      </div>
      {/* Bottom-Right Corner */}
      <div className={`absolute bottom-0 right-0 translate-x-[1px] translate-y-[1px] rotate-180 select-none pointer-events-none ${className}`}>
        {cornerSvg}
      </div>
    </>
  );
};

export default CornerAccents;
