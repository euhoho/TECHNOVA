package org.grupo3.technova.repository.impl;

import org.grupo3.technova.data.dto.request.LineaPedidoRequest;
import org.grupo3.technova.data.dto.request.PedidoRequest;
import org.grupo3.technova.data.enums.EnumPedidoEstado;
import org.grupo3.technova.data.model.Pedido;
import org.grupo3.technova.repository.PedidoRepository;
import org.grupo3.technova.repository.UsuarioRepository;
import org.grupo3.technova.data.model.Usuario;

import org.springframework.stereotype.Repository;

import javax.sql.DataSource;
import java.sql.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Repository
public class PedidoRepositoryImpl implements PedidoRepository {

    private final DataSource dataSource;
    private final UsuarioRepository usuarioRepository;

    public PedidoRepositoryImpl(DataSource dataSource, UsuarioRepository usuarioRepository) {
        this.dataSource = dataSource;
        this.usuarioRepository = usuarioRepository;
    }

    @Override
    public List<Pedido> listarPedidos() {

        String call = "{CALL sp_pedidos()}";
        List<Pedido> pedidos = new ArrayList<>();

        try (Connection con = dataSource.getConnection(); CallableStatement cs = con.prepareCall(call); ResultSet rs = cs.executeQuery()) {

            while (rs.next()) {
                Pedido p = new Pedido();

                // Leemos columnas básicas.
                p.setId_pedido(rs.getLong("id_pedido"));
                p.setId_usuario(rs.getLong("id_usuario"));
                // La columna fecha viene como Timestamp (SQL) y la convertimos a LocalDateTime.
                Timestamp ts = rs.getTimestamp("fecha");
                p.setFecha(ts != null ? ts.toLocalDateTime() : null);

                p.setTotal_pedido(rs.getDouble("total_pedido"));

                p.setPedido_estado(EnumPedidoEstado.valueOf(rs.getString("pedido_estado")));
                // Añadimos el pedido a la lista.
                pedidos.add(p);
            }
            return pedidos;

        } catch (SQLException e) {
            throw new RuntimeException("Error listando pedidos", e);
        }
    }

    @Override
    public Long crearPedido(PedidoRequest pedidoRequest, boolean descontarStock) {
        //Validaciones
        if (pedidoRequest == null) throw new IllegalArgumentException("PedidoRequest nulo");
        if (pedidoRequest.getUsuario() == null) throw new IllegalArgumentException("Usuario obligatorio");
        if (pedidoRequest.getUsuario().getEmail() == null || pedidoRequest.getUsuario().getEmail().isBlank())
            throw new IllegalArgumentException("Email obligatorio");
        if (pedidoRequest.getUsuario().getPassword() == null || pedidoRequest.getUsuario().getPassword().isBlank())
            throw new IllegalArgumentException("Password obligatorio");
        if (pedidoRequest.getLineas() == null || pedidoRequest.getLineas().isEmpty())
            throw new IllegalArgumentException("El pedido debe tener al menos una línea");

        //Validamos credenciales
        Usuario usuario = usuarioRepository.login(
                pedidoRequest.getUsuario().getEmail(),
                pedidoRequest.getUsuario().getPassword()
        );

        if (usuario == null) {
            throw new SecurityException("Credenciales inválidas");
        }

        Long idUsuario = usuario.getId_usuario();

        String call = "{CALL sp_crear_pedido(?,?,?)}";

        try (Connection con = dataSource.getConnection(); CallableStatement cs = con.prepareCall(call)) {
            con.setAutoCommit(false);
            //Calcula total.
            double total = 0.0;

            //Entrada
            cs.setLong(1, idUsuario);
            cs.setDouble(2, total);
            //Salida
            cs.registerOutParameter(3, Types.BIGINT);

            cs.execute();

            Long idPedido = cs.getLong(3);
            //Validamos idPedido generado.
            if (idPedido <= 0){ throw new SQLException("No se pudo obtener id_pedido");}
            // ================ CREAR LINEA PEDIDO =============================
            double totalFinalPedido = 0.0;
            String sqlLinea = "{CALL sp_crear_linea_pedido(?,?,?,?)}";
            try (CallableStatement csLinea = con.prepareCall(sqlLinea)) {
                for (LineaPedidoRequest l : pedidoRequest.getLineas()) {
                    csLinea.setLong(1, idPedido);
                    csLinea.setLong(2, l.getIdProducto());
                    csLinea.setInt(3, l.getCantidad());
                    csLinea.registerOutParameter(4, java.sql.Types.DECIMAL);

                    csLinea.execute();

                    // Lo guardamos. En cada vuelta del bucle se irá actualizando.
                   totalFinalPedido = csLinea.getDouble(4);
                }

            }



            con.commit();
            return idPedido;

        } catch (SQLException e) {
            throw new RuntimeException("Error creando pedido", e);
        }
    }

    @Override
    public List<Pedido> listarPedidosPorEstadoYFecha(EnumPedidoEstado pedidoEstado, LocalDateTime fechaInicio, LocalDateTime fechaFin) {
        //Validaciones.
        if (pedidoEstado == null) throw new IllegalArgumentException("estado obligatorio");
        if (fechaInicio == null || fechaFin == null) throw new IllegalArgumentException("Fechas obligatorias");
        if (fechaInicio.isAfter(fechaFin))
            throw new IllegalArgumentException("fechaInicio no puede ser mayor que fechaFin");

        String call = "{CALL sp_buscar_pedidos(?, ?, ?)}";
        List<Pedido> pedidos = new ArrayList<>();

        try (Connection con = dataSource.getConnection(); CallableStatement cs = con.prepareCall(call)) {

            cs.setString(1, pedidoEstado.name());
            cs.setTimestamp(2, Timestamp.valueOf(fechaInicio));
            cs.setTimestamp(3, Timestamp.valueOf(fechaFin));

            try (ResultSet rs = cs.executeQuery()) {
                while (rs.next()) {
                    Pedido p = new Pedido();

                    p.setId_pedido(rs.getLong("id_pedido"));
                    p.setId_usuario(rs.getLong("id_usuario"));

                    Timestamp ts = rs.getTimestamp("fecha");
                    p.setFecha(ts != null ? ts.toLocalDateTime() : null);

                    p.setTotal_pedido(rs.getDouble("total_pedido"));
                    p.setPedido_estado(EnumPedidoEstado.valueOf(rs.getString("pedido_estado")));

                    pedidos.add(p);
                }
            } catch (SQLException e) {
                throw new RuntimeException("Error listando pedidos por filtro", e);
            }
            return pedidos;
        } catch (SQLException e) {
            throw new RuntimeException("Error buscando pedidos", e);
        }
    }
}
