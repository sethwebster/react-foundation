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

function readUpdate(slug: string): Update | null {
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

function isPublished(update: Update): boolean {
  return update.metadata.draft !== true;
}

export function getAllUpdates(): Update[] {
  if (!fs.existsSync(updatesDirectory)) {
    return [];
  }

  return fs
    .readdirSync(updatesDirectory)
    .filter((fileName) => fileName.endsWith('.mdx'))
    .map((fileName) => readUpdate(fileName.replace(/\.mdx$/, '')))
    .filter((update): update is Update => update !== null)
    .filter(isPublished)
    .sort((a, b) => {
      return new Date(b.metadata.date).getTime() - new Date(a.metadata.date).getTime();
    });
}

export function getUpdateBySlug(slug: string): Update | null {
  const update = readUpdate(slug);
  return update && isPublished(update) ? update : null;
}
