import { useState, useEffect } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

function BiasDistribution({ newsData }) {
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [openTooltip, setOpenTooltip] = useState(null);
  if (!newsData || newsData.length === 0) {
    return null;
  }

  // Calculate overall sentiment from all articles
  const allArticles = newsData.flatMap((item) => item.sources || []);

  const sentimentCounts = {
    positive: 0,
    neutral: 0,
    negative: 0,
  };

  allArticles.forEach((article) => {
    const sentiment = article.sentiment?.toLowerCase() || "neutral";
    if (sentimentCounts.hasOwnProperty(sentiment)) {
      sentimentCounts[sentiment]++;
    } else {
      sentimentCounts.neutral++;
    }
  });

  const total = allArticles.length;
  if (total === 0) return null;

  // Detect touch device
  useEffect(() => {
    const checkTouchDevice = () => {
      setIsTouchDevice(
        "ontouchstart" in window ||
          navigator.maxTouchPoints > 0 ||
          window.matchMedia("(pointer: coarse)").matches
      );
    };
    checkTouchDevice();
    window.addEventListener("resize", checkTouchDevice);
    return () => window.removeEventListener("resize", checkTouchDevice);
  }, []);

  // Close tooltip when clicking outside on mobile
  useEffect(() => {
    if (!isTouchDevice || !openTooltip) return;

    const handleClickOutside = (e) => {
      // Use a small delay to allow Radix UI's internal handlers to run first
      setTimeout(() => {
        const target = e.target;
        const isTooltipContent = target.closest('[role="tooltip"]');
        const isTooltipTrigger = target.closest('[data-radix-tooltip-trigger]');
        const isSentimentBar = target.closest('.sentiment-bar-container');
        
        // Only close if clicking outside the tooltip, trigger, and sentiment bar
        if (!isTooltipContent && !isTooltipTrigger && !isSentimentBar) {
          setOpenTooltip(null);
        }
      }, 10);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isTouchDevice, openTooltip]);

  // Calculate raw percentages
  const rawPercentages = {
    positive: (sentimentCounts.positive / total) * 100,
    neutral: (sentimentCounts.neutral / total) * 100,
    negative: (sentimentCounts.negative / total) * 100,
  };

  // Round each to one decimal place
  let percentages = {
    positive: Math.round(rawPercentages.positive * 10) / 10,
    neutral: Math.round(rawPercentages.neutral * 10) / 10,
    negative: Math.round(rawPercentages.negative * 10) / 10,
  };

  // Ensure the sum equals exactly 100.0%
  const sum = percentages.positive + percentages.neutral + percentages.negative;
  const difference = 100.0 - sum;

  // Adjust the category with the largest raw percentage to make sum exactly 100.0%
  if (Math.abs(difference) > 0.01) { // Only adjust if difference is significant
    const adjustments = [
      { key: 'positive', value: rawPercentages.positive },
      { key: 'neutral', value: rawPercentages.neutral },
      { key: 'negative', value: rawPercentages.negative },
    ];
    adjustments.sort((a, b) => b.value - a.value);
    
    // Add the difference to the largest category
    percentages[adjustments[0].key] = Math.round((percentages[adjustments[0].key] + difference) * 10) / 10;
  }

  // Create sentiment object for tooltip
  const sentiment = {
    positive: sentimentCounts.positive,
    neutral: sentimentCounts.neutral,
    negative: sentimentCounts.negative,
  };

  return (
    <div>
      <div className="mb-2">
        <h2 className="text-lg sm:text-xl font-bold text-[var(--text-primary)]">
          Pakistan's Mood Today
        </h2>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          Based on today's news coverage across Pakistani sources
        </p>
      </div>

      {/* Horizontal Bar Chart with Tooltip */}
      <TooltipProvider delayDuration={isTouchDevice ? 0 : 200}>
        <div className="relative overflow-visible">
          <div className="flex h-8 overflow-hidden bg-[var(--bg-surface)] relative sentiment-bar-container">
            {/* Negative Segment */}
            {percentages.negative > 0 && (
              <Tooltip
                open={
                  isTouchDevice ? openTooltip === "negative" : undefined
                }
                onOpenChange={(open) => {
                  if (isTouchDevice) {
                    setOpenTooltip(open ? "negative" : null);
                  }
                }}
              >
                <TooltipTrigger asChild>
                  <div
                    className="bg-[var(--accent-negative)] flex items-center justify-center cursor-pointer transition-all duration-200 hover:brightness-110 active:brightness-110"
                    style={{ width: `${percentages.negative}%` }}
                    onClick={(e) => {
                      if (isTouchDevice) {
                        e.stopPropagation();
                        setOpenTooltip(
                          openTooltip === "negative" ? null : "negative"
                        );
                      }
                    }}
                  >
                    <span className="text-xs font-medium text-white px-2">
                      {percentages.negative.toFixed(1)}%
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent
                  side="bottom"
                  className="!bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl shadow-2xl px-5 pb-5 pt-3 min-w-[280px] max-w-[320px] overflow-hidden z-[9999]"
                  style={{
                    backgroundColor: "var(--bg-card)",
                    opacity: 1,
                    borderTop: "4px solid var(--accent-negative)",
                    borderTopLeftRadius: "0.75rem",
                    borderTopRightRadius: "0.75rem",
                  }}
                >
                  <div className="relative">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <div
                              className="w-3 h-3 rounded-full shadow-lg"
                              style={{
                                backgroundColor: "var(--accent-negative)",
                                boxShadow: "var(--accent-negative)30 0 0 8px",
                              }}
                            ></div>
                            <div
                              className="absolute inset-0 w-3 h-3 rounded-full animate-ping opacity-20"
                              style={{
                                backgroundColor: "var(--accent-negative)",
                              }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium text-[var(--text-secondary)]">
                            Negative
                          </span>
                        </div>
                        <div className="flex items-baseline gap-1">
                          <span
                            className="text-2xl font-bold"
                            style={{
                              color: "var(--accent-negative)",
                            }}
                          >
                            {percentages.negative.toFixed(1)}
                          </span>
                          <span className="text-xs text-[var(--text-muted)]">
                            %
                          </span>
                        </div>
                      </div>
                      <div className="pt-2 border-t border-[var(--border-subtle)]">
                        <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                          <span className="font-semibold text-[var(--text-primary)]">
                            Negative:
                          </span>{" "}
                          Stories emphasizing risk, conflict, decline, or
                          concern.
                        </p>
                      </div>
                    </div>
                  </div>
                </TooltipContent>
              </Tooltip>
            )}

            {/* Neutral Segment */}
            {percentages.neutral > 0 && (
              <Tooltip
                open={
                  isTouchDevice ? openTooltip === "neutral" : undefined
                }
                onOpenChange={(open) => {
                  if (isTouchDevice) {
                    setOpenTooltip(open ? "neutral" : null);
                  }
                }}
              >
                <TooltipTrigger asChild>
                  <div
                    className="bg-[var(--accent-neutral)] flex items-center justify-center cursor-pointer transition-all duration-200 hover:brightness-110 active:brightness-110"
                    style={{ width: `${percentages.neutral}%` }}
                    onClick={(e) => {
                      if (isTouchDevice) {
                        e.stopPropagation();
                        setOpenTooltip(
                          openTooltip === "neutral" ? null : "neutral"
                        );
                      }
                    }}
                  >
                    <span className="text-xs font-medium text-white px-2">
                      {percentages.neutral.toFixed(1)}%
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent
                  side="bottom"
                  className="!bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl shadow-2xl px-5 pb-5 pt-3 min-w-[280px] max-w-[320px] overflow-hidden z-[9999]"
                  style={{
                    backgroundColor: "var(--bg-card)",
                    opacity: 1,
                    borderTop: "4px solid var(--accent-neutral)",
                    borderTopLeftRadius: "0.75rem",
                    borderTopRightRadius: "0.75rem",
                  }}
                >
                  <div className="relative">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <div
                              className="w-3 h-3 rounded-full shadow-lg"
                              style={{
                                backgroundColor: "var(--accent-neutral)",
                                boxShadow: "var(--accent-neutral)30 0 0 8px",
                              }}
                            ></div>
                            <div
                              className="absolute inset-0 w-3 h-3 rounded-full animate-ping opacity-20"
                              style={{
                                backgroundColor: "var(--accent-neutral)",
                              }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium text-[var(--text-secondary)]">
                            Neutral
                          </span>
                        </div>
                        <div className="flex items-baseline gap-1">
                          <span
                            className="text-2xl font-bold"
                            style={{
                              color: "var(--accent-neutral)",
                            }}
                          >
                            {percentages.neutral.toFixed(1)}
                          </span>
                          <span className="text-xs text-[var(--text-muted)]">
                            %
                          </span>
                        </div>
                      </div>
                      <div className="pt-2 border-t border-[var(--border-subtle)]">
                        <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                          <span className="font-semibold text-[var(--text-primary)]">
                            Neutral:
                          </span>{" "}
                          Informational or balanced coverage without strong
                          emotional framing.
                        </p>
                      </div>
                    </div>
                  </div>
                </TooltipContent>
              </Tooltip>
            )}

            {/* Positive Segment */}
            {percentages.positive > 0 && (
              <Tooltip
                open={
                  isTouchDevice ? openTooltip === "positive" : undefined
                }
                onOpenChange={(open) => {
                  if (isTouchDevice) {
                    setOpenTooltip(open ? "positive" : null);
                  }
                }}
              >
                <TooltipTrigger asChild>
                  <div
                    className="bg-[var(--accent-positive)] flex items-center justify-center cursor-pointer transition-all duration-200 hover:brightness-110 active:brightness-110"
                    style={{ width: `${percentages.positive}%` }}
                    onClick={(e) => {
                      if (isTouchDevice) {
                        e.stopPropagation();
                        setOpenTooltip(
                          openTooltip === "positive" ? null : "positive"
                        );
                      }
                    }}
                  >
                    <span className="text-xs font-medium text-white px-2">
                      {percentages.positive.toFixed(1)}%
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent
                  side="bottom"
                  className="!bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl shadow-2xl px-5 pb-5 pt-3 min-w-[280px] max-w-[320px] overflow-hidden z-[9999]"
                  style={{
                    backgroundColor: "var(--bg-card)",
                    opacity: 1,
                    borderTop: "4px solid var(--accent-positive)",
                    borderTopLeftRadius: "0.75rem",
                    borderTopRightRadius: "0.75rem",
                  }}
                >
                  <div className="relative">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <div
                              className="w-3 h-3 rounded-full shadow-lg"
                              style={{
                                backgroundColor: "var(--accent-positive)",
                                boxShadow: "var(--accent-positive)30 0 0 8px",
                              }}
                            ></div>
                            <div
                              className="absolute inset-0 w-3 h-3 rounded-full animate-ping opacity-20"
                              style={{
                                backgroundColor: "var(--accent-positive)",
                              }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium text-[var(--text-secondary)]">
                            Positive
                          </span>
                        </div>
                        <div className="flex items-baseline gap-1">
                          <span
                            className="text-2xl font-bold"
                            style={{
                              color: "var(--accent-positive)",
                            }}
                          >
                            {percentages.positive.toFixed(1)}
                          </span>
                          <span className="text-xs text-[var(--text-muted)]">
                            %
                          </span>
                        </div>
                      </div>
                      <div className="pt-2 border-t border-[var(--border-subtle)]">
                        <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                          <span className="font-semibold text-[var(--text-primary)]">
                            Positive:
                          </span>{" "}
                          Stories framed with optimism, progress, opportunity,
                          or growth.
                        </p>
                      </div>
                    </div>
                  </div>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        </div>
      </TooltipProvider>
    </div>
  );
}

export default BiasDistribution;
