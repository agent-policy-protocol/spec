import { notFound } from "next/navigation";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { PostHeader } from "@/components/blog/post-header";
import { ShareButtons } from "@/components/blog/share-buttons";
import { RelatedPosts } from "@/components/blog/related-posts";
import { Separator } from "@/components/ui/separator";
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
    alternates: {
      canonical: `https://agentpolicy.org/blog/${params.slug}`,
    },
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      publishedTime: post.date,
      authors: post.author ? [post.author.name] : undefined,
      images: [
        {
          url: `/api/og?title=${encodeURIComponent(post.title)}&type=blog&author=${encodeURIComponent(post.author?.name || "Arun Vijayarengan")}&date=${encodeURIComponent(new Date(post.date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }))}`,
          width: 1200,
          height: 630,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
      images: [
        `/api/og?title=${encodeURIComponent(post.title)}&type=blog&author=${encodeURIComponent(post.author?.name || "Arun Vijayarengan")}&date=${encodeURIComponent(new Date(post.date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }))}`,
      ],
    },
  };
}

export default async function BlogPostPage(props: {
  params: Promise<{ slug: string }>;
}) {
  const params = await props.params;
  const post = getBlogPost(params.slug);
  if (!post) notFound();

  const allPosts = getBlogPosts();
  const MDX = post.body;

  // Check if this is a tutorial/how-to post
  const isTutorial = post.tags?.some((tag) =>
    ["tutorial", "getting-started", "guide"].includes(tag.toLowerCase()),
  );

  // BlogPosting schema for better SEO
  const blogPostingSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.date,
    author: post.author
      ? {
          "@type": "Person",
          name: post.author.name,
          jobTitle: post.author.title,
          url: post.author.url,
        }
      : undefined,
    publisher: {
      "@type": "Organization",
      name: "Superdom AI Research Labs",
      url: "https://superdom.ai",
      logo: {
        "@type": "ImageObject",
        url: "https://agentpolicy.org/og-image.png",
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://agentpolicy.org/blog/${post.slug}`,
    },
    image: post.image || "https://agentpolicy.org/og-image.png",
    articleSection: post.tags?.[0] || "General",
    keywords: post.tags?.join(", "),
    wordCount: post.readingTime * 200, // Estimate based on reading time
  };

  // HowTo schema for tutorial posts
  const howToSchema = isTutorial
    ? {
        "@context": "https://schema.org",
        "@type": "HowTo",
        name: post.title,
        description: post.description,
        totalTime: `PT${post.readingTime}M`, // Reading time in ISO 8601 format
        step:
          post.slug === "protect-your-website"
            ? [
                {
                  "@type": "HowToStep",
                  name: "Create Your Policy",
                  text: "Create a file called agent-policy.json with your policy configuration defining allowed and disallowed actions for AI agents.",
                  position: 1,
                },
                {
                  "@type": "HowToStep",
                  name: "Deploy It",
                  text: "Deploy your policy file using one of three methods: static file at /.well-known/agent-policy.json, Express middleware, or Vercel deployment.",
                  position: 2,
                },
                {
                  "@type": "HowToStep",
                  name: "Test It",
                  text: "Verify your policy is accessible and test agent requests to ensure proper enforcement.",
                  position: 3,
                },
              ]
            : undefined,
      }
    : null;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(blogPostingSchema),
        }}
      />
      {howToSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(howToSchema),
          }}
        />
      )}
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
          <Separator className="my-8" />
          <ShareButtons
            title={post.title}
            url={`https://agentpolicy.org/blog/${post.slug}`}
          />
          <RelatedPosts
            currentSlug={post.slug}
            currentTags={post.tags}
            allPosts={allPosts}
          />
        </article>
      </main>
      <Footer />
    </>
  );
}
