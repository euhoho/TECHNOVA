package org.grupo3.technova.repository;

import org.grupo3.technova.data.model.Producto;
import org.grupo3.technova.data.enums.EnumCategoria;
import org.grupo3.technova.data.model.Usuario;

import javax.sql.DataSource;
import java.util.List;
// Repositorio para manejar operaciones de producto en la base de datos.
//Se define los metodos para crear, listar productos de la BD
public interface ProductoRepository {

    DataSource getDataSource();

    List<Producto> listar();

    List<Producto> findByCategoria(EnumCategoria categoria);

    void save(Producto producto);
}
