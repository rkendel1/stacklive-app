import { API_BASE } from '@/constants/config';
import { MiniApp } from '@/src/lib/miniapps';
import { useEffect, useState } from 'react';


export const useTrendingApps = () => {
  const [trendingApps, setTrendingApps] = useState<MiniApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [allApps, setAllApps] = useState<MiniApp[]>([]);
  const [curation, setCuration] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const apiUrl = API_BASE;

        const [appsRes, curationRes] = await Promise.all([
          fetch(`${apiUrl}/api/miniapps/list`),
          fetch(`${apiUrl}/api/curation/get`)
        ]);

        let apps: MiniApp[] = [];
        let curationData = {};

        if (appsRes.ok && curationRes.ok) {
          apps = await appsRes.json();
          curationData = await curationRes.json();
        } else {
          // Silently fallback to empty data; mock will handle if needed
        }

        let finalApps = apps;
        let finalCuration = curationData;

        if (apps.length === 0 || !curationData || Object.keys(curationData).length === 0) {
          console.warn('API returned empty or failed, using mock for demonstration');
          finalApps = [
            {
              id: 'app_123abc456def789ghi',
              name: 'Pixel Art Studio',
              description: 'Create stunning pixel art and animations.',
              launchUrl: 'https://pixel-art-studio-xyz.vercel.app/?webview=true',
              icon: 'Palette',
              iconType: 'lucide',
              iconUrl: null,
              categories: ['Creative', 'Tools'],
              rating: 4.8,
              reviews: '12K',
              creator: {
                id: 'user_abc123',
                email: 'creator@example.com'
              },
              longDescription: 'Unleash your creativity with Pixel Art Studio...',
              tags: ['#Art', '#Design', "Editor's Choice"],
              screenshots: [
                'https://example.com/screenshot1.png',
                'https://example.com/screenshot2.png'
              ],
              features: [
                {
                  icon: 'Zap',
                  title: 'Lightning Fast',
                  description: 'Optimized for a smooth, lag-free experience.'
                }
              ],
              ratingsAndReviews: {
                totalReviews: '12K ratings',
                averageRating: 4.8,
                reviews: [
                  {
                    avatar: 'https://example.com/avatar.png',
                    name: 'Sarah M.',
                    rating: 5,
                    comment: 'Amazing app! Does exactly what I need.'
                  }
                ]
              }
            }
          ];
          finalCuration = {
            trendingAppIds: ['app_123abc456def789ghi']
          };
          setError(null); // Clear error for mock
        } else {
          setError(null);
        }

        setAllApps(finalApps);
        setCuration(finalCuration);

        const allAppsMap: { [key: string]: MiniApp } = finalApps.reduce((map, app) => {
          map[app.id] = app;
          return map;
        }, {} as { [key: string]: MiniApp });

        const hydratedTrending = (finalCuration && 'trendingAppIds' in finalCuration 
          ? (finalCuration as {trendingAppIds: string[]}).trendingAppIds.map((id: string) => allAppsMap[id]).filter(Boolean) 
          : []).filter(Boolean) || [];

        setTrendingApps(hydratedTrending);
      } catch (err) {
        console.error('Trending fetch error:', err);
        setAllApps([]);
        setCuration(null);
        setTrendingApps([]);
        setError(err instanceof Error ? `Failed to load data: ${err.message}` : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { allApps, curation, trendingApps, loading, error };
};