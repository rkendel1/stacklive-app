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

        const response = await fetch('https://stacklive.dev/api/apps/list');

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch apps');
        }

        const apps: MiniApp[] = await response.json();
        console.log('Fetched Apps:', apps);

        setAllApps(apps);
        setCuration(null); // No longer using curation

        const trendingApps = apps.filter(app => app.isTrending === true);

        setTrendingApps(trendingApps);
        setError(null);
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

  return { allApps, trendingApps, loading, error };
};