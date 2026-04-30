package org.grupo3.technova.repository;

import org.grupo3.technova.data.model.Pedido;
import org.grupo3.technova.data.model.Usuario;

import javax.sql.DataSource;
import java.util.List;

/**
 * Interfaz del repositorio de usuarios.
 * Define las operaciones disponibles sobre la tabla USUARIO de la BD.
 * La implementación real está en UsuarioRepositoryImpl.
 */
public interface UsuarioRepository {

    // Devuelve el DataSource (la conexión a BD) que usa este repositorio.
    DataSource getDataSource();

    // Comprueba las credenciales del usuario. Devuelve el Usuario si son correctas, o null si no.
    Usuario login(String email, String passwordPlano);

    // Devuelve todos los usuarios registrados en la BD.
    List<Usuario> findAll();

    // Devuelve la lista de pedidos que ha hecho un usuario concreto.
    List<Pedido> obtenerPedidosDeUsuario(Long idUsuario);

    // Guarda un nuevo usuario en la BD (hasheando la contraseña antes de insertarla).
    Usuario save(Usuario usuario);
}
