import { newsArticles } from "@/data/news";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar } from "lucide-react";

interface Params {
  slug: string;
}

interface NewsDetailPageProps {
  params: Promise<Params>;
}

export default async function NewsDetailPage({ params }: NewsDetailPageProps) {
  const { slug: articleSlug } = await params;
  const article = newsArticles.find((article) => article.slug === articleSlug);

  // Nếu không tìm thấy bài viết, hiển thị 404
  if (!article) {
    notFound();
  }

  // Lấy bài viết liên quan (khác bài hiện tại)
  const relatedArticles = newsArticles.filter((a) => a.slug !== article.slug);

  return (
    <article className="container mx-auto px-4 py-8 max-w-5xl">
      {/* Back Button */}
      <Link
        href="/news"
        className="inline-flex items-center text-gray-800  mb-6 "
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Quay lại danh sách tin tức
      </Link>

      {/* Article Header */}
      <header className="mb-8">
        <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>{article.date}</span>
          </div>
        </div>

        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          {article.title}
        </h1>

        <p className="text-lg text-gray-600 leading-relaxed">
          {article.excerpt}
        </p>
      </header>

      {/* Featured Image */}
      <div className="relative w-full h-64 md:h-80 mb-8 rounded-lg overflow-hidden">
        <Image
          src={article.image}
          alt={article.title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 800px"
          priority
        />
      </div>

      {/* Article Content */}
      <div className="prose prose-lg max-w-none mb-12">
        <div
          className="text-gray-700 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />
      </div>

      {/* Related Articles */}
      {relatedArticles.length > 0 && (
        <section className="border-t pt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Bài viết liên quan
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {relatedArticles.map((relatedArticle) => (
              <Link
                key={relatedArticle.slug}
                href={`/news/${relatedArticle.slug}`}
                className="group bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="relative h-48">
                  <Image
                    src={relatedArticle.image}
                    alt={relatedArticle.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-200"
                    sizes="(max-width: 768px) 100vw, 400px"
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-gray-600 transition-colors">
                    {relatedArticle.title}
                  </h3>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {relatedArticle.excerpt}
                  </p>
                  <div className="flex items-center mt-3 text-xs text-gray-500">
                    <Calendar className="w-3 h-3 mr-1" />
                    <span>{relatedArticle.date}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}

// Generate static params for better performance (optional)
