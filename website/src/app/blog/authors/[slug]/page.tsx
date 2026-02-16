import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { getBlogPosts } from "@/lib/blog";
import { PostCard } from "@/components/blog/post-card";
import { Linkedin, ExternalLink } from "lucide-react";

export async function generateStaticParams() {
  const posts = getBlogPosts();
  const authors = new Set(
    posts.map((post) => post.author?.name).filter(Boolean),
  );

  return Array.from(authors).map((name) => ({
    slug: name
      ?.toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]+/g, ""),
  }));
}

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const params = await props.params;
  const posts = getBlogPosts();

  // Find author by matching slug
  const author = posts.find((post) => {
    const authorSlug = post.author?.name
      ?.toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]+/g, "");
    return authorSlug === params.slug;
  })?.author;

  if (!author) return {};

  return {
    title: `${author.name} - Blog Author`,
    description: `Articles by ${author.name}${author.title ? `, ${author.title}` : ""} on Agent Policy Protocol and the agentic web.`,
    alternates: {
      canonical: `https://agentpolicy.org/blog/authors/${params.slug}`,
    },
  };
}

export default async function AuthorPage(props: {
  params: Promise<{ slug: string }>;
}) {
  const params = await props.params;
  const posts = getBlogPosts();

  // Find all posts by this author
  const authorPosts = posts.filter((post) => {
    const authorSlug = post.author?.name
      ?.toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]+/g, "");
    return authorSlug === params.slug;
  });

  if (authorPosts.length === 0) notFound();

  const author = authorPosts[0]?.author;
  if (!author) notFound();

  return (
    <>
      <Header />
      <main className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        {/* Author Header */}
        <div className="mb-12 space-y-4">
          <div className="flex items-start gap-6">
            {author.avatar && (
              <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-primary/20 bg-muted shrink-0">
                <img
                  src={author.avatar}
                  alt={author.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
                {author.name}
              </h1>
              {author.title && (
                <p className="text-lg text-neutral-600 dark:text-neutral-400 mt-1">
                  {author.title}
                </p>
              )}
              {author.url && (
                <a
                  href={author.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 mt-3 text-primary hover:underline"
                >
                  <Linkedin className="h-4 w-4" />
                  <span className="text-sm">LinkedIn Profile</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          </div>
          <p className="text-neutral-600 dark:text-neutral-400">
            {authorPosts.length} article{authorPosts.length !== 1 ? "s" : ""}{" "}
            published
          </p>
        </div>

        {/* Author's Posts */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            Articles
          </h2>
          <div className="grid gap-6">
            {authorPosts.map((post) => (
              <PostCard
                key={post.slug}
                slug={post.slug}
                title={post.title}
                description={post.description}
                date={post.date}
                author={post.author}
                readingTime={post.readingTime}
                tags={post.tags}
              />
            ))}
          </div>
        </div>

        {/* Back to Blog */}
        <div className="mt-12 pt-8 border-t border-neutral-200 dark:border-neutral-700">
          <Link
            href="/blog"
            className="text-primary hover:underline inline-flex items-center gap-2"
          >
            ← Back to all articles
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
