import { API_BASE } from '@/constants/config';
import { MiniApp } from '@/src/lib/miniapps';
import { useEffect, useState } from 'react';

// Mock data for design verification and fallback when API is unavailable
const mockAllApps: MiniApp[] = [
  {
    id: 'pixel-art',
    name: 'Pixel Art Studio',
    description: 'Create stunning pixel art with intuitive tools.',
    icon: 'palette',
    iconBackgroundColor: 'bg-orange-500',
    rating: 4.8,
    reviews: '1K',
    deploymentUrl: 'https://stacklive.app/apps/pixel-art',
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
    deploymentUrl: 'https://stacklive.app/apps/focus-timer',
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
    deploymentUrl: 'https://stacklive.app/apps/music-mixer',
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
    deploymentUrl: 'https://stacklive.app/apps/recipe-book',
    launchUrl: '#',
  },
  {
    id: 'weather-app',
    name: 'Weather App',
    description: 'Get real-time weather updates.',
    icon: 'cloud',
    iconBackgroundColor: 'bg-indigo-500',
    rating: 4.9,
    reviews: '5K',
    deploymentUrl: 'https://stacklive.app/apps/weather-app',
    launchUrl: '#',
  },
];

const mockCuration = {
  featuredAppIds: ['pixel-art'],
  newThisWeekAppIds: ['focus-timer', 'music-mixer', 'recipe-book'],
  trendingAppIds: ['pixel-art', 'focus-timer', 'weather-app'],
};

export const useTrendingApps = () => {
  const [trendingApps, setTrendingApps] = useState<MiniApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [allApps, setAllApps] = useState<MiniApp[]>([]);
  const [curation, setCuration] = useState<any>(null);

  useEffect(() => {
    if (__DEV__) {
      // In development, use mock data directly to avoid API calls
      const mockAppsWithUrls = mockAllApps.map((app) => {
        if (app.deploymentUrl && app.launchUrl === '#') {
          const url = new URL(app.deploymentUrl);
          url.searchParams.set('webview', 'true');
          return { ...app, launchUrl: url.toString() };
        }
        return app;
      });
      setAllApps(mockAppsWithUrls);
      setCuration(mockCuration);
      setTrendingApps(mockAppsWithUrls.filter(app => mockCuration.trendingAppIds.includes(app.id)));
      setLoading(false);
      setError(null);
      return;
    }

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
          console.error(`API fetch failed - Apps: ${appsRes.status} (${appsRes.url}), Curation: ${curationRes.status} (${curationRes.url})`);
          throw new Error(`API fetch failed: Apps ${appsRes.status}, Curation ${curationRes.status}`);
        }

        const apps: MiniApp[] = await appsRes.json();
        const curationData = await curationRes.json();

        // Use API data if available, otherwise fallback to mock data
        let effectiveApps = apps.length > 0 ? apps : mockAllApps;
        const effectiveCuration = curationData || mockCuration;

        // Derive launchUrl from deploymentUrl if needed
        effectiveApps = effectiveApps.map((app) => {
          if (app.deploymentUrl && (!app.launchUrl || app.launchUrl === '#')) {
            const url = new URL(app.deploymentUrl);
            url.searchParams.set('webview', 'true');
            return { ...app, launchUrl: url.toString() };
          }
          return app;
        });
        
        setAllApps(effectiveApps);
        setCuration(effectiveCuration);

        const allAppsMap: { [key: string]: MiniApp } = effectiveApps.reduce((map, app) => {
          map[app.id] = app;
          return map;
        }, {} as { [key: string]: MiniApp });

        const hydratedTrending = effectiveCuration.trendingAppIds?.map((id: string) => allAppsMap[id]).filter(Boolean) || [];

        setTrendingApps(hydratedTrending.length > 0 ? hydratedTrending : mockAllApps.filter(app => 
          mockCuration.trendingAppIds.includes(app.id)
        ));
      } catch (err) {
        console.error('Trending fetch error:', err);
        console.log('Using fallback mocks due to API failure');
        // Use mock data as fallback when API fails
        const mockAppsWithUrls = mockAllApps.map((app) => {
          if (app.deploymentUrl && app.launchUrl === '#') {
            const url = new URL(app.deploymentUrl);
            url.searchParams.set('webview', 'true');
            return { ...app, launchUrl: url.toString() };
          }
          return app;
        });
        setAllApps(mockAppsWithUrls);
        setCuration(mockCuration);
        setTrendingApps(mockAppsWithUrls.filter(app => mockCuration.trendingAppIds.includes(app.id)));
        setError(err instanceof Error ? `Failed to load real data: ${err.message}` : 'Failed to load real data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { allApps, curation, trendingApps, loading, error };
};