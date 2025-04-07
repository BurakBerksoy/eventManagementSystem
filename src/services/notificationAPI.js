import axios from 'axios';
import { API_URL, STORAGE_KEYS } from '../config/config';

/**
 * HTML yanıtı veya JSON olmayan içerikleri güvenli şekilde ayrıştıran yardımcı fonksiyon
 * @param {string} responseText - API yanıtı metni
 * @returns {Object|Array|null} - Ayrıştırılmış JSON verisi veya null
 */
const safeParseJSON = (responseText) => {
  if (!responseText || typeof responseText !== 'string') {
    return null;
  }
  
  // HTML yanıtlarını kontrol et
  if (responseText.trim().startsWith('<!DOCTYPE html>') || 
      responseText.trim().startsWith('<html')) {
    console.warn('HTML yanıtı alındı, JSON olarak ayrıştırılamaz');
    return null;
  }
  
  try {
    return JSON.parse(responseText);
  } catch (error) {
    console.error('JSON ayrıştırma hatası:', error);
    return null;
  }
};

/**
 * Bildirimlerle ilgili API isteklerini sağlayan servis
 */
const notificationAPI = {
  /**
   * Tüm bildirimleri getir
   * @returns {Promise<Array>} - Bildirim listesi 
   */
  getNotifications: async () => {
    console.log('getNotifications API çağrılıyor');
    try {
      // Token kontrolü yap
      const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
      if (!token) {
        console.warn('Token bulunamadı, localStorage bildirimlerine dönülüyor');
        
        try {
          // Token yoksa localStorage'dan bildirimleri getir
          const localNotifications = JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS) || '[]');
          console.log(`LocalStorage'dan ${localNotifications.length} bildirim alındı`);
          
          // LocalStorage'dan alınan bildirimlerle başarılı yanıt dön
          return { success: true, data: localNotifications };
        } catch (e) {
          console.error('LocalStorage bildirim okuma hatası:', e);
          return { success: false, data: [] };
        }
      }
      
      // API isteği yap
      const response = await fetch(`${API_URL}/api/notifications`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('API yanıtı:', response.status);
      
      // Başarılı yanıt kontrolü
      if (response.ok) {
        const responseText = await response.text();
        
        // Boş yanıt kontrolü
        if (!responseText || responseText.trim() === '') {
          console.warn('API boş yanıt döndü, boş dizi olarak işleniyor');
          return { success: true, data: [] };
        }
        
        // HTML yanıt kontrolü
        if (responseText.trim().startsWith('<!DOCTYPE html>') || 
            responseText.trim().startsWith('<html')) {
          console.warn('HTML yanıtı alındı, localStorage bildirimleri kullanılıyor');
          
          try {
            // HTML yanıtı alınırsa localStorage'a bak
            const localNotifications = JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS) || '[]');
            return { success: true, data: localNotifications };
          } catch (e) {
            console.error('LocalStorage bildirim okuma hatası:', e);
            return { success: false, data: [] };
          }
        }
        
        // JSON parse işlemi
        try {
          const data = JSON.parse(responseText);
          console.log('API yanıtı başarıyla ayrıştırıldı');
          
          // Yanıt yapısı kontrolü
          if (Array.isArray(data)) {
            // Doğrudan dizi
            console.log(`API ${data.length} bildirim döndürdü (dizi olarak)`);
            return { success: true, data: data };
          } else if (data && typeof data === 'object') {
            // JSON obje yanıtı
            
            // data.data şeklinde mi?
            if (data.data && Array.isArray(data.data)) {
              console.log(`API ${data.data.length} bildirim döndürdü (data.data olarak)`);
              return { success: true, data: data.data };
            }
            
            // data.notifications şeklinde mi?
            if (data.notifications && Array.isArray(data.notifications)) {
              console.log(`API ${data.notifications.length} bildirim döndürdü (data.notifications olarak)`);
              return { success: true, data: data.notifications };
            }
            
            // data.content şeklinde mi?
            if (data.content && Array.isArray(data.content)) {
              console.log(`API ${data.content.length} bildirim döndürdü (data.content olarak)`);
              return { success: true, data: data.content };
            }
            
            // Doğrudan objenin kendisi
            console.log(`API yanıtı obje olarak alındı, bildirim dizisi bulunamadı`);
            return { success: true, data: data };
          }
          
          // Hiçbir formata uymuyorsa
          console.warn('API yanıtı tanımlanamayan formatta, boş dizi döndürülüyor');
          return { success: true, data: [] };
        } catch (parseError) {
          console.error('JSON parse hatası:', parseError);
          
          // Alternatif olarak düz metin yanıtını dizi olarak yorumla
          if (responseText.includes(',') && !responseText.includes('<')) {
            try {
              // Virgülle ayrılmış metin olabilir
              const textItems = responseText.split(',').map(item => ({ 
                id: `auto-${Date.now()}-${Math.random()}`,
                message: item.trim(),
                createdAt: new Date().toISOString()
              }));
              console.log('Metin yanıtı bildirimlere dönüştürüldü:', textItems.length);
              return { success: true, data: textItems };
            } catch (e) {
              console.error('Alternatif metin parse hatası:', e);
            }
          }
          
          return { success: false, data: [] };
        }
      } else if (response.status === 204) {
        // No Content yanıtı
        console.log('API 204 No Content döndü, boş dizi olarak yorumlanıyor');
        return { success: true, data: [] };
      } else if (response.status === 401 || response.status === 403) {
        console.warn('Yetkilendirme hatası, localStorage bildirimlerine dönülüyor');
        
        try {
          const localNotifications = JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS) || '[]');
          return { success: true, data: localNotifications };
        } catch (e) {
          console.error('LocalStorage bildirim okuma hatası:', e);
          return { success: false, data: [] };
        }
      } else {
        console.error('API hatası:', response.status);
        return { success: false, data: [] };
      }
    } catch (error) {
      console.error('Bildirimler alınırken hata:', error);
      
      // Hata durumunda localStorage'a bak
      try {
        const localNotifications = JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS) || '[]');
        return { success: true, data: localNotifications };
      } catch (e) {
        console.error('LocalStorage bildirim okuma hatası:', e);
        return { success: false, data: [] };
      }
    }
  },
  
  /**
   * Okunmamış bildirim sayısını getir
   * @returns {Promise<Object>} - Bildirim sayısı
   */
  getUnreadCount: async () => {
    console.log('getUnreadCount API çağrılıyor');
    try {
      // Token kontrolü yap
      const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
      if (!token) {
        console.warn('Token bulunamadı, localStorage bildirimlerine dönülüyor');
        return { success: false, count: 0 };
      }
      
      // API isteği yap
      const response = await fetch(`${API_URL}/api/notifications/unread/count`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('API yanıtı:', response.status);
      
      // Başarılı yanıt kontrolü
      if (response.ok) {
        const responseText = await response.text();
        const data = safeParseJSON(responseText);
        
        if (data) {
          console.log('Okunmamış bildirim sayısı başarıyla alındı');
          return { success: true, count: data };
        } else {
          console.warn('API yanıtı ayrıştırılamadı');
          return { success: false, count: 0 };
        }
      } else if (response.status === 401 || response.status === 403) {
        console.warn('Yetkilendirme hatası, localStorage bildirimlerine dönülüyor');
        return { success: false, count: 0 };
      } else {
        console.error('API hatası:', response.status);
        return { success: false, count: 0 };
      }
    } catch (error) {
      console.error('Okunmamış bildirim sayısı alınırken hata:', error);
      return { success: false, count: 0 };
    }
  },
  
  /**
   * Bildirimi okundu olarak işaretle
   * @param {string|number} notificationId - Bildirim ID
   * @returns {Promise<Object>} - İşlem sonucu
   */
  markAsRead: async (notificationId) => {
    console.log('markAsRead API çağrılıyor:', notificationId);
    
    try {
      // Token kontrolü yap
      const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
      if (!token) {
        console.warn('Token bulunamadı, localStorage bildirimi güncelleniyor');
        
        // LocalStorage'dan bildirimleri al ve güncelle
        try {
          const notifications = JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS) || '[]');
          const updatedNotifications = notifications.map(n => {
            if (n.id == notificationId || n.notificationId == notificationId) {
              return { ...n, read: true };
            }
            return n;
          });
          
          localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(updatedNotifications));
          console.log('localStorage bildirimi başarıyla güncellendi');
          return { success: true };
        } catch (err) {
          console.error('localStorage bildirimi güncellenirken hata:', err);
          return { success: false };
        }
      }
      
      // API isteği yap
      const response = await fetch(`${API_URL}/api/notifications/${notificationId}/markAsRead`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('API yanıtı:', response.status);
      
      // Başarılı yanıt kontrolü
      if (response.ok) {
        console.log('Bildirim başarıyla okundu olarak işaretlendi');
        
        // Aynı zamanda localStorage'daki bildirim verisini de güncelle
        try {
          const notifications = JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS) || '[]');
          const updatedNotifications = notifications.map(n => {
            if (n.id == notificationId || n.notificationId == notificationId) {
              return { ...n, read: true };
            }
            return n;
          });
          
          localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(updatedNotifications));
        } catch (err) {
          console.error('localStorage bildirimi güncellenirken hata:', err);
        }
        
        return { success: true };
      } else if (response.status === 401 || response.status === 403) {
        console.warn('Yetkilendirme hatası, localStorage bildirimi güncelleniyor');
        
        // LocalStorage'dan bildirimleri al ve güncelle
        try {
          const notifications = JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS) || '[]');
          const updatedNotifications = notifications.map(n => {
            if (n.id == notificationId || n.notificationId == notificationId) {
              return { ...n, read: true };
            }
            return n;
          });
          
          localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(updatedNotifications));
          console.log('localStorage bildirimi başarıyla güncellendi');
          return { success: true };
        } catch (err) {
          console.error('localStorage bildirimi güncellenirken hata:', err);
          return { success: false };
        }
      } else {
        console.error('API hatası:', response.status);
        return { success: false };
      }
    } catch (error) {
      console.error('Bildirim okundu olarak işaretlenirken hata:', error);
      return { success: false };
    }
  },
  
  /**
   * Yeni bildirim oluştur
   * @param {Object} notificationData - Bildirim verisi
   * @returns {Promise<Object>} - İşlem sonucu
   */
  createNotification: async (notificationData) => {
    console.log('createNotification API çağrılıyor:', notificationData);
    
    if (!notificationData) {
      console.error('Bildirim verisi bulunamadı');
      return { success: false };
    }
    
    try {
      // Token kontrolü yap
      const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
      
      let response;
      
      // Token varsa API isteği yap
      if (token) {
        console.log('Token ile bildirim gönderiliyor');
        response = await fetch(`${API_URL}/api/notifications`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(notificationData)
        });
      } else {
        // Token yoksa anonim olarak göndermeyi dene
        console.log('Anonim olarak bildirim gönderiliyor');
        response = await fetch(`${API_URL}/api/notifications/anonymous`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(notificationData)
        });
      }
      
      console.log('API yanıtı:', response.status);
      
      // API yanıtını kontrol et
      if (response.ok) {
        console.log('Bildirim başarıyla oluşturuldu');
        
        // LocalStorage'a da ekle
        try {
          // Bildirime ID ve tarih ekle
          const notificationWithId = {
            ...notificationData,
            id: notificationData.id || `local-${Date.now()}`,
            createdAt: notificationData.createdAt || new Date().toISOString(),
            read: false
          };
          
          const notifications = JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS) || '[]');
          notifications.push(notificationWithId);
          
          localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
          console.log('Bildirim localStorage\'a eklendi');
        } catch (err) {
          console.error('Bildirim localStorage\'a eklenirken hata:', err);
        }
        
        return { success: true };
      } else {
        console.warn('API hatası, bildirim localStorage\'a ekleniyor');
        
        // API başarısız olursa localStorage'a ekle
        try {
          // Bildirime ID ve tarih ekle
          const notificationWithId = {
            ...notificationData,
            id: notificationData.id || `local-${Date.now()}`,
            createdAt: notificationData.createdAt || new Date().toISOString(),
            read: false
          };
          
          const notifications = JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS) || '[]');
          notifications.push(notificationWithId);
          
          localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
          console.log('Bildirim localStorage\'a eklendi');
          
          return { success: true };
        } catch (err) {
          console.error('Bildirim localStorage\'a eklenirken hata:', err);
          return { success: false };
        }
      }
    } catch (error) {
      console.error('Bildirim oluşturulurken hata:', error);
      
      // Hata durumunda localStorage'a eklemeyi dene
      try {
        // Bildirime ID ve tarih ekle
        const notificationWithId = {
          ...notificationData,
          id: notificationData.id || `local-${Date.now()}`,
          createdAt: notificationData.createdAt || new Date().toISOString(),
          read: false
        };
        
        const notifications = JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS) || '[]');
        notifications.push(notificationWithId);
        
        localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
        console.log('Bildirim localStorage\'a eklendi');
        
        return { success: true };
      } catch (err) {
        console.error('Bildirim localStorage\'a eklenirken hata:', err);
        return { success: false };
      }
    }
  }
};

export default notificationAPI; 