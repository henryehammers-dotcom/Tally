import { NavLink } from 'react-router-dom'
import './BottomNav.css'

const TABS = [
  { path: '/home', label: 'Home', icon: HomeIcon },
  { path: '/tally', label: 'Tally', icon: TallyIcon },
  { path: '/library', label: 'Library', icon: LibraryIcon },
  { path: '/timer', label: 'Timer', icon: TimerIcon },
  { path: '/music', label: 'Music', icon: MusicIcon },
]

function HomeIcon() {
  const homePath = "M 640.351562 42.449219 C 637.15625 42.507812 633.976562 43.597656 631.359375 45.699219 L 588.613281 79.867188 C 584.996094 82.757812 582.519531 87.136719 582.519531 92.0625 L 582.519531 145.785156 C 582.519531 152.582031 588.121094 158.183594 594.917969 158.183594 L 627.976562 158.183594 C 627.976562 147.164062 627.976562 136.144531 627.976562 125.121094 C 627.976562 122.761719 629.75 120.992188 632.109375 120.992188 L 648.640625 120.992188 C 651 120.992188 652.773438 122.761719 652.773438 125.121094 C 652.773438 136.144531 652.773438 147.164062 652.773438 158.183594 L 685.832031 158.183594 C 692.628906 158.183594 698.230469 152.582031 698.230469 145.785156 L 698.230469 92.0625 C 698.230469 87.214844 695.925781 82.640625 692.03125 79.753906 C 677.839844 68.289062 663.640625 56.792969 649.453125 45.34375 C 646.757812 43.347656 643.546875 42.386719 640.351562 42.449219 Z M 640.496094 50.695312 C 641.898438 50.671875 643.3125 51.101562 644.515625 51.988281 C 659.367188 63.96875 674.394531 76.125 687.109375 86.398438 C 688.90625 87.730469 689.964844 89.824219 689.964844 92.0625 L 689.964844 145.785156 C 689.964844 148.148438 688.191406 149.917969 685.832031 149.917969 L 661.035156 149.917969 L 661.035156 125.121094 C 661.035156 118.328125 655.4375 112.726562 648.640625 112.726562 L 632.109375 112.726562 C 625.3125 112.726562 619.710938 118.328125 619.710938 125.121094 L 619.710938 149.917969 L 594.917969 149.917969 C 592.554688 149.917969 590.785156 148.148438 590.785156 145.785156 L 590.785156 92.0625 C 590.785156 89.90625 591.863281 87.855469 593.777344 86.324219 C 608.023438 74.925781 622.296875 63.546875 636.53125 52.140625 C 637.699219 51.203125 639.09375 50.722656 640.496094 50.695312 Z"
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="currentColor">
      <path d={homePath} transform="scale(0.18999) translate(-582.520, -42.387)" />
    </svg>
  )
}

function TallyIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <line x1="4" y1="4" x2="4" y2="20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="9" y1="4" x2="9" y2="20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="14" y1="4" x2="14" y2="20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="19" y1="4" x2="19" y2="20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="2" y1="17" x2="21" y2="7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function LibraryIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M12 6C10.5 4.5 7.5 4 4 4.5V18C7.5 17.5 10.5 18 12 19.5C13.5 18 16.5 17.5 20 18V4.5C16.5 4 13.5 4.5 12 6Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <line x1="12" y1="6" x2="12" y2="19.5" stroke="currentColor" strokeWidth="2" />
    </svg>
  )
}

function TimerIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="13" r="8" stroke="currentColor" strokeWidth="2" />
      <line x1="12" y1="13" x2="12" y2="9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="12" y1="13" x2="15" y2="14.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="10" y1="2" x2="14" y2="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function MusicIcon() {
  const musicPath = "M 105.367188 346.585938 C 115.722656 346.585938 124.148438 339.625 124.148438 331.070312 C 124.105469 330.824219 124.085938 330.683594 124.078125 330.542969 L 124.078125 262.464844 C 124.078125 261.417969 123.574219 260.421875 122.730469 259.800781 C 121.898438 259.1875 120.792969 259.003906 119.792969 259.3125 L 68.375 275.453125 C 66.992188 275.886719 66.0625 277.152344 66.0625 278.605469 L 66.0625 335.3125 L 64.320312 334.34375 C 61.210938 332.613281 57.597656 331.699219 53.878906 331.699219 C 43.523438 331.699219 35.097656 338.660156 35.097656 347.210938 C 35.097656 355.769531 43.523438 362.726562 53.878906 362.726562 C 64.234375 362.726562 72.65625 355.769531 72.65625 347.210938 L 72.65625 286.640625 L 117.484375 272.566406 L 117.484375 319.128906 L 115.746094 318.171875 C 112.640625 316.460938 109.050781 315.554688 105.367188 315.554688 C 95.011719 315.554688 86.589844 322.515625 86.589844 331.070312 C 86.589844 339.625 95.011719 346.585938 105.367188 346.585938 Z"
  return (
    <svg width="20" height="20" viewBox="0 0 24 24">
      <g transform="translate(1.7, 0)" fill="currentColor">
        <g transform="translate(-8.12, -59.94) scale(0.2313)">
          <path d={musicPath} />
        </g>
      </g>
    </svg>
  )
}

export default function BottomNav() {
  return (
    <nav className="bottom-nav">
      {TABS.map((tab) => {
        const Icon = tab.icon
        return (
          <NavLink
            key={tab.path}
            to={tab.path}
            className={({ isActive }) => `nav-item ${isActive ? 'nav-item-active' : ''}`}
          >
            <Icon />
          </NavLink>
        )
      })}
    </nav>
  )
}
