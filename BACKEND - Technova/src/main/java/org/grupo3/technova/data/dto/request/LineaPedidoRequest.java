package org.grupo3.technova.data.dto.request;

/**
 DTO utilizado para enviar los datos de una línea de pedido al crear un pedido.
 Contiene la información necesaria para registrar cada producto dentro de un pedido.
 */
public class LineaPedidoRequest {
    private Long idProducto;
    private int cantidad;
    private double precioUnitario;

    public Long getIdProducto() { return idProducto; }
    public void setIdProducto(Long idProducto) { this.idProducto = idProducto; }

    public int getCantidad() { return cantidad; }
    public void setCantidad(int cantidad) { this.cantidad = cantidad; }

    public double getPrecioUnitario() { return precioUnitario; }
    public void setPrecioUnitario(double precioUnitario) { this.precioUnitario = precioUnitario; }
}
