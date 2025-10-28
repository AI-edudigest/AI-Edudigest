import React, { useState, useEffect } from 'react';
import { getSponsors } from '../utils/firebase';

interface Sponsor {
  name: string;
  logo: string;
  link: string;
}

const SponsorsCarousel: React.FC = () => {
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch sponsors from Firebase
  useEffect(() => {
    const fetchSponsors = async () => {
      try {
        console.log('🔄 SponsorsCarousel: Fetching sponsors from Firebase...');
        const result = await getSponsors();
        console.log('📊 SponsorsCarousel: Raw result:', result);
        
        if (result.sponsors) {
          console.log('📝 SponsorsCarousel: All sponsors:', result.sponsors);
          const activeSponsors = result.sponsors
            .filter((sponsor: any) => sponsor.active)
            .map((sponsor: any) => ({
              name: sponsor.name,
              logo: sponsor.logo,
              link: sponsor.website || '#'
            }));
          setSponsors(activeSponsors);
        } else {
          console.log('❌ SponsorsCarousel: No sponsors found, using test data');
          // Create test sponsors for demonstration
          const testSponsors = [
            {
              name: 'Quanco Technologies',
              logo: 'https://via.placeholder.com/120x60/0d9488/ffffff?text=Quanco',
              link: 'https://quanco.com'
            },
            {
              name: 'BCom Buddy',
              logo: 'https://via.placeholder.com/120x60/3b82f6/ffffff?text=BCom+Buddy',
              link: 'https://bcom-buddy.com'
            },
            {
              name: 'DAXGENAI',
              logo: 'https://via.placeholder.com/120x60/dc2626/ffffff?text=DAXGENAI',
              link: 'https://daxgenai.com'
            },
            {
              name: 'The Siasat Daily',
              logo: 'https://via.placeholder.com/120x60/059669/ffffff?text=Siasat',
              link: 'https://siasat.com'
            }
          ];
          setSponsors(testSponsors);
        }
      } catch (error) {
        console.error('❌ SponsorsCarousel: Error fetching sponsors:', error);
        // Fallback test sponsors
        const testSponsors = [
          {
            name: 'Quanco Technologies',
            logo: 'https://via.placeholder.com/120x60/0d9488/ffffff?text=Quanco',
            link: 'https://quanco.com'
          },
          {
            name: 'BCom Buddy',
            logo: 'https://via.placeholder.com/120x60/3b82f6/ffffff?text=BCom+Buddy',
            link: 'https://bcom-buddy.com'
          },
          {
            name: 'DAXGENAI',
            logo: 'https://via.placeholder.com/120x60/dc2626/ffffff?text=DAXGENAI',
            link: 'https://daxgenai.com'
          },
          {
            name: 'The Siasat Daily',
            logo: 'https://via.placeholder.com/120x60/059669/ffffff?text=Siasat',
            link: 'https://siasat.com'
          }
        ];
        setSponsors(testSponsors);
      } finally {
        setLoading(false);
      }
    };

    fetchSponsors();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#9b0101]"></div>
      </div>
    );
  }

  if (sponsors.length === 0) {
    return (
      <div className="flex justify-center items-center py-4 text-gray-500">
        No sponsors available
      </div>
    );
  }

  // Duplicate sponsors for seamless loop
  const duplicatedSponsors = [...sponsors, ...sponsors];

  return (
    <div className="relative overflow-hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
      <div className="py-3">
        {/* Infinite scrolling container */}
        <div className="flex animate-scroll-right-to-left">
          {duplicatedSponsors.map((sponsor, index) => (
            <a
              key={`${sponsor.name}-${index}`}
              href={sponsor.link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0 flex items-center justify-center p-3 mx-6 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-all duration-200 hover:scale-105 group"
            >
              <div className="h-12 w-24 flex items-center justify-center">
                <img 
                  src={sponsor.logo} 
                  alt={sponsor.name}
                  className="h-12 w-auto object-contain group-hover:scale-110 transition-transform duration-200"
                  onError={(e) => {
                    // Fallback to a simple colored div if image fails
                    (e.target as HTMLImageElement).style.display = 'none';
                    (e.target as HTMLImageElement).parentElement!.innerHTML = `
                      <div class="h-12 w-24 bg-gradient-to-r from-blue-500 to-indigo-600 rounded flex items-center justify-center">
                        <span class="text-white font-bold text-sm">${sponsor.name}</span>
                      </div>
                    `;
                  }}
                />
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SponsorsCarousel;
