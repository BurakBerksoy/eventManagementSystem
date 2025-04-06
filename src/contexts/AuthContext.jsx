import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { login as loginService, logout as logoutService, getCurrentUser as getUserService, register as registerService } from '../services/userService';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [user, setUser] = useState(null); // Alias for currentUser compatibility
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false); 

  // Başlangıçta token varsa kullanıcı bilgilerini getir
  useEffect(() => {
    const checkAuth = async () => {
      setLoading(true);
      try {
        // LocalStorage'dan token ve kullanıcı bilgilerini kontrol et
        const token = localStorage.getItem('auth_token');
        const userStr = localStorage.getItem('user');
        
        if (token) {
          console.log("Token bulundu, kullanıcı bilgisi alınıyor...");
          // Token varsa client headers'a ekle
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          // Önce localStorage'da kaydedilmiş kullanıcı bilgisi var mı kontrol et
          if (userStr) {
            try {
              const storedUser = JSON.parse(userStr);
              console.log("LocalStorage'dan kullanıcı bilgisi yüklendi:", storedUser);
              setCurrentUser(storedUser);
              setUser(storedUser);
              setIsAuthenticated(true);
              setLoading(false);
              return; // localStorage'dan kullanıcı bilgisi yüklendiyse API'ye sorgu atmaya gerek yok
            } catch (e) {
              console.error("LocalStorage'daki kullanıcı bilgisi geçersiz:", e);
              // JSON parse hatası, devam et ve API'den kullanıcı bilgilerini al
            }
          }
          
          try {
            // Mevcut kullanıcı bilgisini getir
            console.log("Kullanıcı bilgisi alınıyor...");
            const userData = await getCurrentUser();
            
            if (userData) {
              console.log("API'den kullanıcı bilgisi yüklendi:", userData);
              
              // LocalStorage'a kaydediyoruz ki sayfayı yenilediğimizde tekrar API'ye sormak zorunda kalmayalım
              localStorage.setItem('user', JSON.stringify(userData));
              setIsAuthenticated(true);
            } else {
              console.warn("Kullanıcı bilgileri alınamadı, token temizleniyor");
              localStorage.removeItem('auth_token');
              localStorage.removeItem('user');
              delete axios.defaults.headers.common['Authorization'];
              setCurrentUser(null);
              setUser(null);
              setIsAuthenticated(false);
            }
          } catch (error) {
            console.error("Kullanıcı bilgileri alınamadı:", error);
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user');
            delete axios.defaults.headers.common['Authorization'];
            setCurrentUser(null);
            setUser(null);
            setIsAuthenticated(false);
          }
        } else {
          console.log("Token bulunamadı, anonim durum");
          setCurrentUser(null);
          setUser(null);
          setIsAuthenticated(false);
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Token doğrulama hatası:", error);
        // Hata durumunda token'ı temizle
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        delete axios.defaults.headers.common['Authorization'];
        setCurrentUser(null);
        setUser(null);
        setIsAuthenticated(false);
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (username, password) => {
    try {
      console.log('Login işlemi başlatılıyor...');
      setAuthError(null);
      
      // Form kontrolü
      if (!username || !password) {
        const errorMsg = 'E-posta ve şifre alanları doldurulmalıdır';
        setAuthError(errorMsg);
        return { success: false, message: errorMsg };
      }
      
      // Login servisini çağır
      const result = await loginService(username, password);
      
      if (!result.success) {
        console.error('Login başarısız:', result.message);
        setAuthError(result.message);
        
        // Backend'den gelen hata mesajlarını kontrol et ve daha anlamlı hata mesajları döndür
        const errorMsg = result.message || 'Giriş yapılırken bir hata oluştu';
        return { success: false, message: errorMsg };
      }
      
      console.log('Login başarılı, kullanıcı bilgisi alınıyor...');
      
      // Token'ı localStorage'a kaydet
      const token = result.token || result.data?.token;
      if (token) {
        localStorage.setItem('auth_token', token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }
      
      // Kullanıcı bilgilerini oluştur
      let userData;
      
      // Login yanıtı içinde kullanıcı bilgisi varsa direkt kullan
      if (result.data?.user || result.data?.id || result.data?.email) {
        userData = result.data.user || result.data;
      } else {
        // Kullanıcı bilgilerini getir - login içinde yetkilendirme bilgisi yoksa
        const userResponse = await getCurrentUser();
        if (!userResponse) {
          console.error('Login sonrası kullanıcı bilgisi alınamadı');
          localStorage.removeItem('auth_token');
          setAuthError('Kullanıcı bilgisi alınamadı');
          return { success: false, message: 'Kullanıcı bilgisi alınamadı' };
        }
        userData = userResponse;
      }
      
      // Kullanıcı state'ini güncelle
      setCurrentUser(userData);
      setUser(userData); // Backward compatibility için
      setIsAuthenticated(true);
      
      // localStorage'a kullanıcı bilgilerini kaydet
      localStorage.setItem('user', JSON.stringify(userData));
      
      console.log('Kullanıcı girişi tamamlandı. Etkinlikler sayfasına yönlendiriliyor:', userData);
      
      return { success: true, user: userData };
    } catch (error) {
      console.error('Login hatası:', error);
      
      // Hata mesajını belirle
      let errorMessage = 'Giriş yapılırken bir hata oluştu';
      
      if (error.response) {
        // HTTP durum koduna göre hata mesajları
        if (error.response.status === 401) {
          errorMessage = 'Geçersiz e-posta veya şifre';
        } else if (error.response.status === 403) {
          errorMessage = 'Giriş bilgileri doğrulanamadı. Lütfen e-posta ve şifrenizi kontrol edin.';
        } else if (error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setAuthError(errorMessage);
      return { success: false, message: errorMessage };
    }
  };

  const logout = async () => {
    try {
      console.log('Çıkış yapılıyor...');
      await logoutService();
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      delete axios.defaults.headers.common['Authorization'];
      setCurrentUser(null);
      setUser(null);
      setIsAuthenticated(false);
      setAuthError(null);
      return true;
    } catch (error) {
      console.error('Logout hatası:', error);
      // Hata olsa da kullanıcı çıkış yapmış sayılır
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      delete axios.defaults.headers.common['Authorization'];
      setCurrentUser(null);
      setUser(null);
      setIsAuthenticated(false);
      setAuthError(null);
      return false;
    }
  };

  const getCurrentUser = async () => {
    try {
      console.log('Kullanıcı bilgisi alınıyor...');
      
      // Token kontrolü
      const token = localStorage.getItem('auth_token');
      if (!token) {
        console.log('Kullanıcı bilgisi alınamadı: Token yok');
        setCurrentUser(null);
        setUser(null);
        setIsAuthenticated(false);
        return null;
      }
      
      // API'den kullanıcı bilgisini al
      const result = await getUserService();
      
      if (!result.success) {
        console.error('Kullanıcı bilgisi alınamadı:', result.error);
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        delete axios.defaults.headers.common['Authorization'];
        setCurrentUser(null);
        setUser(null);
        setIsAuthenticated(false);
        return null;
      }
      
      const userData = result.data;
      if (!userData) {
        console.error('API yanıtı userData içermiyor');
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        delete axios.defaults.headers.common['Authorization'];
        setCurrentUser(null);
        setUser(null);
        setIsAuthenticated(false);
        return null;
      }
      
      console.log('Kullanıcı bilgisi başarıyla alındı');
      setCurrentUser(userData);
      setUser(userData);
      setIsAuthenticated(true);
      
      // LocalStorage'a kullanıcı bilgilerini kaydet
      localStorage.setItem('user', JSON.stringify(userData));
      
      return userData;
    } catch (error) {
      console.error('Kullanıcı bilgisi alınamadı (hata):', error);
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      delete axios.defaults.headers.common['Authorization'];
      setCurrentUser(null);
      setUser(null);
      setIsAuthenticated(false);
      return null;
    }
  };

  // Kullanıcı kayıt işlemi
  const register = async (userData) => {
    try {
      console.log('Register işlemi başlatılıyor...');
      setAuthError(null);
      
      // Form kontrolü
      if (!userData.email || !userData.password) {
        const errorMsg = 'E-posta ve şifre alanları doldurulmalıdır';
        setAuthError(errorMsg);
        return { success: false, message: errorMsg };
      }
      
      // Register servisini çağır
      const result = await registerService(userData);
      
      if (!result.success) {
        console.error('Kayıt başarısız:', result.message);
        setAuthError(result.message);
        return { success: false, message: result.message };
      }
      
      console.log('Kayıt başarılı, otomatik giriş yapılıyor...');
      
      // Otomatik login yap
      const loginResult = await login(userData.email, userData.password);
      
      if (loginResult.success) {
        console.log('Otomatik giriş başarılı:', loginResult.user);
        return { 
          success: true, 
          message: 'Kayıt ve giriş işlemi başarılı.',
          user: loginResult.user
        };
      } else {
        console.error('Otomatik giriş başarısız:', loginResult.message);
        return { 
          success: true, 
          message: 'Kayıt işlemi başarılı, ancak otomatik giriş yapılamadı. Lütfen giriş yapın.'
        };
      }
    } catch (error) {
      console.error('Kayıt hatası:', error);
      
      const errorMessage = error.message || 'Kayıt yapılırken bir hata oluştu';
      setAuthError(errorMessage);
      return { success: false, message: errorMessage };
    }
  };

  const value = {
    currentUser,
    user, // Backward compatibility için
    loading,
    authError,
    login,
    logout,
    register,
    getCurrentUser,
    isAuthenticated
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
} 