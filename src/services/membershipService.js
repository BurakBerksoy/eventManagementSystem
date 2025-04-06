import { api } from './api';
import { notificationAPI } from './api';

/**
 * Kulüp üyelik işlemleri ile ilgili servis
 */
const membershipAPI = {
  /**
   * Kulübe katılma isteği gönderir
   * @param {string} clubId Kulüp ID'si
   * @param {object} requestData İstek verisi (mesaj vb.)
   * @returns {Promise} İşlem sonucunu içeren promise
   */
  requestJoinClub: (clubId, requestData = {}) => {
    return new Promise((resolve, reject) => {
      setTimeout(async () => {
        try {
          const clubs = JSON.parse(localStorage.getItem('clubs') || '[]');
          const club = clubs.find(c => c.id === clubId);
          
          if (!club) {
            return reject({ message: 'Kulüp bulunamadı' });
          }
          
          const currentUser = JSON.parse(localStorage.getItem('currentUser'));
          if (!currentUser) {
            return reject({ message: 'Kullanıcı girişi yapılmamış' });
          }
          
          // Kullanıcı zaten kulüp üyesi mi kontrol et
          const members = club.members || [];
          if (members.some(member => member.userId === currentUser.id)) {
            return reject({ message: 'Zaten bu kulübün üyesisiniz' });
          }
          
          // Kullanıcı daha önce istek göndermiş mi kontrol et
          const requests = JSON.parse(localStorage.getItem('membershipRequests') || '[]');
          const existingRequest = requests.find(req => 
            req.clubId === clubId && 
            req.userId === currentUser.id &&
            req.status === 'PENDING'
          );
          
          if (existingRequest) {
            return reject({ message: 'Zaten bekleyen bir üyelik isteğiniz var' });
          }
          
          // Yeni istek oluştur
          const newRequest = {
            id: Date.now().toString(),
            clubId,
            userId: currentUser.id,
            userName: `${currentUser.firstName} ${currentUser.lastName}`,
            message: requestData.message || '',
            status: 'PENDING',
            createdAt: new Date().toISOString()
          };
          
          requests.push(newRequest);
          localStorage.setItem('membershipRequests', JSON.stringify(requests));
          
          // Kulüp başkanına bildirim gönder
          await notificationAPI.createNotification({
            title: 'Yeni Kulüp Üyelik İsteği',
            message: `${currentUser.firstName} ${currentUser.lastName} kulübünüze katılmak istiyor`,
            type: 'CLUB_MEMBERSHIP_REQUEST',
            entityId: clubId,
            userId: club.presidentId,
            data: {
              requestId: newRequest.id,
              clubId: clubId,
              message: requestData.message
            }
          });
          
          resolve({ success: true, data: newRequest });
        } catch (error) {
          reject({ message: 'İstek gönderilirken bir hata oluştu', error });
        }
      }, 300);
    });
  },
  
  /**
   * Kulüp için bekleyen üyelik isteklerini getirir
   * @param {string} clubId Kulüp ID'si
   * @returns {Promise} İstekleri içeren promise
   */
  getClubMembershipRequests: (clubId) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          const requests = JSON.parse(localStorage.getItem('membershipRequests') || '[]');
          const clubRequests = requests.filter(req => req.clubId === clubId && req.status === 'PENDING');
          resolve({ data: clubRequests });
        } catch (error) {
          reject({ message: 'İstekler alınırken bir hata oluştu', error });
        }
      }, 300);
    });
  },
  
  /**
   * Kullanıcının gönderdiği üyelik isteklerini getirir
   * @returns {Promise} İstekleri içeren promise
   */
  getUserMembershipRequests: () => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          const currentUser = JSON.parse(localStorage.getItem('currentUser'));
          if (!currentUser) {
            return reject({ message: 'Kullanıcı girişi yapılmamış' });
          }
          
          const requests = JSON.parse(localStorage.getItem('membershipRequests') || '[]');
          const userRequests = requests.filter(req => req.userId === currentUser.id);
          resolve({ data: userRequests });
        } catch (error) {
          reject({ message: 'İstekler alınırken bir hata oluştu', error });
        }
      }, 300);
    });
  },
  
  /**
   * Üyelik isteğini onaylar
   * @param {string} clubId Kulüp ID'si
   * @param {string} requestId İstek ID'si
   * @returns {Promise} İşlem sonucunu içeren promise
   */
  approveMembershipRequest: (clubId, requestId) => {
    return new Promise((resolve, reject) => {
      setTimeout(async () => {
        try {
          // İsteği bul ve güncelle
          const requests = JSON.parse(localStorage.getItem('membershipRequests') || '[]');
          const requestIndex = requests.findIndex(req => req.id === requestId && req.clubId === clubId);
          
          if (requestIndex === -1) {
            return reject({ message: 'İstek bulunamadı' });
          }
          
          const request = requests[requestIndex];
          request.status = 'APPROVED';
          request.updatedAt = new Date().toISOString();
          requests[requestIndex] = request;
          localStorage.setItem('membershipRequests', JSON.stringify(requests));
          
          // Kulübe üye ekle
          const clubs = JSON.parse(localStorage.getItem('clubs') || '[]');
          const clubIndex = clubs.findIndex(c => c.id === clubId);
          
          if (clubIndex === -1) {
            return reject({ message: 'Kulüp bulunamadı' });
          }
          
          if (!clubs[clubIndex].members) {
            clubs[clubIndex].members = [];
          }
          
          clubs[clubIndex].members.push({
            userId: request.userId,
            name: request.userName,
            role: 'MEMBER',
            joinDate: new Date().toISOString()
          });
          
          localStorage.setItem('clubs', JSON.stringify(clubs));
          
          // İstek sahibine bildirim gönder
          await notificationAPI.createNotification({
            title: 'Kulüp Üyelik İsteğiniz Onaylandı',
            message: `${clubs[clubIndex].name} kulübüne katılım isteğiniz onaylanmıştır.`,
            type: 'CLUB',
            entityId: clubId,
            userId: request.userId
          });
          
          resolve({ success: true });
        } catch (error) {
          reject({ message: 'İstek onaylanırken bir hata oluştu', error });
        }
      }, 300);
    });
  },
  
  /**
   * Üyelik isteğini reddeder
   * @param {string} clubId Kulüp ID'si
   * @param {string} requestId İstek ID'si
   * @returns {Promise} İşlem sonucunu içeren promise
   */
  rejectMembershipRequest: (clubId, requestId) => {
    return new Promise((resolve, reject) => {
      setTimeout(async () => {
        try {
          // İsteği bul ve güncelle
          const requests = JSON.parse(localStorage.getItem('membershipRequests') || '[]');
          const requestIndex = requests.findIndex(req => req.id === requestId && req.clubId === clubId);
          
          if (requestIndex === -1) {
            return reject({ message: 'İstek bulunamadı' });
          }
          
          const request = requests[requestIndex];
          request.status = 'REJECTED';
          request.updatedAt = new Date().toISOString();
          requests[requestIndex] = request;
          localStorage.setItem('membershipRequests', JSON.stringify(requests));
          
          // Kulübü bul
          const clubs = JSON.parse(localStorage.getItem('clubs') || '[]');
          const club = clubs.find(c => c.id === clubId);
          
          if (!club) {
            return reject({ message: 'Kulüp bulunamadı' });
          }
          
          // İstek sahibine bildirim gönder
          await notificationAPI.createNotification({
            title: 'Kulüp Üyelik İsteğiniz Reddedildi',
            message: `${club.name} kulübüne katılım isteğiniz reddedilmiştir.`,
            type: 'CLUB',
            entityId: clubId,
            userId: request.userId
          });
          
          resolve({ success: true });
        } catch (error) {
          reject({ message: 'İstek reddedilirken bir hata oluştu', error });
        }
      }, 300);
    });
  },
  
  /**
   * Kulüp üyesinin rolünü değiştirir
   * @param {string} clubId Kulüp ID'si
   * @param {string} userId Kullanıcı ID'si
   * @param {string} newRole Yeni rol
   * @returns {Promise} İşlem sonucunu içeren promise
   */
  changeMemberRole: (clubId, userId, newRole) => {
    return new Promise((resolve, reject) => {
      setTimeout(async () => {
        try {
          const clubs = JSON.parse(localStorage.getItem('clubs') || '[]');
          const clubIndex = clubs.findIndex(c => c.id === clubId);
          
          if (clubIndex === -1) {
            return reject({ message: 'Kulüp bulunamadı' });
          }
          
          const club = clubs[clubIndex];
          if (!club.members) {
            return reject({ message: 'Kulüp üyesi bulunamadı' });
          }
          
          const memberIndex = club.members.findIndex(m => m.userId === userId);
          if (memberIndex === -1) {
            return reject({ message: 'Kulüp üyesi bulunamadı' });
          }
          
          // Rolü güncelle
          club.members[memberIndex].role = newRole;
          club.members[memberIndex].lastUpdated = new Date().toISOString();
          clubs[clubIndex] = club;
          localStorage.setItem('clubs', JSON.stringify(clubs));
          
          // Kullanıcıya bildirim gönder
          await notificationAPI.createNotification({
            title: 'Kulüp Rolünüz Güncellendi',
            message: `${club.name} kulübündeki rolünüz ${newRole} olarak güncellenmiştir.`,
            type: 'CLUB',
            entityId: clubId,
            userId: userId
          });
          
          resolve({ success: true });
        } catch (error) {
          reject({ message: 'Rol değiştirilirken bir hata oluştu', error });
        }
      }, 300);
    });
  },
  
  /**
   * Kullanıcının kulüp üyeliğini kontrol eder
   * @param {string} clubId Kulüp ID'si
   * @returns {Promise} Üyelik durumunu içeren promise
   */
  checkMembership: (clubId) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        try {
          const currentUser = JSON.parse(localStorage.getItem('currentUser'));
          if (!currentUser) {
            return resolve({ 
              isMember: false, 
              isPending: false, 
              role: null 
            });
          }
          
          // Kulüp üyeliğini kontrol et
          const clubs = JSON.parse(localStorage.getItem('clubs') || '[]');
          const club = clubs.find(c => c.id === clubId);
          
          if (!club || !club.members) {
            // Üyelik isteklerini kontrol et
            const requests = JSON.parse(localStorage.getItem('membershipRequests') || '[]');
            const pendingRequest = requests.find(req => 
              req.clubId === clubId && 
              req.userId === currentUser.id &&
              req.status === 'PENDING'
            );
            
            return resolve({ 
              isMember: false, 
              isPending: !!pendingRequest,
              role: null,
              requestId: pendingRequest?.id
            });
          }
          
          const membership = club.members.find(m => m.userId === currentUser.id);
          
          if (!membership) {
            // Üyelik isteklerini kontrol et
            const requests = JSON.parse(localStorage.getItem('membershipRequests') || '[]');
            const pendingRequest = requests.find(req => 
              req.clubId === clubId && 
              req.userId === currentUser.id &&
              req.status === 'PENDING'
            );
            
            return resolve({ 
              isMember: false, 
              isPending: !!pendingRequest,
              role: null,
              requestId: pendingRequest?.id
            });
          }
          
          resolve({ 
            isMember: true, 
            isPending: false, 
            role: membership.role,
            joinDate: membership.joinDate
          });
        } catch (error) {
          console.error('Üyelik kontrolü yapılırken hata oluştu:', error);
          resolve({ 
            isMember: false, 
            isPending: false, 
            role: null,
            error: true
          });
        }
      }, 200);
    });
  },
  
  /**
   * Kulüpten ayrılır
   * @param {string} clubId Kulüp ID'si
   * @returns {Promise} İşlem sonucunu içeren promise
   */
  leaveClub: (clubId) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          const currentUser = JSON.parse(localStorage.getItem('currentUser'));
          if (!currentUser) {
            return reject({ message: 'Kullanıcı girişi yapılmamış' });
          }
          
          const clubs = JSON.parse(localStorage.getItem('clubs') || '[]');
          const clubIndex = clubs.findIndex(c => c.id === clubId);
          
          if (clubIndex === -1) {
            return reject({ message: 'Kulüp bulunamadı' });
          }
          
          // Başkanların ayrılmasına izin verme
          const club = clubs[clubIndex];
          if (club.presidentId === currentUser.id) {
            return reject({ message: 'Kulüp başkanı olarak kulüpten ayrılamazsınız' });
          }
          
          if (!club.members) {
            return reject({ message: 'Zaten bu kulübün üyesi değilsiniz' });
          }
          
          // Üyeyi kaldır
          club.members = club.members.filter(m => m.userId !== currentUser.id);
          clubs[clubIndex] = club;
          localStorage.setItem('clubs', JSON.stringify(clubs));
          
          resolve({ success: true });
        } catch (error) {
          reject({ message: 'Kulüpten ayrılırken bir hata oluştu', error });
        }
      }, 300);
    });
  }
};

export default membershipAPI; 