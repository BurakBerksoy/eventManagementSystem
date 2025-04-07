import { API_URL } from '../config/config';

/**
 * Bildirim API'si ile iletişim kuran servis
 */
const notificationService = {
  /**
   * Kullanıcı bildirimlerini getirir
   */
  getNotifications: async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        console.warn('Token bulunamadı, bildirimler alınamıyor');
        return { success: false, data: [], message: 'Oturum açmanız gerekiyor' };
      }
      
      const response = await fetch(`${API_URL}/api/notifications`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const responseData = await response.json();
        console.log('Bildirimler başarıyla alındı:', responseData);
        
        return {
          success: true,
          data: responseData || [],
          message: 'Bildirimler başarıyla alındı'
        };
      } else if (response.status === 401) {
        console.warn('Yetkisiz erişim - oturum süresi dolmuş olabilir');
        return { success: false, data: [], message: 'Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.' };
      } else {
        console.error(`API hatası: ${response.status}`);
        return { success: false, data: [], message: 'Bildirimler alınırken bir hata oluştu' };
      }
    } catch (error) {
      console.error('Bildirimler alınamadı:', error);
      return { success: false, data: [], message: 'Bildirimler alınırken bir hata oluştu' };
    }
  },
  
  /**
   * Okunmamış bildirim sayısını getirir
   */
  getUnreadCount: async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        console.warn('Token bulunamadı, bildirim sayısı alınamıyor');
        return { success: false, data: 0, message: 'Oturum açmanız gerekiyor' };
      }
      
      const response = await fetch(`${API_URL}/api/notifications/unread-count`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const responseData = await response.json();
        console.log('Okunmamış bildirim sayısı alındı:', responseData);
        
        let count = 0;
        if (responseData && responseData.data !== undefined) {
          count = responseData.data;
        } else if (responseData && typeof responseData === 'number') {
          count = responseData;
        }
        
        return {
          success: true,
          data: count,
          message: 'Okunmamış bildirim sayısı alındı'
        };
      } else if (response.status === 401) {
        console.warn('Yetkisiz erişim - oturum süresi dolmuş olabilir');
        return { success: false, data: 0, message: 'Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.' };
      } else {
        console.error(`API hatası: ${response.status}`);
        return { success: false, data: 0, message: 'Bildirim sayısı alınırken bir hata oluştu' };
      }
    } catch (error) {
      console.error('Bildirim sayısı alınamadı:', error);
      return { success: false, data: 0, message: 'Bildirim sayısı alınırken bir hata oluştu' };
    }
  },
  
  /**
   * Bildirimi okundu olarak işaretler
   */
  markAsRead: async (notificationId) => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        console.warn('Token bulunamadı, bildirim işaretlenemiyor');
        return { success: false, message: 'Oturum açmanız gerekiyor' };
      }
      
      const response = await fetch(`${API_URL}/api/notifications/${notificationId}/mark-as-read`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        console.log('Bildirim okundu olarak işaretlendi');
        return { success: true, message: 'Bildirim okundu olarak işaretlendi' };
      } else if (response.status === 401) {
        console.warn('Yetkisiz erişim - oturum süresi dolmuş olabilir');
        return { success: false, message: 'Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.' };
      } else {
        console.error(`API hatası: ${response.status}`);
        return { success: false, message: 'Bildirim işaretlenirken bir hata oluştu' };
      }
    } catch (error) {
      console.error('Bildirim okundu olarak işaretlenemedi:', error);
      return { success: false, message: 'Bildirim işaretlenirken bir hata oluştu' };
    }
  },
  
  /**
   * Tüm bildirimleri okundu olarak işaretler
   */
  markAllAsRead: async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        console.warn('Token bulunamadı, bildirimler işaretlenemiyor');
        return { success: false, message: 'Oturum açmanız gerekiyor' };
      }
      
      const response = await fetch(`${API_URL}/api/notifications/mark-all-as-read`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        console.log('Tüm bildirimler okundu olarak işaretlendi');
        return { success: true, message: 'Tüm bildirimler okundu olarak işaretlendi' };
      } else if (response.status === 401) {
        console.warn('Yetkisiz erişim - oturum süresi dolmuş olabilir');
        return { success: false, message: 'Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.' };
      } else {
        console.error(`API hatası: ${response.status}`);
        return { success: false, message: 'Bildirimler işaretlenirken bir hata oluştu' };
      }
    } catch (error) {
      console.error('Bildirimler okundu olarak işaretlenemedi:', error);
      return { success: false, message: 'Bildirimler işaretlenirken bir hata oluştu' };
    }
  }
};

export default notificationService;
