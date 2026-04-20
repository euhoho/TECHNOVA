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

@Repository //Le dice a Spring que esta clase es un componente de acceso a datos
public class ProductoRepositoryImpl implements ProductoRepository {
    //DataSource es el objeto que nos da conexiones a la base de datos
    //Spring lo inyecta automaticamente
    private final DataSource dataSource;

    public ProductoRepositoryImpl(DataSource dataSource) {this.dataSource = dataSource;}
    @Override
    public DataSource getDataSource() {
        return dataSource;
    }
    /**
     * Devuelve todos los productos de la base de datos.
     *
     * Importante: usamos un procedimiento almacenado (sp_productos_listar)
     * en lugar de SQL embebido directamente en el código Java.
     * Esto mejora la seguridad, el rendimiento y el mantenimiento,
     * ya que la lógica SQL vive en la base de datos, no dispersa por el código.
     */
    @Override
     public List<Producto> listar(){  List<Producto> productos = new ArrayList<>();
        // Requisito Entregable 3: los endpoints GET deben usar procedimientos almacenados
        // definidos en procedures_technova.sql (sin SELECT embebido en el código).
        String sql = "{CALL sp_productos_listar()}";
        //Garantiza que la conexión, el statement y el ResultSet
        // se cierran automáticamente al terminar
        try (Connection con = dataSource.getConnection();
             CallableStatement cs = con.prepareCall(sql);
             ResultSet rs = cs.executeQuery()){
            // Recorremos cada fila del resultado y construimos un objeto Producto
            while (rs.next()){
                Producto p = new Producto(
                        rs.getLong(Producto.ID_PRODUCTO),
                        rs.getString(Producto.SKU),
                        rs.getString(Producto.NOMBRE),
                        rs.getString(Producto.DESCRIPCION),
                        rs.getDouble(Producto.PRECIO),
                        rs.getInt(Producto.STOCK),
                        EnumCategoria.valueOf(rs.getString(Producto.CATEGORIA)), // Convertimos String → Enum
                        rs.getString(Producto.IMAGEN)
                );
                productos.add(p);
            }
        } catch (SQLException e) {
            // Envolvemos la excepción SQL en una RuntimeException para no obligar
            // a las capas superiores (servicio, controlador) a manejar SQLException
            throw new RuntimeException(e);
        }
        return productos;
    }

    /**
     * Devuelve los productos filtrados por una categoría concreta.
     * Recibe un valor del enum EnumCategoria (ej: ELECTRONICA, ROPA...)
     * y llama al procedimiento almacenado correspondiente pasándole ese valor como parámetro.
     */
    @Override
    public List<Producto> findByCategoria (EnumCategoria categoria){
        List<Producto> productos = new ArrayList<>();
        // El '?' es un parámetro de entrada que se sustituirá de forma segura,
        // previniendo inyección SQL (SQL Injection)
        String sql = "{CALL sp_productos_por_categoria(?)}";

        try (Connection con = dataSource.getConnection();
             CallableStatement cs = con.prepareCall(sql)) {
            cs.setString(1, categoria.name());// Pasamos el nombre del enum como String al procedimiento almacenado
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

    /**
     * Guarda un nuevo producto en la base de datos.
     *
     * Antes de ejecutar la inserción, se valida que ningún campo obligatorio
     * esté vacío. Si alguno lo está, se lanza una excepción con un mensaje claro.
     *
     * Nota: el control de roles (que solo un ADMINISTRADOR pueda crear productos)
     * está comentado porque se gestiona en otra capa (servicio o seguridad),
     * siguiendo el principio de separación de responsabilidades.
     */
    @Override

    public void save(Producto producto) {
       // if(!usuario.getRol().equals("ADMINISTRADOR")) {
            //    throw new RuntimeException("Acceso denegado. Solo los administradores pueden crear productos.");
          //  }

        // Validación de campos obligatorios antes de tocar la base de datos
        if(producto.getSku().isEmpty() || producto.getNombre().isEmpty() || producto.getDescripcion().isEmpty() || producto.getCategoria().name().isEmpty() || producto.getImagen().isEmpty())
        {
            throw new RuntimeException("Error. Parámetros vacíos");
        }
        // Llamada al procedimiento almacenado de inserción con 7 parámetros de entrada
        String sql = "CALL sp_crear_producto(?, ?, ?, ?, ?, ?, ?)";

        try (Connection con = dataSource.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {
            // Asignamos cada campo del objeto Producto a su parámetro correspondiente
            ps.setString(1, producto.getSku());
            ps.setString(2, producto.getNombre());
            ps.setString(3, producto.getDescripcion());
            ps.setDouble(4, producto.getPrecio());
            ps.setInt(5, producto.getStock());
            ps.setString(6, producto.getCategoria().name());
            ps.setString(7, producto.getImagen());
            // executeUpdate() se usa para INSERT, UPDATE y DELETE (no devuelve ResultSet)
            ps.executeUpdate();

        } catch (SQLException e) {
            throw new RuntimeException(e);
        }
    }
}