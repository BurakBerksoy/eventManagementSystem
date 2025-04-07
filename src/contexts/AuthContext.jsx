import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { 
  login as loginService, 
  logout as logoutService, 
  getCurrentUser as getUserService, 
  register as registerService 
} from '../services/userService';

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

  // global token expiry event listener ekle
  useEffect(() => {
    // API.js'ten gelen oturum sonlandırma eventini dinle
    const handleLogoutEvent = (event) => {
      console.log('Oturum sonlandırma eventi alındı:', event.detail);
      
      // Sadece oturum açıksa işlem yap
      if (isAuthenticated && currentUser) {
        console.log('Event sonucu oturum sonlandırılıyor');
        
        // State'i güncelle
        setIsAuthenticated(false);
        setCurrentUser(null);
        setLoading(false);
        setAuthError(null);
        
        // Local storage temizliği ve bilgilendirme eventi
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
      }
    };
    
    // Event listener ekle
    window.addEventListener('auth:logout', handleLogoutEvent);
    
    // Cleanup
    return () => {
      window.removeEventListener('auth:logout', handleLogoutEvent);
    };
  }, [isAuthenticated, currentUser]);

  const login = async (email, password) => {
    try {
      console.log(`${email} için giriş denemesi yapılıyor...`);
      const result = await loginService(email, password);
      
      if (result.success) {
        console.log('Login sonucu:', result);
        
        // Token ve kullanıcı bilgilerini kaydet
        setToken(result.token);
        console.log('Token ayarlandı:', result.token.substring(0, 10) + '...');
        
        // Kullanıcı bilgisini API'den al
        console.log('Kullanıcı bilgisi alınıyor...');
        const user = await getUserInfo();
        
        if (user) {
          const userData = user.userData || user;
          setCurrentUser(userData);
          setUser(userData);
          setIsAuthenticated(true);
          
          // LocalStorage'a kaydet
          localStorage.setItem('user', JSON.stringify(userData));
          
          console.log('Login başarılı, kullanıcı bilgileri alındı ve kaydedildi');
          return { success: true };
        } else {
          console.log('Token geçerli ancak kullanıcı bilgileri alınamadı:', user);
          
          // API'den kullanıcı bilgisi alınamadıysa token içinden çıkar
          try {
            const tokenParts = result.token.split('.');
            if (tokenParts.length === 3) {
              // JWT Token'dan kullanıcı bilgilerini çıkar
              const payload = JSON.parse(atob(tokenParts[1]));
              const extractedUser = {
                id: payload.id || payload.sub,
                name: payload.name,
                email: payload.sub,
                role: payload.role
              };
              
              setCurrentUser(extractedUser);
              setUser(extractedUser);
              localStorage.setItem('user', JSON.stringify(extractedUser));
              setIsAuthenticated(true);
              
              console.log('Kullanıcı bilgileri token payload\'ından çıkarıldı:', extractedUser);
              return { success: true };
            }
          } catch (parseError) {
            console.error('Token parse hatası:', parseError);
          }
          
          // Token payload'ından da bilgi alınamadıysa hata döndür
          return { success: false, error: 'Kullanıcı bilgileri doğrulanamadı' };
        }
      } else {
        console.error('Login hatası:', result.error);
        setIsAuthenticated(false);
        setCurrentUser(null);
        setUser(null);
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Login hatası:', error);
      setIsAuthenticated(false);
      setCurrentUser(null);
      setUser(null);
      return { success: false, error: 'Giriş yapılırken bir hata oluştu' };
    }
  };

  const logout = () => {
    try {
      console.log('Çıkış yapılıyor...');
      
      // Tüm oturum verilerini sil
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      localStorage.removeItem('userData');
      
      // API header'larındaki token'ı temizle
      delete axios.defaults.headers.common['Authorization'];
      
      // State'i sıfırla
      setCurrentUser(null);
      setIsAuthenticated(false);
      setLoading(false);
      setAuthError(null);
      
      console.log('Çıkış başarılı, tüm oturum verileri temizlendi');
      
      // Başarılı mesajı döndür
      return { success: true, message: 'Başarıyla çıkış yapıldı' };
    } catch (error) {
      console.error('Çıkış yaparken hata:', error);
      return { success: false, message: 'Çıkış yaparken bir hata oluştu' };
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
      
      // API yanıtını kontrol et
      if (!result.success) {
        console.error('Kullanıcı bilgisi alınamadı:', result.error);
        
        // Oturum bilgilerini temizle
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        delete axios.defaults.headers.common['Authorization'];
        setCurrentUser(null);
        setUser(null);
        setIsAuthenticated(false);
        
        return null;
      }
      
      // Kullanıcı bilgilerini al
      const userData = result.data;
      if (!userData) {
        console.error('API yanıtı userData içermiyor');
        
        // Oturum bilgilerini temizle
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
      
      // Hata durumunda oturum bilgilerini temizle
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

  // Token ayarlama yardımcı fonksiyonu
  const setToken = (token) => {
    if (!token) return;
    
    // Token'ı localStorage'a kaydet
    localStorage.setItem('auth_token', token);
    
    // Axios headers'a ekle
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  };

  // Kullanıcı bilgilerini getirme yardımcı fonksiyonu
  const getUserInfo = async () => {
    try {
      // API'den kullanıcı bilgisini al
      const userData = await getCurrentUser();
      return userData;
    } catch (error) {
      console.error('getUserInfo hatası:', error);
      return null;
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