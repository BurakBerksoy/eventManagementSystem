/**
 * Tarih işlemleri için yardımcı fonksiyonlar
 */

/**
 * Tarih formatını Türkçe olarak düzenler
 * @param {string} dateString ISO formatında tarih string'i
 * @returns {string} Formatlanmış tarih string'i
 */
export const formatDate = (dateString) => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    
    if (isNaN(date.getTime())) {
      return dateString;
    }
    
    return date.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    console.error('Tarih formatlanırken hata oluştu:', error);
    return dateString;
  }
};

/**
 * Tarih kısmını Türkçe olarak formatlar
 * @param {string} dateString ISO formatında tarih string'i
 * @returns {string} Sadece tarih kısmı formatlanmış string
 */
export const formatDateOnly = (dateString) => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    
    if (isNaN(date.getTime())) {
      return dateString;
    }
    
    return date.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (error) {
    console.error('Tarih formatlanırken hata oluştu:', error);
    return dateString;
  }
};

/**
 * Saat kısmını Türkçe olarak formatlar
 * @param {string} dateString ISO formatında tarih string'i
 * @returns {string} Sadece saat kısmı formatlanmış string
 */
export const formatTimeOnly = (dateString) => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    
    if (isNaN(date.getTime())) {
      return dateString;
    }
    
    return date.toLocaleTimeString('tr-TR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    console.error('Saat formatlanırken hata oluştu:', error);
    return dateString;
  }
};

/**
 * İki tarih arasında kalan süreyi hesaplar
 * @param {string|Date} startDate - Başlangıç tarihi
 * @param {string|Date} endDate - Bitiş tarihi (belirtilmezse şu anki zaman kullanılır)
 * @returns {string} - Kalan süre metni
 */
export const getTimeRemaining = (startDate, endDate = new Date()) => {
  if (!startDate) return '';
  
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate;
  
  // Millisaniye cinsinden fark
  const diff = start.getTime() - end.getTime();
  
  // Geçmiş tarih kontrolü
  if (diff <= 0) {
    return 'Süresi Doldu';
  }
  
  // Zaman birimleri (millisaniye cinsinden)
  const minute = 60 * 1000;
  const hour = minute * 60;
  const day = hour * 24;
  const month = day * 30;
  const year = day * 365;
  
  // Kalan süre hesaplama
  if (diff >= year) {
    const years = Math.floor(diff / year);
    return `${years} yıl`;
  } else if (diff >= month) {
    const months = Math.floor(diff / month);
    return `${months} ay`;
  } else if (diff >= day) {
    const days = Math.floor(diff / day);
    return `${days} gün`;
  } else if (diff >= hour) {
    const hours = Math.floor(diff / hour);
    return `${hours} saat`;
  } else if (diff >= minute) {
    const minutes = Math.floor(diff / minute);
    return `${minutes} dakika`;
  } else {
    return 'Az kaldı';
  }
};

/**
 * Tarih nesnesini ISO formatına çevirir
 * @param {Date} date - Tarih nesnesi
 * @returns {string} - ISO formatında tarih
 */
export const toISOString = (date) => {
  if (!date) return '';
  return new Date(date).toISOString();
};

/**
 * İki tarih arasındaki süre farkını hesaplar
 * @param {string|Date} startDate - Başlangıç tarihi
 * @param {string|Date} endDate - Bitiş tarihi
 * @returns {Object} - Gün, saat, dakika ve saniye olarak süre farkı
 */
export const getDuration = (startDate, endDate) => {
  if (!startDate || !endDate) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate;
  
  // Millisaniye cinsinden fark
  const diff = Math.abs(end.getTime() - start.getTime());
  
  // Zaman birimleri (millisaniye cinsinden)
  const second = 1000;
  const minute = second * 60;
  const hour = minute * 60;
  const day = hour * 24;
  
  // Süre hesaplama
  const days = Math.floor(diff / day);
  const hours = Math.floor((diff % day) / hour);
  const minutes = Math.floor((diff % hour) / minute);
  const seconds = Math.floor((diff % minute) / second);
  
  return { days, hours, minutes, seconds };
}; 