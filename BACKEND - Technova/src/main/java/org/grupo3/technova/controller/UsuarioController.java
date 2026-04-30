package org.grupo3.technova.controller;

import org.grupo3.technova.data.dto.request.LoginRequest;
import org.grupo3.technova.data.dto.response.LoginResponse;
import org.grupo3.technova.data.model.Usuario;
import org.grupo3.technova.repository.UsuarioRepository;
import org.grupo3.technova.repository.impl.UsuarioRepositoryImpl;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 Controlador REST para la gestión de usuarios.
 Permite la autenticación de usuarios mediante login y puede ampliarse
 para otros endpoints relacionados con usuarios.
 */
@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

    private final UsuarioRepositoryImpl usuarioRepository;

    public UsuarioController(UsuarioRepositoryImpl usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    /**
     Endpoint para autenticar un usuario.
     Recibe un LoginRequest con email y password y devuelve un LoginResponse
     con los datos del usuario y sus pedidos asociados.
     @param request DTO con credenciales de login (email y password)
     @return LoginResponse con usuario y pedidos si la autenticación es correcta; null si falla
     */
    @PostMapping("/login")
    public LoginResponse login(@RequestBody LoginRequest request) {

        // Intentamos autenticar con las credenciales recibidas.
        Usuario usuario = usuarioRepository.login(
                request.getEmail(),
                request.getPassword()
        );

        // Si el login falla devolvemos null (pendiente de cambiar a un 401 Unauthorized).
        if (usuario == null) {
            return null;
        }

        // Si el login fue correcto, devolvemos el usuario junto con todos sus pedidos.
        return new LoginResponse(
                usuario,
                usuarioRepository.obtenerPedidosDeUsuario(usuario.getId_usuario())
        );
    }

    /**
     * POST /api/usuarios/sign-up
     * Registra un nuevo usuario en la base de datos.
     * El repositorio se encarga de hashear la contraseña antes de guardarla.
     */
    @PostMapping("/sign-up")
    public ResponseEntity<String> registrarUsuario(@RequestBody Usuario usuario) {
        try {
            usuarioRepository.save(usuario);
            return ResponseEntity.status(HttpStatus.CREATED).body("Usuario creado con éxito");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error al registrar: " + e.getMessage());
        }
    }

    /**
     * GET /api/usuarios/migrar-passwords
     * Endpoint de mantenimiento: hashea con BCrypt las contraseñas que estén en texto plano.
     * Usar únicamente cuando se haya reiniciado la base de datos y necesitemos
     * hashear las contraseñas de los usuarios ya existentes. No exponer en producción.
     */
    @GetMapping("/migrar-passwords")
    public String migrar() {
        usuarioRepository.migrarContrasenas();
        return "Proceso de hasheo finalizado correctamente";
    }
}
