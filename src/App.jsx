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
      if (hash.startsWith("#news-")) {
        const newsId = hash.replace("#news-", "");

        // Check if the news item exists in the current data
        const newsExists = newsData.some((item) => String(item.id) === newsId);

        if (newsExists) {
          setHighlightedNewsId(newsId);

          // Update meta tags for the shared news item
          const newsItem = newsData.find((item) => String(item.id) === newsId);
          if (newsItem) {
            const shareUrl = `${window.location.origin}${window.location.pathname}${hash}`;
            updateMetaTags(newsItem, shareUrl);
          }

          // Scroll to the highlighted news after a delay to ensure it's rendered
          setTimeout(() => {
            const element = document.getElementById(`news-${newsId}`);
            if (element) {
              element.scrollIntoView({ behavior: "smooth", block: "center" });
            }
          }, 300);
        } else {
          // News item doesn't exist - redirect to main page by clearing the hash
          window.location.hash = "";
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

  // Handle clicking outside to close highlight
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!highlightedNewsId && !expandedNewsId) return;

      // Check if click is outside any news card
      const clickedElement = event.target;
      const newsCard = clickedElement.closest('article[id^="news-"]');
      const modalCard = clickedElement.closest(".expanded-news-modal");

      if (!newsCard && !modalCard) {
        // Clicked outside, clear highlight and expanded view
        window.location.hash = "";
        setHighlightedNewsId(null);
        setExpandedNewsId(null);
      }
    };

    if (highlightedNewsId || expandedNewsId) {
      document.addEventListener("click", handleClickOutside);
      return () => {
        document.removeEventListener("click", handleClickOutside);
      };
    }
  }, [highlightedNewsId, expandedNewsId]);

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

  // Prevent body scroll when card is expanded
  useEffect(() => {
    if (expandedNewsId) {
      // Save current scroll position
      const scrollY = window.scrollY;
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = "100%";
      document.body.style.overflow = "hidden";

      return () => {
        // Restore scroll position
        document.body.style.position = "";
        document.body.style.top = "";
        document.body.style.width = "";
        document.body.style.overflow = "";
        window.scrollTo(0, scrollY);
      };
    }
  }, [expandedNewsId]);

  const handleTitleClick = (newsId) => {
    // If card is highlighted (from shared link), clear highlight first
    if (highlightedNewsId === String(newsId)) {
      window.location.hash = "";
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
    window.location.hash = "";
    setHighlightedNewsId(null);
  };

  if (loading) {
    return (
      <div className="flex-1 bg-[var(--bg-primary)] flex flex-col">
        <Header />
        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--text-primary)]"></div>
            <p className="mt-4 text-[var(--text-secondary)]">Loading news...</p>
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
    <div className="flex-1 bg-[var(--bg-primary)] flex flex-col">
      <Header />

      {usingSampleData && (
        <div className="bg-[var(--bg-surface)] border-b border-[var(--border-subtle)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <p className="text-sm text-[var(--text-secondary)]">
              ⚠️ Using sample data. Configure Supabase to use real data.
            </p>
          </div>
        </div>
      )}

      <main className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
        {newsData.length > 0 ? (
          <>
            {/* Featured News and Sidebar - 75/25 split */}
            <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 mb-8 lg:items-stretch">
              {/* Featured News - 75% width */}
              <div className="flex-1 lg:w-[75%] order-2 lg:order-1 flex">
                {newsData.length > 0 && (
                  <FeaturedNews
                    newsItem={newsData[0]}
                    onTitleClick={handleTitleClick}
                    onShare={(url) => {
                      const shareUrl = `${window.location.origin}${window.location.pathname}#news-${newsData[0].id}`;
                      updateMetaTags(newsData[0], shareUrl);
                    }}
                  />
                )}
              </div>

              {/* Sidebar - 25% width, sticky on scroll */}
              <div
                className={`lg:w-[25%] lg:flex-shrink-0 order-1 lg:order-2 flex flex-col space-y-2 transition-all lg:sticky lg:top-8 lg:self-start ${
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
              </div>
            </div>

            {/* News Cards Grid - 2 columns, matching Featured News width exactly */}
            <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
              <div className="flex-1 lg:w-[75%] relative">
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
              {/* Empty spacer to match sidebar width */}
              <div className="hidden lg:block lg:w-[25%]"></div>
            </div>

            {/* Expanded News Modal */}
            <NewsDetailModal
              expandedNewsId={expandedNewsId}
              newsData={newsData}
              onClose={() => setExpandedNewsId(null)}
            />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center py-12">
              <p className="text-[var(--text-secondary)]">
                No news data available.
              </p>
              {error && (
                <div className="mt-4 bg-[var(--bg-card)] border border-[var(--accent-negative)] rounded-lg p-4 max-w-md mx-auto">
                  <p className="text-[var(--accent-negative)] font-semibold">
                    Error:
                  </p>
                  <p className="text-[var(--text-secondary)] text-sm">
                    {error}
                  </p>
                </div>
              )}
              <div className="mt-4 text-sm text-[var(--text-muted)] space-y-1">
                <p>NewsData length: {newsData.length}</p>
                <p>Loading: {loading ? "Yes" : "No"}</p>
                <p>Using sample data: {usingSampleData ? "Yes" : "No"}</p>
                <p>
                  Supabase configured: {isSupabaseConfigured ? "Yes" : "No"}
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default App;
