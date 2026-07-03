'use client';

import Image from 'next/image';
import Link from 'next/link';
import { productSlug } from '@/lib/utils';
import { Building2, ChevronRight, Briefcase } from 'lucide-react';

export function ProjectsSection({ projects = [] }: { projects?: any[] }) {
  return (
    <section className="py-8 bg-white border-t border-gray-100">
      <div className="mx-auto max-w-7xl px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <span className="w-1 h-6 rounded-full bg-primary inline-block" />
            <Briefcase className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold text-gray-800">Dự án Tiêu biểu</h2>
          </div>
          <Link href="/du-an" className="flex items-center gap-1 text-sm font-semibold text-primary hover:text-primary/80 group">
            Xem tất cả
            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {projects.map(project => (
            <Link
              key={project.id}
              href={`/du-an/${productSlug(project.title, project.id)}`}
              className="group bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col cursor-pointer"
            >
              {/* Image */}
              <div className="relative h-48 overflow-hidden bg-gray-100">
                <Image
                  src={project.image}
                  alt={project.title}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                {/* Category badge */}
                <div className="absolute bottom-3 left-3">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/90 backdrop-blur-sm text-xs font-semibold text-gray-700 rounded-full">
                    {project.category}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-4 flex flex-col flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Building2 className="w-4 h-4 text-primary shrink-0" />
                  <span className="text-xs font-semibold text-primary">{project.client}</span>
                </div>
                <h3 className="text-base font-bold text-gray-800 mb-2 line-clamp-2 leading-snug group-hover:text-primary transition-colors">
                  {project.title}
                </h3>
                <p className="text-xs text-gray-500 line-clamp-2 flex-1">
                  {project.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
