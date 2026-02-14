import { notFound } from "next/navigation";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { PostHeader } from "@/components/blog/post-header";
import { getBlogPost, getBlogPosts } from "@/lib/blog";

export async function generateStaticParams() {
  const posts = getBlogPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}) {
  const params = await props.params;
  const post = getBlogPost(params.slug);
  if (!post) return {};

  return {
    title: `${post.title} | APoP Blog`,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      publishedTime: post.date,
      authors: post.author ? [post.author.name] : undefined,
      images: [
        {
          url: `/api/og?title=${encodeURIComponent(post.title)}&type=blog`,
          width: 1200,
          height: 630,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
    },
  };
}

export default async function BlogPostPage(props: {
  params: Promise<{ slug: string }>;
}) {
  const params = await props.params;
  const post = getBlogPost(params.slug);
  if (!post) notFound();

  const MDX = post.body;

  return (
    <>
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <article>
          <PostHeader
            title={post.title}
            description={post.description}
            date={post.date}
            author={post.author}
            readingTime={post.readingTime}
            tags={post.tags}
            slug={post.slug}
          />
          <div className="prose prose-neutral dark:prose-invert max-w-none prose-headings:scroll-mt-20 prose-a:text-blue-700 dark:prose-a:text-blue-400 prose-code:before:content-none prose-code:after:content-none">
            <MDX />
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
