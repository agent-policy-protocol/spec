import { Calendar, Clock, ArrowLeft, Tag } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

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
}: PostHeaderProps) {
  return (
    <div className="mb-8">
      <Button variant="ghost" size="sm" asChild className="mb-6 -ml-2">
        <Link href="/blog">
          <ArrowLeft className="h-4 w-4" />
          Back to blog
        </Link>
      </Button>

      <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
        {title}
      </h1>

      {description && (
        <p className="text-lg text-muted-foreground mb-6">{description}</p>
      )}

      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
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
                  className="font-medium text-foreground hover:text-blue-700 dark:hover:text-blue-400 transition-colors"
                >
                  {author.name}
                </a>
              ) : (
                <span className="font-medium text-foreground">
                  {author.name}
                </span>
              )}
              {author.title && (
                <p className="text-xs text-muted-foreground">{author.title}</p>
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
            <Badge key={tag} variant="secondary" className="gap-1">
              <Tag className="h-3 w-3" />
              {tag}
            </Badge>
          ))}
        </div>
      )}

      <Separator />
    </div>
  );
}
