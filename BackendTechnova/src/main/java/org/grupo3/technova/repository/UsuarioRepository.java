package org.grupo3.technova.repository;

public interface UsuarioRepository {
    Long findIdByEmailAndPassword(String email, String password);
}
