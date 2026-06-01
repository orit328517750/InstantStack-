package com.example.instantstack.config;

import com.example.instantstack.service.JwtService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;
import java.util.List;

@Component
public class JwtFilter extends OncePerRequestFilter {

    @Autowired
    private JwtService jwtService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        // 1. מחלצים את ה-Header של ה-Authorization
        String authHeader = request.getHeader("Authorization");
        String token = null;
        String email = null;

        // 2. בודקים אם ה-Header קיים ומתחיל ב-Bearer
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            token = authHeader.substring(7); // מוציאים רק את המחרוזת של הטוקן
            email = jwtService.extractEmail(token); // משתמשים בפונקציה שיצרנו ב-JwtService
        }

        // 3. אם יש אימייל ואין עדיין אימות בסיסטם
        if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            if (jwtService.isTokenValid(token)) {

                // שליפת התפקיד מהטוקן ויצירת הרשאה עם קידומת ROLE_
                String role = jwtService.extractRole(token);
                List<SimpleGrantedAuthority> authorities = Collections.singletonList(
                        new SimpleGrantedAuthority("ROLE_" + role)
                );

                // יוצרים אובייקט אימות שספרינג מבין
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        email, null, authorities // כאן הוספנו את ה-Roles שחילצנו
                );
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                // מספרים לספרינג: "המשתמש הזה מאושר!"
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }

        // 4. ממשיכים הלאה למסנן הבא או לקונטרולר
        filterChain.doFilter(request, response);
    }
}