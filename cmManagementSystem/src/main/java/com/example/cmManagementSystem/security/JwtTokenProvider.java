package com.example.cmManagementSystem.security;

import com.example.cmManagementSystem.entity.User;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Base64;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.function.Function;

/**
 * JWT token oluşturma, doğrulama ve işleme sınıfı.
 */
@Component
@RequiredArgsConstructor
public class JwtTokenProvider {

    private final UserDetailsService userDetailsService;

    @Value("${application.security.jwt.secret-key}")
    private String secretKey;

    @Value("${application.security.jwt.expiration}")
    private long jwtExpiration;

    @Value("${application.security.jwt.refresh-token.expiration}")
    private long refreshExpiration;

    // Geçersiz kılınan token'ları saklamak için basit bir in-memory cache
    // Gerçek uygulamalarda Redis gibi bir çözüm kullanılmalıdır
    private final Map<String, Boolean> blacklistedTokens = new ConcurrentHashMap<>();

    private Key key;

    @PostConstruct
    protected void init() {
        byte[] keyBytes = Base64.getDecoder().decode(secretKey);
        this.key = Keys.hmacShaKeyFor(keyBytes);
    }

    /**
     * Kullanıcı kimlik doğrulama bilgilerinden JWT token oluşturur.
     *
     * @param authentication Kimlik doğrulama bilgileri
     * @return JWT token
     */
    public String createToken(Authentication authentication, Map<String, Object> additionalClaims) {
        String username = authentication.getName();
        Date now = new Date();
        Date validity = new Date(now.getTime() + jwtExpiration);

        // Claims oluştur
        Claims claims = Jwts.claims().setSubject(username);
        
        // Rol bilgisini claim'lere ekle
        if (additionalClaims != null && !additionalClaims.isEmpty()) {
            claims.putAll(additionalClaims);
        }
        
        // Token'ı imzala ve döndür
        return Jwts.builder()
                .setClaims(claims)
                .setIssuedAt(now)
                .setExpiration(validity)
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    /**
     * Token'dan kullanıcı adını alır.
     *
     * @param token JWT token
     * @return Kullanıcı adı
     */
    public String getUsernameFromToken(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody()
                .getSubject();
    }
    
    /**
     * Token'dan tüm claims bilgilerini alır.
     *
     * @param token JWT token
     * @return Claims
     */
    public Claims getClaimsFromToken(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    /**
     * Token'dan Authentication nesnesi oluşturur.
     *
     * @param token JWT token
     * @return Authentication
     */
    public Authentication getAuthentication(String token) {
        String username = getUsernameFromToken(token);
        
        // Claims'den rol bilgisini al
        Claims claims = getClaimsFromToken(token);
        String role = null;
        if (claims.get("role") != null) {
            role = claims.get("role").toString();
            System.out.println("JwtTokenProvider - Token'dan rol alındı: " + role);
        }
        
        // UserDetails servisi ile kullanıcı bilgilerini yükle
        UserDetails userDetails = userDetailsService.loadUserByUsername(username);
        
        // Rol bilgisini logla
        System.out.println("JwtTokenProvider - UserDetails'ten roller: " + userDetails.getAuthorities());
        
        // Authentication nesnesi oluştur
        return new UsernamePasswordAuthenticationToken(
                userDetails, "", userDetails.getAuthorities());
    }

    /**
     * Token'ın geçerli olup olmadığını kontrol eder.
     *
     * @param token JWT token
     * @return Token geçerli ise true, değilse false
     */
    public boolean validateToken(String token) {
        try {
            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(key)
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
            
            // Token süresi dolmuş mu kontrol et
            return !claims.getExpiration().before(new Date()) && !isTokenBlacklisted(token);
        } catch (Exception e) {
            System.err.println("JwtTokenProvider - Token validation error: " + e.getMessage());
            return false;
        }
    }

    public String getUsername(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody()
                .getSubject();
    }

    public Long getUserId(String token) {
        return Long.parseLong(Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody()
                .get("id").toString());
    }

    /**
     * Bir JWT token'dan tüm claim'leri çıkarır
     */
    public Claims extractAllClaims(String token) {
        return Jwts
                .parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    /**
     * JWT token'dan belirli bir claim'i çıkarır
     */
    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    /**
     * JWT token'dan kullanıcı e-postasını çıkarır
     */
    public String getEmailFromToken(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    /**
     * Refresh token'dan kullanıcı e-postasını çıkarır
     */
    public String getEmailFromRefreshToken(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    /**
     * JWT token'ın geçerlilik süresini kontrol eder
     */
    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    /**
     * JWT token'ın süresi dolmuş mu kontrol eder
     */
    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    /**
     * Token blacklist'te mi kontrol eder
     */
    private boolean isTokenBlacklisted(String token) {
        return blacklistedTokens.containsKey(token);
    }

    /**
     * JWT token'ı geçersiz kılar (blacklist'e ekler)
     */
    public void invalidateToken(String token) {
        blacklistedTokens.put(token, true);
    }

    /**
     * Refresh token'ın geçerliliğini kontrol eder
     */
    public boolean validateRefreshToken(String token) {
        try {
            Jws<Claims> claims = Jwts.parserBuilder()
                    .setSigningKey(key)
                    .build()
                    .parseClaimsJws(token);

            return !claims.getBody().getExpiration().before(new Date()) && !isTokenBlacklisted(token);
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    /**
     * Extra claim'leri olmayan bir JWT token oluşturur
     */
    public String generateToken(UserDetails userDetails) {
        return generateToken(new HashMap<>(), userDetails);
    }

    /**
     * Extra claim'leri olan bir JWT token oluşturur
     */
    public String generateToken(
            Map<String, Object> extraClaims,
            UserDetails userDetails
    ) {
        // UserDetails'ten User nesnesine dönüştür
        if (userDetails instanceof User) {
            User user = (User) userDetails;
            extraClaims.put("role", user.getRole().name());
        }
        return buildToken(extraClaims, userDetails, jwtExpiration);
    }

    /**
     * Refresh token oluşturur
     */
    public String generateRefreshToken(UserDetails userDetails) {
        return buildToken(new HashMap<>(), userDetails, refreshExpiration);
    }

    /**
     * JWT token'ı inşa eder
     */
    private String buildToken(
            Map<String, Object> extraClaims,
            UserDetails userDetails,
            long expiration
    ) {
        return Jwts
                .builder()
                .setClaims(extraClaims)
                .setSubject(userDetails.getUsername())
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }
}