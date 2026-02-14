import Link from "next/link";
import { Calendar, Clock, Tag } from "lucide-react";

interface PostCardProps {
  slug: string;
  title: string;
  description?: string;
  date: string;
  author?: {
    name: string;
    title?: string;
  };
  readingTime: number;
  tags?: string[];
}

export function PostCard({
  slug,
  title,
  description,
  date,
  author,
  readingTime,
  tags,
}: PostCardProps) {
  return (
    <Link
      href={`/blog/${slug}`}
      className="group block rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md transition-all"
    >
      <div className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
          {title}
        </h3>
        {description && (
          <p className="text-sm text-neutral-600 dark:text-neutral-400 line-clamp-3">
            {description}
          </p>
        )}
        <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-500 dark:text-neutral-500">
          <span className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            {new Date(date).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {readingTime} min read
          </span>
          {author && (
            <span className="text-neutral-400 dark:text-neutral-600">
              by {author.name}
            </span>
          )}
        </div>
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-1">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 rounded-full bg-blue-50 dark:bg-blue-950 px-2.5 py-0.5 text-xs font-medium text-blue-700 dark:text-blue-300"
              >
                <Tag className="h-3 w-3" />
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
