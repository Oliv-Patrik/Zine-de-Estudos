import { AppStateData } from '../types';

declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (response: { access_token?: string; error?: string }) => void;
          }) => {
            requestAccessToken: (overrideConfig?: { prompt?: string }) => void;
          };
        };
      };
    };
  }
}

const DRIVE_FILE_NAME = 'study_caderno_state.json';
const SCOPES = 'https://www.googleapis.com/auth/drive.appdata https://www.googleapis.com/auth/drive.file';

let memoryAccessToken: string | null = null;
let tokenClient: any = null;

export function getCachedToken(): string | null {
  return memoryAccessToken;
}

export function setCachedToken(token: string | null) {
  memoryAccessToken = token;
}

export function isGisAvailable(): boolean {
  return typeof window !== 'undefined' && !!window.google?.accounts?.oauth2;
}

/**
 * Initializes the GIS token client and triggers authorization popup.
 */
export function requestGoogleAccessToken(
  clientId: string,
  onSuccess: (token: string) => void,
  onError: (err: any) => void
): void {
  if (!isGisAvailable()) {
    onError(new Error('Google Identity Services script not ready yet. Please try again in a few seconds.'));
    return;
  }

  try {
    tokenClient = window.google!.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: SCOPES,
      callback: (response) => {
        if (response.error) {
          onError(new Error(response.error));
          return;
        }
        if (response.access_token) {
          memoryAccessToken = response.access_token;
          onSuccess(response.access_token);
        } else {
          onError(new Error('No access token returned from Google.'));
        }
      },
    });

    tokenClient.requestAccessToken({ prompt: '' });
  } catch (err) {
    onError(err);
  }
}

/**
 * Find existing study state file in Drive appDataFolder (or files)
 */
async function findDriveFileId(token: string): Promise<string | null> {
  try {
    const query = encodeURIComponent(`name = '${DRIVE_FILE_NAME}' and trashed = false`);
    const res = await fetch(
      `https://www.googleapis.com/drive/v3/files?spaces=appDataFolder&q=${query}&fields=files(id,name,modifiedTime)`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (!res.ok) {
      // Fallback search in regular drive files if appDataFolder is restricted
      const fallbackRes = await fetch(
        `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,modifiedTime)`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (fallbackRes.ok) {
        const data = await fallbackRes.json();
        return data.files && data.files.length > 0 ? data.files[0].id : null;
      }
      return null;
    }

    const data = await res.json();
    return data.files && data.files.length > 0 ? data.files[0].id : null;
  } catch (err) {
    console.error('Error finding drive file:', err);
    return null;
  }
}

/**
 * Reads state data from Google Drive
 */
export async function fetchFromDrive(token: string): Promise<AppStateData | null> {
  const fileId = await findDriveFileId(token);
  if (!fileId) return null;

  try {
    const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return null;
    const remoteData = (await res.json()) as AppStateData;
    return remoteData;
  } catch (err) {
    console.error('Error fetching file content from Drive:', err);
    return null;
  }
}

/**
 * Saves or updates state data in Google Drive
 */
export async function uploadToDrive(token: string, data: AppStateData): Promise<boolean> {
  try {
    const fileId = await findDriveFileId(token);
    const content = JSON.stringify(data, null, 2);

    if (fileId) {
      // Update existing file
      const updateRes = await fetch(
        `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: content,
        }
      );
      return updateRes.ok;
    } else {
      // Create new file in appDataFolder
      const metadata = {
        name: DRIVE_FILE_NAME,
        parents: ['appDataFolder'],
        description: 'Caderno de Estudos - Dados do Aluno',
      };

      const boundary = 'foo_bar_baz';
      const delimiter = `\r\n--${boundary}\r\n`;
      const closeDelim = `\r\n--${boundary}--`;

      const multipartRequestBody =
        delimiter +
        'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
        JSON.stringify(metadata) +
        delimiter +
        'Content-Type: application/json\r\n\r\n' +
        content +
        closeDelim;

      const createRes = await fetch(
        'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': `multipart/related; boundary=${boundary}`,
          },
          body: multipartRequestBody,
        }
      );

      return createRes.ok;
    }
  } catch (err) {
    console.error('Error uploading file to Drive:', err);
    return false;
  }
}
