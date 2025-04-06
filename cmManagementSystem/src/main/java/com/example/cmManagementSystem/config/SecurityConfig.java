package com.example.cmManagementSystem.config;

import com.example.cmManagementSystem.security.JwtTokenFilter;
import com.example.cmManagementSystem.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.security.config.Customizer;

import java.util.Arrays;
import java.util.Collections;
import java.util.Map;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtTokenFilter jwtTokenFilter;
    private final AuthenticationProvider authenticationProvider;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        System.out.println("SecurityConfig - SecurityFilterChain yapılandırılıyor...");
        
        return http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .authorizeHttpRequests(auth -> {
                    auth
                            // Authentication endpoints
                            .requestMatchers("/auth/**").permitAll()
                            .requestMatchers("/api/auth/**").permitAll()
                            .requestMatchers("/auth/login").permitAll()
                            .requestMatchers("/auth/register").permitAll()
                            .requestMatchers("/auth/current-user").authenticated()
                            .requestMatchers("/auth/validate-token").authenticated()
                            
                            // Club endpoints - önemli düzeltme: categories endpoint'i herkese açık
                            .requestMatchers(HttpMethod.GET, "/api/clubs").permitAll() // Kulüpler listesi herkese açık
                            .requestMatchers(HttpMethod.GET, "/api/clubs/categories").permitAll() // Kategoriler herkese açık
                            .requestMatchers(HttpMethod.GET, "/api/clubs/**").permitAll() // Alt endpoint'ler herkese açık
                            .requestMatchers(HttpMethod.GET, "/clubs/**").permitAll()
                            .requestMatchers(HttpMethod.POST, "/api/clubs").hasRole("ADMIN")
                            .requestMatchers(HttpMethod.POST, "/api/clubs/**").hasRole("ADMIN")
                            .requestMatchers(HttpMethod.DELETE, "/api/clubs/**").hasRole("ADMIN")
                            .requestMatchers(HttpMethod.PUT, "/api/clubs/**").hasAnyRole("ADMIN", "CLUB_PRESIDENT")
                            
                            // Membership endpoints - üyelik kontrolü için herkese açık izin verildi
                            .requestMatchers(HttpMethod.GET, "/api/clubs/*/membership/check").permitAll()
                            .requestMatchers(HttpMethod.GET, "/api/clubs/{clubId}/membership/check").permitAll()
                            .requestMatchers(HttpMethod.GET, "/api/clubs/[0-9]+/membership/check").permitAll()
                            .requestMatchers(HttpMethod.POST, "/api/clubs/*/membership/join").authenticated()
                            .requestMatchers(HttpMethod.POST, "/api/clubs/*/membership/leave").authenticated()
                            
                            // Event endpoints - izinler güncellendi
                            .requestMatchers(HttpMethod.GET, "/api/events/**").permitAll() // Tüm etkinlikler görüntülenebilir
                            .requestMatchers(HttpMethod.GET, "/api/events").permitAll()
                            .requestMatchers(HttpMethod.GET, "/api/events/participation/user/**").permitAll() // Kullanıcıların etkinlikleri herkese açık
                            
                            // User endpoints - izinler güncellendi
                            .requestMatchers(HttpMethod.GET, "/api/users/**").permitAll() // Kullanıcı bilgileri görüntülenebilir
                            
                            // Static resources
                            .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                            .requestMatchers("/uploads/**").permitAll()
                            
                            // Diğer tüm istekler için kimlik doğrulama gerekli
                            .anyRequest().authenticated();
                    
                    System.out.println("SecurityConfig - API endpoint izinleri güncellendi:");
                    System.out.println(" - /api/clubs ve /api/clubs/** herkes tarafından erişilebilir");
                    System.out.println(" - /api/clubs/categories herkes tarafından erişilebilir");
                    System.out.println(" - /api/events/participation/user/** herkes tarafından erişilebilir");
                })
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )
                .authenticationProvider(authenticationProvider)
                .addFilterBefore(jwtTokenFilter, UsernamePasswordAuthenticationFilter.class)
                .httpBasic(Customizer.withDefaults())
                .build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Collections.singletonList("http://localhost:5173"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD"));
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "Accept", "X-Requested-With",
                "Cache-Control", "X-User-Role", "Origin", "Access-Control-Request-Method", 
                "Access-Control-Request-Headers", "Content-Disposition"));
        configuration.setExposedHeaders(Arrays.asList("Authorization", "Access-Control-Allow-Origin",
                "Access-Control-Allow-Credentials", "Access-Control-Allow-Headers"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        System.out.println("SecurityConfig - CORS yapılandırması oluşturuldu. İzin verilen kaynaklar: " + configuration.getAllowedOrigins());
        System.out.println("SecurityConfig - CORS yapılandırması - İzin verilen metodlar: " + configuration.getAllowedMethods());
        System.out.println("SecurityConfig - CORS yapılandırması - İzin verilen başlıklar: " + configuration.getAllowedHeaders());

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    public void addRoleToClaims(Map<String, Object> claims, User user) {
        claims.put("role", user.getRole().name());
    }
}