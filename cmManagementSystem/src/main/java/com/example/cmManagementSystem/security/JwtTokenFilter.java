package com.example.cmManagementSystem.security;

import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class JwtTokenFilter extends OncePerRequestFilter {

    private final JwtTokenProvider jwtTokenProvider;
    private final UserDetailsService userDetailsService;

    private static final String TOKEN_HEADER = "Authorization";
    private static final String TOKEN_PREFIX = "Bearer ";

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        // Tüm istekler için başlıkları logla
        String contentType = request.getContentType();
        String method = request.getMethod();
        String uri = request.getRequestURI();
        
        System.out.println("======= JwtTokenFilter - İstek Başlangıç =======");
        System.out.println("JwtTokenFilter - İstek alındı: " + method + " " + uri);
        System.out.println("JwtTokenFilter - Content-Type: " + contentType);
        
        if (request.getHeader("Authorization") != null) {
            System.out.println("JwtTokenFilter - Authorization başlığı var: " + 
                request.getHeader("Authorization").substring(0, Math.min(30, request.getHeader("Authorization").length())) + "...");
        } else {
            System.out.println("JwtTokenFilter - Authorization başlığı yok!");
        }
        
        // Auth endpoint'lerine yapılan istekleri doğrudan geçir, token kontrolü yapma
        if (uri.startsWith("/auth") || uri.startsWith("/api/auth")) {
            System.out.println("JwtTokenFilter - Auth endpoint isteği, token kontrolü atlanıyor: " + uri);
            filterChain.doFilter(request, response);
            return;
        }
        
        // Membership check endpoint'i için özel işleme
        if (method.equalsIgnoreCase("GET") && uri.contains("/membership/check")) {
            System.out.println("JwtTokenFilter - Membership check endpoint'i tespit edildi: " + uri);
            System.out.println("JwtTokenFilter - Bu endpoint için token kontrolü gevşek yapılacak, erişim izni veriliyor");
            filterChain.doFilter(request, response);
            return;
        }
        
        // Multipart content type kontrolü
        boolean isMultipart = contentType != null && contentType.startsWith("multipart/form-data");
        if (isMultipart) {
            System.out.println("JwtTokenFilter - Multipart form data isteği tespit edildi");
        }
        
        // OPTIONS isteklerini doğrudan geçir
        if (method.equalsIgnoreCase("OPTIONS")) {
            System.out.println("JwtTokenFilter - OPTIONS isteği, doğrudan geçiriliyor");
            filterChain.doFilter(request, response);
            return;
        }
        
        try {
            // Token kontrolü
            String token = getTokenFromRequest(request);
            
            if (token != null) {
                System.out.println("JwtTokenFilter - Token bulundu: " + token.substring(0, Math.min(20, token.length())) + "...");
                
                boolean isValid = jwtTokenProvider.validateToken(token);
                System.out.println("JwtTokenFilter - Token geçerli mi: " + isValid);
                
                if (isValid) {
                    // Token'dan kullanıcı adı ve rol alınıyor
                    String username = jwtTokenProvider.getUsernameFromToken(token);
                    System.out.println("JwtTokenFilter - Username: " + username);
                    
                    // Role bilgisini almaya çalış
                    Claims claims = jwtTokenProvider.getClaimsFromToken(token);
                    String role = null;
                    if (claims.get("role") != null) {
                        role = claims.get("role").toString();
                        System.out.println("JwtTokenFilter - Token'dan alınan rol: " + role);
                    } else {
                        System.out.println("JwtTokenFilter - Token'da rol bilgisi yok");
                    }
                    
                    // Kullanıcı detayları yükleniyor
                    UserDetails userDetails = userDetailsService.loadUserByUsername(username);
                    System.out.println("JwtTokenFilter - UserDetails yüklendi. Roller: " + userDetails.getAuthorities());
                    
                    // Yetkilendirme nesnesi oluşturuluyor ve SecurityContext'e ekleniyor
                    UsernamePasswordAuthenticationToken authentication =
                            new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                    authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    
                    // Kullanıcı yetkilerini ve rollerini logla
                    System.out.println("JwtTokenFilter - Oluşturulan yetkilendirme: " + authentication);
                    System.out.println("JwtTokenFilter - Kullanıcı yetkileri: " + authentication.getAuthorities());
                    
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                    System.out.println("JwtTokenFilter - SecurityContext güncellendi");
                } else {
                    System.out.println("JwtTokenFilter - Token geçersiz!");
                    
                    // Token geçersizliğinin sebebini analiz et
                    try {
                        jwtTokenProvider.extractAllClaims(token);
                    } catch (Exception e) {
                        System.out.println("JwtTokenFilter - Token analiz hatası: " + e.getMessage());
                    }
                }
            } else {
                System.out.println("JwtTokenFilter - Token bulunamadı");
                
                // Bazı public endpoint'lere token olmadan izin ver
                if (uri.startsWith("/uploads") || 
                   (method.equalsIgnoreCase("GET") && uri.startsWith("/clubs"))) {
                    System.out.println("JwtTokenFilter - Public endpoint, token olmadan erişime izin veriliyor");
                } else {
                    System.out.println("JwtTokenFilter - Token gerektiren endpoint için token bulunamadı: " + uri);
                }
            }
            
            System.out.println("======= JwtTokenFilter - İşlem tamamlandı, isteği devam ettiriyorum =======");
            // İsteği devam ettir
            filterChain.doFilter(request, response);
        } catch (Exception e) {
            System.err.println("JwtTokenFilter - Hata: " + e.getMessage());
            e.printStackTrace();
            
            System.out.println("======= JwtTokenFilter - Hatayla tamamlandı, isteği devam ettiriyorum =======");
            filterChain.doFilter(request, response);
        }
    }

    private String getTokenFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader(TOKEN_HEADER);
        if (bearerToken != null && bearerToken.startsWith(TOKEN_PREFIX)) {
            return bearerToken.substring(TOKEN_PREFIX.length());
        }
        return null;
    }
} 