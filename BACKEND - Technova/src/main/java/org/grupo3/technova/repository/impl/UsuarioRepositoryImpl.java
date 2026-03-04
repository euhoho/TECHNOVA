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

@Repository
public class UsuarioRepositoryImpl implements UsuarioRepository {

    private final DataSource dataSource;
    private final PasswordEncoder passwordEncoder;

    public UsuarioRepositoryImpl(DataSource dataSource, PasswordEncoder passwordEncoder) {
        this.dataSource = dataSource;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public DataSource getDataSource() {
        return dataSource;
    }
    @Override
    public Usuario save(Usuario usuario){
String sql ="{CALL sp_crear_usuario(?,?)}";

        try (Connection con = dataSource.getConnection();
             CallableStatement cs = con.prepareCall(sql)){

            String encodedPassword = passwordEncoder.encode(usuario.getPassword());
            cs.setString(1, usuario.getEmail());
            cs.setString(2, encodedPassword);
            cs.executeUpdate();
        } catch (SQLException e) {
            throw new RuntimeException("Error Guardando el usuario en la base de datos", e);
        }
        return usuario;
    }

    @Override
    public Usuario login(String email, String passwordPlano) {
        //Se hace en la bd el hash automaticamente, entonces en java no hace falta hacr nada, si encuentra el usuario todo ok.
        //O en java se hace el hash antes de interactuar con la bd.
        String sql = "{CALL sp_usuario(?)}"; // email, password(hash), rol

        try (Connection con = dataSource.getConnection();
             CallableStatement cs = con.prepareCall(sql)) {

            cs.setString(1, email);

            try (ResultSet rs = cs.executeQuery()) {
                if (rs.next()) {

                    String hashBD = rs.getString("password");

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

        return null; // usuario no encontrado o password incorrecta
    }

    @Override
    public List<Pedido> obtenerPedidosDeUsuario(Long idUsuario) {
        List<Pedido> pedidos = new ArrayList<>();
        String sql = "{CALL sp_pedidos_usuario(?)}"; // procedimiento que devuelve los pedidos

        try (Connection con = dataSource.getConnection();
             CallableStatement cs = con.prepareCall(sql)) {

            cs.setLong(1, idUsuario);

            try (ResultSet rs = cs.executeQuery()) {
                while (rs.next()) {
                    pedidos.add(new Pedido(
                            rs.getLong("id_pedido"),
                            rs.getLong("id_usuario"),
                            rs.getTimestamp("fecha").toLocalDateTime(),
                            rs.getDouble("total_pedido"),
                            EnumPedidoEstado.valueOf(rs.getString("pedido_estado")),
                            new ArrayList<LineaPedido>() // aquí podrías llamar otro sp para líneas
                    ));
                }
            }

        } catch (SQLException e) {
            throw new RuntimeException("Error obteniendo pedidos", e);
        }

        return pedidos;
    }


    // 🔹 LISTAR USUARIOS usando solo stored procedure
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
}