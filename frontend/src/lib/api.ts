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

/* ========================= REFRESH TOKEN ========================= */

let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

export const refreshToken = async (): Promise<boolean> => {
  const refreshToken = localStorage.getItem("refreshToken");
  if (!refreshToken) return false;

  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }

  isRefreshing = true;
  refreshPromise = (async () => {
    try {
      const response = await fetch(`${API_URL}/api/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.accessToken) {
          localStorage.setItem("token", data.accessToken);
          if (data.refreshToken) {
            localStorage.setItem("refreshToken", data.refreshToken);
          }
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error("Token refresh failed:", error);
      return false;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
};

/* ========================= API FETCH ========================= */

export const apiFetch = async <T = unknown>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  let token = getToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  // console.log(`[API] Fetching: ${API_URL}${endpoint}`);
  let response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // Handle 401 Unauthorized - Attempt Refresh
  if (response.status === 401) {
    console.warn("[API] 401 Unauthorized. Attempting refresh...");
    const refreshed = await refreshToken();

    if (refreshed) {
      console.log("[API] Token refreshed successfully. Retrying request...");
      token = getToken();
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
      response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
      });
    } else {
      console.error("[API] Refresh failed. Logging out.");
      localStorage.clear();
      window.location.href = "/";
      throw new Error("Unauthorized - Session Expired");
    }
  }

  if (response.status === 401) {
    // If still 401 after retry (or immediate failure if not refreshing)
    localStorage.clear();
    window.location.href = "/";
    throw new Error("Unauthorized");
  }

  if (!response.ok) {
    const text = await response.text();
    let errorMessage = "API Error";
    try {
      const json = JSON.parse(text);
      errorMessage = json.message || json.error || errorMessage;
    } catch {
      errorMessage = text || errorMessage;
    }
    throw new Error(errorMessage);
  }

  const text = await response.text();
  let data = {} as T;
  try {
    data = text ? JSON.parse(text) : ({} as T);
  } catch (e) {
    console.warn("API returned non-JSON response", endpoint, text.substring(0, 100));
    if (text.trim().startsWith("<")) {
      throw new Error("Invalid API response (HTML)");
    }
  }

  return data;
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

/* ========================= MARKET API ========================= */

export interface MarketCoinDto {
  id: string;
  symbol: string;
  name: string;
  image: string;
  currentPrice: number;
  priceChange24h: number; // Added
  priceChangePercentage24h: number;
  marketCap: number;
  marketCapRank: number;
  totalVolume: number; // Added
  high24h: number; // Added
  low24h: number; // Added
}

export interface MarketCoinDetailDto {
  id: string;
  symbol: string;
  name: string;
  description: string;
  image: string; // Added image
  currentPrice: number;
  marketCap: number;
  totalVolume: number;
  high24h: number;
  low24h: number;
  priceChangePercentage24h: number;
  circulatingSupply: number;
  totalSupply: number;
  maxSupply: number;
  ath: number; // Added ATH
  atl: number; // Added ATL
  lastUpdated: string; // Added timestamp
}

export interface MarketChartDto {
  prices: Array<[number, number] | { timestamp: number; price: number }>;
  marketCaps: number[][];
  totalVolumes: number[][];
}

// Helper to map API snake_case to CamelCase DTO
const mapCoinFromApi = (data: any): MarketCoinDto => {
  return {
    id: data.id,
    symbol: data.symbol,
    name: data.name,
    image: typeof data.image === 'string' ? data.image : (data.image?.large || data.image?.small || data.image || ""),
    currentPrice: data.current_price, // map snake_case
    priceChange24h: data.price_change_24h,
    priceChangePercentage24h: data.price_change_percentage_24h,
    marketCap: data.market_cap,
    marketCapRank: data.market_cap_rank,
    totalVolume: data.total_volume,
    high24h: data.high_24h,
    low24h: data.low_24h
  };
};

const mapCoinDetailFromApi = (data: any): MarketCoinDetailDto => {
  if (!data) return { id: "", symbol: "", name: "Unknown", image: "", currentPrice: 0, marketCap: 0, totalVolume: 0, high24h: 0, low24h: 0, priceChangePercentage24h: 0, circulatingSupply: 0, totalSupply: 0, maxSupply: 0, ath: 0, atl: 0, lastUpdated: "", description: "" };

  return {
    id: data.id || "",
    symbol: (data.symbol || "").toLowerCase(),
    name: data.name || "Unknown Coin",
    description: data.description?.en || data.description || "", // handle details text
    image: typeof data.image === 'string' ? data.image : (data.image?.large || data.image?.small || ""), // handle image object or string
    currentPrice: data.market_data?.current_price?.usd ?? data.current_price ?? 0,
    marketCap: data.market_data?.market_cap?.usd ?? data.market_cap ?? 0,
    totalVolume: data.market_data?.total_volume?.usd ?? data.total_volume ?? 0,
    high24h: data.market_data?.high_24h?.usd ?? data.high_24h ?? 0,
    low24h: data.market_data?.low_24h?.usd ?? data.low_24h ?? 0,
    priceChangePercentage24h: data.market_data?.price_change_percentage_24h ?? data.price_change_percentage_24h ?? 0,
    circulatingSupply: data.market_data?.circulating_supply ?? data.circulating_supply ?? 0,
    totalSupply: data.market_data?.total_supply ?? data.total_supply ?? 0,
    maxSupply: data.market_data?.max_supply ?? data.max_supply ?? 0,
    ath: data.market_data?.ath?.usd ?? data.ath ?? 0,
    atl: data.market_data?.atl?.usd ?? data.atl ?? 0,
    lastUpdated: data.last_updated || new Date().toISOString()
  };
};

export const getMarketCoins = async () => {
  const data = await apiFetch<any[]>("/api/market/coins");
  return data.map(mapCoinFromApi);
};

export const getTop50Coins = async () => {
  const data = await apiFetch<any[]>("/api/market/coins/top50");
  return data.map(mapCoinFromApi);
};

export const getTopGainers = async () => {
  const data = await apiFetch<any[]>("/api/market/coins/gainers");
  return data.map(mapCoinFromApi);
};

export const getTopLosers = async () => {
  const data = await apiFetch<any[]>("/api/market/coins/losers");
  return data.map(mapCoinFromApi);
};

export const getCoinDetails = async (id: string) => {
  const data = await apiFetch<any>(`/api/market/coins/${id}`);
  return mapCoinDetailFromApi(data);
};

export const getMarketChart = async (id: string, range: string) => {
  return apiFetch<MarketChartDto>(`/api/market/coins/${id}/chart?range=${range}`);
};

/* ========================= PORTFOLIO API ========================= */

export interface PortfolioItemDto {
  coinId: string; // Changed from symbol to coinId as per requirement
  symbol: string; // Keeping symbol for display if available, or map from coinId
  name: string; // Added name for display
  quantity: number;
  avgBuyPrice: number;
  currentPrice: number;
  investedValue: number;
  currentValue: number;
  profitOrLoss: number; // Changed from profitOrLoss to match "profitLoss" in JSON requirement? 
  // Wait, requirement JSON says "profitLoss", DTO had "profitOrLoss".
  // JSON Requirement: profitLoss
  // I will use profitLoss to match JSON.
  profitLoss: number;
  profitOrLossPercentage: number; // calculated or from backend? JSON doesn't expressly say perc, but UI might need it. 
  // Requirement says "Profit / Loss (per coin)". Color coding implies knowing if > 0.
  // I'll keep percentage if backend sends it, or calculate it.
  // The JSON example in prompt:
  // {
  //   holdings: [
  //     {
  //       coinId: string,
  //       quantity: number,
  //       avgBuyPrice: number,
  //       currentPrice: number,
  //       investedValue: number,
  //       currentValue: number,
  //       profitLoss: number
  //     }
  //   ],
  //   totalInvested: number,
  //   currentValue: number,
  //   profitLoss: number
  // }
  // So I should match this strict structure.
}

export interface PortfolioResponseDto {
  holdings: PortfolioItemDto[];
  totalInvested: number;
  currentValue: number; // Changed from totalValue
  profitLoss: number; // Changed from totalProfitOrLoss
}

export const getPortfolio = async () => {
  return apiFetch<PortfolioResponseDto>("/api/portfolio");
};

/* ========================= TRADE API ========================= */

/* ========================= TRADE API ========================= */

export interface BuyRequest {
  coinId: string;
  amount: number; // BigDecimal backend
}

export interface SellRequest {
  coinId: string;
  quantity: number; // Integer backend
}

export interface TradeResponse {
  coinId: string;
  tradeType: 'BUY' | 'SELL';
  quantity: number;
  price: number;
  message: string;
}

export interface StockTrade {
  coinId: string; // Changed from symbol to coinId
  quantity: number;
  price: number;
  tradeType: 'BUY' | 'SELL'; // Changed from type to tradeType to match response? 
  // Requirement says: "List of StockTrade objects: coinId, quantity, price, tradeType, createdAt"
  createdAt: string; // Changed from timestamp to createdAt
}

export const buyStock = async (data: BuyRequest) => {
  return apiFetch<TradeResponse>("/api/trades/buy", {
    method: "POST",
    body: JSON.stringify(data),
  });
};

export const sellStock = async (data: SellRequest) => {
  return apiFetch<TradeResponse>("/api/trades/sell", {
    method: "POST",
    body: JSON.stringify(data),
  });
};

export const getTradeHistory = async () => {
  return apiFetch<StockTrade[]>("/api/trades/history");
};

/* ========================= WALLET API ========================= */

export interface WalletResponse {
  balance: number;
}

export interface DepositRequest {
  amount: number;
}

export interface WithdrawRequest {
  amount: number;
}

export const getWallet = async () => {
  return apiFetch<WalletResponse>("/api/wallet");
};

export const deposit = async (amount: number) => {
  return apiFetch<WalletResponse>("/api/wallet/deposit", {
    method: "POST",
    body: JSON.stringify({ amount }),
  });
};

export const withdraw = async (amount: number) => {
  return apiFetch<WalletResponse>("/api/wallet/withdraw", {
    method: "POST",
    body: JSON.stringify({ amount }),
  });
};

/* ========================= WATCHLIST API ========================= */

/* ========================= WATCHLIST API ========================= */

export interface WatchlistDto {
  coinId: string;
  currentPrice: number;
}

export const getWatchlist = async () => {
  return apiFetch<WatchlistDto[]>("/api/watchlist");
};

export const addToWatchlist = async (coinId: string) => {
  return apiFetch<void>(`/api/watchlist/${coinId}`, {
    method: "POST",
  });
};

export const removeFromWatchlist = async (coinId: string) => {
  return apiFetch<void>(`/api/watchlist/${coinId}`, {
    method: "DELETE",
  });
};

/* ========================= TRANSFER API ========================= */

export interface TransferRequest {
  toAccountNumber: string;
  amount: number;
  pin: string;
}

export const transferFunds = async (data: TransferRequest) => {
  return apiFetch<{ status: string; message?: string }>("/api/v1/transactions/transfer", {
    method: "POST",
    body: JSON.stringify(data),
  });
};

/* ========================= AI CHAT API ========================= */

export interface ChatRequest {
  message: string;
}

export interface ChatResponse {
  reply: string;
}

export const chatWithAi = async (message: string) => {
  return apiFetch<ChatResponse>("/api/ai/chat", {
    method: "POST",

    body: JSON.stringify({ message }),
  });
};

/* ========================= ADMIN API ========================= */

export interface DashboardSummaryDto {
  totalUsers: number;
  totalTransactions: number;
  totalVolume: number;
  activeUsers: number;
  bannedUsers: number;
}

export interface UserDto {
  id: string;
  email: string;
  fullName: string;
  status: 'ACTIVE' | 'BANNED' | 'PENDING';
  createdAt: string;
}

export interface TradingStatsDto {
  totalVolume24h: number;
  topTradedStocks: { symbol: string; tradeCount: number }[];
}

export interface TransactionDto {
  id: string;
  fromAccountId: string;
  toAccountId: string;
  amount: number;
  type: string;
  status: string;
  referenceId: string;
  description: string;
  keycloakUserId: string;
  isFlagged: boolean;
  createdAt: string;
}

export const getAdminSummary = async () => {
  return apiFetch<DashboardSummaryDto>("/api/admin/dashboard/summary");
};

export const getAllUsers = async () => {
  return apiFetch<UserDto[]>("/api/admin/users");
};

export const updateUserStatus = async (id: string, status: string) => {
  return apiFetch<void>(`/api/admin/users/${id}/status`, {
    method: "PUT",
    body: JSON.stringify({ status })
  });
};

export const getTradingStats = async () => {
  return apiFetch<TradingStatsDto>("/api/admin/trading/stats");
};

export const getFlaggedTransactions = async () => {
  return apiFetch<TransactionDto[]>("/api/admin/fraud/flagged");
};

export const setTransactionFlag = async (id: string, isFlagged: boolean) => {
  return apiFetch<void>(`/api/admin/fraud/${id}/flag`, {
    method: "PUT",
    body: JSON.stringify({ isFlagged })
  });
};

export const downloadAuditReport = (format: 'pdf' | 'csv') => {
  const token = getToken();
  window.location.href = `${API_URL}/api/admin/reports/audit?format=${format}&token=${token}`; // Assuming simplified auth for download, otherwise fetch blob
  // For proper auth headers in download, usually we use fetch -> blob -> objectURL, doing that below
};

export const downloadTransactionReport = async (format: 'pdf' | 'csv') => {
  const response = await fetch(`${API_URL}/api/admin/reports/transactions?format=${format}`, {
    headers: {
      'Authorization': `Bearer ${getToken()}`
    }
  });
  if (!response.ok) throw new Error("Download failed");

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `transactions.${format}`;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
};

export const downloadAuditReportBlob = async (format: 'pdf' | 'csv') => {
  const response = await fetch(`${API_URL}/api/admin/reports/audit?format=${format}`, {
    headers: {
      'Authorization': `Bearer ${getToken()}`
    }
  });
  if (!response.ok) throw new Error("Download failed");

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `audit_logs.${format}`;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
};
