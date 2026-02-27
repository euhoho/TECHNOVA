package org.grupo3.technova.data.model;

import org.grupo3.technova.data.enums.EnumPedidoEstado;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class Pedido {

    private Long id_pedido;
    private Long id_usuario;
    private LocalDateTime fecha;
    private double total_pedido;
    private EnumPedidoEstado pedido_estado;
    private List<LineaPedido> lineaPedidos = new ArrayList<>();

    //Constructor con id_pedido para leer un pedido
    public Pedido(Long id_pedido, Long id_usuario, LocalDateTime fecha, double total_pedido, EnumPedidoEstado pedido_estado, List<LineaPedido> lineaPedidos) {
        this.id_pedido = id_pedido;
        this.id_usuario = id_usuario;
        this.fecha = fecha;
        this.total_pedido = total_pedido;
        this.pedido_estado = pedido_estado;
        this.lineaPedidos = lineaPedidos;
    }

    //Constructor sin id_pedido para crear un pedido
    public Pedido(Long id_usuario, LocalDateTime fecha, double total_pedido, EnumPedidoEstado pedido_estado, List<LineaPedido> lineaPedidos) {
        this.id_usuario = id_usuario;
        this.fecha = fecha;
        this.total_pedido = total_pedido;
        this.pedido_estado = pedido_estado;
        this.lineaPedidos = lineaPedidos;
    }

    public Pedido() {
    }

    public Long getId_pedido() {
        return id_pedido;
    }

    public void setId_pedido(Long id_pedido) {
        this.id_pedido = id_pedido;
    }

    public Long getId_usuario() {
        return id_usuario;
    }

    public void setId_usuario(Long id_usuario) {
        this.id_usuario = id_usuario;
    }

    public LocalDateTime getFecha() {
        return fecha;
    }

    public void setFecha(LocalDateTime fecha) {
        this.fecha = fecha;
    }

    public double getTotal_pedido() {
        return total_pedido;
    }

    public void setTotal_pedido(double total_pedido) {
        this.total_pedido = total_pedido;
    }

    public EnumPedidoEstado getPedido_estado() {
        return pedido_estado;
    }

    public void setPedido_estado(EnumPedidoEstado pedido_estado) {
        this.pedido_estado = pedido_estado;
    }

    public List<LineaPedido> getLineaPedidos() {
        return lineaPedidos;
    }

    public void setLineaPedidos(List<LineaPedido> lineaPedidos) {
        this.lineaPedidos = lineaPedidos;
    }
}