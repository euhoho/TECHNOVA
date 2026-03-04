package org.grupo3.technova.repository.impl;
import org.grupo3.technova.data.enums.EnumCategoria;
import org.grupo3.technova.data.model.Producto;
import org.grupo3.technova.data.model.Usuario;
import org.grupo3.technova.repository.ProductoRepository;
import org.springframework.stereotype.Repository;

import javax.sql.DataSource;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

@Repository
public class ProductoRepositoryImpl implements ProductoRepository {

    private final DataSource dataSource;

    public ProductoRepositoryImpl(DataSource dataSource) {this.dataSource = dataSource;}
    @Override
    public DataSource getDataSource() {
        return dataSource;
    }
    @Override
     public List<Producto> listar(){  List<Producto> productos = new ArrayList<>();
        // Requisito Entregable 3: los endpoints GET deben usar procedimientos almacenados
        // definidos en procedures_technova.sql (sin SELECT embebido en el código).
        String sql = "{CALL sp_productos_listar()}";

        try (Connection con = dataSource.getConnection();
             CallableStatement cs = con.prepareCall(sql);
             ResultSet rs = cs.executeQuery()){

            while (rs.next()){
                Producto p = new Producto(
                        rs.getLong(Producto.ID_PRODUCTO),
                        rs.getString(Producto.SKU),
                        rs.getString(Producto.NOMBRE),
                        rs.getString(Producto.DESCRIPCION),
                        rs.getDouble(Producto.PRECIO),
                        rs.getInt(Producto.STOCK),
                        EnumCategoria.valueOf(rs.getString(Producto.CATEGORIA)),
                        rs.getString(Producto.IMAGEN)
                );
                productos.add(p);
            }
        } catch (SQLException e) {
            throw new RuntimeException(e);
        }
        return productos;
    }

    @Override
    public List<Producto> findByCategoria (EnumCategoria categoria){
        List<Producto> productos = new ArrayList<>();
        String sql = "{CALL sp_productos_por_categoria(?)}";

        try (Connection con = dataSource.getConnection();
             CallableStatement cs = con.prepareCall(sql)) {
            cs.setString(1, categoria.name());
            ResultSet rs = cs.executeQuery();

            while (rs.next()) {
                Producto p = new Producto(
                        rs.getLong(Producto.ID_PRODUCTO),
                        rs.getString(Producto.SKU),
                        rs.getString(Producto.NOMBRE),
                        rs.getString(Producto.DESCRIPCION),
                        rs.getDouble(Producto.PRECIO),
                        rs.getInt(Producto.STOCK),
                        EnumCategoria.valueOf(rs.getString(Producto.CATEGORIA)),
                        rs.getString(Producto.IMAGEN)
                );
                productos.add(p);
            }
        } catch (SQLException e) {
            throw new RuntimeException(e);
        }
        return productos;
    }

    @Override

    public void save(Producto producto) {
       // if(!usuario.getRol().equals("ADMINISTRADOR")) {
            //    throw new RuntimeException("Acceso denegado. Solo los administradores pueden crear productos.");
          //  }

            // Validaciones y guardar producto...
       if(producto.getSku().isEmpty() || producto.getNombre().isEmpty() || producto.getDescripcion().isEmpty() || producto.getCategoria().name().isEmpty() || producto.getImagen().isEmpty())
        {
            throw new RuntimeException("Error. Parámetros vacíos");
        }

        String sql = "CALL sp_crear_producto(?, ?, ?, ?, ?, ?, ?)";

        try (Connection con = dataSource.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {

            ps.setString(1, producto.getSku());
            ps.setString(2, producto.getNombre());
            ps.setString(3, producto.getDescripcion());
            ps.setDouble(4, producto.getPrecio());
            ps.setInt(5, producto.getStock());
            ps.setString(6, producto.getCategoria().name());
            ps.setString(7, producto.getImagen());

            ps.executeUpdate();

        } catch (SQLException e) {
            throw new RuntimeException(e);
        }
    }}



