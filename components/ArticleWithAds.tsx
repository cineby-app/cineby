'use client';

import { AdsterraAd } from './AdsterraAd';

const AD_KEY_300x250 = '8162f7b8c34974f34a974b6e7ecfc56c';

interface ArticleContentProps {
  content: string;
  showAds: boolean;
}

export default function ArticleContent({ content, showAds }: ArticleContentProps) {
  if (!showAds) {
    return <div className="article-content" dangerouslySetInnerHTML={{ __html: content }} />;
  }

  // Split by [AD] marker — you control ad placement in article content
  const parts = content.split('[AD]');
  
  if (parts.length === 1) {
    // No [AD] markers found, fallback to auto-placement after h2 tags
    const h2Parts = content.split('</h2>');
    if (h2Parts.length < 3) {
      return <div className="article-content" dangerouslySetInnerHTML={{ __html: content }} />;
    }

    const adPositions = [1, 3, 5];
    let adCount = 0;

    return (
      <div className="article-content">
        {h2Parts.map((part, i) => {
          const isLast = i === h2Parts.length - 1;
          const html = part + (isLast ? '' : '</h2>');
          const shouldInsertAd = adPositions.includes(i) && adCount < 3;
          if (shouldInsertAd) adCount++;

          return (
            <span key={i}>
              <span dangerouslySetInnerHTML={{ __html: html }} />
              {shouldInsertAd && <AdBanner />}
            </span>
          );
        })}
      </div>
    );
  }

  // [AD] markers found — place ads exactly where you put [AD] in content
  return (
    <div className="article-content">
      {parts.map((part, i) => (
        <span key={i}>
          <span dangerouslySetInnerHTML={{ __html: part }} />
          {i < parts.length - 1 && <AdBanner />}
        </span>
      ))}
    </div>
  );
}

function AdBanner() {
  return (
    <div className="my-8 flex flex-col items-center">
      <div className="bg-gradient-to-br from-[#0F0F1A] to-black rounded-xl border border-[#1F2937] p-3 max-w-[300px]">
        <div className="text-[8px] text-gray-500 uppercase tracking-widest mb-2 text-center">— Sponsored Content —</div>
        <AdsterraAd adKey={AD_KEY_300x250} width={300} height={250} />
      </div>
    </div>
  );
}