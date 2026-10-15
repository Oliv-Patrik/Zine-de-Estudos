import { AppStateData, GoogleUserProfile, Subject, StudySession, GoalTask } from '../types';

declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (response: { access_token?: string; error?: string; expires_in?: number }) => void;
          }) => {
            requestAccessToken: (overrideConfig?: { prompt?: string }) => void;
          };
          revoke: (token: string, done?: () => void) => void;
        };
      };
    };
  }
}

export const DRIVE_FILE_NAME = 'zine-de-estudos.json';
const LEGACY_DRIVE_FILE_NAME = 'study_caderno_state.json';
export const DRIVE_SCOPE = 'https://www.googleapis.com/auth/drive.appdata email profile';

let memoryAccessToken: string | null = null;
let tokenExpiresAt = 0;
let tokenClient: any = null;

export function getCachedToken(): string | null {
  return memoryAccessToken;
}

export function setCachedToken(token: string | null, expiresIn = 3599) {
  memoryAccessToken = token;
  tokenExpiresAt = Date.now() + Math.max(60, expiresIn - 60) * 1000;
}

export function isTokenExpired(): boolean {
  if (!memoryAccessToken) return true;
  return Date.now() >= tokenExpiresAt;
}

export function isGisAvailable(): boolean {
  return typeof window !== 'undefined' && !!window.google?.accounts?.oauth2;
}

/**
 * Initializes GIS token client and requests token (interactive or silent)
 */
export function requestGoogleAccessToken(
  clientId: string,
  onSuccess: (token: string) => void,
  onError: (err: any) => void,
  silent = false
): void {
  if (!isGisAvailable()) {
    onError(new Error('Google Identity Services script not ready yet. Please try again in a few seconds.'));
    return;
  }

  try {
    tokenClient = window.google!.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: DRIVE_SCOPE,
      callback: (response) => {
        if (response.error) {
          onError(new Error(response.error));
          return;
        }
        if (response.access_token) {
          const expiresIn = response.expires_in || 3599;
          setCachedToken(response.access_token, expiresIn);
          onSuccess(response.access_token);
        } else {
          onError(new Error('No access token returned from Google.'));
        }
      },
    });

    tokenClient.requestAccessToken({ prompt: silent ? '' : 'select_account' });
  } catch (err) {
    onError(err);
  }
}

/**
 * Fetches user profile (name, picture, email) using the access token.
 */
export async function fetchUserProfile(token: string): Promise<GoogleUserProfile | null> {
  try {
    const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return {
      name: data.name || data.given_name || 'Usuário',
      email: data.email || '',
      picture: data.picture,
    };
  } catch (err) {
    console.warn('Error fetching user profile:', err);
    return null;
  }
}

/**
 * Revokes Google access token and cleans up session.
 */
export function signOutGoogle(token: string | null): void {
  if (token && window.google?.accounts?.oauth2?.revoke) {
    try {
      window.google.accounts.oauth2.revoke(token, () => {});
    } catch (e) {
      console.warn('Token revoke warning:', e);
    }
  }
  memoryAccessToken = null;
  tokenExpiresAt = 0;
}

/**
 * Find existing study state file in Drive appDataFolder (or legacy file name)
 */
export async function findDriveFileId(token: string): Promise<string | null> {
  try {
    // 1. Try primary file name in appDataFolder
    const query = encodeURIComponent(`name = '${DRIVE_FILE_NAME}' and trashed = false`);
    const res = await fetch(
      `https://www.googleapis.com/drive/v3/files?spaces=appDataFolder&q=${query}&fields=files(id,name,modifiedTime)`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (res.ok) {
      const data = await res.json();
      if (data.files && data.files.length > 0) {
        return data.files[0].id;
      }
    }

    // 2. Fallback search legacy file name in appDataFolder
    const legacyQuery = encodeURIComponent(`name = '${LEGACY_DRIVE_FILE_NAME}' and trashed = false`);
    const legacyRes = await fetch(
      `https://www.googleapis.com/drive/v3/files?spaces=appDataFolder&q=${legacyQuery}&fields=files(id,name,modifiedTime)`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (legacyRes.ok) {
      const legacyData = await legacyRes.json();
      if (legacyData.files && legacyData.files.length > 0) {
        return legacyData.files[0].id;
      }
    }

    return null;
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
        description: 'Zine de Estudos - Dados do Aluno',
      };

      const boundary = 'zine_boundary_99';
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

/**
 * CRDT-style merge between local state and remote Google Drive state.
 * Prevails latest `updatedAt` (or `createdAt`) per entity ID.
 * Soft-deleted items (`deletedAt`) are retained with their deletion timestamp
 * to prevent resurrection.
 */
export function mergeAppState(local: AppStateData, remote: AppStateData): AppStateData {
  // Merge subjects
  const subjectMap = new Map<string, Subject>();
  for (const s of [...(remote.subjects || []), ...(local.subjects || [])]) {
    const existing = subjectMap.get(s.id);
    if (!existing) {
      subjectMap.set(s.id, s);
    } else {
      const existingTime = existing.updatedAt || existing.createdAt || 0;
      const sTime = s.updatedAt || s.createdAt || 0;
      if (sTime >= existingTime) {
        subjectMap.set(s.id, s);
      }
    }
  }

  // Merge sessions
  const sessionMap = new Map<string, StudySession>();
  for (const s of [...(remote.sessions || []), ...(local.sessions || [])]) {
    const existing = sessionMap.get(s.id);
    if (!existing) {
      sessionMap.set(s.id, s);
    } else {
      const existingTime = existing.updatedAt || existing.createdAt || 0;
      const sTime = s.updatedAt || s.createdAt || 0;
      if (sTime >= existingTime) {
        sessionMap.set(s.id, s);
      }
    }
  }

  // Merge goalTasks
  const taskMap = new Map<string, GoalTask>();
  for (const t of [...(remote.goalTasks || []), ...(local.goalTasks || [])]) {
    const existing = taskMap.get(t.id);
    if (!existing) {
      taskMap.set(t.id, t);
    } else {
      const existingTime = existing.updatedAt || existing.createdAt || 0;
      const tTime = t.updatedAt || t.createdAt || 0;
      if (tTime >= existingTime) {
        taskMap.set(t.id, t);
      }
    }
  }

  // Pick newer global settings
  const remoteIsNewer = (remote.lastModified || 0) > (local.lastModified || 0);

  return {
    version: Math.max(local.version || 2, remote.version || 2),
    lastModified: Date.now(),
    subjects: Array.from(subjectMap.values()),
    sessions: Array.from(sessionMap.values()),
    goalTasks: Array.from(taskMap.values()),
    dailyTargetMinutes: remoteIsNewer ? remote.dailyTargetMinutes : local.dailyTargetMinutes,
    pomodoroSettings: remoteIsNewer ? remote.pomodoroSettings : local.pomodoroSettings,
    pomodoroState: local.pomodoroState || remote.pomodoroState,
    language: local.language || remote.language || 'pt-BR',
    theme: local.theme || remote.theme || 'dark',
  };
}
