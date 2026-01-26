package com.cony.manage.global.auth;

import org.springframework.beans.factory.annotation.Value;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.SignatureAlgorithm;
import jakarta.annotation.PostConstruct;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Collections;
import java.util.Date;
import java.util.List;

@Component
public class JwtProvider {

    @Value("${JWT_SECRET}")
    private String secretKey;

    private Key key;
    private final long accessTokenExpiration = 3600000;

    @PostConstruct
    protected void init() {
        this.key = Keys.hmacShaKeyFor(secretKey.getBytes());
    }

    public String createAccessToken(String email, String role) {
        try {
            Date now = new Date();
            return Jwts.builder()
                    .setSubject(email)
                    .claim("role", role)
                    .setIssuedAt(now)
                    .setExpiration(new Date(now.getTime() + accessTokenExpiration))
                    .signWith(key, SignatureAlgorithm.HS256)
                    .compact();
        } catch (Exception e) {
            e.printStackTrace();
            throw e;
        }
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder()
                    .setSigningKey(key)
                    .build()
                    .parseClaimsJws(token);
            return true;
        } catch (SecurityException | MalformedJwtException e) {
            // log.info("잘못된 JWT 서명입니다.");
        } catch (ExpiredJwtException e) {
            // log.info("만료된 JWT 토큰입니다.");
        } catch (UnsupportedJwtException e) {
            // log.info("지원되지 않는 JWT 토큰입니다.");
        } catch (IllegalArgumentException e) {
            // log.info("JWT 토큰이 잘못되었습니다.");
        }
        return false;
    }

    public Authentication getAuthentication(String token) {
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();

        String role = claims.get("role", String.class);
        List<SimpleGrantedAuthority> authorities =
                Collections.singletonList(new SimpleGrantedAuthority(role));

        User principal = new User(claims.getSubject(), "", authorities);

        return new UsernamePasswordAuthenticationToken(principal, token, authorities);
    }
}
