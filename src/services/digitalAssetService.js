import { api } from './api';

/**
 * Dijital varlık (logo, afiş, vb.) işlemleri ile ilgili servis
 */

// Tüm dijital varlıkları getir
export const getAllAssets = async () => {
  try {
    const response = await api.getAllAssets();
    return response.data;
  } catch (error) {
    console.error('Dijital varlıklar yüklenirken hata oluştu:', error);
    return [];
  }
};

// ID'ye göre dijital varlık detaylarını getir
export const getAssetById = async (assetId) => {
  try {
    const response = await api.getAssetById(assetId);
    return response.data;
  } catch (error) {
    console.error(`Dijital varlık detayları yüklenirken hata oluştu (ID: ${assetId}):`, error);
    return null;
  }
};

// Yeni dijital varlık yükle
export const uploadAsset = async (assetData) => {
  try {
    const response = await api.uploadAsset(assetData);
    return response.data;
  } catch (error) {
    console.error('Dijital varlık yüklenirken hata oluştu:', error);
    throw new Error(error.response?.data?.message || 'Dijital varlık yüklenemedi');
  }
};

// Dijital varlık bilgilerini güncelle
export const updateAsset = async (assetId, assetData) => {
  try {
    const response = await api.updateAsset(assetId, assetData);
    return response.data;
  } catch (error) {
    console.error(`Dijital varlık güncellenirken hata oluştu (ID: ${assetId}):`, error);
    throw new Error(error.response?.data?.message || 'Dijital varlık güncellenemedi');
  }
};

// Dijital varlık sil
export const deleteAsset = async (assetId) => {
  try {
    await api.deleteAsset(assetId);
    return true;
  } catch (error) {
    console.error(`Dijital varlık silinirken hata oluştu (ID: ${assetId}):`, error);
    throw new Error(error.response?.data?.message || 'Dijital varlık silinemedi');
  }
}; 