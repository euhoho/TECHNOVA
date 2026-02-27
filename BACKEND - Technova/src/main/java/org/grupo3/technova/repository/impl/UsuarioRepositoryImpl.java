package org.grupo3.technova.repository.impl;

import org.grupo3.technova.data.enums.EnumPedidoEstado;
import org.grupo3.technova.data.enums.EnumRol;
import org.grupo3.technova.data.model.LineaPedido;
import org.grupo3.technova.data.model.Pedido;
import org.grupo3.technova.data.model.Usuario;
import org.grupo3.technova.repository.UsuarioRepository;
import org.springframework.stereotype.Repository;

import javax.sql.DataSource;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

@Repository
public class UsuarioRepositoryImpl implements UsuarioRepository {

    private final DataSource dataSource;

    public UsuarioRepositoryImpl(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @Override
    public DataSource getDataSource() {
        return dataSource;
    }

    // 🔐 LOGIN (USA sp_usuario)
    @Override
    public Usuario login(String email, String password) {

        String sql = "{CALL sp_usuario(?, ?)}";

        try (Connection con = dataSource.getConnection();
             CallableStatement cs = con.prepareCall(sql)) {

            cs.setString(1, email);
            cs.setString(2, password);

            try (ResultSet rs = cs.executeQuery()) {
                if (rs.next()) {
                    return new Usuario(
                            rs.getLong("id_usuario"),
                            rs.getString("email"),
                            rs.getString("password"),
                            EnumRol.valueOf(rs.getString("rol"))
                    );
                }
            }

        } catch (SQLException e) {
            throw new RuntimeException("Error en login", e);
        }

        return null;
    }

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

    // 📦 PEDIDOS DEL USUARIO
    @Override
    public List<Pedido> obtenerPedidosDeUsuario(Long idUsuario) {

        List<Pedido> pedidos = new ArrayList<>();
        String sql = "SELECT * FROM pedido WHERE id_usuario = ?";

        try (Connection con = dataSource.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {

            ps.setLong(1, idUsuario);

            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
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
}