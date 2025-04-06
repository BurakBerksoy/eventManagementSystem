import { api } from './api';

/**
 * Kullanıcı işlemleri ile ilgili servis
 */

/**
 * Kullanıcı girişi işlemi
 * Spring Boot Security format ile çalışır
 * @param {string} username Kullanıcı adı/email
 * @param {string} password Şifre
 * @returns {Promise<object>} Kullanıcı bilgileri ve token
 */
export const login = async (username, password) => {
  try {
    // AuthRequest DTO'suna uygun format
    const loginData = {
      email: username, // username parametresini email olarak kullan
      password: password
    };

    console.log('Login isteği gönderiliyor:', username);
    
    // AuthController'ın beklediği endpoint: /auth/login
    const response = await api.post('/auth/login', loginData);
    
    console.log('Login başarılı:', response);
    
    return response;
  } catch (error) {
    console.error('Login hatası:', error);
    
    if (error.message && error.message.includes('btoa')) {
      // btoa hatasını özel olarak işle (Türkçe karakter sorunu)
      return {
        success: false,
        message: 'Kullanıcı adı veya şifrede desteklenmeyen karakterler var. Lütfen kontrol ediniz.'
      };
    }
    
    // Backend'den dönen hata mesajını incele ve anlamlı yanıt döndür
    if (error.response) {
      const status = error.response.status;
      const errorData = error.response.data || {};
      
      if (status === 401) {
        console.error('401 hatası: Yetkilendirme hatası');
        return {
          success: false,
          message: errorData.message || 'Kullanıcı adı veya şifre hatalı'
        };
      }
      
      if (status === 403) {
        console.error('403 hatası: Yetkilendirme hatası');
        return {
          success: false,
          message: errorData.message || 'Giriş izniniz bulunmuyor'
        };
      }
      
      if (status === 404) {
        console.error('404 hatası: API endpoint bulunamadı');
        return {
          success: false,
          message: 'Giriş servisi bulunamadı'
        };
      }
      
      // Diğer HTTP hataları
      return {
        success: false,
        message: errorData.message || `Sunucu hatası: ${status}`
      };
    }
    
    // Ağ hatası
    if (error.request) {
      console.error('Ağ hatası: Sunucuya erişilemiyor');
      return {
        success: false,
        message: 'Sunucuya bağlanılamıyor. Spring Boot uygulamasının çalıştığından emin olun.'
      };
    }
    
    // Diğer hatalar
    return {
      success: false,
      message: error.message || 'Bilinmeyen bir hata oluştu'
    };
  }
};

/**
 * Kullanıcı bilgilerini getir
 * @returns {Promise<object>} Kullanıcı profil bilgileri
 */
export const getUserProfile = async () => {
  try {
    // Token doğrulama endpoint'i ile kullanıcı bilgilerini al
    const response = await api.get('/auth/validate-token');
    return response;
  } catch (error) {
    console.error('Kullanıcı profili getirme hatası:', error);
    throw error;
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

// Çıkış yap
export const logout = async () => {
  try {
    // Çıkış isteği gönder
    await api.post('/api/auth/logout');
    
    // Token ve kullanıcı bilgilerini temizle
    localStorage.removeItem('auth_token');
    localStorage.removeItem('userData');
    
    return { success: true };
  } catch (error) {
    console.error('Logout hatası:', error);
    
    // Hataya rağmen yerel bilgileri temizle
    localStorage.removeItem('auth_token');
    localStorage.removeItem('userData');
    
    return { 
      success: false, 
      error: error.response?.data?.message || error.message || 'Çıkış işlemi sırasında bir hata oluştu' 
    };
  }
};

// Mevcut kullanıcı bilgilerini getir
export const getCurrentUser = async () => {
  try {
    // Token doğrulama endpoint'i ile kullanıcı bilgilerini al
    const response = await api.get('/auth/validate-token');
    
    if (!response) {
      return { success: false, error: 'Kullanıcı bilgileri alınamadı' };
    }
    
    return { success: true, data: response };
  } catch (error) {
    console.error('Kullanıcı bilgileri alınamadı:', error);
    return { 
      success: false, 
      error: error.message || 'Kullanıcı bilgileri alınamadı' 
    };
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