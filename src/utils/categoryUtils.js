/**
 * Utility functions for category tags
 */

/**
 * Capitalizes the first letter of a string
 * @param {string} str - The string to capitalize
 * @returns {string} - The string with first letter capitalized
 */
export function capitalizeFirst(str) {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Direct color mapping for each category tag
 * Each tag gets a unique, visually distinct color
 * Colors are muted/subdued to be less prominent
 */
const CATEGORY_COLOR_MAP = {
  politics: { bg: "#DC7878", text: "#FFFFFF" },      // Muted Red
  economy: { bg: "#4A9B7F", text: "#FFFFFF" },       // Muted Green
  sports: { bg: "#D4A574", text: "#FFFFFF" },        // Muted Amber/Orange
  international: { bg: "#7BA3D4", text: "#FFFFFF" }, // Muted Blue
  security: { bg: "#9B7FC4", text: "#FFFFFF" },      // Muted Purple
  society: { bg: "#D48FB3", text: "#FFFFFF" },      // Muted Pink
  technology: { bg: "#6BB5C4", text: "#FFFFFF" },    // Muted Cyan
  health: { bg: "#5FA88A", text: "#FFFFFF" },        // Muted Green
  education: { bg: "#D49A6A", text: "#FFFFFF" },      // Muted Orange
  other: { bg: "#94A3B8", text: "#FFFFFF" },         // Muted Slate Gray
};

/**
 * Gets the color for a category tag
 * Returns a default color if category is not in the map
 * @param {string} category - The category name (case-insensitive)
 * @returns {Object} - Object with bg and text color properties
 */
export function getCategoryColor(category) {
  if (!category) {
    return { bg: "var(--bg-surface)", text: "var(--text-secondary)" };
  }

  // Normalize category name to lowercase for lookup
  const normalizedCategory = category.toLowerCase().trim();
  
  // Return mapped color or default
  return CATEGORY_COLOR_MAP[normalizedCategory] || {
    bg: "var(--bg-surface)",
    text: "var(--text-secondary)"
  };
}

