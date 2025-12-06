import Image from "next/image";
import Link from "next/link";
import { newsImages } from "@/assets/images";

interface NewsCardProps {
  id: number;
  title: string;
  slug: string;
  date: string;
  category: string;
  excerpt: string;
  image: string;
}

export default function NewsCard({
  title,
  slug,
  date,
  category,
  excerpt,
  image,
}: NewsCardProps) {
  return (
    <article className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative h-48 w-full">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>

      <div className="p-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
            {category}
          </span>
          <span className="text-xs text-gray-500">{date}</span>
        </div>

        <h3 className="text-xl font-semibold mb-2 text-gray-900 line-clamp-2">
          {title}
        </h3>

        <p className="text-gray-600 text-sm mb-4 line-clamp-3">{excerpt}</p>

        <Link
          href={`/news/${slug}`}
          className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium text-sm"
        >
          Đọc thêm
          <svg
            className="w-4 h-4 ml-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </Link>
      </div>
    </article>
  );
}