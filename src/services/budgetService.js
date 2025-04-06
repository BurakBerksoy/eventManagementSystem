import { api } from './api';

/**
 * Bütçe ile ilgili işlemleri yöneten servis
 */
const budgetService = {
  /**
   * Tüm bütçeleri getirir
   * @returns {Promise} - Bütçeler
   */
  getAllBudgets: () => {
    return api.get('/budgets')
      .then(response => response.data);
  },
  
  /**
   * ID'ye göre bütçe getirir
   * @param {number} id - Bütçe ID
   * @returns {Promise} - Bütçe bilgileri
   */
  getBudgetById: (id) => {
    return api.get(`/budgets/${id}`)
      .then(response => response.data);
  },
  
  /**
   * Kulübe göre bütçe getirir
   * @param {number} clubId - Kulüp ID
   * @returns {Promise} - Bütçe bilgileri
   */
  getBudgetByClub: (clubId) => {
    return api.get(`/budgets/club/${clubId}`)
      .then(response => response.data);
  },
  
  /**
   * Etkinliğe göre bütçe getirir
   * @param {number} eventId - Etkinlik ID
   * @returns {Promise} - Bütçe bilgileri
   */
  getBudgetByEvent: (eventId) => {
    return api.get(`/budgets/event/${eventId}`)
      .then(response => response.data);
  },
  
  /**
   * Yeni bütçe oluşturur
   * @param {object} budgetData - Bütçe bilgileri
   * @returns {Promise} - Oluşturulan bütçe
   */
  createBudget: (budgetData) => {
    return api.post('/budgets', budgetData)
      .then(response => response.data);
  },
  
  /**
   * Bütçe bilgilerini günceller
   * @param {number} id - Bütçe ID
   * @param {object} budgetData - Güncellenecek bütçe bilgileri
   * @returns {Promise} - Güncellenen bütçe
   */
  updateBudget: (id, budgetData) => {
    return api.put(`/budgets/${id}`, budgetData)
      .then(response => response.data);
  },
  
  /**
   * Bütçe siler
   * @param {number} id - Bütçe ID
   * @returns {Promise} - İşlem sonucu
   */
  deleteBudget: (id) => {
    return api.delete(`/budgets/${id}`)
      .then(response => response.data);
  },
  
  /**
   * Kulüp bütçesine işlem ekler
   * @param {number} clubId - Kulüp ID
   * @param {object} transactionData - İşlem bilgileri
   * @returns {Promise} - Oluşturulan işlem
   */
  addTransaction: (clubId, transactionData) => {
    return api.post(`/clubs/${clubId}/transactions`, transactionData)
      .then(response => response.data);
  },
  
  /**
   * Kulüp bütçesi işlemlerini getirir
   * @param {number} clubId - Kulüp ID
   * @param {object} params - Filtreleme parametreleri
   * @returns {Promise} - İşlemler
   */
  getTransactions: (clubId, params = {}) => {
    return api.get(`/clubs/${clubId}/transactions`, { params })
      .then(response => response.data);
  },
  
  /**
   * Bütçe işlemini günceller
   * @param {number} clubId - Kulüp ID
   * @param {number} transactionId - İşlem ID
   * @param {object} transactionData - Güncellenecek işlem bilgileri
   * @returns {Promise} - Güncellenen işlem
   */
  updateTransaction: (clubId, transactionId, transactionData) => {
    return api.put(`/clubs/${clubId}/transactions/${transactionId}`, transactionData)
      .then(response => response.data);
  },
  
  /**
   * Bütçe işlemini siler
   * @param {number} clubId - Kulüp ID
   * @param {number} transactionId - İşlem ID
   * @returns {Promise} - İşlem sonucu
   */
  deleteTransaction: (clubId, transactionId) => {
    return api.delete(`/clubs/${clubId}/transactions/${transactionId}`)
      .then(response => response.data);
  },
  
  /**
   * Kulüp bütçesi özeti getirir
   * @param {number} clubId - Kulüp ID
   * @returns {Promise} - Bütçe özeti
   */
  getBudgetSummary: (clubId) => {
    return api.get(`/clubs/${clubId}/budget/summary`)
      .then(response => response.data);
  },
  
  /**
   * Kulüp bütçesi raporunu getirir
   * @param {number} clubId - Kulüp ID
   * @param {string} startDate - Başlangıç tarihi
   * @param {string} endDate - Bitiş tarihi
   * @returns {Promise} - Bütçe raporu
   */
  getBudgetReport: (clubId, startDate, endDate) => {
    return api.get(`/clubs/${clubId}/budget/report`, { 
      params: { startDate, endDate } 
    }).then(response => response.data);
  },
  
  /**
   * Kulüp bakiyesini getir (Finance bileşeni için)
   * @param {number} clubId - Kulüp ID
   * @returns {Promise} - Bakiye bilgisi
   */
  getClubBalance: (clubId) => {
    return api.get(`/clubs/${clubId}/balance`)
      .then(response => { return response; });
  },
  
  /**
   * Kulüp işlemlerini getir (Finance bileşeni için)
   * @param {number} clubId - Kulüp ID
   * @returns {Promise} - İşlemler listesi
   */
  getClubTransactions: (clubId) => {
    return api.get(`/clubs/${clubId}/transactions`)
      .then(response => { return response; });
  },
  
  /**
   * İşlem oluştur (para yatırma/çekme) (Finance bileşeni için)
   * @param {object} transactionData - İşlem bilgileri
   * @returns {Promise} - Oluşturulan işlem
   */
  createTransaction: (transactionData) => {
    return api.post(`/clubs/${transactionData.clubId}/transactions`, transactionData)
      .then(response => response.data);
  },
  
  /**
   * Kulübe ait bütçeleri getir (BudgetTab bileşeni için)
   * @param {number} clubId - Kulüp ID
   * @returns {Promise} - Bütçe listesi
   */
  getClubBudgets: (clubId) => {
    return api.get(`/clubs/${clubId}/budgets`)
      .then(response => { return response; });
  },
};

export default budgetService; 