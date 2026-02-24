package org.grupo3.technova.repository;

import org.grupo3.technova.data.dto.request.PedidoRequest;
import org.grupo3.technova.data.enums.EnumPedidoEstado;
import org.grupo3.technova.data.model.Pedido;

import java.time.LocalDateTime;
import java.util.List;

public interface PedidoRepository {
    Pedido findById(Long id_pedido);
    Long crearPedido(PedidoRequest pedidoRequest, boolean descontarStock);
    List<Pedido> findAll(EnumPedidoEstado pedidoEstado, LocalDateTime fechaInicio, LocalDateTime fechaFin);
}