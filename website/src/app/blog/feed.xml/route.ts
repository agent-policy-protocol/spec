import { Feed } from "feed";
import { getBlogPosts } from "@/lib/blog";

export async function GET() {
  const posts = getBlogPosts();
  const siteUrl = "https://agentpolicy.org";

  const feed = new Feed({
    title: "Agent Policy Protocol — Blog",
    description:
      "Insights, announcements, and guides about the Agent Policy Protocol and the agentic web.",
    id: siteUrl,
    link: siteUrl,
    language: "en",
    copyright: `Copyright ${new Date().getFullYear()} Superdom AI Research Labs. Apache 2.0 License.`,
    feedLinks: {
      rss2: `${siteUrl}/blog/feed.xml`,
    },
    author: {
      name: "Arun Vijayarengan",
      link: "https://www.linkedin.com/in/arunvijayarengan",
    },
  });

  for (const post of posts) {
    feed.addItem({
      title: post.title,
      id: `${siteUrl}/blog/${post.slug}`,
      link: `${siteUrl}/blog/${post.slug}`,
      description: post.description || "",
      date: new Date(post.date),
      author: post.author
        ? [
            {
              name: post.author.name,
              link: post.author.url,
            },
          ]
        : undefined,
    });
  }

  return new Response(feed.rss2(), {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
