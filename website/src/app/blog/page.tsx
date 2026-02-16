import type { Metadata } from "next";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { PostCard } from "@/components/blog/post-card";
import { getBlogPosts } from "@/lib/blog";
import { Rss } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Blog — Agent Policy Protocol",
  description:
    "Insights, announcements, and guides about the Agent Policy Protocol and the agentic web.",
  alternates: {
    canonical: "https://agentpolicy.org/blog",
  },
};

export default function BlogPage() {
  const posts = getBlogPosts();

  return (
    <>
      <Header />
      <main className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-10 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
              Blog
            </h1>
            <p className="mt-2 text-neutral-600 dark:text-neutral-400">
              Insights, announcements, and guides about APoP and the agentic
              web.
            </p>
          </div>
          <Link
            href="/blog/feed.xml"
            title="RSS Feed"
            className="mt-1 rounded-lg border border-neutral-200 dark:border-neutral-700 p-2 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <Rss className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid gap-6">
          {posts.map((post) => (
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

        {posts.length === 0 && (
          <p className="text-center text-neutral-500 dark:text-neutral-400 py-12">
            No blog posts yet. Check back soon!
          </p>
        )}
      </main>
      <Footer />
    </>
  );
}
