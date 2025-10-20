export type Author = {
  slug: string;
  name: string;
  title: string;
  bio: string;
  avatar?: string;
  github?: string;
  twitter?: string;
  linkedin?: string;
  website?: string;
};

export const authors: Record<string, Author> = {
  'seth-webster': {
    slug: 'seth-webster',
    name: 'Seth Webster',
    title: 'Executive Director, React Foundation',
    bio: "Seth has had the privilege of leading React at Meta for many years. As Executive Director of the React Foundation, he carries the same North Star: helping others bring their ideas to life.",
    avatar: '/seth-webster-headshot.jpeg',
    github: 'https://github.com/sethwebster',
    twitter: 'https://x.com/sethwebster',
    linkedin: 'https://www.linkedin.com/in/sethwebster/',
  },
  // Add more authors here
};

export function getAuthorBySlug(slug: string): Author | null {
  return authors[slug] || null;
}

export function getAllAuthors(): Author[] {
  return Object.values(authors);
}
