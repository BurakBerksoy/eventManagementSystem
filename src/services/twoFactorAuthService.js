import { api } from './api';

/**
 * İki faktörlü kimlik doğrulama (2FA) ile ilgili işlemleri yöneten servis
 */
const twoFactorAuthService = {
  /**
   * 2FA durumunu kontrol eder
   * @returns {Promise} - 2FA durumu (aktif/pasif)
   */
  getStatus: () => {
    return api.get('/auth/2fa/status')
      .then(response => response.data);
  },
  
  /**
   * 2FA kurulumunu başlatır
   * @returns {Promise} - QR kodu ve geçici kod
   */
  setup: () => {
    return api.post('/auth/2fa/setup')
      .then(response => response.data);
  },
  
  /**
   * 2FA kurulumunu doğrular ve aktif eder
   * @param {string} code - Doğrulama kodu
   * @returns {Promise} - Doğrulama sonucu
   */
  verify: (code) => {
    return api.post('/auth/2fa/verify', { code })
      .then(response => response.data);
  },
  
  /**
   * 2FA'yı devre dışı bırakır
   * @param {string} code - Doğrulama kodu
   * @returns {Promise} - İşlem sonucu
   */
  disable: (code) => {
    return api.post('/auth/2fa/disable', { code })
      .then(response => response.data);
  },
  
  /**
   * Giriş yapma sırasında 2FA doğrulaması yapar
   * @param {string} code - Doğrulama kodu
   * @param {string} token - Geçici oturum token'ı
   * @returns {Promise} - Tam oturum token'ı ve bilgileri
   */
  authenticate: (code, token) => {
    return api.post('/auth/2fa/authenticate', { code, token })
      .then(response => response.data);
  },
  
  /**
   * Yedek kod listesini getirir
   * @returns {Promise} - Yedek kodlar
   */
  getBackupCodes: () => {
    return api.get('/auth/2fa/backup-codes')
      .then(response => response.data);
  },
  
  /**
   * Yeni yedek kodlar oluşturur
   * @param {string} code - Mevcut 2FA doğrulama kodu
   * @returns {Promise} - Yeni yedek kodlar
   */
  generateBackupCodes: (code) => {
    return api.post('/auth/2fa/backup-codes', { code })
      .then(response => response.data);
  },
  
  /**
   * Yedek kod ile doğrulama yapar
   * @param {string} backupCode - Yedek kod
   * @param {string} token - Geçici oturum token'ı
   * @returns {Promise} - Tam oturum token'ı ve bilgileri
   */
  authenticateWithBackupCode: (backupCode, token) => {
    return api.post('/auth/2fa/authenticate-backup', { backupCode, token })
      .then(response => response.data);
  }
};

export default twoFactorAuthService; 