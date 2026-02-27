package org.grupo3.technova.data.model;
// se declara los campos que existieran en nuestra tabla Linea pedido de la BD
public class LineaPedido {
    // Constantes que representan los nombres de las columnas de la tabla linea pedido en la base de datos.
    public static final String ID_LINEA_PEDIDO = "id_linea_pedido";
    public static final String ID_PEDIDO = "id_pedido";
    public static final String ID_PRODUCTO = "id_producto";
    public static final String CANTIDAD = "cantidad";
    public static final String PRECIO_UNITARIO_MOMENTO = "precio_unitario_momento";

    private int id_linea_pedido;
    private int id_pedido;
    private int id_producto;
    private int cantidad;
    private double precio_unitario_momento;

    public LineaPedido() {}
//Constructor de linea pedido
    public LineaPedido(int id_linea_pedido, int id_pedido, int id_producto, int cantidad, double precio_unitario__momento) {
        this.id_linea_pedido = id_linea_pedido;
        this.id_pedido = id_pedido;
        this.id_producto = id_producto;
        this.cantidad = cantidad;
        this.precio_unitario_momento = precio_unitario__momento;
    }
    // realizamos el get y set de cada campo
    public int getId_linea_pedido() { return id_linea_pedido; }
    public void setId_linea_pedido(int id_linea_pedido) { this.id_linea_pedido = id_linea_pedido; }

    public int getId_pedido() { return id_pedido; }
    public void setId_pedido(int id_pedido) { this.id_pedido = id_pedido; }

    public int getId_producto() { return id_producto; }
    public void setId_producto(int id_producto) { this.id_producto = id_producto; }

    public int getCantidad() { return cantidad; }
    public void setCantidad(int cantidad) { this.cantidad = cantidad; }

    public double getPrecio_unitario_momento() { return precio_unitario_momento; }
    public void setPrecio_unitario_momento(double precio_unitario_momento) { this.precio_unitario_momento = precio_unitario_momento; }

}
