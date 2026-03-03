package org.grupo3.technova.config;

import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.SQLException;

/**
 * Componente que verifica la conexión a MySQL al arrancar la aplicación.
 * Si la conexión es correcta, muestra un mensaje en consola.
 * Si falla, lanza una excepción para que el arranque falle de forma visible.
 */
@Component
public class DBConnectionChecker {

    private final DataSource dataSource;

    public DBConnectionChecker(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    // Se ejecuta automáticamente al iniciar Spring Boot
    @PostConstruct
    public void checkConnection() {
        // Intentamos abrir una conexión y la cerramos inmediatamente (try-with-resources)
        try (Connection con = dataSource.getConnection()) {
            System.out.println("==============================================");
            System.out.println("  Conexión a MySQL establecida correctamente  ");
            System.out.println("  Base de datos: " + con.getCatalog());
            System.out.println("==============================================");
        } catch (SQLException e) {
            // Si falla la conexión, lo mostramos claramente en consola
            System.err.println("ERROR: No se pudo conectar a MySQL: " + e.getMessage());
            throw new RuntimeException("Fallo al conectar con MySQL", e);
        }
    }
}
