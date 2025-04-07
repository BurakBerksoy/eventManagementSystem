import { api } from './api';
import { API_URL, API_ENDPOINTS } from '../config/config';

/**
 * Kullanıcı işlemleri ile ilgili servis
 */

/**
 * Kullanıcı girişi yapar
 * @param {string} email Kullanıcı e-posta adresi
 * @param {string} password Kullanıcı şifresi
 * @returns {Promise<object>} Giriş sonucu
 */
export const login = async (email, password) => {
  try {
    console.log('Login isteği gönderiliyor:', email);
    
    const endpoint = `${API_URL}/auth/login`;
    console.log('Login isteği gönderiliyor:', endpoint);
    
    // API isteği - axios yerine fetch kullanıyoruz daha güvenilir olması için
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Login hatası: ${response.status}`, errorText);
      
      let errorMessage = 'Giriş yapılamadı';
      try {
        // Error yanıtı JSON içeriyor mu kontrol et
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorData.error || 'Giriş yapılamadı';
        }
      } catch (parseError) {
        console.warn('Hata yanıtı parse edilemedi:', parseError);
      }
      
      return { success: false, error: errorMessage };
    }
    
    // Başarılı yanıt
    try {
      const responseData = await response.json();
      console.log('Login yanıtı alındı:', responseData);
      
      let token = null;
      
      // Token yapısını kontrol et - backend farklı alanlarda dönebilir
      if (responseData.accessToken) {
        console.log('Token accessToken olarak bulundu');
        token = responseData.accessToken;
      } else if (responseData.token) {
        console.log('Token token olarak bulundu');
        token = responseData.token;
      } else if (responseData.data && responseData.data.token) {
        console.log('Token data.token olarak bulundu');
        token = responseData.data.token;
      }
      
      if (!token) {
        console.error('Token bulunamadı, yanıt:', responseData);
        return { success: false, error: 'Token bilgisi bulunamadı' };
      }
      
      // Token'ı localStorage'a kaydet
      localStorage.setItem('auth_token', token);
      
      // Refresh token varsa kaydet
      if (responseData.refreshToken) {
        localStorage.setItem('refresh_token', responseData.refreshToken);
      }
      
      // Kullanıcı bilgilerini localStorage'a kaydet
      if (responseData.user) {
        localStorage.setItem('user', JSON.stringify(responseData.user));
      }
      
      console.log('Token header\'a eklendi ve localStorage\'a kaydedildi');
      
      return { 
        success: true, 
        token: token,
        data: responseData.user || responseData.data || responseData 
      };
    } catch (parseError) {
      console.error('Yanıt JSON parse hatası:', parseError);
      return { success: false, error: 'Sunucu yanıtı işlenemedi' };
    }
  } catch (error) {
    console.error('Login işlemi sırasında hata:', error);
    return { success: false, error: error.message || 'Bağlantı hatası' };
  }
};

/**
 * Kullanıcı profil bilgilerini getir
 * @returns {Promise<object>} Kullanıcı profil bilgileri
 */
export const getUserProfile = async () => {
  try {
    // Token kontrolü yap
    const token = localStorage.getItem('auth_token');
    if (!token) {
      console.log('Token bulunamadı, profil bilgisi alınamadı');
      return { success: false, error: 'Oturum açılmamış' };
    }
    
    // API isteği yap
    const response = await fetch(`${API_URL}/api/users/profile`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    // Başarılı yanıt kontrolü
    if (!response.ok) {
      console.error(`Profil bilgisi alınamadı: ${response.status}`);
      return { success: false, error: 'Profil bilgisi alınamadı' };
    }
    
    // Yanıtı güvenli şekilde parse et
    const responseText = await response.text();
    
    // HTML yanıtı kontrolü
    if (responseText.trim().startsWith('<!DOCTYPE html>') || 
        responseText.trim().startsWith('<html')) {
      console.warn('HTML yanıtı alındı, JSON olarak ayrıştırılamaz');
      return { success: false, error: 'Geçersiz yanıt formatı' };
    }
    
    try {
      // JSON olarak parse et
      const profileData = JSON.parse(responseText);
      console.log('Profil bilgisi başarıyla alındı');
      return { success: true, data: profileData };
    } catch (parseError) {
      console.error('JSON parse hatası:', parseError);
      return { success: false, error: 'Yanıt işlenemedi' };
    }
  } catch (error) {
    console.error('getUserProfile hatası:', error);
    return { success: false, error: error.message || 'Profil bilgisi alınırken hata oluştu' };
  }
};

/**
 * Kullanıcı kayıt işlemi
 * @param {Object} userData Kullanıcı kayıt bilgileri
 * @returns {Promise<object>} Kayıt sonucu
 */
export const register = async (userData) => {
  try {
    console.log('Kayıt isteği gönderiliyor:', userData.email);
    
    // Doğru endpoint: /auth/register (veya /api/auth/register değil)
    const response = await api.post('/auth/register', userData);
    
    console.log('Kayıt başarılı:', response);
    
    // Yanıt formatını doğru şekilde döndür
    return {
      success: true,
      data: response.data || response
    };
  } catch (error) {
    console.error('Kayıt hatası:', error);
    
    // Hata işleme
    if (error.response) {
      const status = error.response.status;
      const errorData = error.response.data || {};
      
      // E-posta zaten kayıtlı vb. hataları kontrol et
      if (status === 400) {
        const errorMessage = errorData.message || 'Kayıt bilgilerinizde hata var. Lütfen kontrol edin.';
        return {
          success: false,
          message: errorMessage
        };
      }
      
      if (status === 409) {
        return {
          success: false,
          message: 'Bu e-posta adresi zaten kullanılıyor.'
        };
      }
      
      return {
        success: false,
        message: errorData.message || `Sunucu hatası: ${status}`
      };
    }
    
    // Ağ hatası
    if (error.request) {
      return {
        success: false,
        message: 'Sunucuya bağlanılamıyor. Spring Boot uygulamasının çalıştığından emin olun.'
      };
    }
    
    // Genel hata
    return {
      success: false,
      message: error.message || 'Kayıt sırasında beklenmeyen bir hata oluştu.'
    };
  }
};

/**
 * Çıkış işlemini gerçekleştirir
 * @returns {Promise<Object>} Çıkış işlem sonucu
 */
export const logout = async () => {
  try {
    // Tüm yerel depolama verilerini temizle
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    
    // Varsa backend'e logout isteği gönder (opsiyonel)
    try {
      await fetch('/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
    } catch (logoutApiError) {
      // Backend logout hatası kritik değil, sadece log
      console.warn('Logout API hatası (önemsiz):', logoutApiError);
    }
    
    return { success: true };
  } catch (error) {
    console.error('Logout sırasında hata:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Token'ı doğrular ve kullanıcı bilgilerini alır
 * @returns {Promise<Object>} Doğrulama sonucu
 */
export const validateToken = async () => {
  try {
    const token = localStorage.getItem('auth_token');
    
    if (!token) {
      return { success: false, message: 'Token bulunamadı' };
    }
    
    const response = await fetch('/auth/validate-token', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response.ok) {
      try {
        const userData = await response.json();
        
        // Kullanıcı verilerini güncelle
        localStorage.setItem('user', JSON.stringify(userData));
        
        return { success: true, data: userData };
      } catch (parseError) {
        console.error('Kullanıcı verileri parse hatası:', parseError);
        return { success: false, error: 'Kullanıcı verileri işlenemedi' };
      }
    } else {
      console.warn(`Token doğrulama hatası: ${response.status}`);
      
      // 401 veya 403 hatası - token geçersiz
      if (response.status === 401 || response.status === 403) {
        // Token'ı temizle
        localStorage.removeItem('auth_token');
        
        // Yenileme token'ı varsa yenilemeyi dene
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          console.log('Token yenileme deneniyor...');
          try {
            const refreshResponse = await fetch('/auth/refresh-token', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ refreshToken })
            });
            
            if (refreshResponse.ok) {
              const refreshData = await refreshResponse.json();
              if (refreshData.accessToken) {
                localStorage.setItem('auth_token', refreshData.accessToken);
                console.log('Token başarıyla yenilendi');
                
                // Token yenilendi, tekrar validate et
                return validateToken();
              }
            } else {
              // Yenileme başarısız, refreshToken'ı da temizle
              localStorage.removeItem('refresh_token');
            }
          } catch (refreshError) {
            console.error('Token yenileme hatası:', refreshError);
          }
        }
        
        return { success: false, error: 'Oturum süresi dolmuş' };
      }
      
      return { success: false, error: 'Token doğrulanamadı' };
    }
  } catch (error) {
    console.error('Token doğrulama sırasında hata:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Mevcut kullanıcı bilgilerini getir
 * @returns {Promise<object>} Mevcut kullanıcı bilgileri
 */
export const getCurrentUser = async () => {
  try {
    // Token kontrolü yap
    const token = localStorage.getItem('auth_token');
    if (!token) {
      console.log('Token bulunamadı, kullanıcı bilgisi alınamadı');
      return { success: false, error: 'Oturum açılmamış' };
    }
    
    // API isteği yap
    const response = await fetch(`${API_URL}/auth/validate-token`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    // Başarılı yanıt kontrolü
    if (!response.ok) {
      console.error(`Kullanıcı bilgisi alınamadı: ${response.status}`);
      
      if (response.status === 401 || response.status === 403) {
        // Token geçersiz, temizle
        localStorage.removeItem('auth_token');
      }
      
      // Hata yanıtını döndür
      return { success: false, error: 'Kullanıcı bilgisi alınamadı' };
    }
    
    // Yanıtı güvenli şekilde parse et
    const responseText = await response.text();
    
    // HTML yanıtı kontrolü
    if (responseText.trim().startsWith('<!DOCTYPE html>') || 
        responseText.trim().startsWith('<html')) {
      console.warn('HTML yanıtı alındı, JSON olarak ayrıştırılamaz');
      return { success: false, error: 'Geçersiz yanıt formatı' };
    }
    
    try {
      // JSON olarak parse et
      const userData = JSON.parse(responseText);
      
      // Kullanıcı bilgilerini kontrol et
      if (!userData || !userData.id) {
        console.error('Geçersiz kullanıcı bilgisi:', userData);
        return { success: false, error: 'Geçersiz kullanıcı bilgisi' };
      }
      
      console.log('Kullanıcı bilgisi başarıyla alındı');
      return { success: true, data: userData };
    } catch (parseError) {
      console.error('JSON parse hatası:', parseError);
      return { success: false, error: 'Yanıt işlenemedi' };
    }
  } catch (error) {
    console.error('getCurrentUser hatası:', error);
    return { success: false, error: error.message || 'Kullanıcı bilgisi alınırken hata oluştu' };
  }
};

// Tüm kullanıcıları getir (admin)
export const getAllUsers = async () => {
  try {
    const response = await api.get('/api/users');
    return { success: true, data: response };
  } catch (error) {
    console.error('Kullanıcı listesi alınamadı:', error);
    return { 
      success: false, 
      error: error.message || 'Kullanıcı listesi alınamadı' 
    };
  }
};

// ID'ye göre kullanıcı getir
export const getUserById = async (userId) => {
  try {
    const response = await api.get(`/api/users/${userId}`);
    return { success: true, data: response };
  } catch (error) {
    console.error(`ID: ${userId} olan kullanıcı alınamadı:`, error);
    return { 
      success: false, 
      error: error.message || 'Kullanıcı bilgileri alınamadı' 
    };
  }
};

// Kullanıcı profili güncelle
export const updateUserProfile = async (userData) => {
  try {
    const response = await api.put(`/api/users/${userData.id}`, userData);
    return { success: true, data: response };
  } catch (error) {
    console.error('Profil güncellenirken hata oluştu:', error);
    return { 
      success: false, 
      error: error.message || 'Profil güncellenemedi' 
    };
  }
};

// Şifre değiştir
export const changePassword = async (currentPassword, newPassword) => {
  try {
    const response = await api.post('/api/auth/change-password', { 
      currentPassword, 
      newPassword 
    });
    return { success: true, data: response };
  } catch (error) {
    console.error('Şifre değiştirilirken hata oluştu:', error);
    return { 
      success: false, 
      error: error.message || 'Şifre değiştirilemedi' 
    };
  }
};

// Şifre sıfırlama isteği gönder
export const requestPasswordReset = async (email) => {
  try {
    const response = await api.post('/api/auth/password-reset-request', { email });
    return { success: true, data: response };
  } catch (error) {
    console.error('Şifre sıfırlama isteği gönderilirken hata oluştu:', error);
    return { success: false, error: error.message };
  }
};

// Şifre sıfırlama
export const resetPassword = async (token, newPassword) => {
  try {
    const response = await api.post('/api/auth/password-reset', {
      token,
      newPassword
    });
    return { success: true, data: response };
  } catch (error) {
    console.error('Şifre sıfırlama hatası:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Kullanıcının katıldığı etkinlikleri getirir
 * @param {number} userId - Kullanıcı ID
 * @returns {Promise<Object>} Etkinlik listesi ve durum bilgisi
 */
export const getUserEvents = async (userId) => {
  try {
    console.log(`getUserEvents fonksiyonu çağrıldı (Kullanıcı ID: ${userId})`);
    
    // Spring Boot backend path ile uyumlu endpoint kullanıyoruz
    const response = await api.get(`/api/events/participation/user/${userId}`);
    
    console.log("Kullanıcı etkinlikleri başarıyla alındı:", response);
    return {
      success: true,
      data: response.data || [],
      message: 'Kullanıcı etkinlikleri başarıyla alındı'
    };
  } catch (error) {
    console.error(`Kullanıcı etkinlikleri getirme hatası (Kullanıcı ID: ${userId}):`, error);
    
    // 403 hatası özel işleme - yetki eksikliği
    if (error.response && error.response.status === 403) {
      console.warn("Kullanıcı etkinliklerine erişim yetkisi yok. Spring Boot SecurityConfig yapılandırmasını kontrol edin.");
      return {
        success: false,
        data: [],
        message: 'Etkinlik verilerine erişim izniniz yok. Backend yetki ayarlarını kontrol edin.',
        error: 'FORBIDDEN'
      };
    }
    
    return {
      success: false,
      data: [],
      message: error.message || 'Kullanıcı etkinlikleri alınırken bir hata oluştu',
      error: error.response?.status || 'UNKNOWN_ERROR'
    };
  }
};

/**
 * Kullanıcının üye olduğu kulüpleri getirir
 * @param {number} userId - Kullanıcı ID
 * @returns {Promise<Object>} Kulüp listesi ve durum bilgisi
 */
export const getUserClubs = async (userId) => {
  try {
    console.log(`getUserClubs fonksiyonu çağrıldı (Kullanıcı ID: ${userId})`);
    
    // Spring Boot API yapılandırmasıyla uyumlu endpoint (doğru endpoint kullanılıyor)
    const response = await api.get(`/api/clubs`);
    
    // API'den gelen yanıt kontrolü
    console.log("Kullanıcı kulüpleri başarıyla alındı:", response);
    
    let clubs = [];
    if (response && Array.isArray(response.data)) {
      // Kullanıcıya ait kulüpleri filtrele (istemci tarafında)
      // NOT: Backend'de kullanıcıya özel filtreleme yoksa, tüm kulüpleri alıp
      // istemci tarafında filtreleme yapılabilir
      clubs = response.data;
    }
    
    return {
      success: true,
      data: clubs,
      message: 'Kullanıcı kulüpleri başarıyla alındı'
    };
  } catch (error) {
    console.error(`Kullanıcı kulüpleri getirme hatası (Kullanıcı ID: ${userId}):`, error);
    
    // 403 hatası özel işleme - yetki eksikliği
    if (error.response && error.response.status === 403) {
      console.warn("Kullanıcı kulüplerine erişim yetkisi yok. Spring Boot SecurityConfig yapılandırmasını kontrol edin.");
      return {
        success: false,
        data: [],
        message: 'Kulüp verilerine erişim izniniz yok. Backend yetki ayarlarını kontrol edin.',
        error: 'FORBIDDEN'
      };
    }
    
    return {
      success: false,
      data: [],
      message: error.message || 'Kullanıcı kulüpleri alınırken bir hata oluştu',
      error: error.response?.status || 'UNKNOWN_ERROR'
    };
  }
};

// Kullanıcının etkinlikten ayrılmasını kaydet
export const unregisterFromEvent = async (eventId) => {
  try {
    const response = await api.delete(`/api/events/${eventId}/leave`);
    return { success: true, data: response };
  } catch (error) {
    console.error(`Etkinlikten ayrılma işlemi yapılırken hata oluştu (ID: ${eventId}):`, error);
    return { success: false, error: error.message };
  }
};

// İki faktörlü doğrulama kurulumu başlat
export const setupTwoFactorAuth = async () => {
  try {
    const response = await api.post('/api/auth/2fa/setup');
    return { success: true, data: response };
  } catch (error) {
    console.error('İki faktörlü doğrulama kurulurken hata oluştu:', error);
    return { success: false, error: error.message };
  }
};

// İki faktörlü doğrulama kodunu doğrula
export const verifyTwoFactorAuth = async (code) => {
  try {
    const response = await api.post('/api/auth/2fa/verify', { code });
    return { success: true, data: response };
  } catch (error) {
    console.error('İki faktörlü doğrulama kodu doğrulanırken hata oluştu:', error);
    return { success: false, error: error.message };
  }
};

// Bildirim tercihlerini getir
export const getNotificationPreferences = async () => {
  try {
    const response = await api.get('/api/users/notification-preferences');
    return { success: true, data: response };
  } catch (error) {
    console.error('Bildirim tercihleri yüklenirken hata oluştu:', error);
    return { success: false, error: error.message };
  }
};

// Bildirim tercihlerini güncelle
export const updateNotificationPreferences = async (preferences) => {
  try {
    const response = await api.put('/api/users/notification-preferences', preferences);
    return { success: true, data: response };
  } catch (error) {
    console.error('Bildirim tercihleri güncellenirken hata oluştu:', error);
    return { success: false, error: error.message };
  }
};

// Kullanıcının rollerini getir
export const getUserRoles = async (userId = 'me') => {
  try {
    const response = await api.get(`/users/${userId}/roles`);
    return response.data;
  } catch (error) {
    console.error(`Kullanıcı rolleri alınamadı (ID: ${userId}):`, error);
    return [];
  }
}; 