package org.grupo3.technova.data.model;

import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import org.grupo3.technova.data.enums.EnumPedidoEstado;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Modelo que representa un Pedido en TechNova.
 * Implementa JsonSerializable para convertirse en JsonObject con GSON.
 * Incluye la lista de líneas de pedido (LineaPedido).
 */
public class Pedido implements JsonSerializable {

    private Long              id_pedido;
    private Long              id_usuario;
    private LocalDateTime     fecha;
    private double            total_pedido;
    private EnumPedidoEstado  pedido_estado;
    private List<LineaPedido> lineaPedidos = new ArrayList<>();

    public Pedido() {}

    // Constructor con id (para leer desde BD)
    public Pedido(Long id_pedido, Long id_usuario, LocalDateTime fecha,
                  double total_pedido, EnumPedidoEstado pedido_estado,
                  List<LineaPedido> lineaPedidos) {
        this.id_pedido     = id_pedido;
        this.id_usuario    = id_usuario;
        this.fecha         = fecha;
        this.total_pedido  = total_pedido;
        this.pedido_estado = pedido_estado;
        this.lineaPedidos  = lineaPedidos;
    }

    // Constructor sin id (para crear un nuevo pedido)
    public Pedido(Long id_usuario, LocalDateTime fecha, double total_pedido,
                  EnumPedidoEstado pedido_estado, List<LineaPedido> lineaPedidos) {
        this.id_usuario    = id_usuario;
        this.fecha         = fecha;
        this.total_pedido  = total_pedido;
        this.pedido_estado = pedido_estado;
        this.lineaPedidos  = lineaPedidos;
    }

    // --- Getters y Setters ---

    public Long getId_pedido()                             { return id_pedido; }
    public void setId_pedido(Long id_pedido)               { this.id_pedido = id_pedido; }

    public Long getId_usuario()                            { return id_usuario; }
    public void setId_usuario(Long id_usuario)             { this.id_usuario = id_usuario; }

    public LocalDateTime getFecha()                        { return fecha; }
    public void setFecha(LocalDateTime fecha)              { this.fecha = fecha; }

    public double getTotal_pedido()                        { return total_pedido; }
    public void setTotal_pedido(double total_pedido)       { this.total_pedido = total_pedido; }

    public EnumPedidoEstado getPedido_estado()             { return pedido_estado; }
    public void setPedido_estado(EnumPedidoEstado estado)  { this.pedido_estado = estado; }

    public List<LineaPedido> getLineaPedidos()             { return lineaPedidos; }
    public void setLineaPedidos(List<LineaPedido> lineas)  { this.lineaPedidos = lineas; }

    /**
     * Convierte este Pedido en un JsonObject de GSON.
     * Incluye un JsonArray con todas sus líneas.
     */
    @Override
    public JsonObject toJsonObject() {
        JsonObject json = new JsonObject();
        json.addProperty("id_pedido",     id_pedido);
        json.addProperty("id_usuario",    id_usuario);
        // La fecha se envía como String para simplificar (recomendación guía)
        json.addProperty("fecha",         fecha != null ? fecha.toString() : null);
        json.addProperty("total_pedido",  total_pedido);
        json.addProperty("pedido_estado", pedido_estado != null ? pedido_estado.name() : null);

        // Construir el array de líneas
        JsonArray lineasArray = new JsonArray();
        if (lineaPedidos != null) {
            for (LineaPedido linea : lineaPedidos) {
                lineasArray.add(linea.toJsonObject());
            }
        }
        json.add("lineas", lineasArray);

        return json;
    }
}
