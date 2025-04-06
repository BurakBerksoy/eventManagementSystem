package com.example.cmManagementSystem.service.impl;

import com.example.cmManagementSystem.config.FileStorageProperties;
import com.example.cmManagementSystem.exception.FileStorageException;
import com.example.cmManagementSystem.service.FileStorageService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Objects;
import java.util.UUID;

@Service
@Slf4j
public class FileStorageServiceImpl implements FileStorageService {
    
    private final Path fileStorageLocation;
    private final Path thumbnailStorageLocation;
    
    @Autowired
    public FileStorageServiceImpl(FileStorageProperties fileStorageProperties) {
        this.fileStorageLocation = Paths.get(fileStorageProperties.getUploadDir())
                .toAbsolutePath().normalize();
        this.thumbnailStorageLocation = Paths.get(fileStorageProperties.getUploadDir() + "/thumbnails")
                .toAbsolutePath().normalize();
        
        try {
            Files.createDirectories(this.fileStorageLocation);
            Files.createDirectories(this.thumbnailStorageLocation);
        } catch (Exception ex) {
            throw new FileStorageException("Dosya yükleme dizini oluşturulamadı", ex);
        }
    }
    
    @Override
    public String storeFile(MultipartFile file) throws IOException {
        // Dosya adını normalleştir
        String originalFileName = StringUtils.cleanPath(Objects.requireNonNull(file.getOriginalFilename()));
        
        // Dosya adında geçersiz karakterler var mı kontrol et
        if (originalFileName.contains("..")) {
            throw new FileStorageException("Dosya adı geçersiz karakter içeriyor: " + originalFileName);
        }
        
        // Dosya adını benzersiz hale getir (UUID ile)
        String fileExtension = getFileExtension(originalFileName);
        String fileName = UUID.randomUUID().toString() + "." + fileExtension;
        
        // Dosyayı hedef konuma kopyala
        Path targetLocation = this.fileStorageLocation.resolve(fileName);
        Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
        
        return fileName;
    }
    
    @Override
    public String getFileUrl(String fileName) {
        return ServletUriComponentsBuilder.fromCurrentContextPath()
                .path("/api/digital-assets/download/")
                .path(fileName)
                .toUriString();
    }
    
    @Override
    public byte[] readFile(String fileUrl) throws IOException {
        try {
            // URL'den dosya adını çıkar
            String fileName = getFileNameFromUrl(fileUrl);
            Path filePath = this.fileStorageLocation.resolve(fileName).normalize();
            Resource resource = new UrlResource(filePath.toUri());
            
            if (resource.exists()) {
                return Files.readAllBytes(filePath);
            } else {
                throw new FileStorageException("Dosya bulunamadı: " + fileName);
            }
        } catch (MalformedURLException ex) {
            throw new FileStorageException("Dosya URL'i hatalı", ex);
        }
    }
    
    @Override
    public void deleteFile(String fileUrl) throws IOException {
        String fileName = getFileNameFromUrl(fileUrl);
        Path filePath = this.fileStorageLocation.resolve(fileName).normalize();
        
        if (Files.exists(filePath)) {
            Files.delete(filePath);
        } else {
            throw new FileStorageException("Dosya bulunamadı: " + fileName);
        }
    }
    
    @Override
    public String createThumbnail(String fileName) throws IOException {
        Path originalFilePath = this.fileStorageLocation.resolve(fileName).normalize();
        
        // Orijinal dosyanın var olup olmadığını kontrol et
        if (!Files.exists(originalFilePath)) {
            throw new FileStorageException("Orijinal dosya bulunamadı: " + fileName);
        }
        
        // Thumbnail adını oluştur
        String thumbnailFileName = "thumb_" + fileName;
        Path thumbnailPath = this.thumbnailStorageLocation.resolve(thumbnailFileName);
        
        // Orijinal görseli yükle
        BufferedImage originalImage = ImageIO.read(originalFilePath.toFile());
        
        // Thumbnail boyutunu hesapla (max. 200px genişlik veya yükseklik)
        int thumbnailWidth = 200;
        int thumbnailHeight = 200;
        
        if (originalImage.getWidth() > originalImage.getHeight()) {
            thumbnailHeight = (int) (((double) thumbnailWidth / originalImage.getWidth()) * originalImage.getHeight());
        } else {
            thumbnailWidth = (int) (((double) thumbnailHeight / originalImage.getHeight()) * originalImage.getWidth());
        }
        
        // Thumbnail oluştur
        BufferedImage thumbnailImage = new BufferedImage(thumbnailWidth, thumbnailHeight, BufferedImage.TYPE_INT_RGB);
        Graphics2D g = thumbnailImage.createGraphics();
        g.drawImage(originalImage, 0, 0, thumbnailWidth, thumbnailHeight, null);
        g.dispose();
        
        // Thumbnail'i kaydet
        String fileExtension = getFileExtension(fileName);
        ImageIO.write(thumbnailImage, fileExtension, thumbnailPath.toFile());
        
        // Thumbnail URL'ini döndür
        return ServletUriComponentsBuilder.fromCurrentContextPath()
                .path("/api/digital-assets/download/thumbnails/")
                .path(thumbnailFileName)
                .toUriString();
    }
    
    // URL'den dosya adını çıkarma yardımcı metodu
    private String getFileNameFromUrl(String fileUrl) {
        int lastIndex = fileUrl.lastIndexOf("/");
        if (lastIndex != -1 && lastIndex < fileUrl.length() - 1) {
            return fileUrl.substring(lastIndex + 1);
        }
        return fileUrl; // URL geçerli değilse, orijinal string'i döndür
    }
    
    // Dosya uzantısını alma yardımcı metodu
    private String getFileExtension(String fileName) {
        int dotIndex = fileName.lastIndexOf(".");
        return (dotIndex == -1) ? "" : fileName.substring(dotIndex + 1);
    }
} 