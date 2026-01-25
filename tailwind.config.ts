import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  safelist: [
    // Category badge colors - dynamically generated, must be safelisted
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
    'bg-gray-500',
  ],
  theme: {
    extend: {
      colors: {
        // Semantic tokens using CSS variables
        "bg-primary": "var(--bg-primary)",
        "bg-surface": "var(--bg-surface)",
        "bg-card": "var(--bg-card)",
        "text-primary": "var(--text-primary)",
        "text-secondary": "var(--text-secondary)",
        "text-muted": "var(--text-muted)",
        "border-subtle": "var(--border-subtle)",
        "accent-positive": "var(--accent-positive)",
        "accent-neutral": "var(--accent-neutral)",
        "accent-negative": "var(--accent-negative)",
        // Legacy support (will be phased out)
        sentiment: {
          positive: "var(--accent-positive)",
          negative: "var(--accent-negative)",
          neutral: "var(--accent-neutral)",
        },
        // shadcn/ui colors
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: [
          "UniversalSans",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Oxygen",
          "Ubuntu",
          "Cantarell",
          "Fira Sans",
          "Droid Sans",
          "Helvetica Neue",
          "sans-serif",
        ],
        serif: ["Georgia", "Times New Roman", "serif"],
      },
      gridTemplateColumns: {
        "20": "repeat(20, minmax(0, 1fr))",
      },
    },
  },
  plugins: [],
};

export default config;

