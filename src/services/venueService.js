import { api } from './api';

// Mock mekan verileri
const venues = [
  {
    id: 1,
    name: 'Ana Konferans Salonu',
    description: 'Büyük etkinlikler için modern donanımlı ana konferans salonu',
    location: 'Merkez Kampüs, A Blok',
    capacity: 500,
    facilities: ['Projeksiyon', 'Ses Sistemi', 'Klima', 'Wi-Fi', 'Sahne'],
    image: 'https://source.unsplash.com/random?auditorium',
    availability: true,
    pricePerHour: 0, // Ücretsiz
    reservationRequired: true,
    contactPerson: 'Ahmet Yılmaz',
    contactEmail: 'salonrezervasyon@universite.edu.tr',
    contactPhone: '0312 555 44 33'
  },
  {
    id: 2,
    name: 'Açık Hava Amfisi',
    description: 'Açık hava etkinlikleri için ideal amfi tiyatro',
    location: 'Merkez Kampüs, Doğu Bahçesi',
    capacity: 350,
    facilities: ['Ses Sistemi', 'Sahne Işıkları', 'Oturma Alanları'],
    image: 'https://source.unsplash.com/random?amphitheater',
    availability: true,
    pricePerHour: 0, // Ücretsiz
    reservationRequired: true,
    contactPerson: 'Zeynep Kaya',
    contactEmail: 'acikhavaamfi@universite.edu.tr',
    contactPhone: '0312 555 44 34'
  },
  {
    id: 3,
    name: 'Bilgisayar Laboratuvarı',
    description: 'Teknik eğitimler ve workshoplar için 40 bilgisayarlı laboratuvar',
    location: 'Mühendislik Fakültesi, B Blok 2. Kat',
    capacity: 40,
    facilities: ['Bilgisayarlar', 'Projeksiyon', 'Whiteboard', 'Klima', 'Wi-Fi'],
    image: 'https://source.unsplash.com/random?computerlab',
    availability: true,
    pricePerHour: 0, // Ücretsiz
    reservationRequired: true,
    contactPerson: 'Murat Özkan',
    contactEmail: 'bilgisayarlab@universite.edu.tr',
    contactPhone: '0312 555 44 35'
  },
  {
    id: 4,
    name: 'Çok Amaçlı Etkinlik Salonu',
    description: 'Konserler, sergiler ve sosyal etkinlikler için geniş salon',
    location: 'Merkez Kampüs, Öğrenci Merkezi',
    capacity: 250,
    facilities: ['Ses Sistemi', 'Sahne', 'Işıklandırma', 'Klima', 'Wi-Fi'],
    image: 'https://source.unsplash.com/random?eventspace',
    availability: true,
    pricePerHour: 0, // Ücretsiz
    reservationRequired: true,
    contactPerson: 'Ayşe Demir',
    contactEmail: 'etkinliksalonu@universite.edu.tr',
    contactPhone: '0312 555 44 36'
  },
  {
    id: 5,
    name: 'Seminer Salonu',
    description: 'Küçük ve orta ölçekli seminerler için ideal salon',
    location: 'Merkez Kampüs, Kütüphane Binası 1. Kat',
    capacity: 80,
    facilities: ['Projeksiyon', 'Ses Sistemi', 'Whiteboard', 'Klima', 'Wi-Fi'],
    image: 'https://source.unsplash.com/random?seminarroom',
    availability: true,
    pricePerHour: 0, // Ücretsiz
    reservationRequired: true,
    contactPerson: 'Can Yıldız',
    contactEmail: 'seminersalonu@universite.edu.tr',
    contactPhone: '0312 555 44 37'
  }
];

// Mock rezervasyon verileri
const reservations = [
  {
    id: 1,
    venueId: 1,
    eventId: 1,
    startTime: '2025-04-15T13:00:00',
    endTime: '2025-04-15T18:00:00',
    status: 'CONFIRMED',
    notes: 'Yapay Zeka Semineri için rezervasyon'
  },
  {
    id: 2,
    venueId: 4,
    eventId: 2,
    startTime: '2025-05-10T09:00:00',
    endTime: '2025-05-11T18:00:00',
    status: 'CONFIRMED',
    notes: 'Kariyer Günleri için rezervasyon'
  },
  {
    id: 3,
    venueId: 3,
    eventId: 4,
    startTime: '2025-04-22T14:00:00',
    endTime: '2025-04-22T19:00:00',
    status: 'CONFIRMED',
    notes: 'Web Geliştirme Workshop için rezervasyon'
  }
];

// Tüm mekanları getir
export const getAllVenues = async () => {
  try {
    return venues;
  } catch (error) {
    console.error('Mekanlar yüklenirken hata oluştu:', error);
    return [];
  }
};

// ID'ye göre mekan detaylarını getir
export const getVenueById = async (venueId) => {
  try {
    const venue = venues.find(v => v.id === parseInt(venueId));
    return venue || null;
  } catch (error) {
    console.error(`Mekan detayları yüklenirken hata oluştu (ID: ${venueId}):`, error);
    return null;
  }
};

// Yeni mekan oluştur
export const createVenue = async (venueData) => {
  try {
    const newId = Math.max(...venues.map(v => v.id)) + 1;
    const newVenue = { ...venueData, id: newId };
    venues.push(newVenue);
    return newVenue;
  } catch (error) {
    console.error('Mekan oluşturulurken hata oluştu:', error);
    throw new Error('Mekan oluşturulamadı');
  }
};

// Mekan bilgilerini güncelle
export const updateVenue = async (venueId, venueData) => {
  try {
    const index = venues.findIndex(v => v.id === parseInt(venueId));
    if (index === -1) {
      throw new Error(`Mekan bulunamadı: ${venueId}`);
    }
    venues[index] = { ...venues[index], ...venueData };
    return venues[index];
  } catch (error) {
    console.error(`Mekan güncellenirken hata oluştu (ID: ${venueId}):`, error);
    throw new Error('Mekan güncellenemedi');
  }
};

// Mekan sil
export const deleteVenue = async (venueId) => {
  try {
    const index = venues.findIndex(v => v.id === parseInt(venueId));
    if (index === -1) {
      throw new Error(`Mekan bulunamadı: ${venueId}`);
    }
    venues.splice(index, 1);
    return true;
  } catch (error) {
    console.error(`Mekan silinirken hata oluştu (ID: ${venueId}):`, error);
    throw new Error('Mekan silinemedi');
  }
};

// Mekan müsaitlik durumunu kontrol et
export const getVenueAvailability = async (venueId, startDate, endDate) => {
  try {
    const venue = venues.find(v => v.id === parseInt(venueId));
    if (!venue) {
      throw new Error(`Mekan bulunamadı: ${venueId}`);
    }
    
    // Çakışan rezervasyonları kontrol et
    const conflictingReservations = reservations.filter(r => {
      return r.venueId === parseInt(venueId) && 
        ((new Date(r.startTime) <= new Date(endDate) && new Date(r.endTime) >= new Date(startDate)));
    });
    
    return {
      venue,
      isAvailable: conflictingReservations.length === 0,
      conflictingReservations
    };
  } catch (error) {
    console.error(`Mekan müsaitlik durumu yüklenirken hata oluştu (ID: ${venueId}):`, error);
    return null;
  }
};

// Mekan rezervasyonu yap
export const reserveVenue = async (venueId, reservationData) => {
  try {
    const venue = venues.find(v => v.id === parseInt(venueId));
    if (!venue) {
      throw new Error(`Mekan bulunamadı: ${venueId}`);
    }
    
    // Çakışma kontrolü
    const { isAvailable } = await getVenueAvailability(
      venueId, 
      reservationData.startTime, 
      reservationData.endTime
    );
    
    if (!isAvailable) {
      throw new Error('Seçilen tarih ve saatlerde mekan müsait değil');
    }
    
    // Yeni rezervasyon oluştur
    const newId = Math.max(...reservations.map(r => r.id)) + 1;
    const newReservation = { 
      ...reservationData, 
      id: newId, 
      venueId: parseInt(venueId),
      status: 'CONFIRMED'
    };
    
    reservations.push(newReservation);
    return newReservation;
  } catch (error) {
    console.error(`Mekan rezervasyonu yapılırken hata oluştu (ID: ${venueId}):`, error);
    throw new Error('Mekan rezervasyonu yapılamadı: ' + error.message);
  }
};

// Rezervasyon iptal et
export const cancelReservation = async (reservationId) => {
  try {
    const index = reservations.findIndex(r => r.id === parseInt(reservationId));
    if (index === -1) {
      throw new Error(`Rezervasyon bulunamadı: ${reservationId}`);
    }
    
    reservations[index].status = 'CANCELLED';
    return reservations[index];
  } catch (error) {
    console.error(`Rezervasyon iptal edilirken hata oluştu (ID: ${reservationId}):`, error);
    throw new Error('Rezervasyon iptal edilemedi');
  }
};

// Mekanın rezervasyonlarını getir
export const getVenueReservations = async (venueId) => {
  try {
    return reservations.filter(r => r.venueId === parseInt(venueId));
  } catch (error) {
    console.error(`Mekan rezervasyonları yüklenirken hata oluştu (ID: ${venueId}):`, error);
    return [];
  }
};

// Etkinliğin rezervasyonlarını getir
export const getEventReservations = async (eventId) => {
  try {
    return reservations.filter(r => r.eventId === parseInt(eventId));
  } catch (error) {
    console.error(`Etkinlik rezervasyonları yüklenirken hata oluştu (ID: ${eventId}):`, error);
    return [];
  }
};

// Özelliklerine göre mekanları filtrele
export const filterVenues = async (filters) => {
  try {
    let filteredVenues = [...venues];
    
    if (filters.capacity) {
      filteredVenues = filteredVenues.filter(v => v.capacity >= parseInt(filters.capacity));
    }
    
    if (filters.facilities && filters.facilities.length > 0) {
      filteredVenues = filteredVenues.filter(v => 
        filters.facilities.every(facility => v.facilities.includes(facility))
      );
    }
    
    if (filters.available) {
      // Tarih kontrolleri eklenebilir
    }
    
    return filteredVenues;
  } catch (error) {
    console.error('Mekanlar filtrelenirken hata oluştu:', error);
    return [];
  }
}; 