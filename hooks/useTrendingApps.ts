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

        setAllApps(apps);
        setCuration(curationData);

        console.log('Fetched apps count:', apps.length);
        console.log('Trending IDs from curation:', curationData.trendingAppIds);

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