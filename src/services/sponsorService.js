import { api } from './api';

/**
 * Sponsor ile ilgili işlemleri yöneten servis
 */
const sponsorService = {
  /**
   * Tüm sponsorları getirir
   * @param {object} params - Sayfalama ve filtreleme parametreleri
   * @returns {Promise} - Sponsorlar
   */
  getAllSponsors: (params = {}) => {
    return api.get('/sponsors', { params })
      .then(response => response.data);
  },
  
  /**
   * ID'ye göre sponsor getirir
   * @param {number} id - Sponsor ID
   * @returns {Promise} - Sponsor bilgileri
   */
  getSponsorById: (id) => {
    return api.get(`/sponsors/${id}`)
      .then(response => response.data);
  },
  
  /**
   * İsme göre sponsorları arar
   * @param {string} name - Sponsor adı
   * @returns {Promise} - Sponsorlar
   */
  getSponsorsByName: (name) => {
    return api.get(`/sponsors/name/${name}`)
      .then(response => response.data);
  },
  
  /**
   * Sponsor türüne göre sponsorları filtreler
   * @param {string} type - Sponsor türü
   * @returns {Promise} - Sponsorlar
   */
  getSponsorsByType: (type) => {
    return api.get(`/sponsors/type/${type}`)
      .then(response => response.data);
  },
  
  /**
   * Sponsor seviyesine göre sponsorları filtreler
   * @param {string} level - Sponsor seviyesi
   * @returns {Promise} - Sponsorlar
   */
  getSponsorsByLevel: (level) => {
    return api.get(`/sponsors/level/${level}`)
      .then(response => response.data);
  },
  
  /**
   * Kulübe göre sponsorları getirir
   * @param {number} clubId - Kulüp ID
   * @returns {Promise} - Sponsorlar
   */
  getSponsorsByClub: (clubId) => {
    return api.get(`/sponsors/club/${clubId}`)
      .then(response => response.data);
  },
  
  /**
   * Yeni sponsor oluşturur
   * @param {object} sponsorData - Sponsor bilgileri
   * @returns {Promise} - Oluşturulan sponsor
   */
  createSponsor: (sponsorData) => {
    return api.post('/sponsors', sponsorData)
      .then(response => response.data);
  },
  
  /**
   * Sponsor bilgilerini günceller
   * @param {number} id - Sponsor ID
   * @param {object} sponsorData - Güncellenecek sponsor bilgileri
   * @returns {Promise} - Güncellenen sponsor
   */
  updateSponsor: (id, sponsorData) => {
    return api.put(`/sponsors/${id}`, sponsorData)
      .then(response => response.data);
  },
  
  /**
   * Sponsor siler
   * @param {number} id - Sponsor ID
   * @returns {Promise} - İşlem sonucu
   */
  deleteSponsor: (id) => {
    return api.delete(`/sponsors/${id}`)
      .then(response => response.data);
  },
  
  /**
   * Sponsoru kulübe ekler
   * @param {number} sponsorId - Sponsor ID
   * @param {number} clubId - Kulüp ID
   * @returns {Promise} - İşlem sonucu
   */
  addSponsorToClub: (sponsorId, clubId) => {
    return api.post(`/sponsors/${sponsorId}/clubs/${clubId}`)
      .then(response => response.data);
  },
  
  /**
   * Sponsoru kulüpten kaldırır
   * @param {number} sponsorId - Sponsor ID
   * @param {number} clubId - Kulüp ID
   * @returns {Promise} - İşlem sonucu
   */
  removeSponsorFromClub: (sponsorId, clubId) => {
    return api.delete(`/sponsors/${sponsorId}/clubs/${clubId}`)
      .then(response => response.data);
  },
  
  /**
   * Sponsoru etkinliğe ekler
   * @param {number} sponsorId - Sponsor ID
   * @param {number} eventId - Etkinlik ID
   * @returns {Promise} - İşlem sonucu
   */
  addSponsorToEvent: (sponsorId, eventId) => {
    return api.post(`/sponsors/${sponsorId}/events/${eventId}`)
      .then(response => response.data);
  },
  
  /**
   * Sponsoru etkinlikten kaldırır
   * @param {number} sponsorId - Sponsor ID
   * @param {number} eventId - Etkinlik ID
   * @returns {Promise} - İşlem sonucu
   */
  removeSponsorFromEvent: (sponsorId, eventId) => {
    return api.delete(`/sponsors/${sponsorId}/events/${eventId}`)
      .then(response => response.data);
  }
};

export default sponsorService; 