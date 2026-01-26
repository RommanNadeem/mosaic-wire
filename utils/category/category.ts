/**
 * Capitalize first letter of a string
 */
export function capitalizeFirst(str: string | null | undefined): string {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

/**
 * Get category badge color
 * Returns a background color class for the category badge with white text
 */
export function getCategoryColor(category: string | null | undefined): string {
  // #region agent log
  fetch('http://127.0.0.1:7244/ingest/42a0f6a5-3fa7-4a58-9e96-0413017a13f0',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'utils/category/category.ts:13',message:'getCategoryColor called',data:{category,type:typeof category,length:category?.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
  // #endregion
  if (!category) {
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/42a0f6a5-3fa7-4a58-9e96-0413017a13f0',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'utils/category/category.ts:15',message:'category is null/undefined',data:{returning:'bg-gray-500'},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
    // #endregion
    return 'bg-gray-500'
  }
  
  const categoryLower = category.toLowerCase().trim()
  // #region agent log
  fetch('http://127.0.0.1:7244/ingest/42a0f6a5-3fa7-4a58-9e96-0413017a13f0',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'utils/category/category.ts:17',message:'category normalized',data:{original:category,normalized:categoryLower},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
  // #endregion
  
  // Define color mapping for different categories
  const colorMap: Record<string, string> = {
    'politics': 'bg-blue-600',
    'political': 'bg-blue-600',
    'economy': 'bg-green-600',
    'economic': 'bg-green-600',
    'security': 'bg-red-600',
    'society': 'bg-purple-600',
    'social': 'bg-purple-600',
    'sports': 'bg-orange-600',
    'sport': 'bg-orange-600',
    'technology': 'bg-indigo-600',
    'tech': 'bg-indigo-600',
    'health': 'bg-pink-600',
    'education': 'bg-teal-600',
    'entertainment': 'bg-yellow-600',
    'business': 'bg-cyan-600',
    'world': 'bg-slate-600',
    'international': 'bg-slate-600',
    'national': 'bg-amber-600',
    'local': 'bg-amber-600',
    'culture': 'bg-violet-600',
    'science': 'bg-emerald-600',
    'environment': 'bg-lime-600',
    'weather': 'bg-sky-600',
    'crime': 'bg-rose-600',
    'military': 'bg-stone-600',
    'religion': 'bg-fuchsia-600',
  }
  
  // Check for exact match first
  if (colorMap[categoryLower]) {
    const result = colorMap[categoryLower]
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/42a0f6a5-3fa7-4a58-9e96-0413017a13f0',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'utils/category/category.ts:49',message:'exact match found',data:{category:categoryLower,color:result},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    return result
  }
  
  // Check for partial matches (category contains key or key contains category)
  for (const [key, color] of Object.entries(colorMap)) {
    if (categoryLower.includes(key) || key.includes(categoryLower)) {
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/42a0f6a5-3fa7-4a58-9e96-0413017a13f0',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'utils/category/category.ts:55',message:'partial match found',data:{category:categoryLower,matchedKey:key,color},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
      // #endregion
      return color
    }
  }
  
  // Default: hash the category name to get a consistent color
  const colors = [
    'bg-blue-600',
    'bg-green-600',
    'bg-red-600',
    'bg-purple-600',
    'bg-orange-600',
    'bg-indigo-600',
    'bg-pink-600',
    'bg-teal-600',
    'bg-yellow-600',
    'bg-cyan-600',
    'bg-slate-600',
    'bg-amber-600',
    'bg-violet-600',
    'bg-emerald-600',
    'bg-lime-600',
    'bg-sky-600',
    'bg-rose-600',
    'bg-stone-600',
    'bg-fuchsia-600',
  ]
  
  let hash = 0
  for (let i = 0; i < category.length; i++) {
    hash = category.charCodeAt(i) + ((hash << 5) - hash)
  }
  
  const result = colors[Math.abs(hash) % colors.length]
  // #region agent log
  fetch('http://127.0.0.1:7244/ingest/42a0f6a5-3fa7-4a58-9e96-0413017a13f0',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'utils/category/category.ts:88',message:'hash fallback used',data:{category:categoryLower,hash:Math.abs(hash),selectedColor:result},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
  // #endregion
  return result
}

/**
 * Get category text color (converts background color to text color)
 * Returns a text color class for the category
 */
export function getCategoryTextColor(category: string | null | undefined): string {
  const bgColor = getCategoryColor(category)
  // Convert bg- classes to text- classes
  return bgColor.replace('bg-', 'text-')
}

