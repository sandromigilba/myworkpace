import React from 'react'

export const EmptyNotesIllustration: React.FC<{ className?: string }> = ({ className = "w-48 h-48" }) => {
  return (
    <svg className={className} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Background shadow blob */}
      <ellipse cx="100" cy="170" rx="60" ry="12" fill="#E2E8F0" className="dark:fill-slate-800" />
      
      {/* Notepad body */}
      <rect x="50" y="30" width="100" height="120" rx="16" fill="#FFFFFF" stroke="#1E293B" strokeWidth="6" />
      <rect x="50" y="30" width="100" height="25" rx="8" fill="#FEE2E2" stroke="#1E293B" strokeWidth="6" />
      
      {/* Binding rings */}
      <circle cx="75" cy="30" r="8" fill="#94A3B8" stroke="#1E293B" strokeWidth="4" />
      <circle cx="100" cy="30" r="8" fill="#94A3B8" stroke="#1E293B" strokeWidth="4" />
      <circle cx="125" cy="30" r="8" fill="#94A3B8" stroke="#1E293B" strokeWidth="4" />
      
      {/* Paper lines */}
      <line x1="70" y1="75" x2="130" y2="75" stroke="#E2E8F0" strokeWidth="6" strokeLinecap="round" className="dark:stroke-slate-700" />
      <line x1="70" y1="95" x2="130" y2="95" stroke="#E2E8F0" strokeWidth="6" strokeLinecap="round" className="dark:stroke-slate-700" />
      <line x1="70" y1="115" x2="110" y2="115" stroke="#E2E8F0" strokeWidth="6" strokeLinecap="round" className="dark:stroke-slate-700" />
      
      {/* Cute eyes */}
      <circle cx="85" cy="85" r="7" fill="#1E293B" />
      <circle cx="115" cy="85" r="7" fill="#1E293B" />
      <circle cx="83" cy="82" r="2.5" fill="#FFFFFF" />
      <circle cx="113" cy="82" r="2.5" fill="#FFFFFF" />
      
      {/* Shy cheeks */}
      <circle cx="75" cy="93" r="5" fill="#FDA4AF" opacity="0.6" />
      <circle cx="125" cy="93" r="5" fill="#FDA4AF" opacity="0.6" />
      
      {/* Smile */}
      <path d="M94 96 C97 100 103 100 106 96" stroke="#1E293B" strokeWidth="4" strokeLinecap="round" />
    </svg>
  )
}

export const EmptyTodoIllustration: React.FC<{ className?: string }> = ({ className = "w-48 h-48" }) => {
  return (
    <svg className={className} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="100" cy="170" rx="70" ry="12" fill="#E2E8F0" className="dark:fill-slate-800" />
      
      {/* Main Clipboard */}
      <rect x="55" y="35" width="90" height="120" rx="16" fill="#F1F5F9" stroke="#1E293B" strokeWidth="6" className="dark:fill-slate-700" />
      
      {/* Clip */}
      <path d="M85 35 V25 C85 22 88 19 91 19 H109 C112 19 115 22 115 25 V35" fill="#94A3B8" stroke="#1E293B" strokeWidth="5" />
      
      {/* Checkboxes */}
      <rect x="75" y="60" width="16" height="16" rx="4" fill="#FFFFFF" stroke="#1E293B" strokeWidth="4" />
      <rect x="75" y="90" width="16" height="16" rx="4" fill="#FFFFFF" stroke="#1E293B" strokeWidth="4" />
      <rect x="75" y="120" width="16" height="16" rx="4" fill="#FFFFFF" stroke="#1E293B" strokeWidth="4" />
      
      {/* Tasks lines */}
      <line x1="102" y1="68" x2="132" y2="68" stroke="#CBD5E1" strokeWidth="5" strokeLinecap="round" className="dark:stroke-slate-600" />
      <line x1="102" y1="98" x2="132" y2="98" stroke="#CBD5E1" strokeWidth="5" strokeLinecap="round" className="dark:stroke-slate-600" />
      <line x1="102" y1="128" x2="122" y2="128" stroke="#CBD5E1" strokeWidth="5" strokeLinecap="round" className="dark:stroke-slate-600" />
      
      {/* Checkmark animation look */}
      <path d="M72 98 L80 106 L96 90" stroke="#60A5FA" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      
      {/* Cute sleeping face on clip */}
      <circle cx="93" cy="27" r="1.5" fill="#1E293B" />
      <circle cx="107" cy="27" r="1.5" fill="#1E293B" />
    </svg>
  )
}

export const EmptySpotifyIllustration: React.FC<{ className?: string }> = ({ className = "w-48 h-48" }) => {
  return (
    <svg className={className} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="100" cy="170" rx="70" ry="12" fill="#E2E8F0" className="dark:fill-slate-800" />
      
      {/* Record player box */}
      <rect x="40" y="45" width="120" height="110" rx="20" fill="#DBEAFE" stroke="#1E293B" strokeWidth="6" className="dark:fill-blue-900/30" />
      
      {/* Vinyl Record */}
      <circle cx="95" cy="100" r="40" fill="#1E293B" stroke="#60A5FA" strokeWidth="4" />
      <circle cx="95" cy="100" r="24" fill="#FCA5A5" />
      <circle cx="95" cy="100" r="8" fill="#FFFFFF" stroke="#1E293B" strokeWidth="3" />
      
      {/* Music Note floating */}
      <path d="M145 55 L160 50 V75 M145 78 C145 82 140 85 136 84 C132 83 130 79 131 75 C132 71 137 68 141 69 M160 73 C160 77 155 80 151 79 C147 78 145 74 146 70 C147 66 152 63 156 64" fill="#1E293B" stroke="#1E293B" strokeWidth="3" strokeLinejoin="round" />
      
      {/* Tone arm */}
      <rect x="135" y="65" width="10" height="40" rx="5" transform="rotate(25 135 65)" fill="#94A3B8" stroke="#1E293B" strokeWidth="3" />
      <circle cx="135" cy="65" r="7" fill="#64748B" stroke="#1E293B" strokeWidth="3" />
    </svg>
  )
}
