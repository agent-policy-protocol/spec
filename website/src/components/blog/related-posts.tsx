import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";
import type { BlogPost } from "@/lib/blog";

interface RelatedPostsProps {
  currentSlug: string;
  currentTags?: string[];
  allPosts: BlogPost[];
  maxPosts?: number;
}

export function RelatedPosts({
  currentSlug,
  currentTags = [],
  allPosts,
  maxPosts = 3,
}: RelatedPostsProps) {
  // Find related posts by matching tags
  const relatedPosts = allPosts
    .filter((post) => post.slug !== currentSlug) // Exclude current post
    .map((post) => {
      // Calculate similarity score based on tag overlap
      const postTags = post.tags || [];
      const commonTags = postTags.filter((tag) => currentTags.includes(tag));
      return {
        ...post,
        similarity: commonTags.length,
      };
    })
    .filter((post) => post.similarity > 0) // Only posts with at least one common tag
    .sort((a, b) => {
      // Sort by similarity first, then by date
      if (b.similarity !== a.similarity) {
        return b.similarity - a.similarity;
      }
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    })
    .slice(0, maxPosts);

  // If no related posts by tags, show most recent posts
  const postsToShow =
    relatedPosts.length > 0
      ? relatedPosts
      : allPosts
          .filter((post) => post.slug !== currentSlug)
          .sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
          )
          .slice(0, maxPosts);

  if (postsToShow.length === 0) {
    return null;
  }

  return (
    <div className="mt-12 border-t border-border pt-8">
      <h2 className="text-2xl font-bold mb-6">Related Articles</h2>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {postsToShow.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="group hover:no-underline"
          >
            <Card className="h-full transition-all hover:shadow-lg hover:border-primary/50">
              <CardHeader>
                <div className="flex flex-wrap gap-2 mb-2">
                  {post.tags?.slice(0, 2).map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="text-xs lowercase"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
                <CardTitle className="group-hover:text-primary transition-colors line-clamp-2">
                  {post.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {post.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {post.description}
                  </p>
                )}
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <time dateTime={post.date}>
                    {new Date(post.date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </time>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {post.readingTime} min read
                  </span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
