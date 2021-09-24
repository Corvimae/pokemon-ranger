import dotenv from 'dotenv';
import { Octokit } from '@octokit/rest';
import { createAppAuth } from '@octokit/auth-app';
import { GameTitleMetadata, normalizeGameTitle } from './titles';

interface RouteMetadata {
  path: string;
  title?: string;
  author?: string;
  authorLink?: string;
  game?: string;
  generation?: number;
  version?: string;
  routeMetadataURL?: string;
  routeURL?: string;
}

let RouteList: RouteMetadata[] = [];

dotenv.config();

const appOctokit = new Octokit({
  authStrategy: createAppAuth,
  auth: {
    appId: process.env.GITHUB_APP_ID,
    privateKey: process.env.GITHUB_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    clientId: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    installationId: process.env.GITHUB_INSTALLATION_ID,
  },
});

export function getRouteList(): RouteMetadata[] {
  return RouteList;
}

async function getDirectoryContentList(path: string) {
  const content = await appOctokit.repos.getContent({
    owner: 'Corvimae',
    repo: 'ranger-routes',
    path,
  });

  return Array.isArray(content.data) ? content.data : [];
}

type RouteGroup = { label: string; options: RouteMetadata[] } & GameTitleMetadata;

export function groupRoutesByTitle(routes: RouteMetadata[]): RouteGroup[] {
  const groups = routes.reduce((acc, item) => {
    const gameTitle = (item.game ? normalizeGameTitle(item.game) : null) ?? { title: 'Other', generation: -1 };

    const group = acc[gameTitle.title] ?? {
      label: gameTitle.shortTitle ?? gameTitle.title,
      ...gameTitle,
      options: [],
    };

    group.options.push(item);
    
    return {
      ...acc,
      [gameTitle.title]: group,
    };
  }, {} as Record<string, RouteGroup>);

  return Object.values(groups).sort((a, b) => b.generation - a.generation);
}

export async function updateRouteList(): Promise<void> {
  try {
    console.info('Updating the list of routes...');

    const content = await getDirectoryContentList('');
    const directories = content.filter(item => item.type === 'dir');

    RouteList = await Promise.all(directories.map(async ({ path }) => {
      const pathContent = await getDirectoryContentList(path);

      const routeMetadataURL = pathContent.find(item => item.name === 'route.json')?.download_url ?? undefined;
      const routeURL = pathContent.find(item => item.name === 'route.mdr')?.download_url ?? undefined;

      try {
        if (routeMetadataURL) {
          const metadataResponse = await fetch(routeMetadataURL);
          const metadata = await metadataResponse.json();

          return {
            path,
            routeMetadataURL,
            routeURL,
            ...metadata,
          };
        }
      } catch (e) {
        console.error(`Unable to parse route.json for ${path}.`);
        console.error(e);
      }

      return {
        path,
        routeMetadataURL,
        routeURL,
      };
    }));

    console.info('Route list updated.');
  } catch (e) {
    console.error('An error occurred when attempting to update the available routes:');
    console.error(e);
  }
}
