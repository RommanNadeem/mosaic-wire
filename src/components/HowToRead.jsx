function HowToRead({ newsData, isExpanded, onToggle }) {
  // Calculate metrics from newsData
  const allArticles = newsData.flatMap(item => item.sources || [])
  const storiesAnalyzed = allArticles.length
  const topicsClustered = newsData.length
  
  // Get unique sources
  const uniqueSources = new Set()
  allArticles.forEach(article => {
    if (article.source) {
      uniqueSources.add(article.source)
    }
  })
  const sourcesCompared = uniqueSources.size
  
  // Calculate dominant mood
  const sentimentCounts = {
    positive: 0,
    neutral: 0,
    negative: 0
  }
  
  allArticles.forEach(article => {
    const sentiment = article.sentiment?.toLowerCase() || 'neutral'
    if (sentimentCounts.hasOwnProperty(sentiment)) {
      sentimentCounts[sentiment]++
    } else {
      sentimentCounts.neutral++
    }
  })
  
  const total = allArticles.length
  const percentages = {
    positive: total > 0 ? Math.round((sentimentCounts.positive / total) * 100) : 0,
    neutral: total > 0 ? Math.round((sentimentCounts.neutral / total) * 100) : 0,
    negative: total > 0 ? Math.round((sentimentCounts.negative / total) * 100) : 0
  }
  
  // Determine dominant mood
  let dominantMood = 'Neutral'
  if (percentages.positive > percentages.neutral && percentages.positive > percentages.negative) {
    dominantMood = 'Positive'
  } else if (percentages.negative > percentages.neutral && percentages.negative > percentages.positive) {
    dominantMood = 'Negative'
  }

  return (
    <div className="space-y-4">
      {/* Mobile Toggle Button */}
      <button
        onClick={onToggle}
        className="lg:hidden w-full p-4 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-lg flex items-center justify-between hover:bg-[var(--bg-surface)] transition-colors"
      >
        <span className="text-base font-bold text-[var(--text-primary)]">How to Read MosaicBeat</span>
        <svg 
          className={`w-5 h-5 text-[var(--text-muted)] transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {/* Content - Hidden on mobile unless expanded */}
      <div className={`${isExpanded ? 'block' : 'hidden'} lg:block space-y-4`}>
      {/* What This Is */}
      <div className="bg-[var(--bg-card)] rounded-lg border border-[var(--border-subtle)] p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-bold text-[var(--text-primary)] mb-3">What This Is</h3>
        <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
          MosaicBeat analyzes how news is being told, not just what happened. We compare coverage across sources to surface the signal behind the noise.
        </p>
      </div>

      {/* What We Analyzed Today */}
      <div className="bg-[var(--bg-card)] rounded-lg border border-[var(--border-subtle)] p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-bold text-[var(--text-primary)] mb-4">What We Analyzed Today</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-[var(--text-muted)] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <div className="flex-1">
              <span className="text-sm text-[var(--text-secondary)]">Stories analyzed:</span>
              <span className="text-sm font-semibold text-[var(--text-primary)] ml-2">{storiesAnalyzed}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-[var(--text-muted)] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <div className="flex-1">
              <span className="text-sm text-[var(--text-secondary)]">Topics clustered:</span>
              <span className="text-sm font-semibold text-[var(--text-primary)] ml-2">{topicsClustered}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-[var(--text-muted)] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="flex-1">
              <span className="text-sm text-[var(--text-secondary)]">Sources compared:</span>
              <span className="text-sm font-semibold text-[var(--text-primary)] ml-2">{sourcesCompared}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-[var(--text-muted)] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <div className="flex-1">
              <span className="text-sm text-[var(--text-secondary)]">Dominant mood:</span>
              <span className="text-sm font-semibold text-[var(--text-primary)] ml-2">{dominantMood}</span>
            </div>
          </div>
        </div>
      </div>

      {/* How the Mood Is Calculated */}
      <div className="bg-[var(--bg-card)] rounded-lg border border-[var(--border-subtle)] p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-bold text-[var(--text-primary)] mb-4">How the Mood Is Calculated</h3>
        <ol className="space-y-2 mb-4">
          <li className="text-sm text-[var(--text-secondary)] leading-relaxed">
            <span className="font-semibold text-[var(--text-primary)]">1.</span> Similar headlines are grouped into topics
          </li>
          <li className="text-sm text-[var(--text-secondary)] leading-relaxed">
            <span className="font-semibold text-[var(--text-primary)]">2.</span> Tone and language are analyzed across sources
          </li>
          <li className="text-sm text-[var(--text-secondary)] leading-relaxed">
            <span className="font-semibold text-[var(--text-primary)]">3.</span> The dominant framing is aggregated into a daily mood
          </li>
        </ol>
        <p className="text-xs italic text-[var(--text-muted)]">
          This is probabilistic analysis, not opinion.
        </p>
      </div>

      {/* Why This Exists */}
      <div className="bg-[var(--bg-card)] rounded-lg border border-[var(--border-subtle)] p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-bold text-[var(--text-primary)] mb-3">Why This Exists</h3>
        <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
          News shapes perception. MosaicBeat exists to make that process visible.
        </p>
      </div>
      </div>
    </div>
  )
}

export default HowToRead

