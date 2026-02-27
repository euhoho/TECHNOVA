package org.grupo3.technova.repository;

import org.grupo3.technova.data.dto.request.PedidoRequest;
import org.grupo3.technova.data.enums.EnumPedidoEstado;
import org.grupo3.technova.data.model.LineaPedido;
import org.grupo3.technova.data.model.Pedido;
import org.grupo3.technova.data.model.Producto;

import java.time.LocalDateTime;
import java.util.List;

public interface PedidoRepository {
    List<Pedido> listarPedidos();

    Long crearPedido(PedidoRequest pedidoRequest, boolean descontarStock);

    List<Pedido> listarPedidosPorEstadoYFecha(EnumPedidoEstado pedidoEstado, LocalDateTime fechaInicio, LocalDateTime fechaFin);
}