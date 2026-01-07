import { useEffect, useRef } from "react";

function SentimentTooltip({
  hoveredSegment,
  sentiment,
  tooltipRef,
  sentimentBarRef,
  tooltipStyle,
  setTooltipStyle,
}) {
  const previousStyleRef = useRef(null);

  useEffect(() => {
    if (
      !hoveredSegment ||
      !tooltipRef.current ||
      !sentimentBarRef.current ||
      !sentiment
    ) {
      // Only clear tooltip style if it was previously set
      if (previousStyleRef.current !== null) {
        setTooltipStyle({});
        previousStyleRef.current = null;
      }
      return;
    }

    const { positive, neutral, negative } = sentiment;
    const total = positive + neutral + negative;
    const percentages =
      total > 0
        ? {
            positive: Math.round((positive / total) * 100),
            neutral: Math.round((neutral / total) * 100),
            negative: Math.round((negative / total) * 100),
          }
        : { positive: 0, neutral: 0, negative: 0 };

    const updatePosition = () => {
      const container = sentimentBarRef.current;
      const tooltip = tooltipRef.current;
      if (!container || !tooltip) return;

      const containerRect = container.getBoundingClientRect();
      const tooltipRect = tooltip.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const padding = 16;

      let leftPercent = 0;
      if (hoveredSegment === "negative") {
        leftPercent = percentages.negative / 2;
      } else if (hoveredSegment === "neutral") {
        leftPercent = percentages.negative + percentages.neutral / 2;
      } else if (hoveredSegment === "positive") {
        leftPercent =
          percentages.negative + percentages.neutral + percentages.positive / 2;
      }

      const containerWidth = containerRect.width;
      const tooltipWidth = tooltipRect.width || 320;
      const leftPosition = (containerWidth * leftPercent) / 100;
      const tooltipLeft = containerRect.left + leftPosition - tooltipWidth / 2;

      let adjustedLeft = leftPercent;
      if (tooltipLeft < padding) {
        const overflow = padding - tooltipLeft;
        adjustedLeft = leftPercent + (overflow / containerWidth) * 100;
      }

      const tooltipRight =
        containerRect.left +
        (containerWidth * adjustedLeft) / 100 +
        tooltipWidth / 2;
      if (tooltipRight > viewportWidth - padding) {
        const overflow = tooltipRight - (viewportWidth - padding);
        adjustedLeft = adjustedLeft - (overflow / containerWidth) * 100;
      }

      const spaceAbove = containerRect.top;
      const spaceBelow = viewportHeight - containerRect.bottom;
      const tooltipHeight = tooltipRect.height || 200;
      const showAbove =
        spaceAbove > tooltipHeight + padding || spaceAbove > spaceBelow;

      const tooltipCenterX =
        containerRect.left + (containerWidth * adjustedLeft) / 100;
      const segmentCenterX =
        containerRect.left + (containerWidth * leftPercent) / 100;
      const arrowOffset = segmentCenterX - tooltipCenterX;
      const arrowPositionPercent = (arrowOffset / tooltipWidth) * 100;

      const newStyle = {
        left: `${adjustedLeft}%`,
        transform: "translateX(-50%)",
        bottom: showAbove ? "100%" : "auto",
        top: showAbove ? "auto" : "100%",
        marginBottom: showAbove ? "0.5rem" : "0",
        marginTop: showAbove ? "0" : "0.5rem",
        arrowOffset: `${arrowPositionPercent}%`,
      };

      // Only update if style actually changed
      const styleString = JSON.stringify(newStyle);
      if (previousStyleRef.current !== styleString) {
        setTooltipStyle(newStyle);
        previousStyleRef.current = styleString;
      }
    };

    const timeoutId = setTimeout(updatePosition, 10);
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hoveredSegment, sentiment]);

  const getTooltipContent = (segment) => {
    if (!segment || !sentiment) return null;

    const { positive, neutral, negative } = sentiment;
    const total = positive + neutral + negative;
    const percentages =
      total > 0
        ? {
            positive: Math.round((positive / total) * 100),
            neutral: Math.round((neutral / total) * 100),
            negative: Math.round((negative / total) * 100),
          }
        : { positive: 0, neutral: 0, negative: 0 };

    const segmentData = {
      negative: {
        label: "Negative",
        percentage: percentages.negative,
        color: "var(--accent-negative)",
        count: negative,
        description: "Stories emphasizing risk, conflict, decline, or concern.",
      },
      neutral: {
        label: "Neutral",
        percentage: percentages.neutral,
        color: "var(--accent-neutral)",
        count: neutral,
        description:
          "Informational or balanced coverage without strong emotional framing.",
      },
      positive: {
        label: "Positive",
        percentage: percentages.positive,
        color: "var(--accent-positive)",
        count: positive,
        description:
          "Stories framed with optimism, progress, opportunity, or growth.",
      },
    };
    return segmentData[segment];
  };

  const tooltipData = getTooltipContent(hoveredSegment);

  if (!tooltipData) return null;

  return (
    <div
      ref={tooltipRef}
      className="absolute opacity-0 invisible transition-all duration-300 ease-out z-[9999] pointer-events-none"
      style={{
        ...tooltipStyle,
        opacity: hoveredSegment ? 1 : 0,
        visibility: hoveredSegment ? "visible" : "hidden",
        transform: hoveredSegment
          ? tooltipStyle.transform || "translateX(-50%) translateY(0)"
          : "translateX(-50%) translateY(8px)",
      }}
    >
      <div className="relative">
        <div className="bg-gradient-to-br from-[var(--bg-card)] to-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl shadow-2xl p-5 min-w-[280px] max-w-[320px] backdrop-blur-md">
          <div
            className="absolute top-0 left-0 right-0 h-1 rounded-t-xl"
            style={{ backgroundColor: tooltipData.color }}
          ></div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div
                    className="w-3 h-3 rounded-full shadow-lg"
                    style={{
                      backgroundColor: tooltipData.color,
                      boxShadow: `${tooltipData.color}30 0 0 8px`,
                    }}
                  ></div>
                  <div
                    className="absolute inset-0 w-3 h-3 rounded-full animate-ping opacity-20"
                    style={{ backgroundColor: tooltipData.color }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-[var(--text-secondary)]">
                  {tooltipData.label}
                </span>
              </div>
              <div className="flex items-baseline gap-1">
                <span
                  className="text-2xl font-bold"
                  style={{ color: tooltipData.color }}
                >
                  {tooltipData.percentage}
                </span>
                <span className="text-xs text-[var(--text-muted)]">%</span>
              </div>
            </div>
            <div className="pt-2 border-t border-[var(--border-subtle)]">
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                <span className="font-semibold text-[var(--text-primary)]">
                  {tooltipData.label}:
                </span>{" "}
                {tooltipData.description}
              </p>
            </div>
          </div>
        </div>
        <div
          className={`absolute -mt-px`}
          style={{
            left: tooltipStyle.arrowOffset
              ? `calc(50% + ${tooltipStyle.arrowOffset})`
              : "50%",
            transform: "translateX(-50%)",
            ...(tooltipStyle.bottom !== undefined
              ? { top: "100%" }
              : { bottom: "100%" }),
          }}
        >
          <div
            className="w-3 h-3 bg-gradient-to-br from-[var(--bg-card)] to-[var(--bg-surface)] border-l border-b border-[var(--border-subtle)]"
            style={{
              transform:
                tooltipStyle.bottom !== undefined
                  ? "rotate(45deg)"
                  : "rotate(-135deg)",
            }}
          ></div>
        </div>
      </div>
    </div>
  );
}

export default SentimentTooltip;
