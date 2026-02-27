package org.grupo3.technova.repository.impl;

import org.grupo3.technova.data.model.LineaPedido;
import org.grupo3.technova.data.dto.request.LineaPedidoRequest;
import org.grupo3.technova.repository.LineaPedidoRepository;
import org.springframework.stereotype.Repository;

import javax.sql.DataSource;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

@Repository
public class LineaPedidoRepositoryImpl implements LineaPedidoRepository {

    private final DataSource dataSource;

    public LineaPedidoRepositoryImpl(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @Override
    public DataSource getDataSource() {
        return dataSource;
    }

    @Override
    public void save(LineaPedidoRequest request) {
        String sql = "INSERT INTO linea_pedido (id_producto, cantidad, precio_unitario_momento) VALUES (?, ?, ?)";

        try (Connection con = dataSource.getConnection();
             PreparedStatement ps = con.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {

            ps.setInt(1, request.getIdProducto().intValue());
            ps.setInt(2, request.getCantidad());
            ps.setDouble(3, request.getPrecioUnitario());

            ps.executeUpdate();

            try (ResultSet generatedKeys = ps.getGeneratedKeys()) {
                if (generatedKeys.next()) {
                    int idGenerado = generatedKeys.getInt(1);
                    System.out.println("LineaPedido insertada con ID: " + idGenerado);
                }
            }

        } catch (SQLException e) {
            throw new RuntimeException("Error guardando linea de pedido", e);
        }
    }

    @Override
    public List<LineaPedido> findAll() {
        List<LineaPedido> lineas = new ArrayList<>();
        String sql = "SELECT * FROM linea_pedido";

        try (Connection con = dataSource.getConnection();
             PreparedStatement ps = con.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {

            while (rs.next()) {
                LineaPedido l = new LineaPedido(
                        rs.getInt("id_linea_pedido"),
                        rs.getInt("id_pedido"),
                        rs.getInt("id_producto"),
                        rs.getInt("cantidad"),
                        rs.getDouble("precio_unitario_momento")
                );
                lineas.add(l);
            }

        } catch (SQLException e) {
            throw new RuntimeException("Error consultando lineas de pedido", e);
        }

        return lineas;
    }

    @Override
    public List<LineaPedido> findByIdPedido(int idPedido) {
        List<LineaPedido> lineas = new ArrayList<>();
        String sql = "SELECT * FROM linea_pedido WHERE id_pedido = ?";

        try (Connection con = dataSource.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {

            ps.setInt(1, idPedido);

            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    LineaPedido l = new LineaPedido(
                            rs.getInt("id_linea_pedido"),
                            rs.getInt("id_pedido"),
                            rs.getInt("id_producto"),
                            rs.getInt("cantidad"),
                            rs.getDouble("precio_unitario_momento")
                    );
                    lineas.add(l);
                }
            }

        } catch (SQLException e) {
            throw new RuntimeException("Error consultando lineas por idPedido", e);
        }

        return lineas;
    }

    @Override
    public List<LineaPedido> findByIdProducto(int idProducto) {
        List<LineaPedido> lineas = new ArrayList<>();
        String sql = "SELECT * FROM linea_pedido WHERE id_producto = ?";

        try (Connection con = dataSource.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {

            ps.setInt(1, idProducto);

            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    LineaPedido l = new LineaPedido(
                            rs.getInt("id_linea_pedido"),
                            rs.getInt("id_pedido"),
                            rs.getInt("id_producto"),
                            rs.getInt("cantidad"),
                            rs.getDouble("precio_unitario_momento")
                    );
                    lineas.add(l);
                }
            }

        } catch (SQLException e) {
            throw new RuntimeException("Error consultando lineas por idProducto", e);
        }

        return lineas;
    }
}