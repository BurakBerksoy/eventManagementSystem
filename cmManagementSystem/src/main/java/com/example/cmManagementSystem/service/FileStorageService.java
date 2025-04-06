package com.example.cmManagementSystem.service;

import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

/**
 * Dosya depolama işlemlerini yöneten servis
 */
public interface FileStorageService {
    
    /**
     * Dosyayı depolar ve dosya adını döndürür
     * 
     * @param file Yüklenecek dosya
     * @return Kaydedilen dosyanın adı
     * @throws IOException Dosya işlemi sırasında bir hata oluşursa
     */
    String storeFile(MultipartFile file) throws IOException;
    
    /**
     * Kaydedilen dosyanın erişim URL'ini döndürür
     * 
     * @param fileName Dosya adı
     * @return Dosyanın tam URL'i
     */
    String getFileUrl(String fileName);
    
    /**
     * Dosyanın içeriğini okur
     * 
     * @param fileUrl Dosya URL'i
     * @return Dosya içeriği (byte array)
     * @throws IOException Dosya okunamadığında
     */
    byte[] readFile(String fileUrl) throws IOException;
    
    /**
     * Dosyayı siler
     * 
     * @param fileUrl Silinecek dosyanın URL'i
     * @throws IOException Dosya silinemediğinde
     */
    void deleteFile(String fileUrl) throws IOException;
    
    /**
     * Resim dosyasından thumbnail oluşturur
     * 
     * @param fileName Ana resim dosyasının adı
     * @return Thumbnail dosyasının URL'i
     * @throws IOException İşlem sırasında hata oluşursa
     */
    String createThumbnail(String fileName) throws IOException;
} 