package org.grupo3.technova.controller;

import org.grupo3.technova.data.dto.request.LoginRequest;
import org.grupo3.technova.data.dto.response.LoginResponse;
import org.grupo3.technova.data.model.Usuario;
import org.grupo3.technova.repository.impl.UsuarioRepositoryImpl;
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

        Usuario usuario = usuarioRepository.login(
                request.getEmail(),
                request.getPassword()
        );

        if (usuario == null) {
            return null; // posteriormente se puede devolver un 401 Unauthorized
        }

        return new LoginResponse(
                usuario,
                usuarioRepository.obtenerPedidosDeUsuario(usuario.getId_usuario())
        );
    }
}