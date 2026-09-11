/** Placeholder cards shown while a listing request is in flight. */
export function CardSkeletons({ count = 6, columns }: { count?: number; columns?: 3 | 4 }) {
  return (
    <div className={`grid ${columns === 3 ? 'grid--3' : ''}`} aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="skeleton">
          <div className="skeleton__media" />
          <div className="skeleton__line skeleton__line--short" />
          <div className="skeleton__line" />
          <div className="skeleton__line skeleton__line--short" />
        </div>
      ))}
    </div>
  )
}
