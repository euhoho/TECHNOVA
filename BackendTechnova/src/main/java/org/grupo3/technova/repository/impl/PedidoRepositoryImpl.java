package org.grupo3.technova.repository.impl;

import org.grupo3.technova.data.dto.request.LineaPedidoRequest;
import org.grupo3.technova.data.dto.request.PedidoRequest;
import org.grupo3.technova.data.enums.EnumPedidoEstado;
import org.grupo3.technova.data.model.LineaPedido;
import org.grupo3.technova.data.model.Pedido;
import org.grupo3.technova.repository.PedidoRepository;
import org.grupo3.technova.repository.UsuarioRepository;
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
    public Pedido findById(Long id_pedido) {
        if (id_pedido == null) throw new IllegalArgumentException("id_pedido no puede ser nulo");

        String call = "{CALL sp_pedido_id(?)}";

        try (Connection con = dataSource.getConnection();
             CallableStatement cs = con.prepareCall(call)) {

            cs.setLong(1, id_pedido);

            try (ResultSet rs = cs.executeQuery()) {
                if (!rs.next()) return null;

                Long idPedido = rs.getLong("id_pedido");
                Long idUsuario = rs.getLong("id_usuario");

                Timestamp ts = rs.getTimestamp("fecha");
                LocalDateTime fecha = (ts == null) ? null : ts.toLocalDateTime();

                double total = rs.getDouble("total_pedido");

                String estadoStr = rs.getString("pedido_estado");
                EnumPedidoEstado estado = (estadoStr == null || estadoStr.isBlank())
                        ? null
                        : EnumPedidoEstado.valueOf(estadoStr.trim().toUpperCase());

                return new Pedido(idPedido, idUsuario, fecha, total, estado, new ArrayList<>());
            }

        } catch (SQLException e) {
            throw new RuntimeException("Error buscando pedido por id: " + id_pedido, e);
        }
    }

    @Override
    public Long crearPedido(PedidoRequest pedidoRequest, boolean descontarStock) {
        if (pedidoRequest == null) throw new IllegalArgumentException("PedidoRequest nulo");
        if (pedidoRequest.getUsuario() == null) throw new IllegalArgumentException("Usuario obligatorio");
        if (pedidoRequest.getUsuario().getEmail() == null || pedidoRequest.getUsuario().getEmail().isBlank())
            throw new IllegalArgumentException("Email obligatorio");
        if (pedidoRequest.getUsuario().getPassword() == null || pedidoRequest.getUsuario().getPassword().isBlank())
            throw new IllegalArgumentException("Password obligatorio");
        if (pedidoRequest.getLineas() == null || pedidoRequest.getLineas().isEmpty())
            throw new IllegalArgumentException("El pedido debe tener al menos una línea");

        Long idUsuario = usuarioRepository.findIdByEmailAndPassword(
                pedidoRequest.getUsuario().getEmail(),
                pedidoRequest.getUsuario().getPassword()
        );
        if (idUsuario == null) throw new SecurityException("Credenciales inválidas");

        double total = 0.0;
        for (LineaPedidoRequest l : pedidoRequest.getLineas()) {
            if (l == null) continue;
            if (l.getCantidad() <= 0) throw new IllegalArgumentException("Cantidad inválida");
            total += l.getCantidad() * l.getPrecioUnitario();
        }

        // Por ahora: solo cabecera (mínimo viable). Si luego metes líneas/stock, se hace con transacción.
        String call = "{CALL sp_crear_pedido(?,?,?)}";

        try (Connection con = dataSource.getConnection();
             CallableStatement cs = con.prepareCall(call)) {

            cs.setLong(1, idUsuario);
            cs.setString(2,);
            cs.setLong(3, );
            cs.registerOutParameter(4, Types.BIGINT);

            cs.execute();

            long idPedido = cs.getLong(4);
            if (idPedido <= 0) throw new SQLException("No se pudo obtener id_pedido");

            return idPedido;

        } catch (SQLException e) {
            throw new RuntimeException("Error creando pedido", e);
        }
    }

    @Override
    public List<Pedido> findAll(EnumPedidoEstado pedidoEstado, LocalDateTime fechaInicio, LocalDateTime fechaFin) {
        String call = "{CALL sp_buscar_pedidos(?, ?, ?)}";
        List<Pedido> pedidos = new ArrayList<>();

        try (Connection con = dataSource.getConnection();
             CallableStatement cs = con.prepareCall(call)) {

            if (pedidoEstado != null) cs.setString(1, pedidoEstado.name());
            else cs.setNull(1, Types.VARCHAR);

            if (fechaInicio != null) cs.setTimestamp(2, Timestamp.valueOf(fechaInicio));
            else cs.setNull(2, Types.TIMESTAMP);

            if (fechaFin != null) cs.setTimestamp(3, Timestamp.valueOf(fechaFin));
            else cs.setNull(3, Types.TIMESTAMP);

            try (ResultSet rs = cs.executeQuery()) {
                while (rs.next()) {
                    Long idPedido = rs.getLong("id_pedido");
                    Long idUsuario = rs.getLong("id_usuario");

                    Timestamp ts = rs.getTimestamp("fecha");
                    LocalDateTime fecha = (ts == null) ? null : ts.toLocalDateTime();

                    double total = rs.getDouble("total_pedido");

                    String estadoStr = rs.getString("pedido_estado");
                    EnumPedidoEstado estado = (estadoStr == null || estadoStr.isBlank())
                            ? null
                            : EnumPedidoEstado.valueOf(estadoStr.trim().toUpperCase());

                    pedidos.add(new Pedido(idPedido, idUsuario, fecha, total, estado, new ArrayList<>()));
                }
            }

            return pedidos;

        } catch (SQLException e) {
            throw new RuntimeException("Error buscando pedidos", e);
        }
    }
}
