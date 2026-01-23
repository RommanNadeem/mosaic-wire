/**
 * Utility functions for managing dynamic meta tags for social sharing
 */

/**
 * Updates meta tags for a specific news item
 * @param {Object} newsItem - The news item object with title, summary, image, etc.
 * @param {string} shareUrl - The URL to share
 */
export function updateMetaTags(newsItem, shareUrl) {
  if (!newsItem) return;

  const title = newsItem.title || 'MosaicBeat - A real-time digest of Pakistan\'s most consequential stories';
  const description = newsItem.summary || 'Read the latest news from Pakistan with AI-powered sentiment analysis.';
  const category = newsItem.category || null;
  
  // Use image if available, otherwise use default
  const image = newsItem.image || `${window.location.origin}/vite.svg`;
  const url = shareUrl || window.location.href;
  
  // Ensure image URL is absolute and properly formatted
  // If it's already a full URL (http/https), use it as-is
  // If it's a Supabase public URL, it should already be absolute
  let imageUrl;
  if (image.startsWith('http://') || image.startsWith('https://')) {
    imageUrl = image; // Already absolute
  } else {
    // Relative path, make it absolute
    imageUrl = `${window.location.origin}${image.startsWith('/') ? image : '/' + image}`;
  }

  // Helper function to set or update meta tag
  const setMetaTag = (property, content) => {
    let meta = document.querySelector(`meta[property="${property}"]`) || 
               document.querySelector(`meta[name="${property}"]`);
    
    if (!meta) {
      meta = document.createElement('meta');
      // Twitter uses 'name', Open Graph uses 'property'
      if (property.startsWith('twitter:')) {
        meta.setAttribute('name', property);
      } else if (property.startsWith('og:')) {
        meta.setAttribute('property', property);
      } else {
        meta.setAttribute('name', property);
      }
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', content);
  };

  // Update title
  document.title = `${title} | MosaicBeat`;

  // Open Graph meta tags (Facebook, LinkedIn, etc.)
  setMetaTag('og:title', title);
  setMetaTag('og:description', description);
  setMetaTag('og:image', imageUrl);
  setMetaTag('og:image:url', imageUrl); // Some platforms prefer this
  setMetaTag('og:image:type', 'image/jpeg'); // Adjust based on your image format
  setMetaTag('og:image:width', '1200'); // Recommended dimensions
  setMetaTag('og:image:height', '630');
  setMetaTag('og:url', url);
  setMetaTag('og:type', 'article');
  setMetaTag('og:site_name', 'MosaicBeat');
  
  // Add category/topic as article tag if available
  if (category) {
    setMetaTag('og:article:tag', category);
    setMetaTag('article:tag', category);
  }

  // Twitter Card meta tags
  setMetaTag('twitter:card', 'summary_large_image');
  setMetaTag('twitter:title', title);
  setMetaTag('twitter:description', description);
  setMetaTag('twitter:image', imageUrl);

  // Standard meta tags
  setMetaTag('description', description);
  
  // Add keywords meta tag with category if available
  if (category) {
    setMetaTag('keywords', `${category}, Pakistan news, news aggregator, sentiment analysis`);
  }
}

/**
 * Resets meta tags to default values
 */
export function resetMetaTags() {
  const defaultTitle = 'MosaicBeat - A real-time digest of Pakistan\'s most consequential stories';
  const defaultDescription = 'Pakistan\'s news, unmasked. Get AI-powered sentiment analysis of the latest news from multiple sources.';
  const defaultImage = `${window.location.origin}/vite.svg`;

  document.title = defaultTitle;

  const setMetaTag = (property, content) => {
    let meta = document.querySelector(`meta[property="${property}"]`) || 
               document.querySelector(`meta[name="${property}"]`);
    
    if (meta) {
      meta.setAttribute('content', content);
    }
  };

  // Remove article-specific tags if they exist
  const removeMetaTag = (property) => {
    const meta = document.querySelector(`meta[property="${property}"]`) || 
                 document.querySelector(`meta[name="${property}"]`);
    if (meta) {
      meta.remove();
    }
  };

  setMetaTag('og:title', defaultTitle);
  setMetaTag('og:description', defaultDescription);
  setMetaTag('og:image', defaultImage);
  setMetaTag('og:url', window.location.href);
  setMetaTag('og:type', 'website');
  setMetaTag('twitter:card', 'summary_large_image');
  setMetaTag('twitter:title', defaultTitle);
  setMetaTag('twitter:description', defaultDescription);
  setMetaTag('twitter:image', defaultImage);
  setMetaTag('description', defaultDescription);
  setMetaTag('keywords', 'Pakistan news, news aggregator, sentiment analysis');
  
  // Remove article-specific tags
  removeMetaTag('og:article:tag');
  removeMetaTag('article:tag');
}

