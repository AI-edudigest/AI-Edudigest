import React, { useState, useEffect } from 'react';
import { getAds } from '../utils/firebase';

interface Ad {
  id: string;
  title: string;
  imageUrl: string;
  linkUrl?: string;
  active: boolean;
}

interface AdsCarouselProps {
  institutionName?: string;
}

const AdsCarousel: React.FC<AdsCarouselProps> = ({ institutionName }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch ads from Firebase
  useEffect(() => {
    const fetchAds = async () => {
      try {
        console.log('🔄 AdsCarousel: Fetching ads from Firebase...');
        const result = await getAds();
        console.log('📊 AdsCarousel: Raw result:', result);
        
        if (result.ads) {
          console.log('📝 AdsCarousel: All ads:', result.ads);
          // Temporarily show all ads for debugging
          const allAds = result.ads;
          console.log('✅ AdsCarousel: All ads (debug mode):', allAds);
          setAds(allAds);
        } else {
          console.log('❌ AdsCarousel: No ads found in result');
          // Create a test ad if none exist
          console.log('🧪 AdsCarousel: Creating test ad...');
          try {
            const { createAd } = await import('../utils/firebase');
            await createAd({
              title: 'Test Ad',
              linkUrl: 'https://example.com',
              imageUrl: 'https://via.placeholder.com/150x100/9b0101/ffffff?text=Test+Ad',
              active: true
            });
            console.log('✅ AdsCarousel: Test ad created');
            // Refetch ads
            const newResult = await getAds();
            if (newResult.ads) {
              setAds(newResult.ads);
            }
          } catch (testError) {
            console.error('❌ AdsCarousel: Failed to create test ad:', testError);
            setAds([]);
          }
        }
      } catch (error) {
        console.error('❌ AdsCarousel: Error fetching ads:', error);
        setAds([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAds();
  }, []);

  // Auto-rotate ads
  useEffect(() => {
    if (ads.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % ads.length);
    }, 3000); // Change every 3 seconds

    return () => clearInterval(interval);
  }, [ads.length]);

  const handleAdClick = (ad: Ad) => {
    if (ad.linkUrl) {
      window.open(ad.linkUrl, '_blank', 'noopener,noreferrer');
    }
  };

  // Debug logging
  console.log('🎯 AdsCarousel render:', { loading, adsCount: ads.length, ads });

  if (loading) {
    console.log('⏳ AdsCarousel: Showing loading state');
    return (
      <div className="h-16 w-48 mx-auto flex items-center justify-center">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (ads.length === 0) {
    console.log('❌ AdsCarousel: No ads to display, showing institution name');
    
    // Use institution name from props or fallback
    const displayName = institutionName || 'AI for Educational Institutions';
    
    return (
      <div className="relative h-20 w-64 mx-auto overflow-hidden">
        <div className="relative h-full w-full">
          <div className="relative w-full h-full transition-all duration-1000 ease-in-out transform-gpu">
            <div className="flex-shrink-0 w-full h-full">
              <div className="h-full w-full rounded-lg shadow-lg overflow-hidden bg-gradient-to-r from-[#9b0101] to-[#7a0101] border border-gray-200 hover:shadow-xl transition-all duration-300 flex items-center justify-center">
                <div className="text-center px-4">
                  <h3 className="text-white font-bold text-sm leading-tight">
                    {displayName}
                  </h3>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  console.log('✅ AdsCarousel: Rendering ads carousel with', ads.length, 'ads');

  const currentAd = ads[currentIndex];

  return (
    <div className="relative h-20 w-64 mx-auto overflow-hidden">
      {/* 3D Carousel Container */}
      <div className="relative h-full w-full">
        <div 
          className="relative w-full h-full transition-all duration-1000 ease-in-out transform-gpu"
          style={{
            transform: `translateX(-${currentIndex * 100}%)`,
            display: 'flex'
          }}
        >
          {/* All Ads in Smooth Sliding Carousel */}
          {ads.map((ad, index) => (
            <div
              key={ad.id}
              className="flex-shrink-0 w-full h-full cursor-pointer"
              style={{
                minWidth: '100%'
              }}
              onClick={() => handleAdClick(ad)}
            >
              <div className="h-full w-full rounded-lg shadow-lg overflow-hidden bg-gradient-to-r from-blue-50 to-indigo-50 border border-gray-200 hover:shadow-xl transition-all duration-300">
                <img
                  src={ad.imageUrl}
                  alt={ad.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback to a simple colored div if image fails
                    (e.target as HTMLImageElement).style.display = 'none';
                    (e.target as HTMLImageElement).parentElement!.innerHTML = `
                      <div class="w-full h-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center">
                        <span class="text-white font-bold text-sm">${ad.title}</span>
                      </div>
                    `;
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Progress dots for multiple ads */}
      {ads.length > 1 && (
        <div className="flex justify-center space-x-1 mt-2">
          {ads.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? 'bg-blue-600 scale-125'
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`Go to ad ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default AdsCarousel;
