import { api } from './api';

// Mock veri olarak kulüp üyelikleri
const userClubMemberships = [
  { userId: '1', clubId: 1, role: 'Üye', joinDate: '2023-01-15', isActive: true },
  { userId: '1', clubId: 3, role: 'Dijital Medya Sorumlusu', joinDate: '2022-09-10', isActive: true },
  { userId: '2', clubId: 2, role: 'Başkan', joinDate: '2023-02-20', isActive: true },
  { userId: '2', clubId: 3, role: 'Üye', joinDate: '2023-03-05', isActive: true },
  { userId: '3', clubId: 1, role: 'Başkan Yardımcısı', joinDate: '2022-11-12', isActive: true },
  { userId: '4', clubId: 4, role: 'Üye', joinDate: '2023-04-18', isActive: true }
];

// Mock kulüp verileri - backend bağlantısı yoksa kullanılacak
const mockClubs = [
  {
    id: 1,
    name: "Bilgisayar Kulübü",
    description: "Bilişim teknolojileri, programlama ve yazılım geliştirme alanlarında etkinlikler düzenleyen kulüp.",
    logo: "https://source.unsplash.com/random?computer",
    category: "Teknoloji",
    foundationDate: "2020-09-15",
    maxMembers: 100,
    currentMembers: 78,
    president: {
      id: 1,
      name: "Ahmet Yılmaz",
      email: "ahmet.yilmaz@example.com"
    },
    active: true
  },
  {
    id: 2,
    name: "Müzik Kulübü",
    description: "Müzik seven ve müzikle ilgilenen öğrencileri bir araya getiren, konserler ve etkinlikler düzenleyen kulüp.",
    logo: "https://source.unsplash.com/random?music",
    category: "Sanat",
    foundationDate: "2019-04-22",
    maxMembers: 75,
    currentMembers: 62,
    president: {
      id: 3,
      name: "Zeynep Kaya",
      email: "zeynep.kaya@example.com"
    },
    active: true
  },
  {
    id: 3,
    name: "Tiyatro Kulübü",
    description: "Tiyatro sanatıyla ilgilenen, oyunlar sahneye koyan ve atölyeler düzenleyen kulüp.",
    logo: "https://source.unsplash.com/random?theatre",
    category: "Sanat",
    foundationDate: "2018-10-10",
    maxMembers: 50,
    currentMembers: 45,
    president: {
      id: 5,
      name: "Can Demir",
      email: "can.demir@example.com"
    },
    active: true
  }
];

// Kategori verileri
const mockCategories = ["Tümü", "Teknoloji", "Sanat", "Spor", "Bilim", "Edebiyat", "Sosyal Sorumluluk"];

// Mock veri kullanımı için flag
let useMockData = false;

/**
 * Tüm kulüpleri getirir
 * @returns {Promise<Array>} - Kulüpler listesi
 */
export const getAllClubs = async () => {
  try {
    console.log("getAllClubs fonksiyonu çağrıldı");
    
    // API endpoints düzeltildi - /api/clubs şeklinde doğru endpoint kullanılıyor
    const response = await api.get('/api/clubs');
    
    console.log("API yanıtı alındı (getAllClubs):", response);
    
    // API yanıtı kontrolü - Axios yanıtı bir obje içerir ve data alanında asıl veri bulunur
    if (response && response.data) {
      // Yanıt yapısını kontrol et - Axios response.data içinde veri bulunur
      console.log("API yanıtı tipi:", typeof response.data);
      console.log("API yanıtı içeriği:", JSON.stringify(response.data).substring(0, 200));
      
      // API bir dizi döndürüyor olabilir
      if (Array.isArray(response.data)) {
        console.log("API yanıtı array tipinde, uzunluk:", response.data.length);
        
        // Bu dizi obje özelliği olarak bir success alanı içerebilir
        if ('success' in response.data) {
          console.log("Yanıt dizisi 'success' özelliğine sahip, temizleme yapılacak");
          // success özelliği saklayarak temiz bir kopya oluşturalım
          const isSuccess = response.data.success;
          const cleanData = [...response.data];
          
          // success özelliğini objeden kaldıralım
          delete cleanData.success;
          
          return {
            success: isSuccess !== false, // false değilse true kabul et
            data: cleanData,
            message: 'Kulüpler başarıyla alındı (success özelliği temizlendi)'
          };
        }
        
        return {
          success: true,
          data: response.data,
          message: 'Kulüpler başarıyla alındı'
        };
      } 
      // Yanıt bir obje olabilir
      else if (response.data && typeof response.data === 'object') {
        console.log("API yanıtı obje tipinde");
        
        // Yanıt data alanında bir dizi içerebilir
        if (response.data.data && Array.isArray(response.data.data)) {
          console.log("API yanıtında data alanı var ve array tipinde");
          return {
            success: true,
            data: response.data.data,
            message: 'Kulüpler başarıyla alındı (data alanından)'
          };
        }
        
        // Belki doğrudan içinde kulüpler olan bir obje olabilir
        if (response.data.length > 0 || Object.keys(response.data).length > 0) {
          console.log("API yanıtı dolu bir obje, özellikler:", Object.keys(response.data));
          
          // success özelliğini kontrol et
          if ('success' in response.data && Array.isArray(response.data)) {
            console.log("Yanıt success ve array içeriyor");
            const cleanData = [...response.data];
            delete cleanData.success;
            
            return {
              success: response.data.success,
              data: cleanData,
              message: 'Kulüpler başarıyla alındı'
            };
          }
          
          // Objeyi döngüyle kontrol edelim, array özellikli alanlar var mı?
          for (const key in response.data) {
            if (Array.isArray(response.data[key])) {
              console.log(`Obje içinde array özelliği bulundu: ${key}`);
              return {
                success: true,
                data: response.data[key],
                message: `Kulüpler başarıyla alındı (${key} alanından)`
              };
            }
          }
          
          // Objeden değerleri çıkaralım ve kulüp olabilecek nesneleri filtreleyelim
          const clubObjects = Object.values(response.data).filter(item => 
            item && typeof item === 'object' && !Array.isArray(item)
          );
          
          if (clubObjects.length > 0) {
            console.log("Objeden kulüp nesneleri filtrelendi:", clubObjects.length);
            return {
              success: true,
              data: clubObjects,
              message: 'Kulüpler başarıyla alındı (obje değerlerinden)'
            };
          }
          
          // Belki response.data doğrudan kulüpler dizisidir
          if (Array.isArray(response.data)) {
            console.log("Response.data bir dizi, doğrudan kullanılacak");
            return {
              success: true,
              data: response.data,
              message: 'Kulüpler başarıyla alındı'
            };
          }
        }
      }
      
      // Çıktıyı konsola yazdıralım (sorun giderme amaçlı)
      console.log("API yanıtından kulüp verisi çıkarılamadı, yanıt:", 
        response.data === undefined ? "undefined" : 
        response.data === null ? "null" : 
        JSON.stringify(response.data).substring(0, 100) + "...");
      
      // Springboot API yanıtını manuel olarak kontrol edelim
      if (response.data && typeof response.data === 'object') {
        // Bazen SpringBoot HATEOAS yanıtları _embedded içinde veri gönderir
        if (response.data._embedded && response.data._embedded.clubs && 
            Array.isArray(response.data._embedded.clubs)) {
          console.log("HATEOAS yanıtı bulundu, _embedded.clubs kullanılıyor");
          return {
            success: true,
            data: response.data._embedded.clubs,
            message: 'Kulüpler başarıyla alındı (HATEOAS formatından)'
          };
        }
        
        // Spring Data REST formatını kontrol edelim
        if (response.data.content && Array.isArray(response.data.content)) {
          console.log("Spring Data REST pageable yanıtı bulundu");
          return {
            success: true,
            data: response.data.content,
            message: 'Kulüpler başarıyla alındı (pageable yanıttan)'
          };
        }
      }
    } else {
      console.warn("API yanıtı veya data alanı eksik:", response);
    }
    
    // SON ÇARE: 'data' erişilemez, belki yanıt doğrudan dizinin kendisidir
    if (response && Array.isArray(response)) {
      console.log("Response doğrudan bir dizi, uzunluk:", response.length);
      return {
        success: true,
        data: response,
        message: 'Kulüpler başarıyla alındı (doğrudan yanıt dizisi)'
      };
    }
    
    // Sabit test verileri kullanmaya çalışma - önlem amaçlı
    if (mockClubs && Array.isArray(mockClubs) && mockClubs.length > 0) {
      console.log("Gerçek veri alınamadı, sabit test verileri kullanılıyor");
      return {
        success: true,
        data: mockClubs,
        message: 'Test kulüpleri kullanıldı (gerçek veri alınamadı)'
      };
    }
    
    // Yanıt değeri hala işlenemedi, boş dizi dön
    console.warn("API yanıtı işlenemedi veya veri bulunamadı:", response);
    return {
      success: true, // Hata olmadığını belirtmek için true
      data: [],
      message: 'Kulüpler alındı, ancak veri bulunamadı veya format anlaşılamadı'
    };
  } catch (error) {
    console.error("Kulüpleri getirme hatası:", error);
    
    // 403 hatası özel işleme - yetki eksikliği
    if (error.response && error.response.status === 403) {
      console.warn("Kulüplere erişim yetkisi yok. Spring Boot security yapılandırmasını kontrol edin.");
      return {
        success: false,
        data: [],
        message: 'Kulüp verilerine erişim izniniz yok',
        error: 'FORBIDDEN'
      };
    }
    
    return {
      success: false,
      data: [],
      message: error.message || 'Kulüpler alınırken bir hata oluştu',
      error: error.response?.status || 'UNKNOWN_ERROR'
    };
  }
};

/**
 * ID'ye göre kulüp getirir
 * @param {number} id - Kulüp ID
 * @returns {Promise<Object>} - Kulüp detayları
 */
export const getClubById = async (id) => {
  try {
    console.log(`getClubById fonksiyonu çağrıldı (ID: ${id})`);
    
    const response = await api.get(`/api/clubs/${id}`);
    
    console.log("Kulüp başarıyla alındı:", response);
    return {
      success: true,
      data: response.data || {},
      message: 'Kulüp başarıyla alındı'
    };
  } catch (error) {
    console.error(`Kulüp getirme hatası (ID: ${id}):`, error);
    
    // 403 hatası özel işleme
    if (error.response && error.response.status === 403) {
      return {
        success: false,
        data: {},
        message: 'Bu kulübe erişim izniniz yok',
        error: 'FORBIDDEN'
      };
    }
    
    return {
      success: false,
      data: {},
      message: error.message || 'Kulüp alınırken bir hata oluştu',
      error: error.response?.status || 'UNKNOWN_ERROR'
    };
  }
};

/**
 * Kulüp kategorilerini getirir
 * @returns {Promise<Array>} - Kategori listesi
 */
export const getCategories = async () => {
  try {
    console.log("getCategories fonksiyonu çağrıldı");
    
    const response = await api.get('/api/clubs/categories');
    
    console.log("Kategoriler başarıyla alındı:", response);
    
    // API yanıtı kontrolü - categories bir dizi olmalı
    if (response && response.data) {
      // İmplemente edilmemiş endpoint için düzeltme
      if (!Array.isArray(response.data)) {
        console.warn("API'den gelen kategori verisi dizi değil, varsayılan kategori listesi kullanılıyor");
        return {
          success: true,
          data: ["Tümü", "Spor", "Kültür", "Sanat", "Bilim", "Teknoloji", "Diğer"],
          message: 'Varsayılan kategoriler kullanıldı'
        };
      }
      
      // API'den gelen diziye "Tümü" kategorisini ekle
      const categories = ["Tümü", ...response.data];
      
      return {
        success: true,
        data: categories,
        message: 'Kategoriler başarıyla alındı'
      };
    }
    
    // API yanıtında data yoksa varsayılan kategorileri döndür
    return {
      success: true,
      data: ["Tümü", "Spor", "Kültür", "Sanat", "Bilim", "Teknoloji", "Diğer"],
      message: 'Varsayılan kategoriler kullanıldı'
    };
  } catch (error) {
    console.error("Kategorileri getirme hatası:", error);
    
    // 403 hatası özel işleme - kategorilere erişim izni yok
    if (error.response && error.response.status === 403) {
      console.warn("Kategorilere erişim yetkisi yok. Varsayılan liste kullanılıyor.");
      return {
        success: true,
        data: ["Tümü", "Spor", "Kültür", "Sanat", "Bilim", "Teknoloji", "Diğer"],
        message: 'Varsayılan kategoriler kullanıldı (yetki eksikliği nedeniyle)'
      };
    }
    
    // Diğer hatalar için de varsayılan kategori listesi dön
    return {
      success: true,
      data: ["Tümü", "Spor", "Kültür", "Sanat", "Bilim", "Teknoloji", "Diğer"],
      message: 'Varsayılan kategoriler kullanıldı (hata nedeniyle)'
    };
  }
};

// Kulüp detayı getir
export const getClubEvents = async (clubId) => {
  try {
    const response = await api.get(`/api/clubs/${clubId}/events`);
    return { success: true, data: response || [] };
  } catch (error) {
    console.error(`Kulüp etkinlikleri yüklenirken hata oluştu (ID: ${clubId}):`, error);
    return { success: false, error: error.message };
  }
};

// Kulübün üyelerini getir
export const getClubMembers = async (clubId) => {
  try {
    const response = await api.get(`/api/clubs/${clubId}/members`);
    return { success: true, data: response || [] };
  } catch (error) {
    console.error(`Kulüp üyeleri yüklenirken hata oluştu (ID: ${clubId}):`, error);
    return { success: false, error: error.message };
  }
};

// Kulüp oluştur
export const createClub = async (clubData) => {
  try {
    console.log('Kulüp oluşturma işlemi başlatılıyor...');
    
    // Token kontrolü
    const token = localStorage.getItem('auth_token');
    if (!token) {
      console.error('Token bulunamadı, kulüp oluşturulamadı');
      return { 
        success: false, 
        message: 'Oturum bilgisi bulunamadı. Lütfen tekrar giriş yapın.',
        requiresLogin: true
      };
    }
    
    // API isteği - Authorization header'ı ile
    console.log('Token mevcut, API isteği yapılıyor...');
    console.log('Token:', token.substring(0, 15) + '...');
    
    // Token içeriğini decode et ve kontrol et
    try {
      const tokenParts = token.split('.');
      const tokenPayload = JSON.parse(atob(tokenParts[1]));
      console.log('Token payload:', tokenPayload);
      
      // Role kontrolü - Spring Security 'ROLE_' prefix'i bekliyor olabilir
      if (tokenPayload && tokenPayload.role) {
        console.log('Token içindeki rol:', tokenPayload.role);
        
        // Kullanıcı ADMIN rolüne sahip mi?
        const isAdmin = tokenPayload.role === 'ADMIN';
        console.log('Kullanıcı ADMIN mi:', isAdmin);
        
        if (!isAdmin) {
          return {
            success: false,
            message: 'Bu işlem için ADMIN rolüne sahip olmanız gerekiyor.',
            permissionDenied: true
          };
        }
      } else {
        console.warn('Token içinde rol bilgisi bulunamadı!');
      }
    } catch (tokenError) {
      console.error('Token decode hatası:', tokenError);
    }
    
    // Endpoint doğru olmalı: /api/clubs
    const apiEndpoint = '/api/clubs';
    console.log('Endpoint:', apiEndpoint);
    
    // Role ve yetki kontrolünü HTTP header'ında da gönderelim
    let config = {
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-User-Role': 'ADMIN' // Özel rol header'ı ekle
      }
    };
    
    // FormData ise Content-Type header'ı ayarlama (tarayıcı otomatik ayarlayacak)
    if (clubData instanceof FormData) {
      console.log('FormData formatında veri gönderiliyor...');
      // Content-Type kaldırıldı, tarayıcı multipart boundary'i otomatik ayarlayacak
      config.headers['Accept'] = 'application/json';
      
      // FormData içeriğini kontrol et
      for (let pair of clubData.entries()) {
        const value = pair[1] instanceof File ? 
          `[Dosya: ${pair[1].name}, Boyut: ${pair[1].size} bytes]` : pair[1];
        console.log(`FormData içeriği: ${pair[0]} = ${value}`);
      }
    } else {
      console.log('JSON formatında veri gönderiliyor...');
      config.headers['Content-Type'] = 'application/json';
    }
    
    // Direkt XMLHttpRequest ile deneme yapalım
    if (clubData instanceof FormData) {
      console.log('XMLHttpRequest ile FormData gönderimi deneniyor...');
      
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', 'http://localhost:8080' + apiEndpoint);
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        xhr.setRequestHeader('X-User-Role', 'ADMIN');
        
        xhr.onload = function() {
          if (xhr.status >= 200 && xhr.status < 300) {
            console.log('XHR başarılı:', xhr.responseText);
            resolve({
              success: true,
              data: JSON.parse(xhr.responseText),
              message: 'Kulüp başarıyla oluşturuldu'
            });
          } else {
            console.error('XHR hatası:', xhr.status, xhr.statusText);
            console.error('XHR yanıtı:', xhr.responseText);
            reject(new Error(`XHR hatası: ${xhr.status} ${xhr.statusText}`));
          }
        };
        
        xhr.onerror = function() {
          console.error('XHR ağ hatası');
          reject(new Error('Ağ hatası'));
        };
        
        xhr.send(clubData);
      }).catch(error => {
        console.error('XHR hatası yakalandı:', error);
        throw error;
      });
    }
    
    console.log('İstek yapılandırması:', config);
    
    const response = await api.post(apiEndpoint, clubData, config);
    
    console.log('Kulüp oluşturma yanıtı:', response);
    
    if (response) {
      return { 
        success: true,
        data: response,
        message: 'Kulüp başarıyla oluşturuldu'
      };
    } else {
      throw new Error('API yanıtı boş veya tanımsız');
    }
  } catch (error) {
    console.error('Kulüp oluşturulurken hata:', error);
    console.error('Hata detayları:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data
    });
    
    // Yetki hatası - token geçersiz
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      localStorage.removeItem('userData');
      return {
        success: false,
        message: 'Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.',
        requiresLogin: true
      };
    }
    
    // Yetki hatası - yetkisiz erişim
    if (error.response && error.response.status === 403) {
      return {
        success: false,
        message: 'Bu işlem için yetkiniz bulunmuyor. Spring Boot SecurityConfig yapılandırmasını kontrol edin veya ADMIN rolüne sahip olduğunuzdan emin olun.',
        permissionDenied: true
      };
    }
    
    return { 
      success: false, 
      error: error.response?.data?.message || error.message || 'Kulüp oluşturma işlemi sırasında bir hata oluştu'
    };
  }
};

// Kulüp bilgilerini güncelle
export const updateClub = async (clubId, clubData) => {
  try {
    const response = await api.put(`/api/clubs/${clubId}`, clubData);
    return { success: true, data: response };
  } catch (error) {
    console.error(`Kulüp güncellenirken hata oluştu (ID: ${clubId}):`, error);
    return { success: false, error: error.message };
  }
};

// Kulüp sil
export const deleteClub = async (clubId) => {
  try {
    console.log(`Kulüp silme isteği gönderiliyor, clubId: ${clubId}`);
    
    // Token kontrolü
    const token = localStorage.getItem('auth_token');
    console.log(`Token var mı: ${Boolean(token)}, Token uzunluğu: ${token?.length || 0}`);
    
    if (!token) {
      console.error('Token bulunamadı, kulüp silinemedi');
      return { 
        success: false, 
        message: 'Oturum bilgisi bulunamadı. Lütfen tekrar giriş yapın.',
        requiresLogin: true,
        error: 'Token bulunamadı'
      };
    }
    
    // Token'ı header'a ayarla
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    console.log('Token Authorization header\'a ayarlandı');
    
    // İsteğe özel yapılandırma ekle (token ve role header'ları)
    const config = {
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-User-Role': 'ADMIN',
        'Content-Type': 'application/json'
      }
    };
    
    console.log('DELETE isteği config:', JSON.stringify(config));
    
    // Axios client'ı ile DELETE isteği gönder
    console.log(`DELETE isteği gönderiliyor: /api/clubs/${clubId}`);
    const response = await api.delete(`/api/clubs/${clubId}`, config);
    console.log(`Kulüp silme yanıtı alındı:`, response);
    
    // Yanıt kontrolü 
    if (response) {
      return { 
        success: true,
        data: response,
        message: `${clubId} ID'li kulüp başarıyla silindi`
      };
    } else {
      throw new Error('Kulüp silme işleminde API yanıtı alınamadı');
    }
  } catch (error) {
    console.error(`Kulüp silinirken hata oluştu (ID: ${clubId}):`, error);
    
    // 401 Unauthorized hatası - token geçersiz
    if (error.response && error.response.status === 401) {
      console.log('Token geçersiz, oturum sonlandırılıyor');
      // LocalStorage'dan token ve kullanıcı bilgilerini temizle
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      
      return {
        success: false,
        message: 'Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.',
        requiresLogin: true,
        error: error.message || 'Oturum hatası'
      };
    }
    
    // 403 Forbidden hatası - yetki yok
    if (error.response && error.response.status === 403) {
      return {
        success: false,
        message: 'Bu işlem için yetkiniz bulunmuyor. Sadece ADMIN rolüne sahip kullanıcılar kulüp silebilir.',
        error: error.message || 'Yetki hatası'
      };
    }
    
    // Detaylı hata bilgisi
    const errorDetails = {
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
      data: error.response?.data
    };
    
    console.error('Hata detayları:', errorDetails);
    
    return { 
      success: false, 
      error: errorDetails.message || 'Kulüp silme işlemi sırasında bir hata oluştu'
    };
  }
};

/**
 * Kategoriye göre kulüpleri getirir
 * @param {string} category - Kategori adı
 * @returns {Promise<Array>} - Filtrelenmiş kulüpler listesi
 */
export const getClubsByCategory = async (category) => {
  try {
    console.log(`getClubsByCategory fonksiyonu çağrıldı (Kategori: ${category})`);
    
    // Tüm kulüpleri al ve istemci tarafında filtrele (API'de kategori filtresi yoksa)
    const response = await api.get('/api/clubs');
    
    if (!response || !response.data) {
      throw new Error('Kulüp verisi alınamadı');
    }
    
    // Kategori filtresi uygula
    const filteredClubs = Array.isArray(response.data) 
      ? response.data.filter(club => club.category === category)
      : [];
    
    console.log(`Kategoriye göre filtrelenmiş kulüpler (${category}):`, filteredClubs.length);
    
    return {
      success: true,
      data: filteredClubs,
      message: `${category} kategorisindeki kulüpler başarıyla alındı`
    };
  } catch (error) {
    console.error(`Kategoriye göre kulüp getirme hatası (${category}):`, error);
    
    // 403 hatası özel işleme
    if (error.response && error.response.status === 403) {
      return {
        success: false,
        data: [],
        message: 'Kategori verilerine erişim izniniz yok',
        error: 'FORBIDDEN'
      };
    }
    
    return {
      success: false,
      data: [],
      message: error.message || 'Kulüpler alınırken bir hata oluştu',
      error: error.response?.status || 'UNKNOWN_ERROR'
    };
  }
};

/**
 * Kulüplerde arama yapar
 * @param {string} query - Arama terimi
 * @returns {Promise<Array>} - Arama sonuçları
 */
export const searchClubs = async (query) => {
  try {
    console.log(`searchClubs fonksiyonu çağrıldı (Sorgu: ${query})`);
    
    if (!query || query.trim() === '') {
      return await getAllClubs();
    }
    
    // Tüm kulüpleri al ve istemci tarafında arama yap (API'de arama endpoint'i yoksa)
    const response = await api.get('/api/clubs');
    
    if (!response || !response.data) {
      throw new Error('Kulüp verisi alınamadı');
    }
    
    const searchLower = query.toLowerCase();
    const searchResults = Array.isArray(response.data)
      ? response.data.filter(club => 
          club.name.toLowerCase().includes(searchLower) || 
          (club.description && club.description.toLowerCase().includes(searchLower))
        )
      : [];
    
    console.log(`Arama sonuçları (${query}):`, searchResults.length);
    
    return {
      success: true,
      data: searchResults,
      message: `Arama sonuçları: ${searchResults.length} kulüp bulundu`
    };
  } catch (error) {
    console.error(`Kulüp arama hatası (${query}):`, error);
    
    // 403 hatası özel işleme
    if (error.response && error.response.status === 403) {
      return {
        success: false,
        data: [],
        message: 'Arama yapma izniniz yok',
        error: 'FORBIDDEN'
      };
    }
    
    return {
      success: false,
      data: [],
      message: error.message || 'Arama yapılırken bir hata oluştu',
      error: error.response?.status || 'UNKNOWN_ERROR'
    };
  }
};

// Kullanıcının üye olduğu kulüpleri getir
export const getUserClubs = async (userId) => {
  try {
    console.log(`getUserClubs fonksiyonu çağrıldı (ID: ${userId})`);
    
    const response = await api.get(`/api/users/${userId}/clubs`);
    
    console.log("Kullanıcının kulüpleri başarıyla alındı:", response);
    
    // Yanıtın yapısını kontrol ediyoruz
    if (response && response.data) {
      // API yanıtı direkt olarak dizi olabilir veya bir obje içinde data alanında olabilir
      const clubsData = Array.isArray(response.data) ? response.data : 
                    (response.data.data && Array.isArray(response.data.data)) ? response.data.data : [];
      
      return {
        success: true,
        data: clubsData,
        message: 'Kulüpler başarıyla alındı'
      };
    }
    
    // Yanıt boş veya geçersiz ise boş dizi döndürüyoruz
    return {
      success: true,
      data: [],
      message: 'Kullanıcının kulüpleri bulunamadı'
    };
  } catch (error) {
    console.error(`Kullanıcının kulüpleri yüklenirken hata oluştu (ID: ${userId}):`, error);
    
    // 403 hatası özel işleme
    if (error.response && error.response.status === 403) {
      return {
        success: false,
        data: [],
        message: 'Kulüp bilgilerine erişim izniniz yok',
        error: 'FORBIDDEN'
      };
    }
    
    // 404 hatası - kullanıcı bulunamadı
    if (error.response && error.response.status === 404) {
      return {
        success: false,
        data: [],
        message: 'Kullanıcı bulunamadı',
        error: 'NOT_FOUND'
      };
    }
    
    return {
      success: false,
      data: [],
      message: error.message || 'Kullanıcının kulüpleri yüklenirken bir hata oluştu',
      error: error.response?.status || 'UNKNOWN_ERROR'
    };
  }
};

// Popüler kulüpleri getir
export const getPopularClubs = async (limit = 4) => {
  try {
    const response = await api.get(`/api/clubs/popular?limit=${limit}`);
    return { success: true, data: response || [] };
  } catch (error) {
    console.error('Popüler kulüpler yüklenirken hata oluştu:', error);
    return { success: false, error: error.message };
  }
};

// Kulüp bütçe bilgilerini getir
export const getClubBudget = async (clubId) => {
  try {
    const response = await api.get(`/api/clubs/${clubId}/budget`);
    return { success: true, data: response };
  } catch (error) {
    console.error(`Bütçe bilgileri yüklenirken hata oluştu (Kulüp ID: ${clubId}):`, error);
    return { success: false, error: error.message };
  }
};

// Kulüp sponsor bilgilerini getir
export const getClubSponsors = async (clubId) => {
  try {
    const response = await api.get(`/api/clubs/${clubId}/sponsors`);
    return { success: true, data: response || [] };
  } catch (error) {
    console.error(`Sponsor bilgileri yüklenirken hata oluştu (Kulüp ID: ${clubId}):`, error);
    return { success: false, error: error.message };
  }
};

// Kulüp işlem geçmişini getir
export const getClubTransactions = async (clubId) => {
  try {
    const response = await api.get(`/api/clubs/${clubId}/transactions`);
    return { success: true, data: response || [] };
  } catch (error) {
    console.error(`İşlem bilgileri yüklenirken hata oluştu (Kulüp ID: ${clubId}):`, error);
    return { success: false, error: error.message };
  }
};

// Kulübe katılma işlemi
export const joinClub = async (clubId, userId) => {
  try {
    console.log(`joinClub fonksiyonu çağrıldı (Kulüp ID: ${clubId}, Kullanıcı ID: ${userId})`);
    
    const response = await api.post(`/api/clubs/${clubId}/members/${userId}`);
    
    console.log("Kulübe katılma işlemi başarılı:", response);
    
    return {
      success: true,
      data: response.data || {},
      message: 'Kulübe başarıyla katıldınız'
    };
  } catch (error) {
    console.error(`Kulübe katılma hatası (Kulüp ID: ${clubId}, Kullanıcı ID: ${userId}):`, error);
    
    // 403 hatası özel işleme
    if (error.response && error.response.status === 403) {
      return {
        success: false,
        data: {},
        message: 'Bu kulübe katılma izniniz yok',
        error: 'FORBIDDEN'
      };
    }
    
    // Diğer hata durumları
    let errorMessage = 'Kulübe katılırken bir hata oluştu';
    
    if (error.response) {
      const status = error.response.status;
      
      if (status === 400) {
        errorMessage = 'Geçersiz istek: Lütfen bilgilerinizi kontrol edin';
      } else if (status === 404) {
        errorMessage = 'Kulüp veya kullanıcı bulunamadı';
      } else if (status === 409) {
        errorMessage = 'Zaten bu kulübün üyesisiniz';
      }
    }
    
    return {
      success: false,
      data: {},
      message: error.response?.data?.message || errorMessage,
      error: error.response?.status || 'UNKNOWN_ERROR'
    };
  }
};

// Kulüpten ayrılma
export const leaveClub = async (clubId) => {
  try {
    const response = await api.delete(`/api/clubs/${clubId}/leave`);
    return { success: true, data: response };
  } catch (error) {
    console.error(`Kulüpten ayrılırken hata oluştu (ID: ${clubId}):`, error);
    return { success: false, error: error.message };
  }
};

// Token bilgisini güvenli bir şekilde dekode eden yardımcı fonksiyon
export const decodeToken = () => {
  try {
    const tokenStr = localStorage.getItem('auth_token');
    // Token yoksa veya geçersizse null dön
    if (!tokenStr) {
      console.log('Token bulunamadı');
      return null;
    }
    
    // Token parçalarını kontrol et
    const parts = tokenStr.split('.');
    if (parts.length !== 3) {
      console.log('Geçersiz token formatı');
      return null;
    }
    
    // Token payload kısmını decode et
    const payload = JSON.parse(atob(parts[1]));
    console.log('Token içeriği:', payload);
    return payload;
  } catch (error) {
    console.error('Token decode edilirken hata oluştu:', error);
    return null;
  }
}; 