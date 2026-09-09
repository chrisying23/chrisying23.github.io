import { parseDateStr } from './time'

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

/**
 * Auto-generated stand-in "photograph" for any day that does not yet have
 * a real image in PHOTOS (see src/lib/config.ts). Renders an elegant,
 * candle-lit date card as an inline SVG — no network requests needed.
 *
 * Once real photos exist, this function stops being used for those days.
 */
export function placeholderPhoto(dateStr: string): string {
  const { day, month } = parseDateStr(dateStr)
  const monthName = MONTH_NAMES[month].toUpperCase()

  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='800' height='1000' viewBox='0 0 800 1000'>
  <defs>
    <radialGradient id='glow' cx='50%' cy='36%' r='78%'>
      <stop offset='0%' stop-color='#3d2b44'/>
      <stop offset='52%' stop-color='#1c1424'/>
      <stop offset='100%' stop-color='#0c0910'/>
    </radialGradient>
    <linearGradient id='sheen' x1='0' y1='0' x2='1' y2='1'>
      <stop offset='0%' stop-color='#e0c586' stop-opacity='0.9'/>
      <stop offset='100%' stop-color='#b08a4a' stop-opacity='0.9'/>
    </linearGradient>
  </defs>
  <rect width='800' height='1000' fill='url(#glow)'/>
  <rect x='40' y='40' width='720' height='920' fill='none' stroke='#b08a4a' stroke-opacity='0.55' stroke-width='2'/>
  <rect x='58' y='58' width='684' height='884' fill='none' stroke='#b08a4a' stroke-opacity='0.22' stroke-width='1'/>
  <circle cx='400' cy='370' r='150' fill='none' stroke='#b08a4a' stroke-opacity='0.35' stroke-width='1.5'/>
  <circle cx='400' cy='370' r='162' fill='none' stroke='#b08a4a' stroke-opacity='0.15' stroke-width='1'/>
  <text x='400' y='445' text-anchor='middle' font-family='Georgia, "Times New Roman", serif' font-size='190' fill='url(#sheen)'>${day}</text>
  <text x='400' y='590' text-anchor='middle' font-family='Georgia, "Times New Roman", serif' font-size='42' letter-spacing='14' fill='#e0c586'>${monthName}</text>
  <text x='400' y='640' text-anchor='middle' font-family='Georgia, "Times New Roman", serif' font-size='30' letter-spacing='8' fill='#a79a86'>MMXXVI</text>
  <line x1='300' y1='700' x2='500' y2='700' stroke='#b08a4a' stroke-opacity='0.4' stroke-width='1'/>
  <text x='400' y='880' text-anchor='middle' font-family='Georgia, "Times New Roman", serif' font-style='italic' font-size='30' fill='#d9cdb7' opacity='0.85'>a memory for this day</text>
</svg>`

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}
