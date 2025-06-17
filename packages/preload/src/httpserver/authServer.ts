import http from 'http';
import net from 'net';
import url from 'url';
import axios from 'axios';
import {v4 as uuidv4} from 'uuid';
import {store} from '../electronApis';
import {openInBrowser} from '../urlHandler';


interface BuildInfo {
  version: string;
  email: string;
  website_url: string;
}

type AccountInfo = {
  name: string;
  email: string;
  avatar: string;
  auth_time: string;
}

let port: number;
let server: http.Server | null;
let buildInfo: BuildInfo;

function init() {
  port = 52650;
  server = null;
  buildInfo = {
    version: store.get('version') as string,
    email: store.get('email') as string,
    website_url: (import.meta.env.DEV ? 'http://localhost:3000' : store.get('website_url')) as string,
  };
}

async function start(): Promise<string> {
  port = await findAvailablePort(port);
  return new Promise((resolve, reject) => {
    server = http.createServer(async (req, res) => {
      if (req.method === 'GET' && req.url?.startsWith('/callback')) {
        const queryObject = url.parse(req.url, true).query;
        console.log('Received oauth callback.');
        const authorizationCode = queryObject.code as string;

        try {
          const token = await exchangeCodeForToken(authorizationCode);
          res.writeHead(200, {'Content-Type': 'text/html'});
          res.end('<html><body>Authorization successful. You can close this window.</body></html>');
          closeServer();
          resolve(token);
        } catch (error) {
          reject(error);
        }
      } else {
        res.writeHead(404, {'Content-Type': 'text/html'});
        res.end('<html><body>Not Found</body></html>');
      }
    });

    server.listen(port, () => {
      console.log(`Server is listening on port ${port}`);
      setTimeout(() => closeServer(), 10 * 60 * 1000); // 10 minutes timeout
    });

    server.on('error', (err: NodeJS.ErrnoException) => {
      reject(err);
    });
  });
}

function closeServer(): void {
  if (server) {
    server.close(() => {
      console.log('Server has been closed');
    });
  }
}

async function findAvailablePort(startPort: number): Promise<number> {
  const MAX_ATTEMPTS = 100; // 设置最大尝试次数
  let attempts = 0;
  let currentPort = startPort;

  while (attempts < MAX_ATTEMPTS) {
    try {
      await checkPort(currentPort);
      return currentPort;
    } catch (err) {
      if (err instanceof Error && 'code' in err && err.code === 'EADDRINUSE') {
        currentPort++;
        attempts++;
      } else {
        throw err;
      }
    }
  }
  throw new Error(`Unable to find an available port after ${MAX_ATTEMPTS} attempts`);
}

function checkPort(port: number): Promise<void> {
  return new Promise((resolve, reject) => {
    const tester = net.createServer()
      .once('error', reject)
      .once('listening', () => {
        tester.once('close', resolve).close();
      })
      .listen(port);
  });
}

async function exchangeCodeForToken(code: string): Promise<string> {
  const tokenUrl = `${buildInfo.website_url}/api/auth/oauth/access_token`;
  const params = {
    code,
    redirect_uri: `http://localhost:${port}/callback`,
  };

  try {
    const response = await axios.post(tokenUrl, params, {
      headers: {Accept: 'application/json'},
    });

    const accessToken = response.data.data.access_token;
    console.log('Access Token obtained successfully');
    return accessToken;
  } catch (error) {
    console.error('Error exchanging code for token:', error);
    throw error;
  }
}

function getOrGenerateClientId(): string {
  const oauth_client_id = store.get('oauth_client_id') as string | undefined;
  if (oauth_client_id) {
    return oauth_client_id;
  } else {
    const clientId = uuidv4();
    store.set('oauth_client_id', clientId);
    return clientId;
  }
}

async function startOAuthLogin(): Promise<string> {
  init();

  const clientId = getOrGenerateClientId();
  const redirectUri = `http://localhost:${port}/callback`;
  const authUrl = `${buildInfo.website_url}/auth/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}`;
  console.debug('authUrl:' + authUrl);
  openInBrowser(authUrl);

  return await start();
}

async function exchangeTokenToAccountInfo(access_token: string): Promise<AccountInfo> {
  const url = `${buildInfo.website_url}/api/auth/oauth/queryAccount`;
  const params = {
    client_id: getOrGenerateClientId(),
    access_token: access_token,
  };

  try {
    const response = await axios.post(url, params, {
      headers: {Accept: 'application/json'},
    });

    const accountInfo = response.data.data;
    if (accountInfo) {
      console.log('AccountInfo obtained successfully');
      console.debug('AccountInfo : ', JSON.stringify(accountInfo));
      return {
        name: accountInfo.name,
        avatar: accountInfo.avatar,
        auth_time: accountInfo.access_token_time,
        email: accountInfo.email,
      };
    } else {
      throw new Error('Failed to get account info');
    }
  } catch (error) {
    console.error('Error exchanging Token for AccountInfo:', error);
    throw error;
  }
}

export async function reAuthAccountLoginByOauth(): Promise<AccountInfo> {
  store.del('access_token');
  store.del('account_info');

  const token = await startOAuthLogin();
  store.set('access_token', token);

  const accountInfo = await exchangeTokenToAccountInfo(token);
  store.set('account_info', JSON.stringify(accountInfo));

  await closeServer();
  return accountInfo;
}
