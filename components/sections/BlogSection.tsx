'use client';

import Image from 'next/image';
import Link from 'next/link';
import { blogPosts } from '@/lib/mockData';
import { ArrowRight, Calendar, Tag, BookOpen } from 'lucide-react';

export function BlogSection() {
  const featured = blogPosts[0];
  const rest = blogPosts.slice(1, 4);

  return (
    <section className="py-8 bg-[#F4F7F6] border-t border-gray-100">
      <div className="mx-auto max-w-7xl px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <span className="w-1 h-6 rounded-full bg-primary inline-block" />
            <BookOpen className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold text-gray-800">Tin tức & Kiến thức</h2>
          </div>
          <Link href="/tin-tuc" className="flex items-center gap-1 text-sm font-semibold text-primary hover:text-primary/80 group">
            Xem tất cả
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Featured post */}
          <article className="lg:col-span-1 group rounded-xl overflow-hidden bg-white border border-gray-200 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 flex flex-col">
            <div className="relative h-52 overflow-hidden bg-gray-100">
              <Image src={featured.image} alt={featured.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
              <span className="absolute top-3 left-3 px-2.5 py-1 bg-primary text-white text-xs font-semibold rounded-full">
                {featured.category}
              </span>
            </div>
            <div className="p-4 flex flex-col flex-1">
              <div className="flex items-center gap-3 text-xs text-gray-400 mb-2">
                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{featured.date}</span>
              </div>
              <h3 className="font-bold text-gray-800 mb-2 line-clamp-2 group-hover:text-primary transition-colors leading-snug">
                {featured.title}
              </h3>
              <p className="text-sm text-gray-500 line-clamp-2 flex-1 mb-3">{featured.excerpt}</p>
              <Link href={`/blog/tin-tuc/${featured.slug}`} className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:gap-2 transition-all">
                Đọc tiếp <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </article>

          {/* 3 smaller posts */}
          <div className="lg:col-span-2 flex flex-col gap-3">
            {rest.map(post => (
              <article
                key={post.id}
                className="group flex gap-3 bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 p-3"
              >
                <div className="relative w-24 h-20 shrink-0 rounded-lg overflow-hidden bg-gray-100">
                  <Image src={post.image} alt={post.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                </div>
                <div className="flex flex-col justify-between flex-1 min-w-0">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-1.5 py-0.5 bg-primary/10 text-primary text-[10px] font-semibold rounded">{post.category}</span>
                      <span className="text-[10px] text-gray-400 flex items-center gap-0.5"><Calendar className="w-2.5 h-2.5" />{post.date}</span>
                    </div>
                    <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 leading-snug group-hover:text-primary transition-colors">
                      {post.title}
                    </h3>
                  </div>
                  <Link href={`/blog/tin-tuc/${post.slug}`} className="text-xs text-primary font-semibold flex items-center gap-1 mt-1 hover:gap-1.5 transition-all">
                    Xem thêm <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
