import Link from "next/link";
import { Calendar, Clock, Tag } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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
    <Link href={`/blog/${slug}`} className="group block">
      <Card className="hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md transition-all">
        <CardHeader>
          <CardTitle className="text-lg group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
            {title}
          </CardTitle>
          {description && (
            <CardDescription className="line-clamp-3">
              {description}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
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
            {author && <span>by {author.name}</span>}
          </div>
        </CardContent>
        {tags && tags.length > 0 && (
          <CardFooter>
            <div className="flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="gap-1">
                  <Tag className="h-3 w-3" />
                  {tag}
                </Badge>
              ))}
            </div>
          </CardFooter>
        )}
      </Card>
    </Link>
  );
}
