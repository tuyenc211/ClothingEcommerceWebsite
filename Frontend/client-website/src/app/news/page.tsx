import { newsArticles } from "@/data/news";
import Image from "next/image";
import Link from "next/link";
export default function NewsPage() {
  return (
    <div className="container mx-auto px-4 my-5">
      <div className="flex items-center w-full gap-4 px-8 max-w-6xl mx-auto mt-10">
        <div className="h-[2px] bg-gradient-to-r from-[#111111] to-[#EEEEEE] flex-1" />
        <h3 className="text-xl md:text-2xl font-bold  mx-auto uppercase text-center">
          Chính sách cửa hàng chúng tôi
        </h3>
        <div className="h-[2px] bg-gradient-to-r from-[#EEEEEE] to-[#111111] flex-1" />
      </div>

      <div className="flex flex-col md:flex-row space-x-4">
        {/* <div className="main-news flex-1"></div> */}
        <div className=" list-news py-4 px-2 mt-3">
          <div className=" grid grid-cols-1 md:grid-cols-2 gap-4 rounded-md w-full ">
            {newsArticles.map((article) => (
              <div key={article.id} className="bg-white p-4 rounded-md">
                <Link href={`/news/${article.slug}`}>
                  <Image
                    src={article.image}
                    alt={article.title}
                    width={400}
                    height={250}
                    className="w-full md:h-80 h-40   rounded-md"
                  />
                </Link>
                <div className="py-2 my-4">
                  <h3 className="text-lg md:text-2xl font-bold">
                    {article.title}
                  </h3>
                  <p className="text-sm md:text-base text-gray-500">
                    {article.excerpt}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
