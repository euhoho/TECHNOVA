package org.grupo3.technova.repository;

import org.grupo3.technova.data.model.MovimientoInventario;
import org.grupo3.technova.data.model.Producto;
import org.grupo3.technova.data.enums.EnumTipoMovimiento;
import org.grupo3.technova.data.enums.EnumCategoria;

import javax.sql.DataSource;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public interface MovimientoInventarioRepository {
    DataSource getDataSource();

    void save (MovimientoInventario movimiento);
    List<MovimientoInventario> findAll();

    List<MovimientoInventario> findByProductoId(Long idProducto);

}