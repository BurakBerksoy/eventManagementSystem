import { api } from './api';

/**
 * Bildirim ile ilgili işlemleri yöneten servis
 */
const notificationService = {
  /**
   * Kullanıcının tüm bildirimlerini getirir
   * @param {object} params - Filtreleme ve sayfalama parametreleri
   * @returns {Promise} - Bildirimler
   */
  getUserNotifications: (params = {}) => {
    return api.get('/notifications', { params })
      .then(response => response.data);
  },
  
  /**
   * Okunmamış bildirimleri getirir
   * @returns {Promise} - Okunmamış bildirimler
   */
  getUnreadNotifications: () => {
    return api.get('/notifications/unread')
      .then(response => response.data);
  },
  
  /**
   * Bildirim okundu olarak işaretler
   * @param {number} id - Bildirim ID
   * @returns {Promise} - İşlem sonucu
   */
  markAsRead: (id) => {
    return api.put(`/notifications/${id}/read`)
      .then(response => response.data);
  },
  
  /**
   * Tüm bildirimleri okundu olarak işaretler
   * @returns {Promise} - İşlem sonucu
   */
  markAllAsRead: () => {
    return api.put('/notifications/read-all')
      .then(response => response.data);
  },
  
  /**
   * Bildirim siler
   * @param {number} id - Bildirim ID
   * @returns {Promise} - İşlem sonucu
   */
  deleteNotification: (id) => {
    return api.delete(`/notifications/${id}`)
      .then(response => response.data);
  },
  
  /**
   * Tüm bildirimleri siler
   * @returns {Promise} - İşlem sonucu
   */
  deleteAllNotifications: () => {
    return api.delete('/notifications')
      .then(response => response.data);
  },
  
  /**
   * Bildirim tercihlerini getirir
   * @returns {Promise} - Bildirim tercihleri
   */
  getNotificationPreferences: () => {
    return api.get('/notifications/preferences')
      .then(response => response.data);
  },
  
  /**
   * Bildirim tercihlerini günceller
   * @param {object} preferences - Güncellenecek tercihler
   * @returns {Promise} - Güncellenen tercihler
   */
  updateNotificationPreferences: (preferences) => {
    return api.put('/notifications/preferences', preferences)
      .then(response => response.data);
  },
  
  /**
   * Okunmamış bildirim sayısını getirir
   * @returns {Promise} - Okunmamış bildirim sayısı
   */
  getUnreadCount: () => {
    return api.get('/notifications/unread/count')
      .then(response => response.data);
  },
  
  /**
   * Belirli bir türde bildirim gönderir
   * @param {object} notificationData - Bildirim verileri
   * @returns {Promise} - Oluşturulan bildirim
   */
  sendNotification: (notificationData) => {
    return api.post('/notifications', notificationData)
      .then(response => response.data);
  },
  
  /**
   * Etkinlik bildirimi göndermek için
   * @param {number} eventId - Etkinlik ID
   * @param {object} notificationData - Bildirim verileri
   * @returns {Promise} - Oluşturulan bildirim
   */
  sendEventNotification: (eventId, notificationData) => {
    return api.post(`/notifications/event/${eventId}`, notificationData)
      .then(response => response.data);
  },
  
  /**
   * Kulüp bildirimi göndermek için
   * @param {number} clubId - Kulüp ID
   * @param {object} notificationData - Bildirim verileri
   * @returns {Promise} - Oluşturulan bildirim
   */
  sendClubNotification: (clubId, notificationData) => {
    return api.post(`/notifications/club/${clubId}`, notificationData)
      .then(response => response.data);
  },

  /**
   * Web push bildirimlerine abone olur
   * @returns {Promise} - Abonelik sonucu
   */
  subscribeWebPush: () => {
    return api.post('/notifications/subscribe-web-push')
      .then(response => response.data);
  },
  
  /**
   * Web push bildirim aboneliğini iptal eder
   * @returns {Promise} - İşlem sonucu
   */
  unsubscribeWebPush: () => {
    return api.delete('/notifications/subscribe-web-push')
      .then(response => response.data);
  }
};

export default notificationService; 