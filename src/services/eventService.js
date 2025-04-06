import { api } from './api';

// Mock etkinlik verileri
const events = [
  {
    id: 1,
    title: 'Yapay Zeka Semineri',
    description: 'Yapay zekanın geleceği ve günümüzdeki uygulamaları hakkında kapsamlı bir seminer.',
    startDate: '2025-04-15T14:00:00',
    endDate: '2025-04-15T17:00:00',
    location: 'Ana Konferans Salonu',
    venueId: 1,
    organizerId: 1,
    clubId: 1,
    club: 'Bilgisayar Kulübü',
    imageUrl: 'https://source.unsplash.com/random?ai',
    category: 'Teknoloji',
    capacity: 300,
    registeredParticipants: 210,
    isPublic: true,
    status: 'UPCOMING',
    ticketPrice: 0,
    featured: true,
    participants: [1, 2, 3, 15, 22, 34, 45],
    speakers: [
      { name: 'Prof. Dr. Ahmet Yıldız', role: 'Yapay Zeka Uzmanı', bio: 'XYZ Üniversitesi Bilgisayar Mühendisliği Bölümü Öğretim Üyesi', image: 'https://source.unsplash.com/random?professor' }
    ],
    tags: ['yapay zeka', 'machine learning', 'teknoloji']
  },
  {
    id: 2,
    title: 'Kariyer Günleri',
    description: 'Farklı sektörlerden profesyonellerin katılımıyla düzenlenecek kariyer günleri etkinliği.',
    startDate: '2025-05-10T10:00:00',
    endDate: '2025-05-11T17:00:00',
    location: 'Çok Amaçlı Etkinlik Salonu',
    venueId: 4,
    organizerId: 2,
    clubId: 6,
    club: 'Kişisel Gelişim Kulübü',
    imageUrl: 'https://source.unsplash.com/random?career',
    category: 'Kariyer',
    capacity: 200,
    registeredParticipants: 150,
    isPublic: true,
    status: 'UPCOMING',
    ticketPrice: 0,
    featured: true,
    participants: [5, 7, 8, 12, 20],
    speakers: [
      { name: 'Mehmet Kaya', role: 'İnsan Kaynakları Direktörü', bio: 'ABC Şirketi İK Direktörü', image: 'https://source.unsplash.com/random?businessman' },
      { name: 'Ayşe Demir', role: 'Girişimci', bio: 'XYZ Startup Kurucusu', image: 'https://source.unsplash.com/random?businesswoman' }
    ],
    tags: ['kariyer', 'iş hayatı', 'profesyonel gelişim']
  },
  {
    id: 3,
    title: 'Resim Sergisi',
    description: 'Güzel Sanatlar Fakültesi öğrencilerinin eserlerinden oluşan karma resim sergisi.',
    startDate: '2025-04-05T13:00:00',
    endDate: '2025-04-12T19:00:00',
    location: 'Sergi Salonu',
    organizerId: 3,
    clubId: 2,
    club: 'Sanat Kulübü',
    imageUrl: 'https://source.unsplash.com/random?painting',
    category: 'Sanat',
    capacity: 100,
    registeredParticipants: 65,
    isPublic: true,
    status: 'ONGOING',
    ticketPrice: 0,
    featured: false,
    participants: [3, 6, 9, 14, 19],
    tags: ['sanat', 'resim', 'sergi']
  },
  {
    id: 4,
    title: 'Web Geliştirme Workshop',
    description: 'Modern web teknolojileri ve en iyi uygulamalar hakkında uygulamalı bir atölye çalışması.',
    startDate: '2025-04-22T15:00:00',
    endDate: '2025-04-22T18:00:00',
    location: 'Bilgisayar Laboratuvarı',
    venueId: 3,
    organizerId: 1,
    clubId: 1,
    club: 'Bilgisayar Kulübü',
    imageUrl: 'https://source.unsplash.com/random?webdevelopment',
    category: 'Teknoloji',
    capacity: 30,
    registeredParticipants: 28,
    isPublic: true,
    status: 'UPCOMING',
    ticketPrice: 0,
    featured: false,
    participants: [1, 4, 11, 16, 28],
    speakers: [
      { name: 'Ali Can', role: 'Front-end Geliştirici', bio: 'XYZ Teknoloji Şirketi', image: 'https://source.unsplash.com/random?developer' }
    ],
    tags: ['web', 'javascript', 'html', 'css', 'coding']
  },
  {
    id: 5,
    title: 'Bahar Şenliği',
    description: 'Geleneksel bahar şenliği kapsamında konserler, oyunlar ve çeşitli etkinlikler.',
    startDate: '2025-05-15T10:00:00',
    endDate: '2025-05-17T22:00:00',
    location: 'Kampüs Meydanı',
    organizerId: 4,
    clubId: 4,
    club: 'Sosyal Faaliyet Kulübü',
    imageUrl: 'https://source.unsplash.com/random?festival',
    category: 'Sosyal',
    capacity: 1000,
    registeredParticipants: 650,
    isPublic: true,
    status: 'UPCOMING',
    ticketPrice: 0,
    featured: true,
    participants: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    tags: ['şenlik', 'konser', 'eğlence']
  },
  {
    id: 6,
    title: 'Edebiyat Söyleşisi',
    description: 'Ünlü yazarlarla edebiyat, yaratıcı yazarlık ve kitaplar üzerine söyleşi.',
    startDate: '2025-04-18T16:00:00',
    endDate: '2025-04-18T18:00:00',
    location: 'Kütüphane Konferans Salonu',
    organizerId: 5,
    clubId: 5,
    club: 'Kütüphane Kulübü',
    imageUrl: 'https://source.unsplash.com/random?literature',
    category: 'Kültür',
    capacity: 75,
    registeredParticipants: 45,
    isPublic: true,
    status: 'UPCOMING',
    ticketPrice: 0,
    featured: false,
    participants: [2, 7, 13, 21, 25],
    speakers: [
      { name: 'Zeynep Yılmaz', role: 'Yazar', bio: 'Çok satan 5 kitabın yazarı', image: 'https://source.unsplash.com/random?writer' }
    ],
    tags: ['edebiyat', 'kitap', 'yazarlık']
  }
];

// Mock kategori verileri
const categories = [
  'Tümü', 'Teknoloji', 'Sanat', 'Kültür', 'Spor', 'Sosyal', 'Eğitim', 'Bilim', 'Kariyer', 'Müzik'
];

// Mock bekleme listesi
const waitingList = [
  { eventId: 4, userId: 30, registrationDate: '2025-04-10T09:25:00' },
  { eventId: 4, userId: 31, registrationDate: '2025-04-10T10:15:30' },
  { eventId: 1, userId: 50, registrationDate: '2025-04-11T14:20:45' },
  { eventId: 1, userId: 51, registrationDate: '2025-04-11T16:05:10' }
];

// Tüm etkinlikleri getir
export const getAllEvents = async (filters = {}) => {
  try {
    let filteredEvents = [...events];
    
    // Filtreleme işlemlerini uygula
    if (filters.category && filters.category !== 'Tümü') {
      filteredEvents = filteredEvents.filter(event => event.category === filters.category);
    }
    
    if (filters.status) {
      filteredEvents = filteredEvents.filter(event => event.status === filters.status);
    }
    
    if (filters.clubId) {
      filteredEvents = filteredEvents.filter(event => event.clubId === parseInt(filters.clubId));
    }
    
    if (filters.search) {
      const searchText = filters.search.toLowerCase();
      filteredEvents = filteredEvents.filter(event => 
        event.title.toLowerCase().includes(searchText) ||
        event.description.toLowerCase().includes(searchText) ||
        (event.club && event.club.toLowerCase().includes(searchText))
      );
    }
    
    return filteredEvents;
  } catch (error) {
    console.error('Etkinlikler yüklenirken hata oluştu:', error);
    return [];
  }
};

// ID'ye göre etkinlik detaylarını getir
export const getEventById = async (eventId) => {
  try {
    const event = events.find(e => e.id === parseInt(eventId));
    return event || null;
  } catch (error) {
    console.error(`Etkinlik detayları yüklenirken hata oluştu (ID: ${eventId}):`, error);
    return null;
  }
};

// Yeni etkinlik oluştur
export const createEvent = async (eventData) => {
  try {
    const newId = Math.max(...events.map(e => e.id)) + 1;
    const newEvent = { 
      ...eventData, 
      id: newId,
      registeredParticipants: 0,
      participants: [],
      status: 'UPCOMING' 
    };
    
    events.push(newEvent);
    return newEvent;
  } catch (error) {
    console.error('Etkinlik oluşturulurken hata oluştu:', error);
    throw new Error('Etkinlik oluşturulamadı');
  }
};

// Etkinlik bilgilerini güncelle
export const updateEvent = async (eventId, eventData) => {
  try {
    const index = events.findIndex(e => e.id === parseInt(eventId));
    if (index === -1) {
      throw new Error(`Etkinlik bulunamadı: ${eventId}`);
    }
    
    events[index] = { ...events[index], ...eventData };
    return events[index];
  } catch (error) {
    console.error(`Etkinlik güncellenirken hata oluştu (ID: ${eventId}):`, error);
    throw new Error('Etkinlik güncellenemedi');
  }
};

// Etkinlik sil
export const deleteEvent = async (eventId) => {
  try {
    const index = events.findIndex(e => e.id === parseInt(eventId));
    if (index === -1) {
      throw new Error(`Etkinlik bulunamadı: ${eventId}`);
    }
    
    events.splice(index, 1);
    return true;
  } catch (error) {
    console.error(`Etkinlik silinirken hata oluştu (ID: ${eventId}):`, error);
    throw new Error('Etkinlik silinemedi');
  }
};

// Etkinliğe katılma (registerForEvent)
export const registerForEvent = async (eventId, userId) => {
  try {
    const eventIndex = events.findIndex(e => e.id === parseInt(eventId));
    if (eventIndex === -1) {
      throw new Error(`Etkinlik bulunamadı: ${eventId}`);
    }
    
    const event = events[eventIndex];
    
    // Etkinlik dolu mu kontrol et
    if (event.registeredParticipants >= event.capacity) {
      throw new Error('Etkinlik kapasitesi dolu');
    }
    
    // Kullanıcı zaten kayıtlı mı kontrol et
    if (event.participants.includes(userId)) {
      return { success: true, message: 'Zaten bu etkinliğe kayıtlısınız' };
    }
    
    // Katılımcı listesine ekle
    event.participants.push(userId);
    event.registeredParticipants += 1;
    
    return { success: true, message: 'Etkinliğe başarıyla katıldınız' };
  } catch (error) {
    console.error(`Etkinliğe katılırken hata oluştu (ID: ${eventId}):`, error);
    throw new Error('Etkinliğe katılınamadı');
  }
};

// Etkinlikten ayrılma (cancelRegistration)
export const cancelRegistration = async (eventId, userId) => {
  try {
    const eventIndex = events.findIndex(e => e.id === parseInt(eventId));
    if (eventIndex === -1) {
      throw new Error(`Etkinlik bulunamadı: ${eventId}`);
    }
    
    const event = events[eventIndex];
    
    // Kullanıcı kayıtlı mı kontrol et
    const participantIndex = event.participants.indexOf(userId);
    if (participantIndex === -1) {
      return { success: false, message: 'Bu etkinliğe kayıtlı değilsiniz' };
    }
    
    // Katılımcı listesinden çıkar
    event.participants.splice(participantIndex, 1);
    event.registeredParticipants -= 1;
    
    return { success: true, message: 'Etkinlik kaydınız iptal edildi' };
  } catch (error) {
    console.error(`Etkinlik kaydı iptal edilirken hata oluştu (ID: ${eventId}):`, error);
    throw new Error('Etkinlik kaydı iptal edilemedi');
  }
};

// Etkinliğe katılma (joinEvent) - Alternatif isimle
export const joinEvent = async (eventId, userId) => {
  return registerForEvent(eventId, userId);
};

// Etkinlikten ayrılma (leaveEvent) - Alternatif isimle
export const leaveEvent = async (eventId, userId) => {
  return cancelRegistration(eventId, userId);
};

// Katılımcı listesini getir
export const getEventParticipants = async (eventId) => {
  try {
    const event = events.find(e => e.id === parseInt(eventId));
    if (!event) {
      throw new Error(`Etkinlik bulunamadı: ${eventId}`);
    }
    
    return event.participants;
  } catch (error) {
    console.error(`Etkinlik katılımcıları yüklenirken hata oluştu (ID: ${eventId}):`, error);
    return [];
  }
};

// Tüm kategorileri getir
export const getAllCategories = async () => {
  try {
    return categories;
  } catch (error) {
    console.error('Kategoriler yüklenirken hata oluştu:', error);
    return [];
  }
};

// Etkinlikleri kategoriye göre filtrele
export const getEventsByCategory = async (category) => {
  try {
    if (category === 'Tümü') {
      return events;
    }
    return events.filter(event => event.category === category);
  } catch (error) {
    console.error(`Kategoriye göre etkinlikler yüklenirken hata oluştu (Kategori: ${category}):`, error);
    return [];
  }
};

// Etkinliklere göre arama yap
export const searchEvents = async (query) => {
  try {
    if (!query) {
      return events;
    }
    
    const searchText = query.toLowerCase();
    return events.filter(event => (
      event.title.toLowerCase().includes(searchText) ||
      event.description.toLowerCase().includes(searchText) ||
      (event.location && event.location.toLowerCase().includes(searchText)) ||
      (event.club && event.club.toLowerCase().includes(searchText))
    ));
  } catch (error) {
    console.error(`Etkinlik araması yapılırken hata oluştu (Sorgu: ${query}):`, error);
    return [];
  }
};

// Kullanıcının katıldığı etkinlikleri getir
export const getEventsByParticipant = async (userId) => {
  try {
    return events.filter(event => event.participants.includes(userId));
  } catch (error) {
    console.error(`Kullanıcının etkinlikleri yüklenirken hata oluştu (ID: ${userId}):`, error);
    return [];
  }
};

// Kullanıcı geri bildirimi gönder
export const submitFeedback = async (eventId, userId, feedbackData) => {
  try {
    // Gerçek bir backend'de, bu veri veritabanına kaydedilirdi
    console.log(`Geri bildirim alındı: Etkinlik ${eventId}, Kullanıcı ${userId}`);
    console.log('Geri bildirim:', feedbackData);
    
    return { success: true, message: 'Geri bildiriminiz için teşekkür ederiz!' };
  } catch (error) {
    console.error(`Geri bildirim gönderilirken hata oluştu (Etkinlik ID: ${eventId}):`, error);
    throw new Error('Geri bildirim gönderilemedi');
  }
};

// Bekleme listesine ekle
export const addToWaitingList = async (eventId, userId) => {
  try {
    const event = events.find(e => e.id === parseInt(eventId));
    if (!event) {
      throw new Error(`Etkinlik bulunamadı: ${eventId}`);
    }
    
    // Kullanıcı zaten bekleme listesinde mi kontrol et
    const isAlreadyInWaitingList = waitingList.some(
      item => item.eventId === parseInt(eventId) && item.userId === userId
    );
    
    if (isAlreadyInWaitingList) {
      return { success: true, message: 'Zaten bekleme listesindesiniz' };
    }
    
    // Bekleme listesine ekle
    waitingList.push({
      eventId: parseInt(eventId),
      userId,
      registrationDate: new Date().toISOString()
    });
    
    return { success: true, message: 'Bekleme listesine başarıyla eklendiniz' };
  } catch (error) {
    console.error(`Bekleme listesine eklenirken hata oluştu (Etkinlik ID: ${eventId}):`, error);
    throw new Error('Bekleme listesine eklenemedi');
  }
};

// Bekleme listesinden çıkar
export const removeFromWaitingList = async (eventId, userId) => {
  try {
    const index = waitingList.findIndex(
      item => item.eventId === parseInt(eventId) && item.userId === userId
    );
    
    if (index === -1) {
      return { success: false, message: 'Bekleme listesinde değilsiniz' };
    }
    
    waitingList.splice(index, 1);
    
    return { success: true, message: 'Bekleme listesinden çıkarıldınız' };
  } catch (error) {
    console.error(`Bekleme listesinden çıkarılırken hata oluştu (Etkinlik ID: ${eventId}):`, error);
    throw new Error('Bekleme listesinden çıkarılamadı');
  }
};

// Etkinlik bekleme listesini getir
export const getEventWaitingList = async (eventId) => {
  try {
    return waitingList.filter(item => item.eventId === parseInt(eventId));
  } catch (error) {
    console.error(`Bekleme listesi yüklenirken hata oluştu (Etkinlik ID: ${eventId}):`, error);
    return [];
  }
};

// Kullanıcının bekleme listesindeki etkinliklerini getir
export const getUserWaitingLists = async (userId) => {
  try {
    const userWaitingListItems = waitingList.filter(item => item.userId === userId);
    
    // Etkinlik detaylarını ekleyerek döndür
    return userWaitingListItems.map(item => {
      const event = events.find(e => e.id === item.eventId);
      return {
        ...item,
        event
      };
    });
  } catch (error) {
    console.error(`Kullanıcının bekleme listeleri yüklenirken hata oluştu (ID: ${userId}):`, error);
    return [];
  }
};

// Yaklaşan etkinlikleri getir
export const getUpcomingEvents = async (limit = 4) => {
  try {
    const today = new Date();
    return events
      .filter(event => new Date(event.startDate) > today)
      .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
      .slice(0, limit);
  } catch (error) {
    console.error('Yaklaşan etkinlikler yüklenirken hata oluştu:', error);
    return [];
  }
};

// Popüler etkinlikleri getir
export const getPopularEvents = async (limit = 4) => {
  try {
    return events
      .sort((a, b) => (b.registeredParticipants / b.capacity) - (a.registeredParticipants / a.capacity))
      .slice(0, limit);
  } catch (error) {
    console.error('Popüler etkinlikler yüklenirken hata oluştu:', error);
    return [];
  }
};

// Öne çıkan etkinlikleri getir
export const getFeaturedEvents = async (limit = 3) => {
  try {
    return events
      .filter(event => event.featured)
      .slice(0, limit);
  } catch (error) {
    console.error('Öne çıkan etkinlikler yüklenirken hata oluştu:', error);
    return [];
  }
};

// Etkinlik konuşmacılarını getir
export const getEventSpeakers = async (eventId) => {
  try {
    const event = events.find(e => e.id === parseInt(eventId));
    return event?.speakers || [];
  } catch (error) {
    console.error(`Konuşmacılar yüklenirken hata oluştu (Etkinlik ID: ${eventId}):`, error);
    return [];
  }
};

// Etkinliğin yemek/ikram bilgilerini getir
export const getCatering = async (eventId) => {
  try {
    // Şimdilik mock veri dönüyoruz
    return [
      { id: 1, eventId: parseInt(eventId), name: 'Öğle Yemeği', description: 'Salata, ana yemek ve tatlı içerir', time: '12:00-14:00', menuItems: ['Mevsim Salatası', 'Tavuk Sote', 'Pilav', 'Baklava'], dietaryOptions: ['Vejetaryen seçenek mevcut'] },
      { id: 2, eventId: parseInt(eventId), name: 'İkindi Kahve Molası', description: 'Çeşitli atıştırmalıklar ve içecekler', time: '16:00-16:30', menuItems: ['Kurabiye', 'Kek', 'Kahve', 'Çay'], dietaryOptions: ['Glutensiz seçenek mevcut'] }
    ];
  } catch (error) {
    console.error(`İkram bilgileri yüklenirken hata oluştu (Etkinlik ID: ${eventId}):`, error);
    return [];
  }
};

// Etkinlik programını getir
export const getEventProgram = async (eventId) => {
  try {
    // Şimdilik mock veri dönüyoruz
    return [
      { id: 1, eventId: parseInt(eventId), title: 'Açılış Konuşması', description: 'Etkinliğin açılış konuşması', startTime: '10:00', endTime: '10:30', speaker: 'Prof. Dr. Ahmet Yıldız', location: 'Ana Salon' },
      { id: 2, eventId: parseInt(eventId), title: 'Panel Tartışması', description: 'Alanında uzman konuşmacılarla panel', startTime: '10:45', endTime: '12:00', speaker: 'Çeşitli Konuşmacılar', location: 'Ana Salon' },
      { id: 3, eventId: parseInt(eventId), title: 'Öğle Arası', description: 'Yemek ve networking', startTime: '12:00', endTime: '13:30', location: 'Fuaye Alanı' },
      { id: 4, eventId: parseInt(eventId), title: 'Workshop', description: 'Uygulamalı çalışma', startTime: '13:30', endTime: '15:30', speaker: 'Ali Can', location: 'Atölye Salonu' },
      { id: 5, eventId: parseInt(eventId), title: 'Kapanış', description: 'Kapanış konuşması ve sertifika töreni', startTime: '16:00', endTime: '17:00', location: 'Ana Salon' }
    ];
  } catch (error) {
    console.error(`Program bilgileri yüklenirken hata oluştu (Etkinlik ID: ${eventId}):`, error);
    return [];
  }
};

// Etkinlik anketlerini getir
export const getSurveys = async (eventId) => {
  try {
    // Şimdilik mock veri dönüyoruz
    return [
      { 
        id: 1, 
        eventId: parseInt(eventId), 
        title: 'Etkinlik Memnuniyet Anketi', 
        description: 'Etkinliğimiz hakkındaki düşüncelerinizi öğrenmek istiyoruz',
        questions: [
          { id: 1, type: 'rating', text: 'Etkinliğin genel organizasyonunu nasıl değerlendirirsiniz?', options: [1, 2, 3, 4, 5] },
          { id: 2, type: 'rating', text: 'Konuşmacıların sunumlarını nasıl değerlendirirsiniz?', options: [1, 2, 3, 4, 5] },
          { id: 3, type: 'multiple_choice', text: 'Etkinlikte en çok hangi bölümü beğendiniz?', options: ['Açılış Konuşması', 'Panel Tartışması', 'Workshop', 'Kapanış'] },
          { id: 4, type: 'text', text: 'Etkinlikle ilgili diğer görüşleriniz nelerdir?' }
        ],
        isActive: true,
        createdAt: '2025-04-10T08:00:00'
      },
      {
        id: 2,
        eventId: parseInt(eventId),
        title: 'Katılımcı Bilgi Formu',
        description: 'Gelecekteki etkinliklerimiz için bilgilerinizi güncelleyin',
        questions: [
          { id: 1, type: 'text', text: 'İlgilendiğiniz konu başlıkları nelerdir?' },
          { id: 2, type: 'multiple_choice', text: 'Hangi etkinlik formatını tercih edersiniz?', options: ['Workshop', 'Panel', 'Seminer', 'Networking Etkinliği'] },
          { id: 3, type: 'boolean', text: 'Gelecekteki etkinlikler hakkında bilgi almak ister misiniz?' }
        ],
        isActive: true,
        createdAt: '2025-04-11T10:30:00'
      }
    ];
  } catch (error) {
    console.error(`Anket bilgileri yüklenirken hata oluştu (Etkinlik ID: ${eventId}):`, error);
    return [];
  }
};

// Etkinliğin mekan rezervasyonu bilgilerini getir
export const getVenueReservations = async (eventId) => {
  try {
    // Şimdilik mock veri dönüyoruz
    return [
      { 
        id: 1, 
        eventId: parseInt(eventId), 
        venueName: 'Ana Konferans Salonu', 
        venueId: 1,
        startTime: '09:00', 
        endTime: '18:00', 
        date: '2025-04-15', 
        status: 'CONFIRMED',
        capacity: 300,
        facilities: ['Projeksiyon', 'Ses Sistemi', 'Wi-Fi', 'Klima'],
        notes: 'Salon düzeni tiyatro şeklinde olacak' 
      },
      { 
        id: 2, 
        eventId: parseInt(eventId), 
        venueName: 'Fuaye Alanı', 
        venueId: 2,
        startTime: '12:00', 
        endTime: '14:00', 
        date: '2025-04-15', 
        status: 'CONFIRMED',
        capacity: 150,
        facilities: ['Yemek Masaları', 'Oturma Alanı'],
        notes: 'İkram servisi için hazırlanacak' 
      }
    ];
  } catch (error) {
    console.error(`Mekan rezervasyon bilgileri yüklenirken hata oluştu (Etkinlik ID: ${eventId}):`, error);
    return [];
  }
};