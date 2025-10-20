import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

export type UpdateMetadata = {
  title: string;
  description: string;
  date: string;
  author: string; // Author slug (e.g., 'seth-webster')
  draft?: boolean;
};

export type Update = {
  slug: string;
  metadata: UpdateMetadata;
  content: string;
};

const updatesDirectory = path.join(process.cwd(), 'content/updates');

export function getAllUpdates(): Update[] {
  // Create directory if it doesn't exist
  if (!fs.existsSync(updatesDirectory)) {
    return [];
  }

  const fileNames = fs.readdirSync(updatesDirectory);

  const allUpdates = fileNames
    .filter((fileName) => fileName.endsWith('.mdx'))
    .map((fileName) => {
      const slug = fileName.replace(/\.mdx$/, '');
      const fullPath = path.join(updatesDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, 'utf8');
      const { data, content } = matter(fileContents);

      return {
        slug,
        metadata: data as UpdateMetadata,
        content,
      };
    })
    // Filter out drafts in production
    .filter((update) => {
      if (process.env.NODE_ENV === 'production') {
        return !update.metadata.draft;
      }
      return true;
    })
    // Sort by date (newest first)
    .sort((a, b) => {
      return new Date(b.metadata.date).getTime() - new Date(a.metadata.date).getTime();
    });

  return allUpdates;
}

export function getUpdateBySlug(slug: string): Update | null {
  try {
    const fullPath = path.join(updatesDirectory, `${slug}.mdx`);
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { data, content } = matter(fileContents);

    return {
      slug,
      metadata: data as UpdateMetadata,
      content,
    };
  } catch {
    return null;
  }
}
