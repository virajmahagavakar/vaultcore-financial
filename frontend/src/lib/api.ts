const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";
const KEYCLOAK_URL = import.meta.env.VITE_KEYCLOAK_URL || "http://localhost:8081";
const KEYCLOAK_REALM = "vaultcore";
const KEYCLOAK_CLIENT_ID = "vaultcore-frontend";

/* ========================= TOKEN HELPERS ========================= */

function decodeToken(token: string): Record<string, unknown> | null {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch {
    return null;
  }
}

export function getRolesFromToken(token: string): string[] {
  const decoded = decodeToken(token);
  if (!decoded) return [];

  const realmRoles = (decoded.realm_access as { roles?: string[] })?.roles || [];
  const resourceAccess = decoded.resource_access as Record<string, { roles?: string[] }> | undefined;
  const resourceRoles = resourceAccess
    ? Object.values(resourceAccess).flatMap((r) => r.roles || [])
    : [];

  return [...new Set([...realmRoles, ...resourceRoles])];
}

export function isTokenExpired(token: string): boolean {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) return true;
  return Date.now() >= (decoded.exp as number) * 1000;
}

export function getUserFromToken(token: string) {
  const decoded = decodeToken(token);
  if (!decoded) return null;
  return {
    id: decoded.sub as string,
    email: decoded.email as string,
    name: decoded.name as string || decoded.preferred_username as string || "User",
  };
}

export interface AccountResponseDto {
  id: string;
  accountNumber: string;
  balance: number;
  nickname: string;
  status: string;
}

/* ========================= AUTH ========================= */

export function getToken(): string | null {
  return localStorage.getItem("token");
}

export function isAuthenticated(): boolean {
  const token = getToken();
  return !!token && !isTokenExpired(token);
}

export function isAdmin(): boolean {
  const token = getToken();
  if (!token) return false;
  const roles = getRolesFromToken(token);
  return roles.includes("ADMIN") || roles.includes("ROLE_ADMIN");
}

export function getKeycloakLoginUrl(): string {
  const redirectUri = `${window.location.origin}/callback`;
  return (
    `${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}/protocol/openid-connect/auth` +
    `?client_id=${KEYCLOAK_CLIENT_ID}` +
    `&response_type=code` +
    `&scope=openid` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&prompt=login`
  );
}

export function getKeycloakRegisterUrl(): string {
  const redirectUri = `${window.location.origin}/callback`;
  return (
    `${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}/protocol/openid-connect/registrations` +
    `?client_id=${KEYCLOAK_CLIENT_ID}` +
    `&response_type=code` +
    `&scope=openid` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}`
  );
}

/* ========================= API FETCH ========================= */

export const apiFetch = async <T = unknown>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const token = getToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    localStorage.clear();
    window.location.href = "/";
    throw new Error("Unauthorized");
  }

  if (!response.ok) {
    const text = await response.text();
    let errorMessage = "API Error";
    try {
      const json = JSON.parse(text);
      // Spring Boot default error structure: { "message": "...", "error": "...", ... }
      // We prefer "message" if available, else "error"
      errorMessage = json.message || json.error || errorMessage;
    } catch {
      errorMessage = text || errorMessage;
    }
    throw new Error(errorMessage);
  }

  const text = await response.text();
  return text ? JSON.parse(text) : ({} as T);
};

/* ========================= LOGOUT ========================= */

export const logout = async () => {
  const refreshToken = localStorage.getItem("refreshToken");
  const logoutUrl = `${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}/protocol/openid-connect/logout`;

  try {
    if (refreshToken) {
      await fetch(logoutUrl, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: KEYCLOAK_CLIENT_ID,
          refresh_token: refreshToken,
        }),
      });
    }
  } finally {
    localStorage.clear();
    window.location.href = "/";
  }
};
