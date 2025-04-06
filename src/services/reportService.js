import { api } from './api';

/**
 * Rapor işlemleri ile ilgili servis
 */

// Etkinlik raporu oluştur/getir
export const generateEventReport = async (eventId) => {
  try {
    const response = await api.generateEventReport(eventId);
    return response.data;
  } catch (error) {
    console.error(`Etkinlik raporu oluşturulurken hata oluştu (Etkinlik ID: ${eventId}):`, error);
    throw new Error(error.response?.data?.message || 'Etkinlik raporu oluşturulamadı');
  }
};

// Kulüp raporu oluştur/getir
export const generateClubReport = async (clubId) => {
  try {
    const response = await api.generateClubReport(clubId);
    return response.data;
  } catch (error) {
    console.error(`Kulüp raporu oluşturulurken hata oluştu (Kulüp ID: ${clubId}):`, error);
    throw new Error(error.response?.data?.message || 'Kulüp raporu oluşturulamadı');
  }
};

// Kullanıcı raporu oluştur/getir
export const generateUserReport = async (userId) => {
  try {
    const response = await api.generateUserReport(userId);
    return response.data;
  } catch (error) {
    console.error(`Kullanıcı raporu oluşturulurken hata oluştu (Kullanıcı ID: ${userId}):`, error);
    throw new Error(error.response?.data?.message || 'Kullanıcı raporu oluşturulamadı');
  }
};

// Tüm raporları getir
export const getAllReports = async () => {
  try {
    const response = await api.getAllReports();
    return response.data;
  } catch (error) {
    console.error('Raporlar yüklenirken hata oluştu:', error);
    return [];
  }
};

// ID'ye göre rapor detaylarını getir
export const getReportById = async (reportId) => {
  try {
    const response = await api.getReportById(reportId);
    return response.data;
  } catch (error) {
    console.error(`Rapor detayları yüklenirken hata oluştu (ID: ${reportId}):`, error);
    return null;
  }
};

// Özel rapor oluştur
export const createCustomReport = async (reportData) => {
  try {
    const response = await api.createCustomReport(reportData);
    return response.data;
  } catch (error) {
    console.error('Özel rapor oluşturulurken hata oluştu:', error);
    throw new Error(error.response?.data?.message || 'Özel rapor oluşturulamadı');
  }
}; 