package org.grupo3.technova.repository;

import org.grupo3.technova.data.model.Pedido;
import org.grupo3.technova.data.model.Usuario;

import javax.sql.DataSource;
import java.util.List;

public interface UsuarioRepository {

    DataSource getDataSource();

    Usuario login(String email, String password);

    List<Usuario> findAll();

    List<Pedido> obtenerPedidosDeUsuario(Long idUsuario);
    Usuario Save(Usuario usuario);
}