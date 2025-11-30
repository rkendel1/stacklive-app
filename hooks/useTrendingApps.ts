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
          console.error(`API fetch failed - Apps: ${appsRes.status} (${appsRes.url}), Curation: ${curationRes.status} (${curationRes.url})`);
          throw new Error(`API fetch failed: Apps ${appsRes.status}, Curation ${curationRes.status}`);
        }

        const apps: MiniApp[] = await appsRes.json();
        const curationData = await curationRes.json();

        // Derive launchUrl from deploymentUrl if needed
        const processedApps = apps.map((app) => {
          if (app.deploymentUrl && (!app.launchUrl || app.launchUrl === '#')) {
            const url = new URL(app.deploymentUrl);
            url.searchParams.set('webview', 'true');
            return { ...app, launchUrl: url.toString() };
          }
          return app;
        });

        if (apps.length === 0 || !curationData || Object.keys(curationData).length === 0) {
          setError('No data available from API. Check /api/miniapps/list and /api/curation/get for data.');
        }

        setAllApps(processedApps);
        setCuration(curationData);

        const allAppsMap: { [key: string]: MiniApp } = processedApps.reduce((map, app) => {
          map[app.id] = app;
          return map;
        }, {} as { [key: string]: MiniApp });

        const hydratedTrending = curationData.trendingAppIds?.map((id: string) => allAppsMap[id]).filter(Boolean) || [];

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