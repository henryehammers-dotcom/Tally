export default function Placeholder({ name }) {
  return (
    <div className="screen" style={{ paddingTop: 60, textAlign: 'center', color: '#888' }}>
      <h2>{name}</h2>
      <p>This screen is coming up next in the build.</p>
    </div>
  )
}
