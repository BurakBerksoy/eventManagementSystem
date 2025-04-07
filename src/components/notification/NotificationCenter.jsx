import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import notificationService from '../../services/notificationService';
import { API_URL } from '../../config/config';

const NotificationCenter = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { currentUser } = useAuth();

  /**
   * Bildirimleri getiren fonksiyon
   */
  const fetchNotifications = async () => {
    if (!currentUser) {
      console.log('Kullanıcı giriş yapmamış, bildirimler alınamıyor');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('Bildirimler getiriliyor...');
      console.log('Mevcut kullanıcı:', currentUser?.id, currentUser?.name, currentUser?.role);
      
      // Doğrudan fetch API kullanarak bildirimleri getir
      const token = localStorage.getItem('auth_token');
      if (!token) {
        console.warn('Token bulunamadı, bildirimler alınamıyor');
        setLoading(false);
        return;
      }
      
      const response = await fetch(`${API_URL}/api/notifications`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      // Yanıt kontrolü
      if (response.ok) {
        const responseData = await response.json();
        console.log('Bildirimler yanıtı:', responseData);
        
        // Yanıt boş bir dizi olabilir
        if (Array.isArray(responseData) && responseData.length === 0) {
          console.log('Bildirim bulunamadı, boş dizi');
          setNotifications([]);
          setUnreadCount(0);
          setLoading(false);
          return;
        }
        
        // Bildirimleri işle
        let notificationsData = Array.isArray(responseData) ? responseData : [];
        
        // Bildirimleri işle ve ayarla
        if (notificationsData.length > 0) {
          // Verilerin formatını standartlaştır
          notificationsData = notificationsData.map(notification => {
            // data alanını kontrol et
            let parsedData = notification.data;
            if (typeof notification.data === 'string') {
              try {
                parsedData = JSON.parse(notification.data);
              } catch (e) {
                console.warn('Bildirim data alanı parse edilemedi:', e);
                parsedData = {};
              }
            }
            
            // Standart alanları kontrol et ve eksik alanları doldur
            return {
              ...notification,
              id: notification.id || `local-${Date.now()}-${Math.random()}`,
              read: notification.read || notification.isRead || false,
              createdAt: notification.createdAt || notification.timestamp || new Date().toISOString(),
              data: parsedData,
              type: notification.type || 'INFO'
            };
          });
          
          // Okunmamış bildirim sayısını hesapla
          const unreadCount = notificationsData.filter(n => !n.read && !n.isRead).length;
          setUnreadCount(unreadCount);
          console.log('Okunmamış bildirim sayısı:', unreadCount);
          
          // Bildirimleri sırala (en yeniler önce)
          const sortedNotifications = notificationsData
            .sort((a, b) => {
              const dateA = new Date(a.createdAt || a.timestamp || 0);
              const dateB = new Date(b.createdAt || b.timestamp || 0);
              return dateB - dateA;
            });
          
          setNotifications(sortedNotifications);
        } else {
          console.log('Bildirim bulunamadı, boş dizi ayarlanıyor');
          setNotifications([]);
        }
      } else if (response.status === 401) {
        console.warn('Yetkisiz erişim - oturum süresi dolmuş olabilir');
        setError('Oturum süreniz dolmuş, lütfen tekrar giriş yapın');
      } else {
        console.error(`API hatası: ${response.status}`);
        setError('Bildirimler alınırken bir hata oluştu');
      }
    } catch (error) {
      console.error('Bildirimler alınırken hata:', error);
      setError('Bildirimler yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Okunmamış bildirim sayısını almak için kullanılan fonksiyon
   */
  const fetchUnreadCount = async () => {
    if (!currentUser) {
      console.log('Kullanıcı giriş yapmamış, bildirim sayısı alınamıyor');
      return;
    }
    
    try {
      console.log('Okunmamış bildirim sayısı alınıyor...');
      
      // Bildirim servisini kullanarak okunmamış bildirim sayısını al
      const response = await notificationService.getUnreadCount();
      console.log('Bildirim sayısı yanıtı:', response);
      
      if (response && response.success) {
        setUnreadCount(response.data);
        console.log('Okunmamış bildirim sayısı:', response.data);
      } else {
        console.warn('Bildirim sayısı alınamadı:', response?.message);
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Okunmamış bildirim sayısı alınırken hata:', error);
      setUnreadCount(0);
    }
  };

  // Bildirim sayısını periyodik olarak yenile
  useEffect(() => {
    // İlk yükleme
    if (currentUser) {
      fetchUnreadCount();
      
      // 60 saniyede bir yenile
      const interval = setInterval(() => {
        fetchUnreadCount();
      }, 60000);
      
      return () => clearInterval(interval);
    }
  }, [currentUser]);
  
  // Kullanıcı değiştiğinde bildirimleri yenile
  useEffect(() => {
    if (currentUser) {
      console.log('Kullanıcı değiştiği için bildirimler yenileniyor:', currentUser?.id, currentUser?.role);
      fetchNotifications();
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [currentUser]);

  // Bildirimi okundu olarak işaretle
  const handleMarkAsRead = async (id) => {
    try {
      const response = await notificationService.markAsRead(id);
      
      if (response && response.success) {
        // Bildirimleri güncelle
        setNotifications(
          notifications.map(n => n.id === id ? { ...n, read: true } : n)
        );
        
        // Okunmamış sayısını azalt
        setUnreadCount(prev => Math.max(0, prev - 1));
      } else {
        console.error('Bildirim işaretleme hatası:', response?.message);
      }
    } catch (error) {
      console.error('Bildirim işaretleme hatası:', error);
    }
  };
  
  // Tüm bildirimleri okundu olarak işaretle
  const handleMarkAllAsRead = async () => {
    try {
      const response = await notificationService.markAllAsRead();
      
      if (response && response.success) {
        // Tüm bildirimleri okundu olarak işaretle
        setNotifications(
          notifications.map(n => ({ ...n, read: true }))
        );
        
        // Okunmamış sayısını sıfırla
        setUnreadCount(0);
      } else {
        console.error('Tüm bildirimleri işaretleme hatası:', response?.message);
      }
    } catch (error) {
      console.error('Tüm bildirimleri işaretleme hatası:', error);
    }
  };
  
  return (
    <div>
      {/* Bileşen içeriği */}
      {error && <div className="notification-error">{error}</div>}
      {loading && <div className="notification-loading">Yükleniyor...</div>}
      
      {/* Bildirim sayacı */}
      <div className="notification-badge">
        {unreadCount > 0 ? unreadCount : ''}
      </div>
      
      {/* Bildirim listesi */}
      <div className="notification-list">
        {notifications.length === 0 ? (
          <div className="notification-empty">Bildirim bulunmuyor</div>
        ) : (
          notifications.map(notification => (
            <div 
              key={notification.id} 
              className={`notification-item ${notification.read ? 'read' : 'unread'}`}
              onClick={() => !notification.read && handleMarkAsRead(notification.id)}
            >
              <div className="notification-title">{notification.title}</div>
              <div className="notification-message">{notification.message}</div>
              <div className="notification-date">
                {new Date(notification.createdAt).toLocaleString('tr-TR')}
              </div>
            </div>
          ))
        )}
      </div>
      
      {/* Tümünü okundu olarak işaretle butonu */}
      {notifications.length > 0 && unreadCount > 0 && (
        <button className="mark-all-read" onClick={handleMarkAllAsRead}>
          Tümünü okundu olarak işaretle
        </button>
      )}
    </div>
  );
};

export default NotificationCenter; 