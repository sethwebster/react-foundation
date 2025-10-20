import type { MDXComponents } from 'mdx/types';

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...components,
    // Custom components can be added here if needed
    // The prose classes from Tailwind Typography will handle styling
  };
}
