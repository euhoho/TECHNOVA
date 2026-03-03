package org.grupo3.technova.repository;

import org.grupo3.technova.data.model.LineaPedido;
import org.grupo3.technova.data.dto.request.LineaPedidoRequest;

import javax.sql.DataSource;
import java.util.List;
// Repositorio para manejar operaciones de LineaPedido en la base de datos.
//Se define los metodso para guardar, consultar lineas de pedido de la BD
public interface LineaPedidoRepository {

    DataSource getDataSource();

    void save(LineaPedidoRequest lineaPedido);

    List<LineaPedido> findAll();

    List<LineaPedido> findByIdPedido(int idPedido);

    List<LineaPedido> findByIdProducto(int idProducto);
}