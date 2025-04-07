import { api } from './api';
import * as notificationAPI from './notificationAPI';
import { API_URL, STORAGE_KEYS } from '../config/config';

/**
 * Kulüp üyeliği işlemleri için API servisi
 */
export const membershipService = {
  /**
   * Bir kulübe katılma isteği gönderir
   * @param {number} clubId - Katılmak istenen kulübün ID'si
   * @param {Object} requestData - İstek verileri
   * @returns {Promise} İşlem sonucunu içeren promise
   */
  requestJoinClub: async (clubId, requestData = {}) => {
    try {
      if (!clubId) {
        console.error('requestJoinClub: Kulüp ID eksik veya geçersiz');
        return { success: false, message: 'Geçersiz kulüp ID\'si' };
      }
      
      // Mevcut kullanıcıyı kontrol et
      const userStr = localStorage.getItem('user');
      if (!userStr) {
        console.error('requestJoinClub: Kullanıcı bilgisi bulunamadı');
        return { success: false, message: 'Lütfen giriş yapın' };
      }
      
      const currentUser = JSON.parse(userStr);
      console.log(`Üyelik isteği: Kullanıcı=${currentUser.name} (${currentUser.id}), Kulüp ID=${clubId}`);
      
      // Zaten mevcut bir istek var mı kontrol et (API ve localStorage'da)
      let existingRequest = null;
      try {
        // Önce API'den kontrol et
        const token = localStorage.getItem('auth_token');
        if (token) {
          const checkResponse = await fetch(`/api/clubs/${clubId}/membership/check`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (checkResponse.ok) {
            const membershipStatus = await checkResponse.json();
            console.log('Üyelik durumu kontrol edildi:', membershipStatus);
            
            if (membershipStatus.isPending) {
              return { 
                success: false, 
                message: 'Zaten bekleyen bir üyelik isteğiniz var',
                status: 'PENDING'
              };
            }
            
            if (membershipStatus.isMember) {
              return { 
                success: false, 
                message: 'Zaten bu kulübün üyesisiniz',
                status: 'MEMBER'
              };
            }
          }
        }
      } catch (apiCheckError) {
        console.warn('API üzerinden üyelik kontrolü yapılamadı:', apiCheckError);
      }
      
      // Kullanıcının zaten üye veya bekleyen isteği olup olmadığını localStorage'da kontrol et
      try {
        const existingRequests = JSON.parse(localStorage.getItem('membershipRequests') || '[]');
        existingRequest = existingRequests.find(req => 
          req.clubId === Number(clubId) && req.userId === currentUser.id && req.status === 'PENDING');
        
        if (existingRequest) {
          console.log('Zaten bekleyen bir üyelik isteği mevcut:', existingRequest);
          return { 
            success: false, 
            message: 'Zaten bekleyen bir üyelik isteğiniz var',
            request: existingRequest
          };
        }
      } catch (storageError) {
        console.error('LocalStorage kontrolü sırasında hata:', storageError);
      }
      
      // Backend API üzerinden kulübe katılma isteği göndermeyi dene
      let backendRequestSuccessful = false;
      let backendResponse = null;
      
      try {
        const token = localStorage.getItem('auth_token');
        if (token) {
          const joinResponse = await fetch(`/api/clubs/${clubId}/join`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              message: requestData.message || ''
            })
          });
          
          if (joinResponse.ok) {
            try {
              backendResponse = await joinResponse.json();
              backendRequestSuccessful = true;
              console.log('Backend üyelik isteği başarıyla gönderildi:', backendResponse);
            } catch (parseError) {
              console.warn('Backend yanıtı JSON olarak parse edilemedi', parseError);
              backendRequestSuccessful = joinResponse.status >= 200 && joinResponse.status < 300;
            }
          } else {
            console.warn(`Backend üyelik isteği başarısız: ${joinResponse.status}`);
          }
        }
      } catch (backendError) {
        console.error('Backend üyelik isteği sırasında hata:', backendError);
      }
      
      // Kulüp bilgilerini almaya çalış
      let club = await getClubDetails(clubId, requestData);
      
      // Eğer backend'den veya DOM'dan elde edilmiş başkan bilgisi istek parametresi olarak gelmişse kullan
      const presidentInfo = requestData?.presidentInfo;
      if (presidentInfo && presidentInfo.id && !club.presidentId) {
        console.log('Dışarıdan gelen başkan bilgisi kullanılıyor:', presidentInfo);
        club.presidentId = presidentInfo.id;
        club.presidentName = presidentInfo.name;
      }
      
      // Yeni üyelik isteği oluştur
      const newRequest = {
        requestId: backendResponse?.requestId || `req-${Date.now()}`,
        clubId: Number(clubId),
        clubName: club.name || `Kulüp #${clubId}`,
        userId: currentUser.id,
        userName: currentUser.name,
        status: 'PENDING',
        createdAt: new Date().toISOString(),
        backendSynced: backendRequestSuccessful
      };
      
      // Yerel depolamaya kaydet
      try {
        const existingRequests = JSON.parse(localStorage.getItem('membershipRequests') || '[]');
        existingRequests.push(newRequest);
        localStorage.setItem('membershipRequests', JSON.stringify(existingRequests));
        console.log('Yeni üyelik isteği localStorage\'a kaydedildi:', newRequest);
      } catch (storageError) {
        console.error('Üyelik isteği localStorage\'a kaydedilemedi:', storageError);
      }
      
      // Kulüp başkanına bildirim gönder
      let notificationSent = false;
      try {
        if (club && club.presidentId) {
          const notificationData = {
            title: 'Yeni Üyelik İsteği',
            message: `${currentUser.name} kulübünüze katılmak istiyor`,
            type: 'MEMBERSHIP_REQUEST',
            receiverId: club.presidentId,
            senderId: currentUser.id,
            data: JSON.stringify({
              requestId: newRequest.requestId,
              clubId: clubId,
              userId: currentUser.id,
              userName: currentUser.name,
              clubName: club.name || `Kulüp #${clubId}`,
              requestDate: newRequest.createdAt
            })
          };
          
          // NotificationAPI kullanarak bildirim gönder
          try {
            console.log(`Bildirim gönderiliyor - Başkan ID: ${club.presidentId}`);
            const notificationResult = await notificationAPI.createNotification(notificationData);
            console.log('Bildirim gönderme sonucu:', notificationResult);
            notificationSent = notificationResult && notificationResult.success;
          } catch (apiError) {
            console.error('Bildirim API hatası:', apiError);
            
            // Alternatif olarak localStorage kullanarak bildirim oluştur
            try {
              // LocalStorage'dan bildirimleri al
              const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
              
              // Yeni bildirim ekle
              const newNotification = {
                id: `notification-${Date.now()}`,
                ...notificationData,
                createdAt: new Date().toISOString(),
                read: false,
              };
              
              notifications.push(newNotification);
              localStorage.setItem('notifications', JSON.stringify(notifications));
              console.log('Bildirim localStorage\'a kaydedildi:', newNotification);
              notificationSent = true;
            } catch (localStorageError) {
              console.error('LocalStorage bildirim hatası:', localStorageError);
            }
          }
        } else {
          console.warn('Kulüp başkanı bulunamadı, bildirim gönderilemedi. Kulüp:', club);
          
          // Başkan yoksa veya başkan ID yoksa localStorage'a genel bildirim ekle
          try {
            const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
            
            // Sistem bildirimi olarak ekle
            const systemNotification = {
              id: `system-notification-${Date.now()}`,
              title: 'Yeni Üyelik İsteği (Sistem)',
              message: `${currentUser.name}, ${club?.name || `Kulüp #${clubId}`} kulübüne katılmak istiyor`,
              type: 'SYSTEM_MEMBERSHIP_REQUEST',
              receiverId: 'admin',  // Sistem yöneticisine
              senderId: currentUser.id,
              data: JSON.stringify({
                requestId: newRequest.requestId,
                clubId: clubId,
                userId: currentUser.id,
                userName: currentUser.name,
                clubName: club?.name || `Kulüp #${clubId}`,
                requestDate: newRequest.createdAt,
                noPresident: true
              }),
              createdAt: new Date().toISOString(),
              read: false
            };
            
            notifications.push(systemNotification);
            localStorage.setItem('notifications', JSON.stringify(notifications));
            console.log('Sistem bildirimi localStorage\'a kaydedildi:', systemNotification);
            notificationSent = true;
          } catch (systemNotificationError) {
            console.error('Sistem bildirimi oluşturma hatası:', systemNotificationError);
          }
        }
      } catch (notificationError) {
        console.error('Bildirim gönderirken hata oluştu:', notificationError);
      }
      
      return { 
        success: true, 
        message: 'Kulübe katılma isteğiniz başarıyla gönderildi', 
        request: newRequest,
        backendSynced: backendRequestSuccessful,
        notificationSent: notificationSent,
        presidentId: club?.presidentId,
        presidentName: club?.presidentName
      };
    } catch (error) {
      console.error('requestJoinClub hata:', error);
      return { success: false, message: 'Bir hata oluştu. Lütfen daha sonra tekrar deneyin.' };
    }
  },
  
  /**
   * Bekleyen üyelik isteklerini getirir
   * @returns {Array} Bekleyen isteklerin listesi
   */
  getPendingRequests: () => {
    try {
      const requests = JSON.parse(localStorage.getItem('membershipRequests') || '[]');
      return requests.filter(req => req.status === 'PENDING');
    } catch (error) {
      console.error('Bekleyen istekler alınırken hata oluştu:', error);
      return [];
    }
  },
  
  /**
   * Bir üyelik isteğini kabul eder
   * @param {string} requestId - İstek ID'si
   * @returns {Promise} İşlem sonucu
   */
  acceptRequest: (requestId) => {
    return new Promise((resolve, reject) => {
      try {
        const requests = JSON.parse(localStorage.getItem('membershipRequests') || '[]');
        const requestIndex = requests.findIndex(req => req.id === requestId);
        
        if (requestIndex === -1) {
          return reject({ message: 'İstek bulunamadı' });
        }
        
        const request = requests[requestIndex];
        request.status = 'ACCEPTED';
        request.updatedAt = new Date().toISOString();
        
        requests[requestIndex] = request;
        localStorage.setItem('membershipRequests', JSON.stringify(requests));
        
        // Kulübe üye ekle
        const clubs = JSON.parse(localStorage.getItem('clubs') || '[]');
        const clubIndex = clubs.findIndex(c => c.id === request.clubId);
        
        if (clubIndex !== -1) {
          const club = clubs[clubIndex];
          club.members = club.members || [];
          
          club.members.push({
            userId: request.userId,
            userName: request.userName,
            joinDate: new Date().toISOString(),
            role: 'MEMBER'
          });
          
          clubs[clubIndex] = club;
          localStorage.setItem('clubs', JSON.stringify(clubs));
        }
        
        resolve({ success: true, data: request });
      } catch (error) {
        reject({ message: 'İstek kabul edilirken bir hata oluştu', error });
      }
    });
  },
  
  /**
   * Bir üyelik isteğini reddeder
   * @param {string} requestId - İstek ID'si
   * @returns {Promise} İşlem sonucu
   */
  rejectRequest: (requestId) => {
    return new Promise((resolve, reject) => {
      try {
        const requests = JSON.parse(localStorage.getItem('membershipRequests') || '[]');
        const requestIndex = requests.findIndex(req => req.id === requestId);
        
        if (requestIndex === -1) {
          return reject({ message: 'İstek bulunamadı' });
        }
        
        const request = requests[requestIndex];
        request.status = 'REJECTED';
        request.updatedAt = new Date().toISOString();
        
        requests[requestIndex] = request;
        localStorage.setItem('membershipRequests', JSON.stringify(requests));
        
        resolve({ success: true, data: request });
      } catch (error) {
        reject({ message: 'İstek reddedilirken bir hata oluştu', error });
      }
    });
  },

  /**
   * Kulüp katılma isteğini iptal etmek için kullanılan fonksiyon 
   * @param {string|number} clubId - Kulüp ID
   * @returns {Promise<Object>} - İptal sonucu
   */
  cancelRequest: async (clubId) => {
    console.log('cancelRequest fonksiyonu çağrıldı:', clubId);
    
    if (!clubId) {
      console.error('Kulüp ID\'si tanımsız');
      return { success: false, message: 'Kulüp kimliği bulunamadı' };
    }
    
    try {
      const currentUser = JSON.parse(localStorage.getItem(STORAGE_KEYS.USER));
      if (!currentUser || !currentUser.id) {
        console.error('Kullanıcı bilgisi bulunamadı');
        return { success: false, message: 'Kullanıcı bilgisi bulunamadı. Lütfen tekrar giriş yapın' };
      }
      
      console.log('Kulüp katılma isteği iptal ediliyor:', clubId, 'Kullanıcı:', currentUser.id);
      
      // localStorage'dan bekleyen istekleri kontrol et
      let requestId = null;
      try {
        const pendingRequests = JSON.parse(localStorage.getItem(STORAGE_KEYS.PENDING_REQUESTS) || '[]');
        const existingRequest = pendingRequests.find(req => 
          req.clubId == clubId && req.userId == currentUser.id
        );
        
        if (existingRequest) {
          requestId = existingRequest.requestId;
          console.log('İptal edilecek istek bulundu (localStorage):', requestId);
        }
      } catch (storageError) {
        console.warn('localStorage okuma hatası:', storageError);
      }
      
      // API'ye iptal isteği gönder
      try {
        const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
        
        // Token yoksa sadece localStorage işlemini yap
        if (!token) {
          console.log('Token olmadığı için sadece localStorage temizliği yapılacak');
        } else {
          // İstek ID'si biliniyor ise, doğrudan istek ID'si üzerinden iptal et
          if (requestId && !requestId.startsWith('local-')) {
            const response = await fetch(`${API_URL}/api/clubs/membership/requests/${requestId}/cancel`, {
              method: 'PUT',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            });
            
            console.log('API yanıtı (istek ID ile):', response.status);
            
            if (response.ok) {
              // API ile başarılı iptal
              console.log('İptal isteği başarılı (istek ID ile)');
            } else {
              console.warn(`API hatası (istek ID ile): ${response.status}`);
            }
          } else {
            // İstek ID'si bilinmiyor veya local ise, kulüp ID'si üzerinden iptal et
            const response = await fetch(`${API_URL}/api/clubs/${clubId}/membership/cancel`, {
              method: 'DELETE',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ userId: currentUser.id })
            });
            
            console.log('API yanıtı (kulüp ID ile):', response.status);
            
            if (response.ok) {
              // API ile başarılı iptal
              console.log('İptal isteği başarılı (kulüp ID ile)');
            } else {
              console.warn(`API hatası (kulüp ID ile): ${response.status}`);
            }
          }
        }
      } catch (apiError) {
        console.error('API isteği sırasında hata:', apiError);
        // API hatası durumunda localStorage temizliğine devam et
      }
      
      // localStorage'dan isteği sil (API sonucundan bağımsız olarak)
      try {
        const pendingRequests = JSON.parse(localStorage.getItem(STORAGE_KEYS.PENDING_REQUESTS) || '[]');
        const filteredRequests = pendingRequests.filter(req => 
          !(req.clubId == clubId && req.userId == currentUser.id)
        );
        
        localStorage.setItem(STORAGE_KEYS.PENDING_REQUESTS, JSON.stringify(filteredRequests));
        console.log('İstek localStorage\'dan silindi');
      } catch (storageError) {
        console.error('localStorage işlemi sırasında hata:', storageError);
        return { 
          success: false, 
          message: 'İstek iptal edilemedi. Yerel depolama hatası.',
          error: storageError.message
        };
      }
      
      return {
        success: true,
        message: 'Kulübe katılma isteğiniz iptal edildi'
      };
    } catch (error) {
      console.error('cancelRequest fonksiyonunda beklenmeyen hata:', error);
      return {
        success: false,
        message: 'İşlem sırasında beklenmeyen bir hata oluştu.',
        error: error.message
      };
    }
  }
};

/**
 * Kulüp bilgilerini almak için yardımcı fonksiyon
 * @param {number} clubId - Kulüp ID'si
 * @param {Object} options - İstek seçenekleri
 * @returns {Promise<Object>} Kulüp bilgileri
 */
async function getClubDetails(clubId, options = {}) {
  let club = null;
  
  try {
    // 1. Önce tüm kulüpler listesinden ara
    try {
      const allClubsResponse = await fetch('/api/clubs', {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      if (allClubsResponse.ok) {
        const allClubs = await allClubsResponse.json();
        console.log('Tüm kulüpler alındı, aranıyor:', clubId);
        
        if (Array.isArray(allClubs)) {
          club = allClubs.find(c => c.id === Number(clubId));
        } else if (allClubs.data && Array.isArray(allClubs.data)) {
          club = allClubs.data.find(c => c.id === Number(clubId));
        }
        
        if (club) {
          console.log('Kulüp genel listede bulundu:', club);
          return club;
        }
      }
    } catch (listError) {
      console.warn('Kulüp listesi alınırken hata:', listError);
    }
    
    // 2. Doğrudan kulüp detayını al
    try {
      const clubResponse = await fetch(`/api/clubs/${clubId}`, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      if (clubResponse.ok) {
        const contentType = clubResponse.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          club = await clubResponse.json();
          console.log('Kulüp bilgileri tek API istekle alındı:', club);
          return club;
        }
      }
    } catch (detailError) {
      console.warn('Kulüp detayı alınırken hata:', detailError);
    }
    
    // 3. localStorage'dan kulüpler listesini al
    try {
      const storedClubs = JSON.parse(localStorage.getItem('clubs') || '[]');
      club = storedClubs.find(c => c.id === Number(clubId));
      
      if (club) {
        console.log('LocalStorage\'dan kulüp bilgileri alındı:', club);
        return club;
      }
    } catch (storageError) {
      console.warn('LocalStorage\'dan kulüp bilgileri alınamadı:', storageError);
    }
    
    // 4. DOM'dan kulüp bilgilerini çıkarmayı dene
    try {
      const clubElements = document.querySelectorAll(`[data-club-id="${clubId}"]`);
      if (clubElements.length > 0) {
        const clubElement = clubElements[0];
        club = {
          id: clubId,
          name: clubElement.getAttribute('data-club-name') || 'Bilinmeyen Kulüp',
          presidentId: clubElement.getAttribute('data-president-id') || null,
          presidentName: clubElement.getAttribute('data-president-name') || 'Bilinmeyen Başkan'
        };
        console.log('DOM üzerinden kulüp bilgileri alındı:', club);
        return club;
      }
    } catch (domError) {
      console.warn('DOM\'dan kulüp bilgileri alınamadı:', domError);
    }
    
    // 5. Son çare olarak minimum bilgi oluştur
    club = {
      id: clubId,
      name: `Kulüp #${clubId}`,
      presidentId: null,
      presidentName: null
    };
    
    // Eğer option olarak başkan bilgisi geldiyse ekle
    if (options.presidentInfo) {
      club.presidentId = options.presidentInfo.id;
      club.presidentName = options.presidentInfo.name;
    }
    
    console.warn('Kulüp bilgisi bulunamadı, minimum bilgi kullanılıyor:', club);
    return club;
  } catch (error) {
    console.error('Kulüp bilgileri alınırken beklenmeyen hata:', error);
    return {
      id: clubId,
      name: `Kulüp #${clubId}`,
      presidentId: null,
      presidentName: null
    };
  }
}

/**
 * HTML yanıtı veya JSON olmayan içerikleri güvenli şekilde ayrıştıran yardımcı fonksiyon
 * @param {Response} response - Fetch API yanıtı
 * @returns {Promise<Object|Array|null>} - Ayrıştırılmış JSON verisi veya null
 */
const safeParseResponse = async (response) => {
  try {
    // Response metni al
    const text = await response.text();
    
    // Boş ise null döndür
    if (!text || text.trim() === '') {
      console.warn('API yanıtı boş');
      return null;
    }
    
    // HTML yanıtlarını kontrol et
    if (text.trim().startsWith('<!DOCTYPE html>') || 
        text.trim().startsWith('<html')) {
      console.warn('HTML yanıtı alındı, JSON olarak ayrıştırılamaz');
      return null;
    }
    
    // JSON olarak çözümle
    try {
      return JSON.parse(text);
    } catch (parseError) {
      console.error('JSON ayrıştırma hatası:', parseError);
      return null;
    }
  } catch (error) {
    console.error('API yanıtı işlenirken hata:', error);
    return null;
  }
};

/**
 * Kulübe katılma isteği göndermek için kullanılan fonksiyon
 * @param {string|number} clubId - Kulüp ID
 * @param {Object} options - Ek seçenekler (başkan bilgisi vb.)
 * @returns {Promise<Object>} - İstek sonucu
 */
export const requestJoinClub = async (clubId, options = {}) => {
  console.log('requestJoinClub fonksiyonu çağrıldı:', clubId, options);
  
  if (!clubId) {
    console.error('Kulüp ID\'si tanımsız');
    return { success: false, message: 'Kulüp kimliği bulunamadı' };
  }
  
  try {
    const currentUser = JSON.parse(localStorage.getItem(STORAGE_KEYS.USER));
    if (!currentUser || !currentUser.id) {
      console.error('Kullanıcı bilgisi bulunamadı');
      return { success: false, message: 'Kullanıcı bilgisi bulunamadı. Lütfen tekrar giriş yapın' };
    }
    
    console.log('Kulübe katılma isteği:', clubId, 'Kullanıcı:', currentUser.id);
    
    // Aynı kulüp için bekleyen bir istek olup olmadığını kontrol et
    try {
      // 1. Yerel depolama kontrolü
      const localRequests = JSON.parse(localStorage.getItem(STORAGE_KEYS.PENDING_REQUESTS) || '[]');
      const existingLocalRequest = localRequests.find(req => 
        req.clubId == clubId && req.userId == currentUser.id
      );
      
      if (existingLocalRequest) {
        console.warn('Bu kulübe zaten katılma isteği göndermişsiniz (localStorage)');
        return { 
          success: false, 
          message: 'Bu kulübe zaten katılma isteği göndermişsiniz',
          existingRequest: existingLocalRequest
        };
      }
      
      // 2. API kontrolü
      try {
        const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
        if (token) {
          const checkResponse = await fetch(`${API_URL}/api/clubs/${clubId}/membership/requests/check`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (checkResponse.ok) {
            const checkData = await safeParseResponse(checkResponse);
            if (checkData && checkData.exists) {
              console.warn('Bu kulübe zaten katılma isteği göndermişsiniz (API)');
              return { 
                success: false, 
                message: 'Bu kulübe zaten katılma isteği göndermişsiniz',
                existingRequest: checkData.request
              };
            }
          }
        }
      } catch (checkError) {
        console.warn('İstek kontrolü yapılamadı (API hatası):', checkError);
        // Kontrol hatası işlemi durdurmaz, devam eder
      }
    } catch (checkError) {
      console.warn('Mevcut istek kontrolü sırasında hata:', checkError);
      // Devam et
    }
    
    // Kulüp verilerini getir - presidentId bilgisini almak için
    let clubDetails = null;
    let presidentId = null;
    let presidentName = null;
    
    // İlk olarak options içindeki presidentInfo'yu kontrol et
    if (options && options.presidentInfo) {
      presidentId = options.presidentInfo.id;
      presidentName = options.presidentInfo.name;
      console.log('Parametre olarak gelen başkan bilgisi kullanılıyor:', presidentId, presidentName);
    }
    
    // Eğer options içinde presidentInfo yoksa, API ile kulüp bilgilerini getir
    if (!presidentId) {
      try {
        const response = await fetch(`${API_URL}/api/clubs/${clubId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          clubDetails = await safeParseResponse(response);
          console.log('Kulüp bilgileri alındı:', clubDetails);
          
          if (clubDetails && clubDetails.president) {
            presidentId = clubDetails.president.id;
            presidentName = clubDetails.president.fullName || clubDetails.president.name;
            console.log('Kulüp başkanı bilgisi:', presidentId, presidentName);
          } else if (clubDetails && clubDetails.presidentId) {
            presidentId = clubDetails.presidentId;
            presidentName = clubDetails.presidentName || 'Kulüp Başkanı';
            console.log('Kulüp başkanı ID bilgisi bulundu:', presidentId);
          } else {
            console.warn('Kulüp başkanı bilgisi bulunamadı:', clubDetails);
          }
        } else {
          console.warn(`Kulüp bilgileri alınamadı. API yanıtı: ${response.status}`);
        }
      } catch (error) {
        console.error('Kulüp bilgileri alınırken hata:', error);
      }
    }
    
    // API'ye üyelik isteği gönder
    const requestData = {
      userId: currentUser.id,
      clubId: clubId,
      requestDate: new Date().toISOString(),
      message: options.message || '',
      requestStatus: 'PENDING'
    };
    
    try {
      const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
      const response = await fetch(`${API_URL}/api/clubs/${clubId}/membership/join`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      });
      
      console.log('API yanıtı:', response.status);
      
      if (response.ok) {
        const data = await safeParseResponse(response);
        console.log('Katılma isteği başarılı:', data);
        
        // İsteği localStorage'a da kaydet
        try {
          const pendingRequests = JSON.parse(localStorage.getItem(STORAGE_KEYS.PENDING_REQUESTS) || '[]');
          
          // Aynı istek zaten var mı kontrol et
          const existingRequest = pendingRequests.find(req => 
            req.clubId == clubId && req.userId == currentUser.id
          );
          
          if (!existingRequest) {
            const requestWithId = {
              ...requestData,
              requestId: data && data.requestId ? data.requestId : `req-${Date.now()}`,
              clubName: clubDetails ? clubDetails.name : 'Kulüp',
              userName: currentUser.name,
              presidentId: presidentId,
              presidentName: presidentName
            };
            
            pendingRequests.push(requestWithId);
            localStorage.setItem(STORAGE_KEYS.PENDING_REQUESTS, JSON.stringify(pendingRequests));
            console.log('İstek localStorage\'a kaydedildi');
          }
        } catch (storageError) {
          console.warn('localStorage işlemi sırasında hata:', storageError);
        }
        
        return {
          success: true,
          message: 'Kulübe katılma isteğiniz gönderildi',
          request: data,
          presidentId: presidentId,
          presidentName: presidentName
        };
      } else {
        // API hatası durumunda istek localStorage'a kaydedilir
        console.warn(`API hatası: ${response.status}`);
        
        try {
          const pendingRequests = JSON.parse(localStorage.getItem(STORAGE_KEYS.PENDING_REQUESTS) || '[]');
          
          // Aynı istek zaten var mı kontrol et
          const existingRequest = pendingRequests.find(req => 
            req.clubId == clubId && req.userId == currentUser.id
          );
          
          if (!existingRequest) {
            const requestWithId = {
              ...requestData,
              requestId: `local-${Date.now()}`,
              clubName: clubDetails ? clubDetails.name : 'Kulüp',
              userName: currentUser.name,
              presidentId: presidentId,
              presidentName: presidentName
            };
            
            pendingRequests.push(requestWithId);
            localStorage.setItem(STORAGE_KEYS.PENDING_REQUESTS, JSON.stringify(pendingRequests));
            console.log('İstek localStorage\'a kaydedildi (API hatası nedeniyle)');
          }
          
          // localStorage'a kaydedildi, kullanıcıya başarılı mesajı göster
          return {
            success: true,
            message: 'Kulübe katılma isteğiniz kaydedildi. Sunucu yanıt vermediği için işlem geçici olarak saklandı.',
            fallback: true,
            presidentId: presidentId,
            presidentName: presidentName
          };
        } catch (storageError) {
          console.error('localStorage işlemi sırasında hata:', storageError);
          return {
            success: false,
            message: 'Kulübe katılma isteği gönderilemedi ve yerel olarak kaydedilemedi.',
            error: storageError.message
          };
        }
      }
    } catch (error) {
      console.error('API isteği sırasında hata:', error);
      
      // Hata durumunda, istek localStorage'a kaydedilir
      try {
        const pendingRequests = JSON.parse(localStorage.getItem(STORAGE_KEYS.PENDING_REQUESTS) || '[]');
        
        // Aynı istek zaten var mı kontrol et
        const existingRequest = pendingRequests.find(req => 
          req.clubId == clubId && req.userId == currentUser.id
        );
        
        if (!existingRequest) {
          const requestWithId = {
            ...requestData,
            requestId: `local-${Date.now()}`,
            clubName: clubDetails ? clubDetails.name : 'Kulüp',
            userName: currentUser.name,
            presidentId: presidentId,
            presidentName: presidentName
          };
          
          pendingRequests.push(requestWithId);
          localStorage.setItem(STORAGE_KEYS.PENDING_REQUESTS, JSON.stringify(pendingRequests));
          console.log('İstek localStorage\'a kaydedildi (Exception nedeniyle)');
          
          // localStorage'a kaydedildi, kullanıcıya başarılı mesajı göster
          return {
            success: true,
            message: 'Kulübe katılma isteğiniz kaydedildi. Sunucu yanıt vermediği için işlem geçici olarak saklandı.',
            fallback: true,
            presidentId: presidentId,
            presidentName: presidentName
          };
        } else {
          return {
            success: false,
            message: 'Bu kulübe zaten katılma isteği göndermişsiniz',
            existingRequest: existingRequest
          };
        }
      } catch (storageError) {
        console.error('localStorage işlemi sırasında hata:', storageError);
        return {
          success: false,
          message: 'Kulübe katılma isteği gönderilemedi ve yerel olarak kaydedilemedi.',
          error: error.message
        };
      }
    }
  } catch (error) {
    console.error('requestJoinClub fonksiyonunda beklenmeyen hata:', error);
    return {
      success: false,
      message: 'İşlem sırasında beklenmeyen bir hata oluştu.',
      error: error.message
    };
  }
};

/**
 * Bekleyen üyelik isteklerini getirir
 * @returns {Array} Bekleyen isteklerin listesi
 */
export const getPendingRequests = () => {
  return membershipService.getPendingRequests();
};

/**
 * Bir üyelik isteğini kabul eder
 * @param {string} requestId - İstek ID'si
 * @returns {Promise} İşlem sonucu
 */
export const acceptRequest = (requestId) => {
  return membershipService.acceptRequest(requestId);
};

/**
 * Bir üyelik isteğini reddeder
 * @param {string} requestId - İstek ID'si
 * @returns {Promise} İşlem sonucu
 */
export const rejectRequest = (requestId) => {
  return membershipService.rejectRequest(requestId);
};

/**
 * Bekleyen bir üyelik isteğini iptal eder
 * @param {number} clubId - Kulüp ID'si
 * @returns {Promise<Object>} İşlem sonucunu içeren bir Promise
 */
export const cancelRequest = (clubId) => {
  return membershipService.cancelRequest(clubId);
}; 