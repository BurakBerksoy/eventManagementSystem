import { api } from './api';

/**
 * Bekleme listesi ile ilgili işlemleri yöneten servis
 */
const waitingListService = {
  /**
   * Bir etkinliğin bekleme listesini getirir
   * @param {number} eventId - Etkinlik ID
   * @returns {Promise} - Bekleme listesi
   */
  getWaitingListByEvent: (eventId) => {
    return api.event.getWaitingList(eventId)
      .then(response => response.data);
  },
  
  /**
   * Bekleme listesindeki kullanıcıları getirir
   * @param {number} eventId - Etkinlik ID
   * @returns {Promise} - Kullanıcı listesi
   */
  getUsersInWaitingList: (eventId) => {
    return api.event.getWaitingList(eventId)
      .then(response => response.data);
  },
  
  /**
   * Kullanıcıyı bekleme listesine ekler
   * @param {number} eventId - Etkinlik ID
   * @param {number} userId - Kullanıcı ID
   * @param {string} note - İsteğe bağlı not
   * @returns {Promise} - Bekleme listesi kaydı
   */
  addUserToWaitingList: (eventId, userId, note = '') => {
    return api.event.addToWaitingList(eventId, { userId, note })
      .then(response => response.data);
  },
  
  /**
   * Kullanıcıyı bekleme listesinden çıkarır
   * @param {number} eventId - Etkinlik ID
   * @param {number} userId - Kullanıcı ID
   * @returns {Promise} - İşlem sonucu
   */
  removeUserFromWaitingList: (eventId, userId) => {
    return api.event.removeFromWaitingList(eventId, { userId })
      .then(response => response.data);
  },
  
  /**
   * Bekleme listesinin sırasını değiştirir
   * @param {number} eventId - Etkinlik ID
   * @param {Array} waitingList - Yeni sıralama ile bekleme listesi
   * @returns {Promise} - Güncellenen bekleme listesi
   */
  reorderWaitingList: (eventId, waitingList) => {
    return api.event.reorderWaitingList(eventId, waitingList)
      .then(response => response.data);
  },
  
  /**
   * Kullanıcının bütün bekleme listelerini getirir
   * @param {number} userId - Kullanıcı ID
   * @returns {Promise} - Kullanıcının bekleme listeleri
   */
  getUserWaitingLists: (userId) => {
    return api.event.getUserWaitingLists(userId)
      .then(response => response.data)
      .catch(error => {
        // 404 hatası kullanıcının hiç bekleme listesi olmadığını gösterir
        if (error.response && error.response.status === 404) {
          return [];
        }
        throw error;
      });
  },
  
  /**
   * Kullanıcının bekleme listesi durumunu kontrol eder
   * @param {number} eventId - Etkinlik ID
   * @param {number} userId - Kullanıcı ID
   * @returns {Promise} - Bekleme listesi durumu
   */
  checkUserWaitingStatus: (eventId, userId) => {
    return api.event.checkUserWaitingStatus(eventId, userId)
      .then(response => response.data);
  },
  
  /**
   * Bekleme listesinden katılımcıya yükseltir
   * @param {number} eventId - Etkinlik ID
   * @param {number} userId - Kullanıcı ID
   * @returns {Promise} - İşlem sonucu
   */
  promoteToParticipant: (eventId, userId) => {
    return api.event.promoteToParticipant(eventId, userId)
      .then(response => response.data);
  },
  
  /**
   * Otomatik olarak bekleme listesindeki kullanıcıları katılımcıya yükseltir
   * @param {number} eventId - Etkinlik ID
   * @param {number} limit - Maksimum yükseltilecek kişi sayısı
   * @returns {Promise} - Yükseltilen kişi sayısı
   */
  autoPromoteFromWaitingList: (eventId, limit = 0) => {
    return api.event.autoPromoteFromWaitingList(eventId, limit)
      .then(response => response.data);
  },
  
  /**
   * Etkinlik detaylarını getirir
   * @param {number} eventId - Etkinlik ID
   * @returns {Promise} - Etkinlik detayları
   */
  getEventDetails: (eventId) => {
    return api.event.getEventById(eventId)
      .then(response => response.data);
  },
  
  /**
   * Kullanıcıyı bekleme listesinden onaylayarak etkinliğe ekler
   * @param {number} eventId - Etkinlik ID
   * @param {number} userId - Kullanıcı ID
   * @returns {Promise} - İşlem sonucu
   */
  approveUserFromWaitingList: (eventId, userId) => {
    return api.event.approveUserFromWaitingList(eventId, userId)
      .then(response => response.data);
  }
};

export const {
  getWaitingListByEvent,
  getUsersInWaitingList,
  addUserToWaitingList,
  removeUserFromWaitingList,
  reorderWaitingList,
  getUserWaitingLists,
  getEventDetails,
  approveUserFromWaitingList
} = waitingListService;

export default waitingListService; 