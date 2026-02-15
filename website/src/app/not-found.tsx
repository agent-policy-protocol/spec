import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { NotFoundSearch } from "@/components/not-found-search";
import { Shield, Home, BookOpen, Newspaper, Terminal } from "lucide-react";

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="min-h-[60vh] flex items-center justify-center py-20">
        <div className="mx-auto max-w-xl px-4 text-center">
          <div className="inline-flex items-center justify-center rounded-full bg-blue-50 dark:bg-blue-950 p-4 mb-6">
            <Shield className="h-12 w-12 text-blue-700 dark:text-blue-400" />
          </div>

          <h1 className="text-6xl font-bold text-neutral-900 dark:text-white mb-2">
            430
          </h1>
          <p className="text-lg font-medium text-neutral-600 dark:text-neutral-300 mb-2">
            Agent Action Not Allowed
          </p>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-8">
            Just kidding — this page doesn&apos;t exist. But if it did,
            we&apos;d make sure your agent had proper authorization to access
            it. 😄
          </p>

          <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto">
            <Button variant="outline" asChild>
              <Link href="/">
                <Home className="h-4 w-4" />
                Home
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/docs">
                <BookOpen className="h-4 w-4" />
                Docs
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/blog">
                <Newspaper className="h-4 w-4" />
                Blog
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/playground">
                <Terminal className="h-4 w-4" />
                Playground
              </Link>
            </Button>
          </div>

          <NotFoundSearch />
        </div>
      </main>
      <Footer />
    </>
  );
}
