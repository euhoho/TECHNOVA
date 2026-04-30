package org.grupo3.technova.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.*;

// Clase de configuración para permitir peticiones desde otros orígenes (CORS).
// Sin esto, el navegador bloquearía las llamadas al API desde el frontend.
@Configuration
public class CorsConfig {

    // Definimos el bean que configura las reglas CORS de la aplicación.
    @Bean
    public WebMvcConfigurer corsConfigurer() {

        return new WebMvcConfigurer() {

            @Override
            public void addCorsMappings(CorsRegistry registry) {

                // Permitimos acceso desde cualquier origen a todos los endpoints,
                // aceptando los métodos HTTP más comunes y cualquier cabecera.
                // En producción convendría restringir allowedOrigins a dominios concretos.
                registry.addMapping("/**")
                        .allowedOrigins("*")
                        .allowedMethods("GET", "POST", "PUT", "DELETE")
                        .allowedHeaders("*");

            }
        };
    }
}
