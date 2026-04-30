package org.grupo3.technova.repository.impl;

import org.grupo3.technova.data.enums.EnumPedidoEstado;
import org.grupo3.technova.data.enums.EnumRol;
import org.grupo3.technova.data.model.LineaPedido;
import org.grupo3.technova.data.model.Pedido;
import org.grupo3.technova.data.model.Usuario;
import org.grupo3.technova.repository.UsuarioRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Repository;

import javax.sql.DataSource;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

// Indica a Spring que esta clase es un componente de acceso a datos.
@Repository
public class UsuarioRepositoryImpl implements UsuarioRepository {

    private final DataSource      dataSource;
    private final PasswordEncoder passwordEncoder; // lo inyecta Spring desde SecurityConfig

    public UsuarioRepositoryImpl(DataSource dataSource, PasswordEncoder passwordEncoder) {
        this.dataSource      = dataSource;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public DataSource getDataSource() {
        return dataSource;
    }

    /**
     * Guarda un nuevo usuario en la BD llamando al procedimiento sp_crear_usuario.
     * La contraseña se hashea con BCrypt antes de enviarla, así nunca se guarda en texto plano.
     */
    @Override
    public Usuario save(Usuario usuario) {
        String sql = "{CALL sp_crear_usuario(?,?)}";

        try (Connection con = dataSource.getConnection();
             CallableStatement cs = con.prepareCall(sql)) {

            // Hasheamos la contraseña antes de pasarla al procedimiento almacenado.
            String encodedPassword = passwordEncoder.encode(usuario.getPassword());
            cs.setString(1, usuario.getEmail());
            cs.setString(2, encodedPassword);
            cs.executeUpdate();

        } catch (SQLException e) {
            throw new RuntimeException("Error Guardando el usuario en la base de datos", e);
        }
        return usuario;
    }

    /**
     * Comprueba las credenciales de un usuario.
     * Busca en BD por email (mediante SP) y luego compara la contraseña recibida
     * con el hash almacenado usando BCrypt.
     * Devuelve el Usuario si todo es correcto, o null si el email no existe o la contraseña no coincide.
     */
    @Override
    public Usuario login(String email, String passwordPlano) {
        // El SP devuelve el usuario por email; la comprobación del hash se hace en Java.
        String sql = "{CALL sp_usuario(?)}";

        try (Connection con = dataSource.getConnection();
             CallableStatement cs = con.prepareCall(sql)) {

            cs.setString(1, email);

            try (ResultSet rs = cs.executeQuery()) {
                if (rs.next()) {
                    String hashBD = rs.getString("password");

                    // BCrypt compara la contraseña en texto plano con el hash guardado en BD.
                    if (passwordEncoder.matches(passwordPlano, hashBD)) {
                        return new Usuario(
                                rs.getLong("id_usuario"),
                                rs.getString("email"),
                                hashBD,
                                EnumRol.valueOf(rs.getString("rol"))
                        );
                    }
                }
            }

        } catch (SQLException e) {
            throw new RuntimeException("Error en login", e);
        }

        // Llegamos aquí si el email no existe o la contraseña no coincide.
        return null;
    }

    /**
     * Devuelve todos los pedidos asociados a un usuario concreto.
     * Llama al procedimiento almacenado sp_pedidos_usuario pasándole el id del usuario.
     */
    @Override
    public List<Pedido> obtenerPedidosDeUsuario(Long idUsuario) {
        List<Pedido> pedidos = new ArrayList<>();
        String sql = "{CALL sp_pedidos_usuario(?)}";

        try (Connection con = dataSource.getConnection();
             CallableStatement cs = con.prepareCall(sql)) {

            cs.setLong(1, idUsuario);

            try (ResultSet rs = cs.executeQuery()) {
                while (rs.next()) {
                    // Construimos cada Pedido con los datos que devuelve el SP.
                    // Las líneas del pedido se dejan vacías; si se necesitan habría que llamar a otro SP.
                    pedidos.add(new Pedido(
                            rs.getLong("id_pedido"),
                            rs.getLong("id_usuario"),
                            rs.getTimestamp("fecha").toLocalDateTime(),
                            rs.getDouble("total_pedido"),
                            EnumPedidoEstado.valueOf(rs.getString("pedido_estado")),
                            new ArrayList<LineaPedido>()
                    ));
                }
            }

        } catch (SQLException e) {
            throw new RuntimeException("Error obteniendo pedidos", e);
        }

        return pedidos;
    }

    /**
     * Devuelve todos los usuarios de la BD usando el procedimiento sp_usuarios_listar.
     */
    @Override
    public List<Usuario> findAll() {
        List<Usuario> usuarios = new ArrayList<>();
        String sql = "{CALL sp_usuarios_listar()}";

        try (Connection con = dataSource.getConnection();
             CallableStatement cs = con.prepareCall(sql);
             ResultSet rs = cs.executeQuery()) {

            while (rs.next()) {
                usuarios.add(new Usuario(
                        rs.getLong("id_usuario"),
                        rs.getString("email"),
                        rs.getString("password"),
                        EnumRol.valueOf(rs.getString("rol"))
                ));
            }

        } catch (SQLException e) {
            throw new RuntimeException("Error listando usuarios", e);
        }

        return usuarios;
    }

    /**
     * Método de mantenimiento: recorre todos los usuarios y hashea con BCrypt
     * las contraseñas que todavía estén en texto plano (las que no empiecen por "$2a$").
     * Usar batch para que sea más eficiente y no hacer un UPDATE por cada usuario.
     * Solo ejecutar tras reiniciar la BD con datos de prueba en texto plano.
     */
    public void migrarContrasenas() {
        List<Usuario> usuarios = findAll();

        String sqlUpdate = "UPDATE usuario SET password = ? WHERE id_usuario = ?";

        try (Connection con = dataSource.getConnection();
             PreparedStatement ps = con.prepareStatement(sqlUpdate)) {

            for (Usuario u : usuarios) {
                // Si la contraseña ya empieza por "$2a$" es un hash BCrypt → la saltamos para no hashear dos veces.
                if (!u.getPassword().startsWith("$2a$")) {
                    String nuevoHash = passwordEncoder.encode(u.getPassword());

                    ps.setString(1, nuevoHash);
                    ps.setLong(2, u.getId_usuario());
                    ps.addBatch(); // acumulamos el UPDATE para ejecutarlos todos de golpe al final
                }
            }

            ps.executeBatch(); // ejecutamos todos los UPDATEs en una sola llamada a BD
            System.out.println("Migración completada: Todas las contraseñas ahora son BCrypt.");

        } catch (SQLException e) {
            throw new RuntimeException("Error durante la migración de contraseñas", e);
        }
    }
}
