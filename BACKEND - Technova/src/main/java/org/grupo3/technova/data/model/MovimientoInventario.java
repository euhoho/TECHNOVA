package org.grupo3.technova.data.model;

import org.grupo3.technova.data.enums.EnumTipoMovimiento;

import java.sql.Date;

/**
 * Modelo que representa un movimiento de inventario en la BD.
 * Cada vez que entra o sale stock de un producto se registra aquí.
 */
public class MovimientoInventario {

    // Constantes con los nombres de las columnas de la tabla MovimientoInventario en la BD.
    // Las usamos al leer el ResultSet para evitar errores de typo en los String.
    public static final String ID_MOVIMIENTO       = "id_movimiento";
    public static final String TIPO_MOVIMIENTO     = "tipo_movimiento";
    public static final String FECHA_MOVIMIENTO    = "fecha_movimiento";
    public static final String CANTIDAD_MOVIMIENTO = "cantidad_movimiento";
    public static final String MOTIVO_MOVIMIENTO   = "motivo_movimiento";

    private Long               id_movimiento;
    private Producto           id_producto;        // objeto Producto completo (JOIN en el SP)
    private EnumTipoMovimiento tipo_movimiento;    // ENTRADA o SALIDA
    private Date               fecha_movimiento;
    private Integer            cantidad_movimiento;
    private String             motivo_movimiento;

    // Constructor vacío necesario para que frameworks como Spring o Gson puedan instanciar la clase.
    public MovimientoInventario() {}

    // Constructor completo para crear un objeto desde un ResultSet.
    public MovimientoInventario(Long id_movimiento, Producto id_producto,
                                EnumTipoMovimiento tipo_movimiento, Date fecha_movimiento,
                                Integer cantidad_movimiento, String motivo_movimiento) {
        this.id_movimiento       = id_movimiento;
        this.id_producto         = id_producto;
        this.tipo_movimiento     = tipo_movimiento;
        this.fecha_movimiento    = fecha_movimiento;
        this.cantidad_movimiento = cantidad_movimiento;
        this.motivo_movimiento   = motivo_movimiento;
    }

    // --- Getters (solo lectura, sin setters porque los datos vienen de BD) ---

    public Long getId_movimiento() {
        return id_movimiento;
    }

    public Producto getId_producto() {
        return id_producto;
    }

    public EnumTipoMovimiento getTipo_movimiento() {
        return tipo_movimiento;
    }

    public Date getFecha_movimiento() {
        return fecha_movimiento;
    }

    public Integer getCantidad_movimiento() {
        return cantidad_movimiento;
    }

    public String getMotivo_movimiento() {
        return motivo_movimiento;
    }
}
