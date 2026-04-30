package org.grupo3.technova;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

// Esta anotación le dice a Spring Boot que esta es la clase principal de la aplicación.
// Activa la configuración automática y el escaneo de componentes del proyecto.
@SpringBootApplication
public class BackendTechnovaApplication {

    // Punto de entrada de la aplicación, igual que en cualquier programa Java.
    // Spring se encarga del resto a partir de aquí.
    public static void main(String[] args) {
        SpringApplication.run(BackendTechnovaApplication.class, args);
    }

}
