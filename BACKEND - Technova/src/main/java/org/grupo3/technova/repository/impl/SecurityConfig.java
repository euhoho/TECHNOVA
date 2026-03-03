package org.grupo3.technova.repository.impl;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        // This tells Spring: "Whenever someone asks for a PasswordEncoder,
        // give them this BCrypt implementation."
        return new BCryptPasswordEncoder();
    }
}
//SecurityConfig esta puesta aqui de forma temporal se debe cambiar de sitio para mantener un orden
