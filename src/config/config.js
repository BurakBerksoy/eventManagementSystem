/**
 * Uygulama genelinde kullanılan konfigürasyon değerleri
 */

// API temel URL'i
export const API_URL = 'http://localhost:8080';

// LocalStorage anahtar isimleri
export const STORAGE_KEYS = {
  TOKEN: 'auth_token',
  REFRESH_TOKEN: 'refresh_token',
  USER: 'user',
  NOTIFICATIONS: 'notifications',
  CLUB_MEMBERSHIPS: 'club_memberships',
  PENDING_REQUESTS: 'pending_requests'
};

// Token yenileme ve kontrol ayarları
export const TOKEN_CONFIG = {
  REFRESH_THRESHOLD: 5 * 60 * 1000, // Token yenileme için eşik değeri (5 dakika)
  CHECK_INTERVAL: 60 * 1000, // Token kontrolü aralığı (1 dakika)
  MAX_RETRY_COUNT: 3 // Token yenileme maksimum deneme sayısı
};

// API yanıt kodları
export const API_RESPONSE_CODES = {
  SUCCESS: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  SERVER_ERROR: 500
};

// Bildirim tipleri
export const NOTIFICATION_TYPES = {
  CLUB_JOIN_REQUEST: 'CLUB_JOIN_REQUEST',
  CLUB_REQUEST_APPROVED: 'CLUB_REQUEST_APPROVED',
  CLUB_REQUEST_REJECTED: 'CLUB_REQUEST_REJECTED',
  EVENT_CREATED: 'EVENT_CREATED',
  EVENT_UPDATED: 'EVENT_UPDATED',
  EVENT_CANCELLED: 'EVENT_CANCELLED',
  SYSTEM: 'SYSTEM'
};

// API endpoint yapılandırmaları
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REGISTER: '/auth/register',
    CURRENT_USER: '/auth/current-user',
    VALIDATE_TOKEN: '/auth/validate-token',
    REFRESH_TOKEN: '/auth/refresh-token'
  },
  USERS: {
    PROFILE: '/api/users/profile',
    BY_ID: (id) => `/api/users/${id}`,
    EVENTS: (id) => `/api/events/participation/user/${id}`,
    CLUBS: (id) => `/api/clubs`
  },
  CLUBS: {
    ALL: '/api/clubs',
    BY_ID: (id) => `/api/clubs/${id}`,
    MEMBERS: (id) => `/api/clubs/${id}/members`,
    JOIN: (clubId) => `/api/clubs/${clubId}/request-membership`
  },
  EVENTS: {
    ALL: '/api/events',
    BY_ID: (id) => `/api/events/${id}`,
    BY_CLUB: (clubId) => `/api/events/club/${clubId}`,
    BY_PARTICIPANT: (userId) => `/api/events/participation/user/${userId}`
  },
  MEMBERSHIP: {
    CHECK: (clubId) => `/api/clubs/${clubId}/membership/check`,
    JOIN: (clubId) => `/api/clubs/${clubId}/membership/join`,
    LEAVE: (clubId) => `/api/clubs/${clubId}/membership/leave`,
    PENDING_REQUESTS: (clubId) => `/api/clubs/${clubId}/membership/requests/pending`,
    APPROVE_REQUEST: (requestId) => `/api/clubs/membership/requests/${requestId}/approve`,
    REJECT_REQUEST: (requestId) => `/api/clubs/membership/requests/${requestId}/reject`
  },
  NOTIFICATIONS: {
    ALL: '/api/notifications',
    UNREAD_COUNT: '/api/notifications/unread-count',
    MARK_AS_READ: (id) => `/api/notifications/${id}/mark-as-read`,
    MARK_ALL_READ: '/api/notifications/mark-all-as-read',
    CREATE: '/api/notifications',
    CREATE_ANONYMOUS: '/api/notifications/anonymous'
  }
}; 