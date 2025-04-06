package com.example.cmManagementSystem.exception;

/**
 * Dosya işleme sırasında oluşan hataları belirtmek için özel hata sınıfı
 */
public class FileStorageException extends RuntimeException {
    
    public FileStorageException(String message) {
        super(message);
    }
    
    public FileStorageException(String message, Throwable cause) {
        super(message, cause);
    }
} 