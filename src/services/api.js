import axios from 'axios';
import { API_URL } from '../config/config';

// API endpoint yolları - Spring Boot'un yaygın endpoint yapısı
const API_ENDPOINTS = {
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
    JOIN: '/api/clubs/:clubId/request-membership'
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
  }
};

// Spring Boot API endpoint yolları - hata ayıklama için özel yönlendirmeler
const API_REDIRECTS = {
  // Orijinal endpoint: Yönlendirilecek endpoint
  '/api/users/:userId/events': '/api/events/participation/user/:userId',
  '/api/users/:userId/clubs': '/api/clubs'
};

// Axios client yapılandırması
const client = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
  withCredentials: true, // Spring Boot @CrossOrigin(allowCredentials = "true") için
  timeout: 30000 // 30 saniye timeout
});

// Uygulama durumunu kontrol edecek değişken
let isLoggingOut = false;
let tokenRefreshAttempt = 0;
const MAX_TOKEN_REFRESH_ATTEMPTS = 3; // Maksimum deneme sayısını 3'e çıkardık

// Kullanıcı oturumunu sonlandırmak için yardımcı fonksiyon
const logoutUser = () => {
  if (isLoggingOut) return; // Tekrarlı çağrıları önle
  
  isLoggingOut = true;
  console.log('Token geçersiz, oturum sonlandırılıyor...');
  
  // Oturum bilgilerini localStorage'dan temizle
  localStorage.removeItem('auth_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user');
  localStorage.removeItem('userData');
  
  // Bildirimleri silme (bu kaldırıldı - bildirimler korunacak)
  // localStorage.removeItem('notifications');
  
  // API istek header'larını temizle
  delete client.defaults.headers.common['Authorization'];
  
  // AuthContext'i bilgilendir - global event ile
  try {
    const logoutEvent = new CustomEvent('auth:logout', {
      detail: { 
        reason: 'token_expired',
        timestamp: new Date().toISOString()
      }
    });
    window.dispatchEvent(logoutEvent);
    console.log('Oturum sonlandırma eventi gönderildi');
  } catch (e) {
    console.warn('Oturum sonlandırma eventi gönderilemedi:', e);
  }
  
  // 3 saniye sonra sayfayı login sayfasına yönlendir
  setTimeout(() => {
    isLoggingOut = false; // Reset işlemi
    tokenRefreshAttempt = 0; // Token yenileme sayacını sıfırla
    
    // Sadece login sayfasında değilse yönlendir
    const currentPath = window.location.pathname;
    if (currentPath !== '/login' && !currentPath.includes('/auth')) {
      console.log('Login sayfasına yönlendiriliyor...');
      window.location.href = '/login?status=session_expired';
    }
  }, 3000);
};

// Axios isteklerinin öncesinde çalışacak interceptor
client.interceptors.request.use(
  (config) => {
    // İstek yapılmadan önce token kontrolü yap
    const token = localStorage.getItem('auth_token');
    
    // Header'ı düzenle
    if (token) {
      // Token varsa Authorization header'ını ekle
      config.headers.Authorization = `Bearer ${token}`;
      console.log(`İstek gönderiliyor: ${config.method.toUpperCase()} ${config.url}`);
      console.log(`Token mevcut: ${token.substring(0, 10)}...`);
    } else {
      console.log(`İstek gönderiliyor: ${config.method.toUpperCase()} ${config.url} (token yok)`);
      
      // Token gerektiren işlemler için kontrol
      const requiresAuthPaths = [
        '/api/clubs/membership',
        '/request-membership',
        '/api/clubs/join',
        '/api/events/join'
      ];
      
      // Eğer token gerektiren bir istek varsa ve token yoksa, console'a uyarı göster
      const requiresAuth = requiresAuthPaths.some(path => config.url.includes(path));
      if (requiresAuth) {
        console.warn('Bu istek için token gerekli, ancak bulunamadı:', config.url);
      }
    }
    
    // Spring Boot backend için standart header'lar
    config.headers['Content-Type'] = 'application/json';
    config.headers['Accept'] = 'application/json';
    
    return config;
  },
  (error) => {
    console.error('İstek interceptor hatası:', error);
    return Promise.reject(error);
  }
);

// JWT token işlevleri
const setAuthToken = (token) => {
  if (token) {
    // Token'ı localStorage'a kaydet
    localStorage.setItem('auth_token', token);
    
    // Axios default header'larına ekle
    client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    
    // Güvenlik için token'ın sadece ilk 10 karakterini logla
    console.log(`Token ayarlandı: ${token.substring(0, 10)}...`);
  } else {
    // Token yoksa localStorage ve header'dan kaldır
    localStorage.removeItem('auth_token');
    delete client.defaults.headers.common['Authorization'];
    console.log('Token silindi');
  }
};

// Kullanıcı bilgilerini LocalStorage'a kaydet
const setUserData = (userData) => {
  if (userData && userData.id) {
    // Kullanıcı verilerini JSON olarak kaydet
    localStorage.setItem('user', JSON.stringify(userData));
    
    // Eski uygulamaların 'userData' kullanma ihtimali için
    localStorage.setItem('userData', JSON.stringify(userData));
    return true;
  }
  return false;
};

// İstekleri göndermeden önce token ayarla
const initializeToken = () => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    console.log('Token initialize edildi (uzunluk):', token.length);
    return true;
  }
  return false;
};

// Uygulama başlangıcında token varsa ayarla
initializeToken();

// Yanıt interceptor'ı
client.interceptors.response.use(
  // Başarılı yanıtlar için (2xx durum kodları)
  response => {
    try {
      // API yanıt bilgilerini logla
      console.log(`API yanıtı alındı: ${response.status} ${response.config.url}`);
      
      // İstek URL'sini göster (token bilgisi gibi hassas bilgileri gizleyerek)
      const url = response.config.url;
      const responseData = response.data;
      
      // Büyük veri yanıtları için özetleme yap (log boyutunu kontrol etmek için)
      const stringifiedResponse = JSON.stringify(responseData);
      const truncatedResponse = stringifiedResponse.length > 500 
        ? stringifiedResponse.substring(0, 500) + '...'
        : stringifiedResponse;
      
      console.log(`API yanıt içeriği: ${truncatedResponse}`);
      
      // Bazi API'ler direkt veriyi, bazıları ise { data: ... } formatında döndürür.
      // API yanıt formatlarını standartlaştır
      if (responseData && 
        (responseData.data !== undefined || 
         responseData.success !== undefined || 
         typeof responseData === 'object')) {
        // Veri zaten uygun formatta, olduğu gibi dön
        return responseData;
      }
      
      // Yanıt formatı standart olmayan API'ler için veriyi standartlaştır
      return responseData;
    } catch (error) {
      console.error('API yanıtı işlenirken hata:', error);
      return response.data;
    }
  },
  
  // Hata yanıtları için (4xx, 5xx durum kodları)
  async error => {
    // Detaylı hata bilgisi
    let errorInfo = {
      url: error.config?.url || 'URL bilinmiyor',
      method: error.config?.method || 'Metod bilinmiyor',
      status: error.response?.status || 'Durum kodu bilinmiyor',
      message: error.message || 'Hata mesajı yok',
      data: error.response?.data || {}
    };
    
    console.error('API Hatası:', errorInfo);
    
    // Token'la ilgili hatalar (401 unauthorized)
    if (error.response && error.response.status === 401) {
      console.log('401 Unauthorized hatası - token geçersiz');
      
      // Bildirim ve üyelik kontrolleri için token hatası görmezden gelinebilir
      const isSafeEndpoint = 
        error.config.url.includes('/membership/check') || 
        error.config.url.includes('/api/clubs') ||
        error.config.url.includes('/api/events') ||
        error.config.url.includes('/api/notifications') ||
        error.config.url.includes('/categories');
      
      // Güvenli endpoint'ler için sessiz başarısızlık - kullanıcı deneyimini bozmamak için
      if (isSafeEndpoint) {
        console.log('Güvenli endpoint için 401 hatası - kullanıcı deneyimini bozmamak için işlem devam edecek');
        
        // İsteğin türüne göre uygun cevap formatı
        if (error.config.url.includes('/membership/check')) {
          return Promise.resolve({
            success: true,
            data: { 
              isMember: false, 
              isPending: false, 
              role: null 
            }
          });
        }
        
        // Bildirimler için boş dizi dön
        if (error.config.url.includes('/api/notifications')) {
          // Bildirimler için önce ana storage key olan 'notifications' kontrol et
          try {
            let localNotifications = JSON.parse(localStorage.getItem('notifications') || '[]');
            
            // Eğer boşsa, alternatif anahtar olan 'STORAGE_KEYS.NOTIFICATIONS'ı kontrol et
            if (!localNotifications || localNotifications.length === 0) {
              try {
                // config.js'den STORAGE_KEYS değişkeni olmasa bile çalışması için
                const storageKey = 'NOTIFICATIONS';
                localNotifications = JSON.parse(localStorage.getItem(storageKey) || '[]');
              } catch (e) {
                console.error('Alternatif storage key ile bildirim okuma hatası:', e);
              }
            }
            
            console.log(`LocalStorage'dan ${localNotifications.length} bildirim alındı (token hatası nedeniyle)`);
            
            // Kullanıcı bilgilerini kontrol et
            const userStr = localStorage.getItem('user');
            let userId = null;
            let userRole = null;
            
            if (userStr) {
              try {
                const user = JSON.parse(userStr);
                userId = user.id;
                userRole = user.role;
              } catch (e) {
                console.error('Kullanıcı JSON parse hatası:', e);
              }
            }
            
            // Kullanıcıya ait bildirimleri filtrele (eğer kullanıcı bilgisi varsa)
            let filteredNotifications = localNotifications;
            if (userId) {
              if (userRole === 'CLUB_PRESIDENT') {
                // Kulüp başkanları için özel filtreleme
                filteredNotifications = localNotifications.filter(n => 
                  n.receiverId == userId || 
                  n.presidentId == userId ||
                  (n.data && typeof n.data === 'string' && n.data.includes(userId)) ||
                  (n.data && typeof n.data === 'object' && n.data.presidentId == userId) ||
                  (userRole === 'ADMIN' && n.receiverId === 'admin') ||
                  n.type === 'CLUB_MEMBERSHIP_REQUEST'
                );
              } else {
                // Normal kullanıcılar için filtreleme
                filteredNotifications = localNotifications.filter(n => 
                  n.receiverId == userId || 
                  (userRole === 'ADMIN' && n.receiverId === 'admin')
                );
              }
            }
            
            return Promise.resolve({
              success: true,
              data: filteredNotifications,
              message: 'Bildirimler API yerine localStorage\'dan alındı (token hatası nedeniyle)'
            });
          } catch (e) {
            console.error('LocalStorage bildirim okuma hatası:', e);
            return Promise.resolve({
              success: true,
              data: [],
              message: 'Bildirimler yüklenemedi ancak uygulama çalışmaya devam ediyor'
            });
          }
        }
        
        // Diğer güvenli endpoint'ler için boş dizi dön
        return Promise.resolve({
          success: true,
          data: [],
          message: 'Veri yüklenemedi ancak uygulama çalışmaya devam ediyor'
        });
      }
      
      // Eğer bu bir token doğrulama endpoint'i değilse, token yenilemeyi dene
      if (!error.config.url.includes('/auth/validate-token') && !error.config.url.includes('/auth/refresh-token')) {
        // Token yenilemeyi dene
        const isRefreshed = await refreshToken();
        
        if (isRefreshed) {
          // Token yenilendiyse, orijinal isteği tekrarla
          const originalRequest = error.config;
          originalRequest.headers['Authorization'] = `Bearer ${localStorage.getItem('auth_token')}`;
          return client(originalRequest);
        }
        
        // Token yenilenemediyse oturumu sonlandır
        logoutUser();
        
        return Promise.resolve({ 
          success: false, 
          requiresLogin: true,
          message: 'Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.' 
        });
      }
    }
    
    // Yetki hatası (403 forbidden)
    else if (error.response && error.response.status === 403) {
      console.log('403 Forbidden hatası - erişim yetkisi yok');
      
      // Dashboard için özel durumlar - sessiz failover ile devam et
      const isDashboardResource = 
        error.config?.url.includes('/api/events/participation') || 
        error.config?.url.includes('/api/clubs') ||
        error.config?.url.includes('/api/users/') ||
        error.config?.url.includes('/clubs/categories');
      
      if (isDashboardResource) {
        console.log('Dashboard için kaynak erişimi hatası - boş veri döndürülüyor');
        
        // Hata değil boş veri ile devam et - kullanıcı deneyimini bozmamak için
        return Promise.resolve({
          success: false, 
          data: [], 
          message: 'Bu kaynağa erişim yetkiniz bulunmuyor. Spring Boot SecurityConfig yapılandırmasını kontrol edin.' 
        });
      }
      
      // Kulüp üyelik kontrolü için özel işleme
      if (error.config.url.includes('/membership/check')) {
        console.log('403 hatası - kulüp üyelik kontrolü için varsayılan değerler döndürülüyor');
        // Varsayılan üyelik verisi ile yanıt ver, UI'ın düzgün çalışması için
        return Promise.resolve({
          success: true,
          data: {
            isMember: false, 
            isPending: false, 
            role: null
          },
          message: 'Üyelik durum kontrolü için varsayılan değerler kullanıldı'
        });
      }
    }
    
    return Promise.reject(error);
  }
);

// API'yi direkt olarak export et
export const api = client;

// Bildirim API'si
export const notificationAPI = {
  getNotifications: async () => {
    try {
      // Token kontrolü
      const token = localStorage.getItem('auth_token');
      if (!token) {
        console.warn('Token bulunamadı, bildirimler için localStorage kullanılıyor');
        
        // LocalStorage'dan bildirim okuma
        try {
          const localNotifications = JSON.parse(localStorage.getItem('notifications') || '[]');
          return {
            success: true,
            data: localNotifications,
            message: 'Bildirimler localStorage\'dan alındı'
          };
        } catch (e) {
          console.error('LocalStorage bildirim okuma hatası:', e);
          return { success: false, data: [] };
        }
      }
      
      const response = await api.get('/api/notifications');
      
      // Yanıt kontrolü
      if (Array.isArray(response)) {
        // Doğrudan dizi döndüyse - uygun formata dönüştür
        return {
          success: true,
          data: response,
          message: 'Bildirimler başarıyla alındı (dizi yanıt)'
        };
      } else {
        // Obje yanıtı ise olduğu gibi dön
        return response;
      }
    } catch (error) {
      console.error('Bildirimler alınamadı:', error);
      
      // Hata durumunda localStorage'dan okuma
      try {
        const localNotifications = JSON.parse(localStorage.getItem('notifications') || '[]');
        console.log(`Hata nedeniyle bildirimler localStorage'dan alındı, ${localNotifications.length} bildirim bulundu`);
        
        return {
          success: true,
          data: localNotifications,
          message: 'Bildirimler API hatası nedeniyle localStorage\'dan alındı'
        };
      } catch (e) {
        console.error('LocalStorage bildirim okuma hatası:', e);
        return { success: false, data: [] };
      }
    }
  },
  
  getUnreadCount: async () => {
    try {
      // Token kontrolü yap
      const token = localStorage.getItem('auth_token');
      if (!token) {
        console.warn('Token bulunamadı, bildirim sayısı alınamıyor');
        return { success: false, data: 0 };
      }
      
      // API isteği yap - doğru endpoint ile
      const response = await api.get('/api/notifications/unread-count');
      console.log('Bildirim sayısı yanıtı:', response);
      
      // Yanıt formatı kontrolü
      if (response && typeof response === 'number') {
        // Doğrudan sayı döndüyse
        return { success: true, data: response };
      } else if (response && response.data !== undefined) {
        if (typeof response.data === 'number') {
          // { data: sayı } formatı
          return { success: true, data: response.data };
        } else if (response.data && typeof response.data.data === 'number') {
          // { data: { data: sayı } } formatı
          return { success: true, data: response.data.data };
        }
      }
      
      // Varsayılan cevap
      return { success: true, data: 0 };
    } catch (error) {
      console.error('Okunmamış bildirim sayısı alınamadı:', error);
      return { success: false, data: 0 };
    }
  },
  
  markAsRead: async (notificationId) => {
    try {
      // Doğru endpoint format kullan
      const response = await api.post(`/api/notifications/${notificationId}/mark-as-read`);
      return response;
    } catch (error) {
      console.error('Bildirim okundu olarak işaretlenemedi:', error);
      // Hatada da yanıt dön, uygulamanın çalışmaya devam etmesi için
      return { success: false, message: 'Bildirim işaretlenemedi' };
    }
  },
  
  markAllAsRead: async () => {
    try {
      // Doğru endpoint kullan
      const response = await api.post('/api/notifications/mark-all-as-read');
      return response;
    } catch (error) {
      console.error('Tüm bildirimler okundu olarak işaretlenemedi:', error);
      // Hatada da yanıt dön
      return { success: false, message: 'Bildirimler işaretlenemedi' };
    }
  }
};

// Kullanıcı API'si
export const userAPI = {
  // Kullanıcı profilini getir
  getCurrentUser: async () => {
    try {
      // Önce token'ı kontrol et
      const token = localStorage.getItem('auth_token');
      if (!token) {
        return {
          success: false,
          message: 'Token bulunamadı'
        };
      }
      
      // Token doğrulama endpoint'i ile kullanıcı bilgilerini al
      const response = await api.get('/auth/validate-token', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      return {
        success: true,
        data: response
      };
    } catch (error) {
      console.error('Kullanıcı bilgileri alınamadı:', error);
      return {
        success: false,
        message: error.message || 'Kullanıcı bilgileri alınamadı'
      };
    }
  },

  // Tüm kullanıcıları getir (admin yetkisi gerekir)
  getAllUsers: async () => {
    try {
      console.log('Tüm kullanıcılar getiriliyor');
      
      // Token kontrolü
      const token = localStorage.getItem('auth_token');
      if (!token) {
        console.error('Kullanıcı listesi alınamadı: Token yok');
        return {
          success: false,
          data: [],
          message: 'Oturum bilgisi bulunamadı. Lütfen tekrar giriş yapın.'
        };
      }
      
      // API isteği - Authorization header'ı ile
      const response = await api.get('/api/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Detaylı logging ile yanıt yapısını kontrol et
      console.log('getAllUsers yanıt yapısı:', typeof response, 
        Array.isArray(response) ? 'Dizi' : 'Dizi değil',
        'Yanıt anahtarları:', response ? Object.keys(response) : 'yanıt boş');
      
      // Spring Boot'tan dönen yanıtı uygun şekilde işle
      if (Array.isArray(response)) {
        // Doğrudan bir dizi döndüyse
        return {
          success: true,
          data: response
        };
      } else if (response && Array.isArray(response.data)) {
        // Bir obje içinde data alanında dizi döndüyse
        return {
          success: true,
          data: response.data
        };
      } else {
        // Yanıt kendisi dönmüşse
        return response;
      }
    } catch (error) {
      console.error('Kullanıcılar alınamadı:', error);
      
      // 401 Unauthorized hatası - token geçersiz
      if (error.response && error.response.status === 401) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        localStorage.removeItem('userData');
        return {
          success: false,
          data: [],
          message: 'Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.',
          requiresLogin: true
        };
      }
      
      return {
        success: false,
        data: [],
        error: error.message || 'Kullanıcılar yüklenemedi'
      };
    }
  },
  
  // Kullanıcıyı ID'ye göre getir
  getUserById: async (userId) => {
    try {
      const response = await api.get(`/api/users/${userId}`);
      return response;
    } catch (error) {
      console.error(`ID: ${userId} olan kullanıcı alınamadı:`, error);
      throw error;
    }
  },
  
  // Kullanıcı profilini güncelle
  updateProfile: async (userData) => {
    try {
      const response = await api.put(`/api/users/${userData.id}`, userData);
      return response;
    } catch (error) {
      console.error('Profil güncellenemedi:', error);
      throw error;
    }
  },
  
  // Kullanıcının etkinliklerini getir
  getUserEvents: async (userId) => {
    try {
      const response = await api.get(`/api/users/${userId}/events`);
      return response;
    } catch (error) {
      console.error(`Kullanıcı etkinlikleri alınamadı (ID: ${userId}):`, error);
      throw error;
    }
  },

  // Token doğrulama - oturum kontrolü
  validateToken: async () => {
    try {
      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        console.warn('Token bulunamadı, doğrulama yapılamıyor');
        return { success: false, message: 'Token bulunamadı' };
      }
      
      // Token'ın yapısını kontrol et
      try {
        const tokenParts = token.split('.');
        if (tokenParts.length !== 3) {
          console.error('Geçersiz token formatı');
          return { success: false, message: 'Geçersiz token formatı' };
        }
        
        // Base64 ile şifrelenmiş payload'ı çöz
        const payload = JSON.parse(atob(tokenParts[1]));
        const expiration = payload.exp * 1000; // saniyeden milisaniyeye çevir
        
        // Token süresi geçmiş mi kontrol et
        if (Date.now() > expiration) {
          console.warn('Token süresi dolmuş, yenileme gerekiyor');
          return { 
            success: false, 
            message: 'Token süresi dolmuş',
            expired: true,
            userId: payload.id || payload.sub
          };
        }
      } catch (parseError) {
        console.error('Token çözümleme hatası:', parseError);
        return { success: false, message: 'Token çözümleme hatası' };
      }
      
      // Sunucudan token doğrulama isteği
      const response = await fetch('/auth/validate-token', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const userData = await response.json();
        return { success: true, user: userData };
      } else if (response.status === 401 || response.status === 403) {
        return { success: false, message: 'Geçersiz veya süresi dolmuş token' };
      } else {
        console.error(`Token doğrulama hatası: ${response.status}`);
        return { success: false, message: 'Token doğrulama hatası' };
      }
    } catch (error) {
      console.error('Token doğrulama sırasında hata:', error);
      return { success: false, message: 'Token doğrulama sırasında bir hata oluştu' };
    }
  }
};

// Kulüp API'si
export const clubAPI = {
  // Tüm kulüpleri getir
  getAllClubs: async () => {
    try {
      const response = await api.get('/api/clubs');
      return response;
    } catch (error) {
      console.error('Kulüpler alınamadı:', error);
      throw error;
    }
  },
  
  // Kulübü ID'ye göre getir
  getClubById: async (clubId) => {
    try {
      const response = await api.get(`/api/clubs/${clubId}`);
      return response;
    } catch (error) {
      console.error(`ID: ${clubId} olan kulüp alınamadı:`, error);
      throw error;
    }
  },
  
  // Kulüp oluştur
  createClub: async (clubData) => {
    try {
      const response = await api.post('/api/clubs', clubData);
      return response;
    } catch (error) {
      console.error('Kulüp oluşturulamadı:', error);
      throw error;
    }
  },
  
  // Kulübü güncelle
  updateClub: async (clubId, clubData) => {
    try {
      const response = await api.put(`/api/clubs/${clubId}`, clubData);
      return response;
    } catch (error) {
      console.error(`ID: ${clubId} olan kulüp güncellenemedi:`, error);
      throw error;
    }
  },
  
  // Kulübü sil
  deleteClub: async (clubId) => {
    try {
      console.log(`Kulüp silme isteği gönderiliyor, club ID: ${clubId}`);
      
      // Token kontrolü
      const token = localStorage.getItem('auth_token');
      if (!token) {
        console.error('Kulüp silinemedi: Token yok');
        return {
          success: false,
          message: 'Oturum bilgisi bulunamadı. Lütfen tekrar giriş yapın.',
          requiresLogin: true
        };
      }
      
      // User bilgilerini kontrol et
      const userStr = localStorage.getItem('user');
      if (!userStr) {
        return {
          success: false,
          message: 'Kullanıcı bilgileri bulunamadı. Lütfen tekrar giriş yapın.',
          requiresLogin: true
        };
      }
      
      // Kullanıcının admin olduğundan emin ol
      let user;
      try {
        user = JSON.parse(userStr);
        const isAdmin = user.role === 'ADMIN';
        
        if (!isAdmin) {
          console.error('Kullanıcı admin değil:', user.role);
          return {
            success: false,
            message: 'Bu işlem için admin yetkiniz bulunmuyor.',
            isNotAuthorized: true
          };
        }
        
        console.log('Admin yetkisi doğrulandı, kulüp silme işlemine devam ediliyor');
      } catch (e) {
        console.error('Kullanıcı bilgisi JSON parse hatası:', e);
        return {
          success: false,
          message: 'Kullanıcı bilgileri geçersiz. Lütfen tekrar giriş yapın.',
          requiresLogin: true
        };
      }
      
      // API isteği göndermeden önce özel yetki başlıkları ekle
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'X-Operation': 'DELETE_CLUB',
        'X-User-Role': 'ADMIN',
        'X-Admin-Id': user.id.toString()
      };
      
      console.log('Kulüp silme isteği - headers:', Object.keys(headers));
      
      // Axios client yerine doğrudan fetch API kullan - CORS sorunlarını aşmak için
      const API_URL = 'http://localhost:8080';
      
      try {
        console.log(`Fetch API ile DELETE isteği gönderiliyor: ${API_URL}/api/clubs/${clubId}`);
        console.log('Authorization token uzunluğu:', token.length);
        
        const response = await fetch(`${API_URL}/api/clubs/${clubId}`, {
          method: 'DELETE',
          headers: headers,
          credentials: 'include' // CORS ile kimlik bilgilerini gönder
        });
        
        console.log('Kulüp silme yanıtı alındı:', response.status, response.statusText);
        
        if (response.ok) {
          return {
            success: true,
            message: 'Kulüp başarıyla silindi',
            statusCode: response.status
          };
        } else {
          // HTTP hata durumları
          if (response.status === 401) {
            console.error('401 Unauthorized hatası - token geçersiz');
            
            // Token'ı ve kullanıcı bilgilerini temizle - yetkisiz erişim
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user');
            
            return {
              success: false,
              message: 'Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.',
              requiresLogin: true,
              statusCode: 401
            };
          } else if (response.status === 403) {
            console.error('403 Forbidden hatası - yetki yetersiz');
            
            return {
              success: false,
              message: 'Bu işlem için yetkiniz bulunmuyor. Admin yetkisi gereklidir.',
              statusCode: 403
            };
          } else if (response.status === 404) {
            return {
              success: false,
              message: `Silinecek kulüp bulunamadı (ID: ${clubId})`,
              statusCode: 404
            };
          } else {
            // Diğer hata durumları
            let errorMessage = `Kulüp silme işlemi başarısız oldu. Hata kodu: ${response.status}`;
            try {
              const errorData = await response.json();
              if (errorData.message) {
                errorMessage = errorData.message;
              }
            } catch (e) {
              console.error('Hata yanıtı JSON olarak okunamadı:', e);
            }
            
            return {
              success: false,
              message: errorMessage,
              statusCode: response.status
            };
          }
        }
      } catch (fetchError) {
        console.error('Fetch API hatası:', fetchError);
        return {
          success: false,
          message: 'Ağ hatası: Sunucuya bağlanılamadı. Lütfen internet bağlantınızı ve Spring Boot uygulamasının çalıştığını kontrol edin.',
          error: fetchError
        };
      }
    } catch (error) {
      console.error(`ID: ${clubId} olan kulüp silinemedi:`, error);
      
      return {
        success: false,
        message: error.message || 'Kulüp silme işlemi başarısız oldu',
        error: error
      };
    }
  },
  
  // Kulüp kategorilerini getir
  getCategories: async () => {
    try {
      const response = await api.get('/api/clubs/categories');
      return response;
    } catch (error) {
      console.error('Kulüp kategorileri alınamadı:', error);
      throw error;
    }
  }
};

// Kulüp üyelik API'si
export const membershipAPI = {
  // Kullanıcının kulüp üyelik durumunu kontrol et
  checkMembership: async (clubId) => {
    try {
      console.log(`Kulüp üyelik durumu kontrol ediliyor, clubId: ${clubId}`);
      
      // Önce token kontrolü yap
      const token = localStorage.getItem('auth_token');
      const isAuthenticated = !!token;
      
      console.log(`Kulüp üyelik kontrolü - Token var mı: ${isAuthenticated}`);
      
      // Token yoksa direkt varsayılan değerleri dön - sessiz fail
      if (!isAuthenticated) {
        console.log('Token yok - üyelik kontrolü için varsayılan değerler döndürülüyor');
        return { 
          success: true, // UI'da hata göstermemek için success true döndürüyoruz
          data: { 
            isMember: false, 
            isPending: false, 
            role: null 
          }
        };
      }
      
      // Üyelik kontrolü endpoint'i
      const response = await api.get(API_ENDPOINTS.MEMBERSHIP.CHECK(clubId));
      
      return { data: response, success: true };
    } catch (error) {
      console.error('Üyelik durumu kontrolü başarısız:', error);
      
      // 401 (Unauthorized) hatası için özel işleme ekle
      if (error.response?.status === 401) {
        console.log('401 hatası - Kullanıcı giriş yapmamış. Varsayılan değerler döndürülüyor.');
        
        // 401 hatası alındığında token'ı silmiyoruz, varsayılan değerler döndürüyoruz
        // Bu sayede kullanıcı deneyimi bozulmadan devam edebilir
        return { 
          success: true, // UI'da hata göstermemek için success true döndürüyoruz
          data: { 
            isMember: false, 
            isPending: false, 
            role: null 
          }
        };
      }
      
      // 403 hatası için varsayılan değerler döndür - kullanıcı deneyimini iyileştirmek için
      if (error.response?.status === 403) {
        console.log('403 hatası - kulüp üyelik kontrolü için varsayılan değerler döndürülüyor');
        return { 
          success: true, // UI'da hata göstermemek için success true döndürüyoruz
          data: { 
            isMember: false, 
            isPending: false, 
            role: null 
          }
        };
      }
      
      // Diğer tüm hatalar için varsayılan değerler döndür
      return { 
        success: true, // Yine UI'da hata göstermemek için success true döndürüyoruz
        data: { 
          isMember: false, 
          isPending: false, 
          role: null 
        },
        error: error.response?.data?.message || 'Üyelik durumu kontrol edilemedi' 
      };
    }
  },
  
  // Kulübe katılma isteği gönder
  joinClub: async (clubId, message = '') => {
    try {
      // Önce kulüp bilgilerini al
      let club = null;
      try {
        // Tüm kulüpler listesinden bul
        const clubsResponse = await fetch('/api/clubs');
        
        if (clubsResponse.ok) {
          const contentType = clubsResponse.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const clubs = await clubsResponse.json();
            if (Array.isArray(clubs)) {
              club = clubs.find(c => c.id === Number(clubId));
            } else if (clubs.data && Array.isArray(clubs.data)) {
              club = clubs.data.find(c => c.id === Number(clubId));
            }
          } else {
            console.warn('Kulüpler listesi JSON formatında değil');
          }
        }
        
        // Bulunamadıysa doğrudan kulüp detayını al
        if (!club) {
          const clubResponse = await fetch(`/api/clubs/${clubId}`);
          if (clubResponse.ok) {
            try {
              club = await safeParseJSON(clubResponse);
            } catch (parseError) {
              console.error('Kulüp JSON parse hatası:', parseError);
            }
          }
        }
      } catch (fetchError) {
        console.error('Kulüp bilgisi alınamadı:', fetchError);
      }
      
      // Kulüp bilgisi olmadan da devam et
      if (!club) {
        console.warn(`Kulüp bilgisi alınamadı (ID: ${clubId}), minimum bilgiyle devam ediliyor`);
        club = { id: clubId };
      }
      
      // Token kontrolü
      const token = localStorage.getItem('auth_token');
      if (!token) {
        return { success: false, message: 'Oturum açmanız gerekiyor' };
      }
      
      // Üyelik isteği gönder
      const response = await fetch(`/api/clubs/${clubId}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message })
      });
      
      // Yanıtı işle
      if (response.ok) {
        try {
          const data = await safeParseJSON(response);
          return {
            success: true,
            message: 'Kulübe katılma isteği başarılı',
            data
          };
        } catch (parseError) {
          return { success: true, message: 'Kulübe katılma isteği gönderildi' };
        }
      } else if (response.status === 401 || response.status === 403) {
        // Token hatası - localStorage'a isteği kaydet
        try {
          const requests = JSON.parse(localStorage.getItem('pendingClubRequests') || '[]');
          requests.push({
            clubId,
            message,
            timestamp: new Date().toISOString()
          });
          localStorage.setItem('pendingClubRequests', JSON.stringify(requests));
          
          console.log('Yetkilendirme hatası nedeniyle istek yerel olarak kaydedildi');
          return { 
            success: false, 
            message: 'Oturum hatası nedeniyle istek kaydedildi. Lütfen daha sonra tekrar deneyin.',
            offline: true
          };
        } catch (storageError) {
          console.error('Yerel depolama hatası:', storageError);
          return { success: false, message: 'Oturum hatası ve yerel depolama hatası' };
        }
      } else {
        console.error(`Kulübe katılma isteği hatası: ${response.status}`);
        
        // Yanıt içeriğini almaya çalış
        try {
          const errorData = await safeParseJSON(response);
          if (errorData && errorData.message) {
            return { success: false, message: errorData.message };
          }
        } catch (parseError) {
          // Parse hatası yok sayılabilir
        }
        
        return { success: false, message: 'Kulübe katılma isteği başarısız' };
      }
    } catch (error) {
      console.error('Kulübe katılma isteği sırasında hata:', error);
      return { success: false, message: 'Bir hata oluştu. Lütfen daha sonra tekrar deneyin.' };
    }
  },
  
  // Kulüpten ayrıl
  leaveClub: async (clubId) => {
    try {
      const response = await api.post(`/api/clubs/${clubId}/leave`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Kulüpten ayrılma isteği başarısız:', error);
      return { success: false, error: error.message };
    }
  },
  
  // Bekleyen üyelik isteklerini getir
  getPendingRequests: async (clubId) => {
    try {
      console.log(`Bekleyen üyelik istekleri getiriliyor, clubId: ${clubId}`);
      const response = await api.get(API_ENDPOINTS.MEMBERSHIP.PENDING_REQUESTS(clubId));
      return { data: response, success: true };
    } catch (error) {
      console.error('Bekleyen üyelik istekleri getirilemedi:', error);
      return { 
        data: [], 
        success: false, 
        error: error.response?.data?.message || 'Bekleyen üyelik istekleri getirilemedi' 
      };
    }
  },
  
  // Üyelik isteğini onayla
  approveRequest: async (requestId) => {
    try {
      const response = await api.post(`/api/clubs/membership-requests/${requestId}/approve`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('İstek onaylama başarısız:', error);
      return { success: false, error: error.message };
    }
  },
  
  // Üyelik isteğini reddet
  rejectRequest: async (requestId) => {
    try {
      const response = await api.post(`/api/clubs/membership-requests/${requestId}/reject`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('İstek reddetme başarısız:', error);
      return { success: false, error: error.message };
    }
  }
};

// Etkinlik API'si
export const eventAPI = {
  // Tüm etkinlikleri getir
  getAllEvents: async () => {
    try {
      const response = await api.get('/api/events');
      return response;
    } catch (error) {
      console.error('Etkinlikler alınamadı:', error);
      throw error;
    }
  },
  
  // Etkinliği ID'ye göre getir
  getEventById: async (eventId) => {
    try {
      const response = await api.get(`/api/events/${eventId}`);
      return response;
    } catch (error) {
      console.error(`ID: ${eventId} olan etkinlik alınamadı:`, error);
      throw error;
    }
  },
  
  // Etkinlik oluştur
  createEvent: async (eventData) => {
    try {
      const response = await api.post('/api/events', eventData);
      return response;
    } catch (error) {
      console.error('Etkinlik oluşturulamadı:', error);
      throw error;
    }
  },
  
  // Etkinliği güncelle
  updateEvent: async (eventId, eventData) => {
    try {
      const response = await api.put(`/api/events/${eventId}`, eventData);
      return response;
    } catch (error) {
      console.error(`ID: ${eventId} olan etkinlik güncellenemedi:`, error);
      throw error;
    }
  },
  
  // Etkinliği sil
  deleteEvent: async (eventId) => {
    try {
      const response = await api.delete(`/api/events/${eventId}`);
      return response;
    } catch (error) {
      console.error(`ID: ${eventId} olan etkinlik silinemedi:`, error);
      throw error;
    }
  },

  // Etkinliğe katıl
  joinEvent: async (eventId) => {
    try {
      const response = await api.post(`/api/events/${eventId}/join`);
      return response;
    } catch (error) {
      console.error(`ID: ${eventId} olan etkinliğe katılınamadı:`, error);
      throw error;
    }
  },
  
  // Etkinlikten ayrıl
  leaveEvent: async (eventId) => {
    try {
      const response = await api.delete(`/api/events/${eventId}/leave`);
      return response;
    } catch (error) {
      console.error(`ID: ${eventId} olan etkinlikten ayrılınamadı:`, error);
      throw error;
    }
  }
};

// Bildirim gönderme yardımcı fonksiyonu
const sendMembershipRequestNotification = async (club, user, message) => {
  if (!club.presidentId) {
    console.warn('Kulüp başkanı ID bulunamadığı için bildirim gönderilemedi.');
    return false;
  }
  
  try {
    console.log(`Kulüp başkanına (ID: ${club.presidentId}) bildirim gönderiliyor`);
    
    // Bildirim verisini hazırla
    const requestId = `req-${Date.now()}`;
    const notificationData = {
      title: 'Yeni Kulüp Üyelik İsteği',
      message: `${user.name} kulübünüze katılmak istiyor`,
      type: 'CLUB_MEMBERSHIP_REQUEST',
      entityId: club.id.toString(),
      receiverId: club.presidentId.toString(),
      senderId: user.id.toString(),
      data: JSON.stringify({
        requestId: requestId,
        clubId: club.id,
        userId: user.id,
        userName: user.name,
        clubName: club.name,
        message: message || '',
        timestamp: new Date().toISOString()
      })
    };
    
    // Standart API ile bildirim göndermeyi dene
    try {
      const response = await api.post('/api/notifications', notificationData);
      console.log('Bildirim başarıyla gönderildi:', response);
      return true;
    } catch (notificationError) {
      console.log('Standart bildirim gönderme hatası:', notificationError.response?.status);
      
      // Hata durumunda fetch ile direkt istekte bulun
      const fetchResponse = await fetch('/api/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(notificationData)
      });
      
      console.log('Bildirim gönderildi. Yanıt:', fetchResponse.status);
      
      // Hata durumunu kontrol et
      if (!fetchResponse.ok) {
        console.warn('Bildirim gönderme başarısız, manuel doğrulama bilgisi ekleyerek tekrar dene');
        
        // Manuel doğrulama bilgisi ekle
        notificationData.data = JSON.stringify({
          ...JSON.parse(notificationData.data),
          manualVerification: true,
          verificationCode: `${user.id}-${club.id}-${Date.now()}`
        });
        
        // Başka bir endpoint'e göndermeyi dene
        try {
          const lastResponse = await fetch('/api/clubs/notify', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              notification: notificationData,
              clubId: club.id,
              userId: user.id
            })
          });
          
          return lastResponse.ok;
        } catch (e) {
          console.error('Son bildirim denemesi de başarısız:', e);
          return false;
        }
      }
      
      return fetchResponse.ok;
    }
  } catch (error) {
    console.error('Bildirim gönderme işlemi başarısız:', error);
    return false;
  }
};

// Kulübe katılma isteği gönder
const joinClub = async (clubId, message = '') => {
  return membershipAPI.joinClub(clubId, message);
};

// Kulübe katılma isteğini iptal et
const cancelJoinRequest = async (clubId) => {
  try {
    console.log(`Kulüp katılma isteğini iptal ediyorum, clubId: ${clubId}`);
    
    // membershipService üzerinden iptal işlemi 
    if (typeof membershipService !== 'undefined' && membershipService.cancelRequest) {
      return await membershipService.cancelRequest(clubId);
    } else {
      // Alternatif iptal mekanizması - fetch ile direkt istek
      const response = await fetch(`/api/clubs/${clubId}/membership/cancel`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      
      if (response.ok) {
        return { success: true, message: 'İstek başarıyla iptal edildi' };
      } else {
        return { success: false, message: 'İstek iptal edilemedi' };
      }
    }
  } catch (error) {
    console.error('İstek iptal edilirken hata:', error);
    return { success: false, message: 'Bir hata oluştu' };
  }
};

// API'yi ve diğer değişkenleri export et
export { API_ENDPOINTS };
export { joinClub, cancelJoinRequest };

// Var olan token'ı yenile
export const refreshToken = async () => {
  if (tokenRefreshAttempt >= MAX_TOKEN_REFRESH_ATTEMPTS) {
    console.log(`Maksimum token yenileme denemesi (${MAX_TOKEN_REFRESH_ATTEMPTS}) aşıldı`);
    logoutUser();
    return false;
  }
  
  tokenRefreshAttempt++;
  console.log(`Token yenileme denemesi (${tokenRefreshAttempt}/${MAX_TOKEN_REFRESH_ATTEMPTS})`);
  
  try {
    // Refresh token varsa kullan
    const refreshTokenValue = localStorage.getItem('refresh_token');
    if (!refreshTokenValue) {
      // Eğer refresh token yoksa, mevcut token'ı test et
      // Bazı sistemlerde refresh token olmadan da yenileme yapılabilir
      const token = localStorage.getItem('auth_token');
      if (!token) {
        console.warn('Token ve refresh token bulunamadı, yenileme yapılamıyor');
        return false;
      }
      
      // Mevcut token'ı kullanarak yenilenebilir mi diye dene
      try {
        const tokenResponse = await fetch(`${API_URL}/auth/refresh-token-silent`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json', 
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (tokenResponse.ok) {
          // Eğer token yenilenebildiyse, yeni tokeni kaydet
          const tokenData = await tokenResponse.json();
          if (tokenData.accessToken || tokenData.token) {
            const newToken = tokenData.accessToken || tokenData.token;
            localStorage.setItem('auth_token', newToken);
            
            // Yeni refresh token varsa onu da kaydet
            if (tokenData.refreshToken) {
              localStorage.setItem('refresh_token', tokenData.refreshToken);
            }
            
            console.log('Token başarıyla yenilendi (sessiz mod)');
            tokenRefreshAttempt = 0;
            return true;
          }
        }
      } catch (e) {
        console.error('Sessiz token yenileme hatası:', e);
      }
      
      // Sessiz yenileme başarısız oldu
      console.warn('Refresh token bulunamadı ve sessiz yenileme başarısız oldu');
      return false;
    }
    
    // Yeni token isteği
    const response = await fetch(`${API_URL}/auth/refresh-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ refreshToken: refreshTokenValue })
    });
    
    if (response.ok) {
      const data = await response.json();
      
      if (data.accessToken || data.token) {
        // Yeni token'ı ayarla
        const newToken = data.accessToken || data.token;
        localStorage.setItem('auth_token', newToken);
        
        // Yeni refresh token varsa onu da kaydet
        if (data.refreshToken) {
          localStorage.setItem('refresh_token', data.refreshToken);
        }
        
        // API client headers'ını güncelle
        client.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
        if (axios.defaults) {
          axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
        }
        
        console.log('Token başarıyla yenilendi');
        tokenRefreshAttempt = 0; // Başarılı olduğu için sıfırla
        
        return true;
      }
    }
    
    // Başarısız yanıt için kontrol et - hata detaylarını logla
    if (response.status) {
      console.warn(`Token yenileme başarısız - HTTP ${response.status}`);
      
      // Özel durum: 401/403 yanıtları için kullanıcıyı tamamen logout et
      if (response.status === 401 || response.status === 403) {
        console.error('Refresh token geçersiz veya yetki hatası');
        logoutUser();
        return false;
      }
    }
    
    console.warn('Token yenileme başarısız - bilinmeyen hata');
    return false;
  } catch (error) {
    console.error('Token yenileme hatası:', error);
    return false;
  }
};

// API isteğini JSON tipine göre kontrol et ve HTML yanıtlarını ele al
const safeParseJSON = async (response) => {
  const contentType = response.headers.get('content-type');
  
  if (contentType && contentType.includes('application/json')) {
    try {
      return await response.json();
    } catch (error) {
      console.error('JSON parse hatası:', error);
      throw new Error('JSON ayrıştırma hatası');
    }
  } else {
    // HTML yanıtı gelirse
    const text = await response.text();
    console.warn('Beklenen JSON yerine HTML yanıtı alındı', text.substring(0, 100) + '...');
    
    // Eğer bir başlangıç HTML yanıtı ise (genellikle login sayfasına yönlendirme)
    if (text.includes('<!DOCTYPE html>') || text.includes('<html>')) {
      throw new Error('HTML yanıtı alındı, muhtemelen oturum süresi dolmuş');
    }
    
    // Diğer metin yanıtlarını JSON olarak yorumlamaya çalış
    try {
      return JSON.parse(text);
    } catch (jsonError) {
      throw new Error('Yanıt JSON formatında değil: ' + text.substring(0, 50) + '...');
    }
  }
};