package org.grupo3.technova.data.model;

import com.google.gson.JsonObject;

/**
 * Modelo que representa una línea dentro de un pedido (un producto + cantidad).
 * Implementa JsonSerializable para poder convertirse en JsonObject con GSON.
 */
public class LineaPedido implements JsonSerializable {

    // Constantes con los nombres de columna de la tabla LINEA_PEDIDO en la BD.
    public static final String ID_LINEA_PEDIDO         = "id_linea_pedido";
    public static final String ID_PEDIDO               = "id_pedido";
    public static final String ID_PRODUCTO             = "id_producto";
    public static final String CANTIDAD                = "cantidad";
    public static final String PRECIO_UNITARIO_MOMENTO = "precio_unitario_momento";

    private int    id_linea_pedido;
    private int    id_pedido;
    private int    id_producto;
    private int    cantidad;
    private double precio_unitario_momento;

    public LineaPedido() {}

    // Constructor completo (para leer desde ResultSet)
    public LineaPedido(int id_linea_pedido, int id_pedido, int id_producto,
                       int cantidad, double precio_unitario_momento) {
        this.id_linea_pedido         = id_linea_pedido;
        this.id_pedido               = id_pedido;
        this.id_producto             = id_producto;
        this.cantidad                = cantidad;
        this.precio_unitario_momento = precio_unitario_momento;
    }

    // --- Getters y Setters ---

    public int getId_linea_pedido()                         { return id_linea_pedido; }
    public void setId_linea_pedido(int id_linea_pedido)     { this.id_linea_pedido = id_linea_pedido; }

    public int getId_pedido()                               { return id_pedido; }
    public void setId_pedido(int id_pedido)                 { this.id_pedido = id_pedido; }

    public int getId_producto()                             { return id_producto; }
    public void setId_producto(int id_producto)             { this.id_producto = id_producto; }

    public int getCantidad()                                { return cantidad; }
    public void setCantidad(int cantidad)                   { this.cantidad = cantidad; }

    public double getPrecio_unitario_momento()              { return precio_unitario_momento; }
    public void setPrecio_unitario_momento(double v)        { this.precio_unitario_momento = v; }

    /**
     * Convierte esta LineaPedido en un JsonObject de GSON.
     */
    @Override
    public JsonObject toJsonObject() {
        JsonObject json = new JsonObject();
        json.addProperty(ID_LINEA_PEDIDO,         id_linea_pedido);
        json.addProperty(ID_PEDIDO,               id_pedido);
        json.addProperty(ID_PRODUCTO,             id_producto);
        json.addProperty(CANTIDAD,                cantidad);
        json.addProperty(PRECIO_UNITARIO_MOMENTO, precio_unitario_momento);
        return json;
    }
}
