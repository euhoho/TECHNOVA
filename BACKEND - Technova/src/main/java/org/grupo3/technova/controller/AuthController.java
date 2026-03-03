package org.grupo3.technova.controller;

import com.google.gson.JsonObject;
import org.grupo3.technova.data.dto.request.LoginRequest;
import org.grupo3.technova.data.model.Usuario;
import org.grupo3.technova.repository.UsuarioRepository;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Controlador REST para autenticación de usuarios.
 *
 * POST /api/login
 *   Recibe: { "email": "x", "password": "y" }
 *   Éxito:  200 OK  → { "status": "ok", "rol": "CLIENTE" }
 *   Fallo:  401     → { "status": "error", "mensaje": "Credenciales incorrectas" }
 */
@RestController
@RequestMapping("/api")
public class AuthController {

    private final UsuarioRepository usuarioRepository;

    public AuthController(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    /**
     * POST /api/login
     * Valida email y password contra la tabla USUARIOS de la BD.
     * Devuelve el rol del usuario si las credenciales son correctas.
     */
    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestBody LoginRequest request) {

        // Validación básica de campos obligatorios
        if (request.getEmail() == null || request.getEmail().isBlank() ||
                request.getPassword() == null || request.getPassword().isBlank()) {

            JsonObject error = new JsonObject();
            error.addProperty("status",  "error");
            error.addProperty("mensaje", "Email y password son obligatorios");

            return ResponseEntity
                    .status(400)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(error.toString());
        }

        // Intentamos autenticar al usuario en la BD
        Usuario usuario = usuarioRepository.login(request.getEmail(), request.getPassword());

        if (usuario == null) {
            // Credenciales incorrectas → 401 Unauthorized
            JsonObject error = new JsonObject();
            error.addProperty("status",  "error");
            error.addProperty("mensaje", "Credenciales incorrectas");

            return ResponseEntity
                    .status(401)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(error.toString());
        }

        // Login correcto → 200 OK con status y rol
        JsonObject respuesta = new JsonObject();
        respuesta.addProperty("status", "ok");
        respuesta.addProperty("rol",    usuario.getRol().name());   // ej: "ADMINISTRADOR"
        respuesta.add("usuario",        usuario.toJsonObject());     // datos del usuario (sin password)

        return ResponseEntity
                .status(200)
                .contentType(MediaType.APPLICATION_JSON)
                .body(respuesta.toString());
    }
}
