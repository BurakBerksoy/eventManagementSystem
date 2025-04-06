import { api } from './api';

/**
 * Sertifika ile ilgili işlemleri yöneten servis
 */
const certificateService = {
  /**
   * Kullanıcının tüm sertifikalarını getirir
   * @param {number} userId - Kullanıcı ID
   * @returns {Promise} - Sertifikalar
   */
  getUserCertificates: (userId = 'me') => {
    return api.get(`/certificates/user/${userId}`)
      .then(response => response.data);
  },
  
  /**
   * Etkinliğe göre sertifikaları getirir
   * @param {number} eventId - Etkinlik ID
   * @returns {Promise} - Sertifikalar
   */
  getEventCertificates: (eventId) => {
    return api.get(`/certificates/event/${eventId}`)
      .then(response => response.data);
  },
  
  /**
   * Sertifika koduna göre sertifika getirir (doğrulama için)
   * @param {string} code - Sertifika kodu
   * @returns {Promise} - Sertifika bilgileri
   */
  verifyCertificate: (code) => {
    return api.get(`/certificates/verify/${code}`)
      .then(response => response.data);
  },
  
  /**
   * ID'ye göre sertifika getirir
   * @param {number} id - Sertifika ID
   * @returns {Promise} - Sertifika bilgileri
   */
  getCertificateById: (id) => {
    return api.get(`/certificates/${id}`)
      .then(response => response.data);
  },
  
  /**
   * Sertifika oluşturur
   * @param {object} certificateData - Sertifika bilgileri
   * @returns {Promise} - Oluşturulan sertifika
   */
  createCertificate: (certificateData) => {
    return api.post('/certificates', certificateData)
      .then(response => response.data);
  },
  
  /**
   * Etkinlik için toplu sertifika oluşturur
   * @param {number} eventId - Etkinlik ID
   * @returns {Promise} - Oluşturulan sertifikalar
   */
  generateEventCertificates: (eventId) => {
    return api.post(`/certificates/event/${eventId}/generate`)
      .then(response => response.data);
  },
  
  /**
   * Sertifika bilgilerini günceller
   * @param {number} id - Sertifika ID
   * @param {object} certificateData - Güncellenecek sertifika bilgileri
   * @returns {Promise} - Güncellenen sertifika
   */
  updateCertificate: (id, certificateData) => {
    return api.put(`/certificates/${id}`, certificateData)
      .then(response => response.data);
  },
  
  /**
   * Sertifika siler
   * @param {number} id - Sertifika ID
   * @returns {Promise} - İşlem sonucu
   */
  deleteCertificate: (id) => {
    return api.delete(`/certificates/${id}`)
      .then(response => response.data);
  },
  
  /**
   * Sertifika PDF'ini indirir
   * @param {number} id - Sertifika ID
   * @returns {Promise} - PDF dosyası
   */
  downloadCertificate: (id) => {
    return api.get(`/certificates/${id}/download`, { responseType: 'blob' })
      .then(response => {
        // PDF dosyasını oluştur ve indir
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `certificate-${id}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        return url;
      });
  },
  
  /**
   * Sertifika QR kodunu getirir
   * @param {number} id - Sertifika ID
   * @returns {Promise} - QR kod resmi
   */
  getCertificateQR: (id) => {
    return api.get(`/certificates/${id}/qr`)
      .then(response => response.data);
  },
  
  /**
   * Kullanıcı için tüm sertifikaları e-posta ile gönderir
   * @param {number} userId - Kullanıcı ID
   * @returns {Promise} - İşlem sonucu
   */
  emailCertificates: (userId = 'me') => {
    return api.post(`/certificates/user/${userId}/email`)
      .then(response => response.data);
  },
  
  /**
   * Sertifikayı paylaşım için hazırlar
   * @param {number} id - Sertifika ID
   * @returns {Promise} - Paylaşım linki ve bilgileri
   */
  shareCertificate: (id) => {
    return api.get(`/certificates/${id}/share`)
      .then(response => response.data);
  }
};

export default certificateService; 