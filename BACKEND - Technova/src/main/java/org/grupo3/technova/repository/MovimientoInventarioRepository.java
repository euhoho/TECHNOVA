package org.grupo3.technova.repository;

import javax.sql.DataSource;
import java.util.List;

import org.grupo3.technova.data.dto.request.MovimientoInventarioRequest;
import org.grupo3.technova.data.model.MovimientoInventario;
// Repositorio para manejar operaciones de Movimiento inventario en la base de datos.
//Se define los metodso para guardar, consultar Movimiento de inventario de la BD
public interface MovimientoInventarioRepository {

    DataSource getDataSource();

    void save(MovimientoInventarioRequest movimiento);

    List<MovimientoInventario> findAll();

    List<MovimientoInventario> findByProductoId(Long idProducto);
}