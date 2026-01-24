/**
 * Utility functions for managing dynamic meta tags for social sharing
 */

/**
 * Process image URL for social media meta tags
 * Converts private/authenticated Supabase Storage URLs to public format
 * Ensures all URLs are absolute and publicly accessible
 * @param {string} imageUrl - The raw image URL from newsItem
 * @returns {string} - Processed, publicly accessible image URL
 */
function processImageUrlForMetaTags(imageUrl) {
  if (!imageUrl) {
    return null;
  }

  // Supabase Storage URL patterns
  const supabaseStoragePattern = /(https?:\/\/[^\/]+\.supabase\.co\/storage\/v1\/object\/)(sign|authenticated|public)\/([^\/]+)\/(.+)$/;
  const match = imageUrl.match(supabaseStoragePattern);

  if (match) {
    const [, baseUrl, accessType, bucket, path] = match;
    
    // Convert private/authenticated buckets to public format
    // This assumes the bucket is actually public but URL format is wrong
    if (accessType === 'sign' || accessType === 'authenticated') {
      // Try converting to public format
      const publicUrl = `${baseUrl}public/${bucket}/${path}`;
      console.warn('Converting Supabase Storage URL to public format for social sharing:', {
        original: imageUrl,
        converted: publicUrl
      });
      return publicUrl;
    }
    
    // Already public, return as-is
    return imageUrl;
  }

  // Check if URL is absolute
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl; // Already absolute
  }

  // Relative path, make it absolute
  return `${window.location.origin}${imageUrl.startsWith('/') ? imageUrl : '/' + imageUrl}`;
}

/**
 * Updates meta tags for a specific news item
 * @param {Object} newsItem - The news item object with title, summary, image, etc.
 * @param {string} shareUrl - The URL to share
 */
export function updateMetaTags(newsItem, shareUrl) {
  if (!newsItem) return;

  const title = newsItem.title || 'MosaicBeat - A real-time digest of Pakistan\'s most consequential stories';
  // Use summary if available, otherwise fallback to default description
  const description = newsItem.summary || 'Pakistan\'s news, unmasked. Get AI-powered sentiment analysis of the latest news from multiple sources.';
  const category = newsItem.category || null;
  // Ensure shareUrl includes the full URL with hash
  const url = shareUrl || window.location.href;
  
  // Process image URL for social sharing
  // Convert private/authenticated Supabase URLs to public format
  const defaultImage = `${window.location.origin}/mosaicbeat-white.png`;
  const rawImage = newsItem.image;
  let imageUrl = defaultImage; // Default fallback
  
  if (rawImage) {
    const processedUrl = processImageUrlForMetaTags(rawImage);
    if (processedUrl) {
      imageUrl = processedUrl;
    } else {
      console.warn('Failed to process image URL for meta tags, using default:', rawImage);
    }
  }

  // Helper function to set or update meta tag
  const setMetaTag = (property, content) => {
    if (!content) return; // Don't set empty content
    
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
  setMetaTag('twitter:url', url);

  // Standard meta tags
  setMetaTag('description', description);
  
  // Add keywords meta tag with category if available
  if (category) {
    setMetaTag('keywords', `${category}, Pakistan news, news aggregator, sentiment analysis`);
  }
  
  // Log for debugging
  console.log('Meta tags updated:', {
    title,
    description: description.substring(0, 100) + '...',
    imageUrl,
    url
  });
}

/**
 * Resets meta tags to default values
 */
export function resetMetaTags() {
  const defaultTitle = 'MosaicBeat - A real-time digest of Pakistan\'s most consequential stories';
  const defaultDescription = 'Pakistan\'s news, unmasked. Get AI-powered sentiment analysis of the latest news from multiple sources.';
  const defaultImage = `${window.location.origin}/mosaicbeat-white.png`;

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

