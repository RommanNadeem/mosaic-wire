import { useState, useEffect } from "react";
import Header from "./components/Header";
import FeaturedNews from "./components/FeaturedNews";
import BiasDistribution from "./components/BiasDistribution";
import NewsCard from "./components/NewsCard";
import Footer from "./components/Footer";
import HowToRead from "./components/HowToRead";
import NewsDetailModal from "./components/NewsDetailModal";
import { useTheme } from "./contexts/ThemeContext";
import { getLatestTopics } from "./lib/supabaseQueries";
import { transformSupabaseData } from "./utils/dataTransformers";
import { sampleNewsData } from "./data/sampleData";
import { isSupabaseConfigured } from "./lib/supabase";
import { updateMetaTags, resetMetaTags } from "./utils/metaTags";
import { parseNewsHash, findNewsItem } from "./utils/slugUtils";

function App() {
  const { theme } = useTheme();
  const [newsData, setNewsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [usingSampleData, setUsingSampleData] = useState(false);
  const [highlightedNewsId, setHighlightedNewsId] = useState(null);
  const [expandedNewsId, setExpandedNewsId] = useState(null);
  const [sidebarExpanded, setSidebarExpanded] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);

        if (isSupabaseConfigured) {
          // Fetch all topics from Supabase (topics now have top_articles precomputed)
          const topics = await getLatestTopics();

          if (topics && topics.length > 0) {
            // Topics now include top_articles, so we don't need to fetch articles separately
            const transformedData = transformSupabaseData(topics);

            if (transformedData && transformedData.length > 0) {
              setNewsData(transformedData);
              setUsingSampleData(false);
            } else {
              // Transformation returned empty, use sample data
              setNewsData(sampleNewsData);
              setUsingSampleData(true);
            }
          } else {
            // No data in Supabase, use sample data
            setNewsData(sampleNewsData);
            setUsingSampleData(true);
          }
        } else {
          // Supabase not configured, use sample data
          setNewsData(sampleNewsData);
          setUsingSampleData(true);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err.message || "Unknown error occurred");
        // Fallback to sample data on error
        console.log("Falling back to sample data due to error");
        setNewsData(sampleNewsData);
        setUsingSampleData(true);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // Handle hash-based routing for shared news
  useEffect(() => {
    // Only process hash if we have data loaded
    if (loading || newsData.length === 0) return;

    const handleHashChange = () => {
      const hash = window.location.hash;
      
      // Parse hash (supports both old #news-123 and new #news/slug-shortId formats)
      const { id, shortId, slug } = parseNewsHash(hash);
      
      if (id || shortId) {
        // Find news item by ID or short ID
        const newsItem = findNewsItem(newsData, id, shortId);

        if (newsItem) {
          const newsId = String(newsItem.id);
          setHighlightedNewsId(newsId);

          // Update meta tags for the shared news item
          const shareUrl = `${window.location.origin}${window.location.pathname}${hash}`;
          updateMetaTags(newsItem, shareUrl);

          // Scroll to the highlighted news after a delay to ensure it's rendered
          setTimeout(() => {
            const element = document.getElementById(`news-${newsId}`);
            if (element) {
              element.scrollIntoView({ behavior: "smooth", block: "center" });
            }
          }, 300);
        } else {
          // News item doesn't exist - redirect to main page by clearing the hash
          clearHashWithoutScroll();
          setHighlightedNewsId(null);
          resetMetaTags();
        }
      } else {
        setHighlightedNewsId(null);
        resetMetaTags();
      }
    };

    // Check initial hash
    handleHashChange();

    // Listen for hash changes
    window.addEventListener("hashchange", handleHashChange);

    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, [newsData, loading]);

  // Handle ESC key to close expanded view
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === "Escape" && expandedNewsId) {
        setExpandedNewsId(null);
      }
    };

    if (expandedNewsId) {
      document.addEventListener("keydown", handleEsc);
      return () => {
        document.removeEventListener("keydown", handleEsc);
      };
    }
  }, [expandedNewsId]);

  // Helper function to remove hash without scrolling to top
  const clearHashWithoutScroll = () => {
    if (window.history && window.history.replaceState) {
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    } else {
      // Fallback for older browsers
      const scrollY = window.scrollY;
      window.location.hash = "";
      window.scrollTo(0, scrollY);
    }
  };

  const handleTitleClick = (newsId) => {
    // If card is highlighted (from shared link), clear highlight first
    if (highlightedNewsId === String(newsId)) {
      clearHashWithoutScroll();
      setHighlightedNewsId(null);
      // Small delay to allow highlight to clear before opening expanded view
      setTimeout(() => {
        setExpandedNewsId(String(newsId));
      }, 100);
    } else {
      setExpandedNewsId(String(newsId));
    }
  };

  const handleCloseHighlight = () => {
    clearHashWithoutScroll();
    setHighlightedNewsId(null);
    resetMetaTags();
  };

  const handleMainClick = (e) => {
    // Only handle clicks when there's a highlighted news
    if (!highlightedNewsId) return;
    
    // Don't close if clicking on the highlighted card itself
    const highlightedElement = document.getElementById(`news-${highlightedNewsId}`);
    if (highlightedElement && highlightedElement.contains(e.target)) {
      return;
    }
    
    // Don't close if clicking on Header or Footer
    if (e.target.closest('header') || e.target.closest('footer')) {
      return;
    }
    
    // Close the highlight
    handleCloseHighlight();
  };

  // Mark body as loaded to prevent layout shift
  useEffect(() => {
    document.body.classList.add('loaded');
    return () => {
      document.body.classList.remove('loaded');
    };
  }, []);

  if (loading) {
    return (
      <div className="flex-1 bg-[var(--bg-primary)] flex flex-col">
        <Header />
        <main className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-8 h-8 border-4 border-[var(--border-subtle)] border-t-[var(--accent-positive)] rounded-full animate-spin"></div>
            <p className="text-sm text-[var(--text-secondary)]">Loading news...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error && newsData.length === 0) {
    return (
      <div className="flex-1 bg-[var(--bg-primary)] flex flex-col">
        <Header />
        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex items-center justify-center">
          <div className="bg-[var(--bg-card)] border border-[var(--accent-negative)] p-4">
            <p className="text-[var(--accent-negative)]">
              Error loading data: {error}
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex-1 bg-[var(--bg-primary)] flex flex-col min-h-screen">
      <Header />

      <main 
        className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 flex flex-col lg:flex-row gap-6 lg:gap-8"
        onClick={handleMainClick}
      >
        {/* Left side - Featured News and News Cards (75% width) */}
        <div className="flex-1 lg:w-[75%] flex flex-col gap-6 lg:gap-8">
          {newsData.length > 0 && (
            <FeaturedNews
              newsItem={newsData[0]}
              onTitleClick={handleTitleClick}
              onShare={(url) => {
                // Use the URL from ShareButton (already includes slug with last 6 chars of ID)
                updateMetaTags(newsData[0], url);
              }}
            />
          )}

          {/* News Cards Grid - 2 columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            {newsData.slice(1).map((item) => (
              <NewsCard
                key={item.id}
                newsItem={item}
                isHighlighted={highlightedNewsId === String(item.id)}
                highlightedNewsId={highlightedNewsId}
                isExpanded={expandedNewsId === String(item.id)}
                onTitleClick={handleTitleClick}
                onCloseHighlight={handleCloseHighlight}
              />
            ))}
          </div>
        </div>

        {/* Right side - Sidebar (25% width, sticky on scroll) */}
        <aside
          className={`lg:w-[25%] lg:flex-shrink-0 flex flex-col space-y-2 transition-all lg:sticky lg:top-8 lg:self-start lg:max-h-[calc(100vh-4rem)] lg:overflow-y-auto ${
            highlightedNewsId || expandedNewsId
              ? "blur-sm opacity-60 pointer-events-none"
              : ""
          }`}
        >
          <BiasDistribution newsData={newsData} />
          <HowToRead
            newsData={newsData}
            isExpanded={sidebarExpanded}
            onToggle={() => setSidebarExpanded(!sidebarExpanded)}
          />
        </aside>

        {/* Expanded News Modal */}
        <NewsDetailModal
          expandedNewsId={expandedNewsId}
          newsData={newsData}
          onClose={() => setExpandedNewsId(null)}
        />
      </main>

      <Footer />
    </div>
  );
}

export default App;
