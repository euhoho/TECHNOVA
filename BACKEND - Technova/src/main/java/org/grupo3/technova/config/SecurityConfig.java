package org.grupo3.technova.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

// Clase de configuración de seguridad.
// Por ahora solo define el codificador de contraseñas que usará toda la aplicación.
// TODO: SecurityConfig está aquí de forma temporal, habría que moverla para mantener mejor el orden del proyecto.
@Configuration
public class SecurityConfig {

    // Registramos BCryptPasswordEncoder como el algoritmo de hasheo de contraseñas.
    // BCrypt es el estándar recomendado: aplica un factor de coste que lo hace resistente a ataques de fuerza bruta.
    // Spring lo inyectará automáticamente donde haga falta (por ejemplo en UsuarioRepositoryImpl).
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
