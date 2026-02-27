package org.grupo3.technova.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        //define a que rutas se les aplica CORS
        registry.addMapping("/**") // aplica a todos los endpoints
                .allowedOrigins(
                        "http://localhost:5173",
                        "http://localhost:3000"
                )
                //Permite los métodos HTTP que el frontend puede usar.
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                //Permite cualquier header enviado por el frontend.
                .allowedHeaders("*")
                //Permite enviar cookies o credenciales (por ejemplo sesión).
                .allowCredentials(true);
    }
}