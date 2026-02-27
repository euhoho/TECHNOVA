package org.grupo3.technova.repository.impl;

import org.grupo3.technova.data.enums.EnumCategoria;
import org.grupo3.technova.data.enums.EnumTipoMovimiento;
import org.grupo3.technova.data.model.MovimientoInventario;
import org.grupo3.technova.data.model.Producto;
import org.grupo3.technova.repository.MovimientoInventarioRepository;
import org.springframework.stereotype.Repository;

import javax.sql.DataSource;
import java.sql.CallableStatement;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

@Repository
public class MovimientoInventarioImpl implements MovimientoInventarioRepository {

    private final DataSource dataSource;

    public MovimientoInventarioImpl(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @Override
    public DataSource getDataSource() {
        return dataSource;
    }

    @Override
    public void save(MovimientoInventario movimiento) {
        String sql = "{CALL sp_movimiento_inventario(?, ?, ?, ?, ?)}";

        try (Connection con = getDataSource().getConnection();
             CallableStatement cs = con.prepareCall(sql)) {
            cs.setLong(1, movimiento.getId_producto().getId_producto());
            cs.setString(2, movimiento.getTipo_movimiento().name());
            cs.setDate(3, movimiento.getFecha_movimiento());
            cs.setInt(4, movimiento.getCantidad_movimiento());
            cs.setString(5, movimiento.getMotivo_movimiento());

            cs.execute();
        } catch (SQLException e) {
            throw new RuntimeException("Error guardando movimiento", e);
        }
    }

    @Override
    public List<MovimientoInventario> findAll() {
        List<MovimientoInventario> movimientos = new ArrayList<>();
        String sql = "{CALL sp_movimiento_inventario_listar()}";

        try (Connection con = getDataSource().getConnection();
             CallableStatement cs = con.prepareCall(sql);
             ResultSet rs = cs.executeQuery()) {

            while (rs.next()) {
                Producto producto = new Producto(
                        rs.getLong("id_producto"),
                        rs.getString("sku"),
                        rs.getString("nombre"),
                        rs.getString("descripcion"),
                        rs.getDouble("precio"),
                        rs.getInt("stock"),
                        EnumCategoria.valueOf(rs.getString("categoria")),
                        rs.getString("imagen")
                );
                MovimientoInventario m = new MovimientoInventario(
                        rs.getLong(MovimientoInventario.ID_MOVIMIENTO),
                        producto,
                        EnumTipoMovimiento.valueOf(rs.getString(MovimientoInventario.TIPO_MOVIMIENTO)),
                        rs.getDate(MovimientoInventario.FECHA_MOVIMIENTO),
                        rs.getInt(MovimientoInventario.CANTIDAD_MOVIMIENTO),
                        rs.getString(MovimientoInventario.MOTIVO_MOVIMIENTO)
                );
                movimientos.add(m);
            }
        } catch (SQLException e) {
            throw new RuntimeException("Error consultando movimientos del inventario.", e);
        }
        return movimientos;
    }



    @Override
    public List<MovimientoInventario> findByProductoId(Long idProducto) {
        List<MovimientoInventario> movimientos = new ArrayList<>();
        String sql = "{CALL sp_movimiento_inventario_listar_id_producto(?)}";

        try (Connection con = getDataSource().getConnection();
             CallableStatement cs = con.prepareCall(sql)) {
            cs.setLong(1, idProducto);

            try (ResultSet rs = cs.executeQuery()){
                while(rs.next()) {
                    Producto producto = new Producto(
                            rs.getLong("id_producto"),
                            rs.getString("sku"),
                            rs.getString("nombre"),
                            rs.getString("descripcion"),
                            rs.getDouble("precio"),
                            rs.getInt("stock"),
                            EnumCategoria.valueOf(rs.getString("categoria")),
                            rs.getString("imagen")
                    );
                    MovimientoInventario m = new MovimientoInventario(
                            rs.getLong(MovimientoInventario.ID_MOVIMIENTO),
                            producto,
                            EnumTipoMovimiento.valueOf(rs.getString(MovimientoInventario.TIPO_MOVIMIENTO)),
                            rs.getDate(MovimientoInventario.FECHA_MOVIMIENTO),
                            rs.getInt(MovimientoInventario.CANTIDAD_MOVIMIENTO),
                            rs.getString(MovimientoInventario.MOTIVO_MOVIMIENTO)
                    );

                    movimientos.add(m);
                }
            }

        } catch (SQLException e) {
            throw new RuntimeException("Error consultando movimientos por producto", e);
        }

        return movimientos;
    }

    }