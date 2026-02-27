package org.grupo3.technova.repository;

import org.grupo3.technova.data.model.Producto;
import org.grupo3.technova.data.enums.EnumCategoria;

import javax.sql.DataSource;
import java.util.List;

public interface ProductoRepository {

    DataSource getDataSource();

    List<Producto> listar();

    List<Producto> findByCategoria(EnumCategoria categoria);

    void save(Producto producto);
}