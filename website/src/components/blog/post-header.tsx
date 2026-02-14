import { Calendar, Clock, ArrowLeft, Tag } from "lucide-react";
import Link from "next/link";
import { ShareButtons } from "./share-buttons";

interface PostHeaderProps {
  title: string;
  description?: string;
  date: string;
  author?: {
    name: string;
    title?: string;
    url?: string;
    avatar?: string;
  };
  readingTime: number;
  tags?: string[];
  slug: string;
}

export function PostHeader({
  title,
  description,
  date,
  author,
  readingTime,
  tags,
  slug,
}: PostHeaderProps) {
  return (
    <div className="mb-8">
      <Link
        href="/blog"
        className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 transition-colors mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to blog
      </Link>

      <h1 className="text-3xl sm:text-4xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
        {title}
      </h1>

      {description && (
        <p className="text-lg text-neutral-600 dark:text-neutral-400 mb-6">
          {description}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-4 text-sm text-neutral-500 dark:text-neutral-400 mb-4">
        {author && (
          <div className="flex items-center gap-2">
            {author.avatar && (
              <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-700 dark:text-blue-300 text-sm font-semibold">
                {author.name.charAt(0)}
              </div>
            )}
            <div>
              {author.url ? (
                <a
                  href={author.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-neutral-700 dark:text-neutral-300 hover:text-blue-700 dark:hover:text-blue-400 transition-colors"
                >
                  {author.name}
                </a>
              ) : (
                <span className="font-medium text-neutral-700 dark:text-neutral-300">
                  {author.name}
                </span>
              )}
              {author.title && (
                <p className="text-xs text-neutral-500 dark:text-neutral-500">
                  {author.title}
                </p>
              )}
            </div>
          </div>
        )}

        <span className="flex items-center gap-1">
          <Calendar className="h-4 w-4" />
          {new Date(date).toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
        </span>

        <span className="flex items-center gap-1">
          <Clock className="h-4 w-4" />
          {readingTime} min read
        </span>
      </div>

      {tags && tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 rounded-full bg-blue-50 dark:bg-blue-950 px-3 py-1 text-xs font-medium text-blue-700 dark:text-blue-300"
            >
              <Tag className="h-3 w-3" />
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="border-t border-neutral-200 dark:border-neutral-800 pt-4">
        <ShareButtons
          title={title}
          url={`https://agentpolicy.org/blog/${slug}`}
        />
      </div>
    </div>
  );
}
