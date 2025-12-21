import SignalBalance from './SignalBalance'
import { useTheme } from '../contexts/ThemeContext'

function OverallSentiment({ newsData }) {
  const { theme } = useTheme()
  
  if (!newsData || newsData.length === 0) {
    return null
  }

  // Calculate overall sentiment from all articles
  const allArticles = newsData.flatMap(item => item.sources || [])
  
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
  if (total === 0) return null

  const percentages = {
    positive: Math.round((sentimentCounts.positive / total) * 100),
    neutral: Math.round((sentimentCounts.neutral / total) * 100),
    negative: Math.round((sentimentCounts.negative / total) * 100)
  }

  const overallSentiment = {
    type: 'neutral',
    percentage: percentages.neutral,
    positive: percentages.positive,
    neutral: percentages.neutral,
    negative: percentages.negative
  }

  const titleColor = theme === 'light' ? 'text-gray-900' : 'text-ground-text-primary'

  return (
    <div className="mb-8">
      <h2 className={`text-sm font-semibold ${titleColor} mb-4 uppercase tracking-wide`}>Today's Signal Balance</h2>
      <SignalBalance sentiment={overallSentiment} />
    </div>
  )
}

export default OverallSentiment
