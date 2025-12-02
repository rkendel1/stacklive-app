import { API_BASE } from '@/constants/config';
import { MiniApp } from '@/src/lib/miniapps';
import { useEffect, useState } from 'react';


export const useTrendingApps = () => {
  const [trendingApps, setTrendingApps] = useState<MiniApp[]>([]);
  const [featuredApps, setFeaturedApps] = useState<MiniApp[]>([]);
  const [newApps, setNewApps] = useState<MiniApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [allApps, setAllApps] = useState<MiniApp[]>([]);
  const [curation, setCuration] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`${API_BASE}/api/apps/list`);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch apps');
        }

        const apps: MiniApp[] = await response.json();
        console.log('Fetched Apps:', apps);

        const now = new Date();
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        const enhancedApps = apps.map(app => ({
          ...app,
          isNewThisWeek: app.isNewThisWeek || (app.lastDeployedAt ? new Date(app.lastDeployedAt) >= sevenDaysAgo : false)
        }));

        setAllApps(enhancedApps);

        setCuration(null); // No longer using curation

        const trendingApps = enhancedApps.filter(app => app.isTrending === true);
        const featuredApps = enhancedApps.filter(app => app.isFeatured === true);
        const recentApps = enhancedApps
          .filter(app => app.isNewThisWeek)
          .sort((a, b) => new Date(b.lastDeployedAt || 0).getTime() - new Date(a.lastDeployedAt || 0).getTime());

        setTrendingApps(trendingApps);
        setFeaturedApps(featuredApps);
        setNewApps(recentApps);
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

  return { allApps, trendingApps, featuredApps, newApps, loading, error };
};