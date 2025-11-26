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

        if (!appsRes.ok || !curationRes.ok) {
          throw new Error(`API fetch failed: ${appsRes.status} or ${curationRes.status}`);
        }

        const apps: MiniApp[] = await appsRes.json();
        const curationData = await curationRes.json();

        // Always use mock data for design verification
        const mockAllApps: MiniApp[] = [
          {
            id: 'pixel-art',
            name: 'Pixel Art Studio',
            description: 'Create stunning pixel art with intuitive tools.',
            icon: 'palette',
            iconBackgroundColor: 'bg-orange-500',
            rating: 4.8,
            reviews: '1K',
            launchUrl: '#',
          },
          {
            id: 'focus-timer',
            name: 'Focus Timer',
            description: 'Boost productivity with customizable timers.',
            icon: 'clock',
            iconBackgroundColor: 'bg-blue-500',
            rating: 4.5,
            reviews: '2K',
            launchUrl: '#',
          },
          {
            id: 'music-mixer',
            name: 'Music Mixer',
            description: 'Mix and create your own tracks easily.',
            icon: 'music-note',
            iconBackgroundColor: 'bg-green-500',
            rating: 4.7,
            reviews: '3K',
            launchUrl: '#',
          },
          {
            id: 'recipe-book',
            name: 'Recipe Book',
            description: 'Discover and save delicious recipes.',
            icon: 'book-open',
            iconBackgroundColor: 'bg-pink-500',
            rating: 4.6,
            reviews: '1.5K',
            launchUrl: '#',
          },
          // Additional apps for trending or future use
          {
            id: 'weather-app',
            name: 'Weather App',
            description: 'Get real-time weather updates.',
            icon: 'cloud',
            iconBackgroundColor: 'bg-indigo-500',
            rating: 4.9,
            reviews: '5K',
            launchUrl: '#',
          },
        ];
        const mockCuration = {
          featuredAppIds: ['pixel-art'],
          newThisWeekAppIds: ['focus-timer', 'music-mixer', 'recipe-book'],
          trendingAppIds: ['pixel-art', 'focus-timer', 'weather-app'],
        };
        setAllApps(mockAllApps);
        setCuration(mockCuration);
        console.log('Using mock data for apps and curation');

        const allAppsMap: { [key: string]: MiniApp } = apps.reduce((map, app) => {
          map[app.id] = app;
          return map;
        }, {} as { [key: string]: MiniApp });

        const hydratedTrending = curationData.trendingAppIds?.map((id: string) => allAppsMap[id]).filter(Boolean) || [];

        console.log('Hydrated trending count:', hydratedTrending.length);

        setTrendingApps(hydratedTrending);
      } catch (err) {
        console.error('Trending fetch error:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch trending apps');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { allApps, curation, trendingApps, loading, error };
};