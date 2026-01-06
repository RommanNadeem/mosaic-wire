function Moodline({ sentiment, onSentimentClick, selectedSentiment }) {
  if (!sentiment) return null;

  const { positive, neutral, negative } = sentiment;

  const handleClick = (sentimentType) => {
    if (onSentimentClick) {
      onSentimentClick(selectedSentiment === sentimentType ? null : sentimentType);
    }
  };

  const getLabelClasses = (sentimentType) => {
    const isSelected = selectedSentiment === sentimentType;
    const baseClasses = "cursor-pointer transition-all duration-200 px-2 py-1 text-xs";
    
    if (isSelected) {
      return `${baseClasses} ring-2 ring-offset-1 bg-[var(--bg-surface)]`;
    }
    
    return `${baseClasses} hover:opacity-80`;
  };

  const getRingColor = (sentimentType) => {
    switch (sentimentType) {
      case 'positive':
        return 'ring-[var(--accent-positive)]';
      case 'neutral':
        return 'ring-[var(--accent-neutral)]';
      case 'negative':
        return 'ring-[var(--accent-negative)]';
      default:
        return '';
    }
  };

  return (
    <div className="text-left">
      <div className="mb-2">
        <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
          THE MOODLINE
        </span>
      </div>
      
      {/* Emoji Icons with Percentages - Left Aligned */}
      <div className="flex items-center gap-4 text-sm mb-2 text-left">
        <span 
          className={`${getLabelClasses('positive')} ${selectedSentiment === 'positive' ? getRingColor('positive') : ''} flex items-center gap-1`}
          onClick={() => handleClick('positive')}
          title="Click to filter by Positive sentiment"
        >
          <span>🙂</span>
          <span className="text-[var(--accent-positive)] font-medium">{positive}%</span>
        </span>
        <span 
          className={`${getLabelClasses('neutral')} ${selectedSentiment === 'neutral' ? getRingColor('neutral') : ''} flex items-center gap-1`}
          onClick={() => handleClick('neutral')}
          title="Click to filter by Neutral sentiment"
        >
          <span>😐</span>
          <span className="text-[var(--accent-neutral)] font-medium">{neutral}%</span>
        </span>
        <span 
          className={`${getLabelClasses('negative')} ${selectedSentiment === 'negative' ? getRingColor('negative') : ''} flex items-center gap-1`}
          onClick={() => handleClick('negative')}
          title="Click to filter by Negative sentiment"
        >
          <span>🙁</span>
          <span className="text-[var(--accent-negative)] font-medium">{negative}%</span>
        </span>
      </div>
      
      {/* Segmented Bar */}
      <div className="flex h-2 rounded-full overflow-hidden bg-[var(--bg-surface)]">
        {positive > 0 && (
          <div
            className="bg-[var(--accent-positive)] cursor-pointer hover:opacity-80 transition-opacity"
            style={{ width: `${positive}%` }}
            title={`${positive}% Positive - Click to filter`}
            onClick={() => handleClick('positive')}
          />
        )}
        {neutral > 0 && (
          <div
            className="bg-[var(--accent-neutral)] cursor-pointer hover:opacity-80 transition-opacity"
            style={{ width: `${neutral}%` }}
            title={`${neutral}% Neutral - Click to filter`}
            onClick={() => handleClick('neutral')}
          />
        )}
        {negative > 0 && (
          <div
            className="bg-[var(--accent-negative)] cursor-pointer hover:opacity-80 transition-opacity"
            style={{ width: `${negative}%` }}
            title={`${negative}% Negative - Click to filter`}
            onClick={() => handleClick('negative')}
          />
        )}
      </div>
    </div>
  );
}

export default Moodline;
