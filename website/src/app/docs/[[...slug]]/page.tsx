import { source } from "@/lib/source";
import {
  DocsPage,
  DocsBody,
  DocsDescription,
  DocsTitle,
} from "fumadocs-ui/page";
import { notFound } from "next/navigation";
import defaultMdxComponents from "fumadocs-ui/mdx";
import { Tab, Tabs } from "fumadocs-ui/components/tabs";

export default async function Page(props: {
  params: Promise<{ slug?: string[] }>;
}) {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) notFound();

  const MDX = page.data.body;
  const slug = params.slug || [];
  const lastModified = (page.data as any).lastModified;

  // Build breadcrumb schema
  const breadcrumbItems = [
    {
      "@type": "ListItem",
      position: 1,
      name: "Home",
      item: "https://agentpolicy.org",
    },
    {
      "@type": "ListItem",
      position: 2,
      name: "Documentation",
      item: "https://agentpolicy.org/docs",
    },
  ];

  // Add breadcrumb items for each slug segment
  slug.forEach((segment, index) => {
    const path = slug.slice(0, index + 1).join("/");
    breadcrumbItems.push({
      "@type": "ListItem",
      position: index + 3,
      name: segment
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" "),
      item: `https://agentpolicy.org/docs/${path}`,
    });
  });

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbItems,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema),
        }}
      />
      <DocsPage
        toc={page.data.toc}
        editOnGithub={{
          repo: "spec",
          owner: "agent-policy-protocol",
          sha: "main",
          path: `website/content/docs/${page.path}`,
        }}
      >
        <DocsTitle>{page.data.title}</DocsTitle>
        <DocsDescription>{page.data.description}</DocsDescription>
        {lastModified && (
          <p className="text-xs text-muted-foreground mt-2 mb-6 flex items-center gap-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
              <line x1="16" x2="16" y1="2" y2="6" />
              <line x1="8" x2="8" y1="2" y2="6" />
              <line x1="3" x2="21" y1="10" y2="10" />
            </svg>
            Last updated:{" "}
            {new Date(lastModified).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        )}
        <DocsBody>
          <MDX components={{ ...defaultMdxComponents, Tab, Tabs }} />
        </DocsBody>
      </DocsPage>
    </>
  );
}

export async function generateStaticParams() {
  return source.generateParams();
}

export async function generateMetadata(props: {
  params: Promise<{ slug?: string[] }>;
}) {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) notFound();

  const slug = params.slug ? params.slug.join("/") : "";

  // Get lastModified from frontmatter if available
  const lastModified = (page.data as any).lastModified;

  return {
    title: page.data.title,
    description: page.data.description,
    alternates: {
      canonical: `https://agentpolicy.org/docs/${slug}`,
    },
    openGraph: {
      title: page.data.title,
      description: page.data.description,
      type: "article",
      ...(lastModified && { modifiedTime: lastModified }),
      images: [
        {
          url: `/api/og?title=${encodeURIComponent(page.data.title)}&type=docs`,
          width: 1200,
          height: 630,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: page.data.title,
      description: page.data.description,
    },
  };
}
