/**
 * Icon mapping for all 54 React ecosystem libraries
 * Uses Simple Icons via @icons-pack/react-simple-icons
 */

import {
  SiReact,
  SiRedux,
  SiNextdotjs,
  SiJest,
  SiVitest,
  SiVite,
  SiStorybook,
  SiFramer,
  SiMui,
  SiTailwindcss,
  SiGraphql,
  SiGatsby,
  SiRemix,
  SiExpo,
  SiZod,
  SiReactrouter,
  SiApollographql,
  SiXstate,
  SiStyledcomponents,
  SiChakraui,
  SiRadixui,
  SiAstro,
  SiTurborepo,
  SiTrpc,
  SiVercel,
  SiReacthookform,
} from "@icons-pack/react-simple-icons";

// Simple Icons doesn't have all libraries, so we'll use fallback for missing ones
type IconComponent = React.ComponentType<{ size?: number; color?: string; className?: string }>;

// Icon mapping by library repo name
export const libraryIcons: Record<string, IconComponent | null> = {
  // Core React
  react: SiReact,
  "react-native": SiReact,
  jest: SiJest,
  relay: SiGraphql,
  hermes: SiReact, // Hermes is from Meta/Facebook
  "react.dev": SiReact,
  rfcs: SiReact,
  "react-native-releases": SiReact,
  "react-navigation": SiReact,

  // State Management
  redux: SiRedux,
  "redux-toolkit": SiRedux,
  zustand: null, // No official icon
  jotai: null,
  valtio: null,
  xstate: SiXstate,

  // Data Fetching
  query: null, // TanStack Query
  swr: SiVercel, // SWR is from Vercel
  "apollo-client": SiApollographql,
  trpc: SiTrpc,
  urql: SiGraphql, // urql uses GraphQL

  // Routing
  "react-router": SiReactrouter,
  router: null, // TanStack Router
  wouter: null,

  // Meta-frameworks
  "next.js": SiNextdotjs,
  remix: SiRemix,
  expo: SiExpo,
  gatsby: SiGatsby,
  astro: SiAstro,

  // Forms & Validation
  "react-hook-form": SiReacthookform,
  formik: null,
  zod: SiZod,
  yup: null,
  "react-final-form": null,

  // Testing
  "react-testing-library": null,
  vitest: SiVitest,
  playwright: null, // No Simple Icon available
  "react-hooks-testing-library": null,

  // UI/Component Libraries
  primitives: SiRadixui, // Radix UI Primitives
  headlessui: SiTailwindcss,
  "react-spectrum": null,
  ariakit: null,
  "material-ui": SiMui,
  "chakra-ui": SiChakraui,

  // Animation
  motion: SiFramer,
  "react-spring": null,
  "auto-animate": null,

  // Dev Tools & Bundling
  storybook: SiStorybook,
  vite: SiVite,
  metro: SiReact,
  turbo: SiTurborepo,
  "react-devtools": SiReact,

  // Data Tables
  table: null, // TanStack Table

  // Styling
  "styled-components": SiStyledcomponents,
  emotion: null,
  tailwindcss: SiTailwindcss,
  nativewind: SiTailwindcss, // Use Tailwind logo for NativeWind
};

// Display name mapping for libraries
export const libraryDisplayNames: Record<string, string> = {
  react: "React",
  "react-native": "React Native",
  jest: "Jest",
  relay: "Relay",
  hermes: "Hermes",
  "react.dev": "React.dev",
  rfcs: "React RFCs",
  "react-native-releases": "RN Releases",
  "react-navigation": "React Navigation",
  redux: "Redux",
  "redux-toolkit": "Redux Toolkit",
  zustand: "Zustand",
  jotai: "Jotai",
  valtio: "Valtio",
  xstate: "XState",
  query: "TanStack Query",
  swr: "SWR",
  "apollo-client": "Apollo Client",
  trpc: "tRPC",
  urql: "urql",
  "react-router": "React Router",
  router: "TanStack Router",
  wouter: "Wouter",
  "next.js": "Next.js",
  remix: "Remix",
  expo: "Expo",
  gatsby: "Gatsby",
  astro: "Astro",
  "react-hook-form": "React Hook Form",
  formik: "Formik",
  zod: "Zod",
  yup: "Yup",
  "react-final-form": "React Final Form",
  "react-testing-library": "React Testing Library",
  vitest: "Vitest",
  playwright: "Playwright",
  "react-hooks-testing-library": "React Hooks Testing Library",
  primitives: "Radix UI",
  headlessui: "Headless UI",
  "react-spectrum": "React Spectrum",
  ariakit: "Ariakit",
  "material-ui": "Material UI",
  "chakra-ui": "Chakra UI",
  motion: "Framer Motion",
  "react-spring": "React Spring",
  "auto-animate": "AutoAnimate",
  storybook: "Storybook",
  vite: "Vite",
  metro: "Metro",
  turbo: "Turbo",
  "react-devtools": "React DevTools",
  table: "TanStack Table",
  "styled-components": "Styled Components",
  emotion: "Emotion",
  tailwindcss: "Tailwind CSS",
  nativewind: "NativeWind",
};

// Helper component to render library icon with fallback
export function LibraryIcon({
  libraryName,
  size = 20,
  className,
}: {
  libraryName: string;
  size?: number;
  className?: string;
}) {
  const Icon = libraryIcons[libraryName];

  if (!Icon) {
    // Fallback: First letter in a circle
    const firstLetter = libraryName.charAt(0).toUpperCase();
    return (
      <div
        className={`flex items-center justify-center rounded-md bg-background/10 ${className}`}
        style={{ width: size, height: size, fontSize: size * 0.6 }}
      >
        <span className="font-bold text-foreground/80">{firstLetter}</span>
      </div>
    );
  }

  return <Icon size={size} className={className} />;
}
