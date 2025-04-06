import React, { createContext, useContext, useState, useEffect } from 'react';
import { login as apiLogin, getUserProfile } from '../services/userService';
import { api } from '../services/api';

// Auth Context oluşturma
const AuthContext = createContext();

// Auth Provider bileşeni
export const AuthProvider = ({ children }) => {
  // Kullanıcı durumu state'i
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Token alma ve ayarlama
  const setAuthToken = (token) => {
    if (token) {
      localStorage.setItem('auth_token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      return true;
    } else {
      localStorage.removeItem('auth_token');
      delete api.defaults.headers.common['Authorization'];
      return false;
    }
  };
  
  // Token'dan kullanıcı kimliğini doğrulama ve kullanıcı bilgilerini alma
  const verifyToken = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        console.log('Token bulunamadı, anonim durum');
        setIsAuthenticated(false);
        setUser(null);
        setIsLoading(false);
        return false;
      }
      
      console.log('Token doğrulama başlatılıyor. Token uzunluğu:', token.length);
      
      // Token'i ayarla
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Token doğrulama endpoint'i ile kullanıcı bilgilerini al
      try {
        const userData = await api.get('/auth/validate-token');
        
        if (userData) {
          // Kullanıcı verisi başarıyla alındı
          console.log('Token doğrulandı, kullanıcı verileri alındı:', userData);
          setUser(userData);
          setIsAuthenticated(true);
          setIsLoading(false);
          return true;
        } else {
          throw new Error('Kullanıcı verileri alınamadı');
        }
      } catch (profileError) {
        console.error('Token doğrulanamadı:', profileError);
        
        // 401 Unauthorized hatası - token geçersiz
        if (profileError.response?.status === 401) {
          console.log('401 Unauthorized hatası - token geçersiz. Oturum temizleniyor.');
          // Token ve kullanıcı verilerini temizle
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user');
          delete api.defaults.headers.common['Authorization'];
        }
        
        // 403 Forbidden hatası - yetkisiz erişim
        if (profileError.response?.status === 403) {
          console.log('403 Forbidden hatası - yetkisiz erişim. Oturum temizleniyor.');
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user');
          delete api.defaults.headers.common['Authorization'];
        }
        
        // Oturum temizlendiği için state'i güncelle
        setIsAuthenticated(false);
        setUser(null);
        setIsLoading(false);
        return false;
      }
    } catch (error) {
      console.error('Token doğrulama hatası:', error);
      
      // Tüm hata durumlarında token'i temizle
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      delete api.defaults.headers.common['Authorization'];
      
      setIsAuthenticated(false);
      setUser(null);
      setIsLoading(false);
      return false;
    }
  };
  
  // Sayfa yüklendiğinde token kontrolü
  useEffect(() => {
    const checkToken = async () => {
      await verifyToken();
    };
    
    checkToken();
  }, []);
  
  // Login işlevi
  const login = async (username, password) => {
    try {
      setIsLoading(true);
      console.log("AuthContext - Login işlemi başlatılıyor");
      
      const response = await apiLogin(username, password);
      console.log("Login cevabı:", response);
      
      if (response && response.success) {
        // JWT Token al
        const token = response.token || response.accessToken || response.data?.token || response.data?.accessToken;
        
        // Token kontrolü
        if (!token) {
          console.error("Token alınamadı!");
          throw new Error("Oturum tokenı alınamadı");
        }
        
        // Token'ı sakla
        setAuthToken(token);
        
        // Kullanıcı bilgilerini direkt olarak login response'undan al
        const userData = response.data || response;
        
        // Kullanıcı nesnesini oluştur
        const userObject = {
          id: userData.id || userData.userId,
          email: userData.email || username,
          name: userData.name || userData.username || username.split('@')[0],
          role: userData.role || 'USER',
          token: token
        };
        
        console.log("AuthContext - Kullanıcı giriş yaptı:", userObject);
        
        // Kullanıcı state'ini güncelle
        setUser(userObject);
        setIsAuthenticated(true);
        
        // LocalStorage'a kullanıcı bilgilerini sakla
        localStorage.setItem('user', JSON.stringify(userObject));
        
        return {
          success: true,
          user: userObject
        };
      } else {
        console.error("Login başarısız:", response);
        throw new Error(response.message || "Giriş başarısız");
      }
    } catch (error) {
      console.error("Login hatası:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  // useEffect içinde, sayfa yüklendiğinde localStorage'dan kullanıcı bilgisini oku
  useEffect(() => {
    const loadUserFromStorage = async () => {
      try {
        setIsLoading(true);
        
        // LocalStorage'dan token ve kullanıcı bilgilerini al
        const token = localStorage.getItem('auth_token');
        const userStr = localStorage.getItem('user');
        
        if (token && userStr) {
          // Token varsa API isteklerinde kullan
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          try {
            // Kullanıcı bilgilerini JSON olarak parse et
            const userData = JSON.parse(userStr);
            
            console.log("AuthContext - LocalStorage'dan kullanıcı yüklendi:", userData);
            
            // Kullanıcı state'ini güncelle
            setUser(userData);
            setIsAuthenticated(true);
          } catch (parseError) {
            console.error("LocalStorage'daki kullanıcı bilgisi geçersiz:", parseError);
            setUser(null);
            setIsAuthenticated(false);
            localStorage.removeItem('user');
            localStorage.removeItem('auth_token');
          }
        } else {
          console.log("AuthContext - LocalStorage'da kullanıcı bilgisi bulunamadı");
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error("Kullanıcı bilgilerini yükleme hatası:", error);
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadUserFromStorage();
  }, []);
  
  // Logout işlemi
  const logout = async () => {
    try {
      setIsLoading(true);
      console.log("AuthContext - Çıkış işlemi başlatılıyor");
      
      // Token ve kullanıcı bilgilerini temizle
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      delete api.defaults.headers.common['Authorization'];
      
      // State güncelle
      setUser(null);
      setIsAuthenticated(false);
      
      console.log("AuthContext - Çıkış işlemi tamamlandı");
      return { success: true };
    } catch (error) {
      console.error("Çıkış hatası:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Provider value
  const value = {
    user,
    currentUser: user,
    setUser,
    isAuthenticated,
    isLoading,
    login,
    logout,
    setAuthToken,
    verifyToken
  };
  
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Auth Context hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth hook AuthProvider içinde kullanılmalıdır');
  }
  return context;
}; 