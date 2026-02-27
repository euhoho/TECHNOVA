package org.grupo3.technova.repository.impl;

import org.grupo3.technova.repository.UsuarioRepository;
import org.springframework.stereotype.Repository;

@Repository
public class UsuarioRepositoryImpl implements UsuarioRepository {
    @Override
    public Long findIdByEmailAndPassword(String email, String password) {
        // Stub temporal para que compile
        return null;
    }
}
