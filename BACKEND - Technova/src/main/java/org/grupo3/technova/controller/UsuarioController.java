package org.grupo3.technova.controller;

import org.grupo3.technova.data.dto.request.LoginRequest;
import org.grupo3.technova.data.dto.response.LoginResponse;
import org.grupo3.technova.data.model.Usuario;
import org.grupo3.technova.repository.impl.UsuarioRepositoryImpl;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

    private final UsuarioRepositoryImpl usuarioRepository;

    public UsuarioController(UsuarioRepositoryImpl usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    @PostMapping("/login")
    public LoginResponse login(@RequestBody LoginRequest request) {

        Usuario usuario = usuarioRepository.login(
                request.getEmail(),
                request.getPassword()
        );

        if (usuario == null) {
            return null; // luego puedes devolver 401
        }

        return new LoginResponse(
                usuario,
                usuarioRepository.obtenerPedidosDeUsuario(usuario.getId_usuario())
        );
    }
}