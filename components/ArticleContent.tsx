'use client';

import { AdsterraAd } from './AdsterraAd';

const AD_KEY_300x250 = '8162f7b8c34974f34a974b6e7ecfc56c';

interface ArticleContentProps {
  content: string;
}

export default function ArticleContent({ content }: ArticleContentProps) {
  // Split by [AD] marker
  const parts = content.split('[AD]');

  // No [AD] markers - render plain content
  if (parts.length === 1) {
    return <div className="article-content" dangerouslySetInnerHTML={{ __html: content }} />;
  }

  return (
    <div className="article-content">
      {parts.map((part, i) => (
        <span key={i}>
          <span dangerouslySetInnerHTML={{ __html: part }} />
          {i < parts.length - 1 && (
            <div className="my-8 flex flex-col items-center">
              <div className="bg-gradient-to-br from-[#0F0F1A] to-black rounded-xl border border-[#1F2937] p-3 max-w-[300px]">
                <div className="text-[8px] text-gray-500 uppercase tracking-widest mb-2 text-center">— Sponsored Content —</div>
                <AdsterraAd adKey={AD_KEY_300x250} width={300} height={250} />
              </div>
            </div>
          )}
        </span>
      ))}
    </div>
  );
}