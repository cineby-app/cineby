import { Metadata } from 'next';
import { articles } from '@/lib/articles';
import Link from 'next/link';
import Image from 'next/image';
import { Clock, Calendar, ArrowRight } from 'lucide-react';


export default function BlogPage() {
  return (
    <div className="min-h-screen bg-[#05050A] pt-30 pb-20 px-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-16">
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase mb-4 text-white drop-shadow-xl">
            <span className="text-[#E50914]">Cineby</span> Blog
          </h1>
          <p className="text-gray-400 font-mono tracking-widest uppercase text-sm max-w-2xl leading-relaxed">
            Deep dives, industry news, and thoughts on the cinematic universe.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {articles.map((article) => (
            <Link 
              key={article.id} 
              href={`/blog/${article.slug}`}
              className="group flex flex-col bg-[#0F0F1A] border border-[#1F2937] rounded-xl overflow-hidden hover:border-[#E50914]/50 transition-colors duration-300"
            >
              <div className="relative aspect-video overflow-hidden">
                <Image
                  src={article.coverImage}
                  alt={article.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0F0F1A] to-transparent opacity-80" />
                <div className="absolute top-4 left-4 flex gap-2">
                  {article.keywords.slice(0, 2).map(keyword => (
                    <span key={keyword} className="bg-black/60 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded">
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="p-6 flex flex-col flex-1">
                <div className="flex items-center gap-4 text-xs font-mono text-gray-500 uppercase tracking-widest mb-4">
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {article.date}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {article.readTime}</span>
                </div>
                
                <h2 className="text-xl font-bold text-white mb-3 tracking-tight group-hover:text-[#E50914] transition-colors line-clamp-2">
                  {article.title}
                </h2>
                
                <p className="text-sm text-gray-400 line-clamp-3 mb-6 leading-relaxed flex-1">
                  {article.excerpt}
                </p>

                <div className="flex items-center text-xs font-bold uppercase tracking-widest text-white mt-auto group-hover:text-[#E50914] transition-colors">
                  <span>Read Article</span>
                  <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
