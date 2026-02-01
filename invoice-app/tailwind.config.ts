import type { Config } from "tailwindcss"

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ["Inter Tight", "ui-sans-serif", "system-ui"],
      },
      colors: {
        // Primary Colors (UDON Theme)
        primary: { 
          DEFAULT: '#a855f7', 
          500: '#a855f7', 
          600: '#9333ea', 
          700: '#7e22ce',
          foreground: '#ffffff'
        },
        secondary: { 
          DEFAULT: '#6366f1', 
          500: '#6366f1', 
          600: '#4f46e5',
          foreground: '#ffffff'
        },
        success: { 
          DEFAULT: '#06b6d4', 
          500: '#06b6d4', 
          600: '#0891b2',
          foreground: '#ffffff'
        },
        danger: { 
          DEFAULT: '#f87171', 
          500: '#f87171', 
          600: '#dc2626',
          foreground: '#ffffff'
        },
        warning: { 
          DEFAULT: '#f59e0b', 
          500: '#f59e0b', 
          600: '#d97706',
          foreground: '#ffffff'
        },
        info: { 
          DEFAULT: '#0ea5e9', 
          500: '#0ea5e9', 
          600: '#0284c7',
          foreground: '#ffffff'
        },
        // Dark Mode Palette
        dark: { 
          50: '#f1f5f9', 
          100: '#e2e8f0', 
          200: '#cbd5e1',
          300: '#94a3b8', 
          400: '#64748b',
          500: '#475569', 
          600: '#334155', 
          700: '#1e293b', 
          800: '#0f172a', 
          900: '#020617',
          950: '#0a0a0a'
        },
        // shadcn compatibility
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
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
      fontSize: {
        'h1': ['2.25rem', { lineHeight: '1.3', fontWeight: '700' }],
        'h2': ['1.875rem', { lineHeight: '1.3', fontWeight: '700' }],
        'h3': ['1.5rem', { lineHeight: '1.3', fontWeight: '700' }],
        'h4': ['1.3125rem', { lineHeight: '1.4', fontWeight: '700' }],
        'h5': ['1.0625rem', { lineHeight: '1.4', fontWeight: '700' }],
        'h6': ['0.875rem', { lineHeight: '1.5', fontWeight: '700' }],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [],
}
export default config
