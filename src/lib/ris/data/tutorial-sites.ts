/**
 * Tutorial Sites and Resources for Tutorial References
 *
 * Curated list of reputable React tutorial sites, courses, and learning resources
 * used to measure educational value by checking which libraries are mentioned/taught.
 *
 * Selection criteria:
 * - High-quality, maintained content
 * - Significant reach/audience
 * - Teaches real-world React development
 * - Regularly updated
 *
 * Last updated: 2025-01
 */

export interface TutorialSite {
  name: string;
  url: string;
  type: 'documentation' | 'course-platform' | 'blog' | 'video' | 'interactive' | 'github-repo';
  reach: 'high' | 'medium'; // Estimated audience size
  description: string;
}

export const TUTORIAL_SITES: TutorialSite[] = [
  // Official Documentation
  {
    name: 'React.dev',
    url: 'https://react.dev',
    type: 'documentation',
    reach: 'high',
    description: 'Official React documentation',
  },
  {
    name: 'Next.js Docs',
    url: 'https://nextjs.org/docs',
    type: 'documentation',
    reach: 'high',
    description: 'Next.js official documentation',
  },
  {
    name: 'Remix Docs',
    url: 'https://remix.run/docs',
    type: 'documentation',
    reach: 'high',
    description: 'Remix official documentation',
  },

  // Course Platforms
  {
    name: 'Egghead.io',
    url: 'https://egghead.io',
    type: 'course-platform',
    reach: 'high',
    description: 'Professional React courses',
  },
  {
    name: 'Frontend Masters',
    url: 'https://frontendmasters.com',
    type: 'course-platform',
    reach: 'high',
    description: 'Expert-led frontend courses',
  },
  {
    name: 'Epic React',
    url: 'https://epicreact.dev',
    type: 'course-platform',
    reach: 'high',
    description: 'Kent C. Dodds React course',
  },
  {
    name: 'React Training',
    url: 'https://reacttraining.com',
    type: 'course-platform',
    reach: 'medium',
    description: 'React Router team courses',
  },
  {
    name: 'Udemy React Courses',
    url: 'https://www.udemy.com/topic/react/',
    type: 'course-platform',
    reach: 'high',
    description: 'Udemy React courses',
  },
  {
    name: 'Pluralsight React',
    url: 'https://www.pluralsight.com/paths/react',
    type: 'course-platform',
    reach: 'high',
    description: 'Pluralsight React path',
  },

  // High-Quality Blogs
  {
    name: 'Kent C. Dodds Blog',
    url: 'https://kentcdodds.com/blog',
    type: 'blog',
    reach: 'high',
    description: 'Testing Library, Remix author',
  },
  {
    name: 'Josh W Comeau',
    url: 'https://www.joshwcomeau.com',
    type: 'blog',
    reach: 'high',
    description: 'Interactive React tutorials',
  },
  {
    name: 'Dan Abramov Blog',
    url: 'https://overreacted.io',
    type: 'blog',
    reach: 'high',
    description: 'React core team member',
  },
  {
    name: 'Robin Wieruch',
    url: 'https://www.robinwieruch.de/blog',
    type: 'blog',
    reach: 'high',
    description: 'Comprehensive React tutorials',
  },
  {
    name: 'LogRocket Blog',
    url: 'https://blog.logrocket.com',
    type: 'blog',
    reach: 'high',
    description: 'React best practices',
  },
  {
    name: 'Smashing Magazine React',
    url: 'https://www.smashingmagazine.com/category/react',
    type: 'blog',
    reach: 'high',
    description: 'Web development magazine',
  },

  // Video Content
  {
    name: 'Web Dev Simplified',
    url: 'https://www.youtube.com/@WebDevSimplified',
    type: 'video',
    reach: 'high',
    description: 'Popular React YouTube channel',
  },
  {
    name: 'Fireship',
    url: 'https://www.youtube.com/@Fireship',
    type: 'video',
    reach: 'high',
    description: 'Quick web dev tutorials',
  },
  {
    name: 'Theo - t3.gg',
    url: 'https://www.youtube.com/@t3dotgg',
    type: 'video',
    reach: 'high',
    description: 'T3 stack creator',
  },

  // Interactive Learning
  {
    name: 'Scrimba React',
    url: 'https://scrimba.com/learn/learnreact',
    type: 'interactive',
    reach: 'high',
    description: 'Interactive React course',
  },
  {
    name: 'React Tutorial by W3Schools',
    url: 'https://www.w3schools.com/react/',
    type: 'interactive',
    reach: 'high',
    description: 'Interactive React basics',
  },
  {
    name: 'freeCodeCamp React',
    url: 'https://www.freecodecamp.org/learn/front-end-development-libraries/',
    type: 'interactive',
    reach: 'high',
    description: 'Free React certification',
  },

  // GitHub Learning Repos
  {
    name: 'React TypeScript Cheatsheet',
    url: 'https://github.com/typescript-cheatsheets/react',
    type: 'github-repo',
    reach: 'high',
    description: '45k stars TypeScript guide',
  },
  {
    name: 'Awesome React',
    url: 'https://github.com/enaqx/awesome-react',
    type: 'github-repo',
    reach: 'high',
    description: 'Curated React resources',
  },
  {
    name: 'React Patterns',
    url: 'https://github.com/chantastic/reactpatterns.com',
    type: 'github-repo',
    reach: 'medium',
    description: 'React patterns guide',
  },

  // Developer Portals
  {
    name: 'MDN Web Docs React',
    url: 'https://developer.mozilla.org/en-US/docs/Learn/Tools_and_testing/Client-side_JavaScript_frameworks/React_getting_started',
    type: 'documentation',
    reach: 'high',
    description: 'MDN React guides',
  },
  {
    name: 'DigitalOcean React Tutorials',
    url: 'https://www.digitalocean.com/community/tags/react',
    type: 'blog',
    reach: 'high',
    description: 'Community React tutorials',
  },
];

/**
 * Get tutorial sites by type
 */
export function getTutorialSitesByType(type: TutorialSite['type']): TutorialSite[] {
  return TUTORIAL_SITES.filter(site => site.type === type);
}

/**
 * Get high-reach tutorial sites
 */
export function getHighReachSites(): TutorialSite[] {
  return TUTORIAL_SITES.filter(site => site.reach === 'high');
}

/**
 * Get total number of tutorial sites
 */
export function getTutorialSiteCount(): number {
  return TUTORIAL_SITES.length;
}
