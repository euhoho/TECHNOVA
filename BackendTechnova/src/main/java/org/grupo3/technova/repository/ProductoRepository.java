package org.grupo3.technova.repository;
import org.springframework.stereotype.Repository;
import java.util.List;
import org.grupo3.technova.data.model.Producto;
import javax.sql.DataSource;
import java.sql.*;
import java.util.ArrayList;
import org.grupo3.technova.data.enums.EnumCategoria;

import static org.grupo3.technova.data.model.Producto.SKU;


@Repository
public class ProductoRepository {

    private final DataSource dataSource;
    public ProductoRepository(DataSource dataSource) {
        this.dataSource = dataSource;

    }
    public  List<Producto> findAll(){
        List<Producto> productos = new ArrayList<>();
        // Requisito Entregable 3: los endpoints GET deben usar procedimientos almacenados
        // definidos en procedures_technova.sql (sin SELECT embebido en el código).
        String sql = "{CALL sp_productos_listar()}";

        try (Connection con = dataSource.getConnection();
             CallableStatement cs = con.prepareCall(sql);
             ResultSet rs = cs.executeQuery()){

            while (rs.next()){
                Producto p = new Producto(
                        rs.getLong(Producto.ID_PRODUCTO),
                        rs.getString(SKU),
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

    public List<Producto> findByCategoria(EnumCategoria categoria){
        List<Producto> productos = new ArrayList<>();
        String sql = "{CALL sp_productos_por_categoria(?)}";

        try(Connection con = dataSource.getConnection();
        CallableStatement cs = con.prepareCall(sql)) {
            cs.setString(1, categoria.name());
            ResultSet rs = cs.executeQuery();

            while (rs.next()) {
                Producto p = new Producto(
                        rs.getLong(Producto.ID_PRODUCTO),
                        rs.getString(SKU),
                        rs.getString(Producto.NOMBRE),
                        rs.getString(Producto.DESCRIPCION),
                        rs.getDouble(Producto.PRECIO),
                        rs.getInt(Producto.STOCK),
                        EnumCategoria.valueOf(rs.getString(Producto.CATEGORIA)),
                        rs.getString(Producto.IMAGEN)
                );
                productos.add(p);
            }
        }catch (SQLException e) {
            throw new RuntimeException(e);
        }
        return productos;
    }

    public void save(Producto producto){

        String sql = "INSERT INTO producto (sku, nombre, descripcion, precio, stock, categoria, imagen) VALUES (?, ?, ?, ?, ?, ?, ?)";

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
    }
}