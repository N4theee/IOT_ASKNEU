import type { ReactNode } from 'react'
export function Brand({ className = '' }: { className?: string }) {
  return <svg className={`askneu-logo ${className}`} viewBox="0 0 310 290" role="img" aria-label="AskNEU">
    <path fill="#1d7b29" d="M82 12h206a12 12 0 0 1 12 12v155l-42-40H82a12 12 0 0 1-12-12V24a12 12 0 0 1 12-12Z"/>
    <text x="185" y="94" textAnchor="middle" fill="white" fontFamily="Arial,sans-serif" fontSize="88" fontWeight="400">Ask</text>
    <path fill="#811f08" stroke="#fff" strokeWidth="1.5" d="M24 115h206a12 12 0 0 1 12 12v108a12 12 0 0 1-12 12H62L12 290V127a12 12 0 0 1 12-12Z" transform="translate(0 -6)"/>
    <text x="119" y="199" textAnchor="middle" fill="white" fontFamily="Arial,sans-serif" fontSize="76" fontWeight="400">NEU</text>
    <text x="223" y="202" textAnchor="middle" fill="white" fontFamily="Arial,sans-serif" fontSize="73">?</text>
    <path d="M208 219h30m-27-4 24 0m-20-5h16m-12-5h8M223 198v-7m-8 9-4-7m20 7 4-7m-25 13-7-4m33 4 7-4" stroke="#ffd000" strokeWidth="2.5"/>
  </svg>
}
type IconName = 'chat' | 'office' | 'filter' | 'search' | 'edit' | 'delete' | 'logout' | 'kiosk'
export function Icon({ name }: { name: IconName }) {
  const paths: Record<IconName, ReactNode> = {
    chat: <path d="M21 11c0 5-4 8-9 8H8l-5 3 1-6a8 8 0 0 1-2-5c0-5 4-8 10-8s9 3 9 8Z"/>,
    office: <><path d="M6 5h12v17H6zM4 2h16M10 22v-4h4v4"/><path d="M9 8h1m4 0h1m-6 4h1m4 0h1m-6 3h1m4 0h1"/></>,
    filter: <path d="M3 4h18l-7 8v8l-4 2V12Z"/>,
    search: <><circle cx="10" cy="10" r="6"/><path d="m15 15 6 6"/></>,
    edit: <><path d="m4 16 12-12 4 4L8 20l-5 1Z"/><path d="m14 6 4 4"/></>,
    delete: <><path d="M5 7h14l-1 14H6ZM3 4h18M9 4V2h6v2"/></>,
    logout: <><path d="M10 3H4v18h6m4-15 6 6-6 6m-6-6h12"/></>,
    kiosk: <><rect x="3" y="3" width="18" height="13" rx="2"/><path d="M12 16v5m-5 0h10"/></>,
  }
  return <svg className="ui-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>
}
