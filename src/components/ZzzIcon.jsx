export default function ZzzIcon({ size = 32 }) {
  const zPath = "M 28.015625 -30.6875 L 12.796875 -6.140625 L 27.015625 -6.140625 L 27.015625 0 L 0.59375 0 L 15.78125 -24.546875 L 2.75 -24.546875 L 2.75 -30.6875 Z"
  return (
    <svg width={size} height={size} viewBox="0 0 32 32">
      <g transform="translate(8.336, 23.865)" fill="currentColor">
        <g transform="scale(0.2647)">
          <path d={zPath} />
        </g>
      </g>
      <g transform="translate(15.701, 15.673)" fill="currentColor">
        <g transform="scale(0.2647)">
          <path d={zPath} />
        </g>
      </g>
    </svg>
  )
}
