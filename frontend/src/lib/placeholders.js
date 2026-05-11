const svgToDataUri = (svg) => `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`

export const placeholderLogo = svgToDataUri(`
  <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64" fill="none">
    <rect width="64" height="64" rx="18" fill="#111111"/>
    <rect x="14" y="18" width="16" height="12" rx="2" fill="#F1F3F5"/>
    <rect x="30" y="18" width="20" height="12" rx="2" fill="#F1F3F5" opacity=".7"/>
    <rect x="22" y="30" width="18" height="12" rx="2" fill="#6FE28C"/>
    <rect x="40" y="30" width="10" height="12" rx="2" fill="#F1F3F5"/>
  </svg>
`)

export const placeholderAvatar = svgToDataUri(`
  <svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96" fill="none">
    <rect width="96" height="96" rx="48" fill="#202020"/>
    <circle cx="48" cy="38" r="18" fill="#8B6F47"/>
    <path d="M20 80C24 61 38 54 48 54C58 54 72 61 76 80" fill="#6FE28C"/>
    <circle cx="38" cy="34" r="3" fill="#111111"/>
    <circle cx="58" cy="34" r="3" fill="#111111"/>
  </svg>
`)

export const placeholderDashboardIcon = svgToDataUri(`
  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none">
    <rect x="4" y="4" width="10" height="10" rx="3" fill="#6FE28C"/>
    <rect x="18" y="4" width="10" height="10" rx="3" fill="#6FE28C"/>
    <rect x="4" y="18" width="10" height="10" rx="3" fill="#6FE28C"/>
    <rect x="18" y="18" width="10" height="10" rx="3" fill="#6FE28C"/>
  </svg>
`)

export const placeholderExpensesIcon = svgToDataUri(`
  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none">
    <rect x="6" y="4" width="20" height="24" rx="5" fill="#F1F3F5"/>
    <path d="M11 20L15 16L18 19L22 13" stroke="#111111" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="12" cy="11" r="1.5" fill="#6FE28C"/>
  </svg>
`)

export const placeholderSettingsIcon = svgToDataUri(`
  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none">
    <circle cx="16" cy="16" r="6" fill="#F1F3F5"/>
    <path d="M16 4L18 8.5L23 9L20 13L21 18L16 16L11 18L12 13L9 9L14 8.5L16 4Z" fill="#6FE28C"/>
  </svg>
`)

export const placeholderTransactionsIcon = svgToDataUri(`
  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none">
    <rect x="7" y="6" width="18" height="20" rx="5" fill="#F1F3F5"/>
    <path d="M11 12H21" stroke="#111111" stroke-width="2.2" stroke-linecap="round"/>
    <path d="M11 17H18" stroke="#111111" stroke-width="2.2" stroke-linecap="round"/>
    <path d="M11 22H16" stroke="#6FE28C" stroke-width="2.2" stroke-linecap="round"/>
  </svg>
`)

export const placeholderDocument = svgToDataUri(`
  <svg xmlns="http://www.w3.org/2000/svg" width="88" height="88" viewBox="0 0 88 88" fill="none">
    <rect width="88" height="88" rx="24" fill="#1B1B1B"/>
    <path d="M32 18H50L62 30V62C62 65.3137 59.3137 68 56 68H32C28.6863 68 26 65.3137 26 62V24C26 20.6863 28.6863 18 32 18Z" fill="#F1F3F5"/>
    <path d="M50 18V30H62" stroke="#111111" stroke-width="3" stroke-linejoin="round"/>
    <path d="M44 36V54" stroke="#111111" stroke-width="4" stroke-linecap="round"/>
    <path d="M36 46L44 54L52 46" stroke="#6FE28C" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>
`)

export const placeholderOrbit = svgToDataUri(`
  <svg xmlns="http://www.w3.org/2000/svg" width="540" height="720" viewBox="0 0 540 720" fill="none">
    <rect width="540" height="720" fill="#122117"/>
    <circle cx="390" cy="170" r="110" fill="#6FE28C" fill-opacity=".2"/>
    <circle cx="420" cy="160" r="60" fill="#6FE28C" fill-opacity=".15"/>
    <circle cx="390" cy="170" r="22" fill="#6FE28C"/>
    <path d="M250 130C280 70 360 40 440 70C520 100 560 190 540 270" stroke="#6FE28C" stroke-opacity=".25" stroke-width="2"/>
    <path d="M210 220C260 170 350 170 420 220C490 270 520 360 500 450" stroke="#F1F3F5" stroke-opacity=".1" stroke-width="2"/>
    <circle cx="300" cy="460" r="170" fill="#0E1712"/>
    <circle cx="300" cy="460" r="90" fill="#13261A"/>
  </svg>
`)

export const placeholderExpandIcon = svgToDataUri(`
  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28" fill="none">
    <path d="M8 11V8H11" stroke="#4E4E4E" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M17 8H20V11" stroke="#4E4E4E" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M20 17V20H17" stroke="#4E4E4E" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M11 20H8V17" stroke="#4E4E4E" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>
`)

export const placeholderAttachIcon = svgToDataUri(`
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 22 22" fill="none">
    <path d="M8.5 11.5L13.8 6.2C15.2 4.8 17.5 4.8 18.9 6.2C20.3 7.6 20.3 9.9 18.9 11.3L10.8 19.4C8.9 21.3 5.8 21.3 3.9 19.4C2 17.5 2 14.4 3.9 12.5L12.2 4.2" stroke="#4E4E4E" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>
`)

export const placeholderSendIcon = svgToDataUri(`
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 22 22" fill="none">
    <path d="M4 11H18" stroke="#111111" stroke-width="2" stroke-linecap="round"/>
    <path d="M12 5L18 11L12 17" stroke="#111111" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>
`)

export const placeholderChevronIcon = svgToDataUri(`
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path d="M4 7L9 12L14 7" stroke="#E7E7E7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>
`)

export const placeholderSearchIcon = svgToDataUri(`
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none">
    <circle cx="8" cy="8" r="4.5" stroke="#5D6260" stroke-width="1.8"/>
    <path d="M11.5 11.5L15 15" stroke="#5D6260" stroke-width="1.8" stroke-linecap="round"/>
  </svg>
`)

export const placeholderBellIcon = svgToDataUri(`
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path d="M9 3C6.79086 3 5 4.79086 5 7V8.8C5 9.5355 4.72957 10.2454 4.24 10.794L3 12.2H15L13.76 10.794C13.2704 10.2454 13 9.5355 13 8.8V7C13 4.79086 11.2091 3 9 3Z" stroke="#C7CFCA" stroke-width="1.5" stroke-linejoin="round"/>
    <path d="M7.5 14C7.9 14.6 8.4 15 9 15C9.6 15 10.1 14.6 10.5 14" stroke="#C7CFCA" stroke-width="1.5" stroke-linecap="round"/>
    <circle cx="13.5" cy="4.5" r="1.8" fill="#6FE28C"/>
  </svg>
`)

export const placeholderPlusIcon = svgToDataUri(`
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path d="M9 4V14" stroke="#E7E7E7" stroke-width="1.8" stroke-linecap="round"/>
    <path d="M4 9H14" stroke="#E7E7E7" stroke-width="1.8" stroke-linecap="round"/>
  </svg>
`)

export const placeholderDotsIcon = svgToDataUri(`
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none">
    <circle cx="4" cy="9" r="1.5" fill="#7A7F7C"/>
    <circle cx="9" cy="9" r="1.5" fill="#7A7F7C"/>
    <circle cx="14" cy="9" r="1.5" fill="#7A7F7C"/>
  </svg>
`)

export const placeholderWorkspaceIcon = svgToDataUri(`
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none">
    <rect x="2" y="2" width="4" height="4" rx="1.2" stroke="#75827C" stroke-width="1.2"/>
    <rect x="8" y="2" width="4" height="4" rx="1.2" stroke="#75827C" stroke-width="1.2"/>
    <rect x="2" y="8" width="4" height="4" rx="1.2" stroke="#75827C" stroke-width="1.2"/>
    <rect x="8" y="8" width="4" height="4" rx="1.2" stroke="#75827C" stroke-width="1.2"/>
  </svg>
`)
