
package org.grupo3.technova.data.model;
import org.grupo3.technova.data.enums.EnumTipoMovimiento;

import java.sql.Date;

public class MovimientoInventario {
    public static final String ID_MOVIMIENTO = "id_movimiento";
    public static final String TIPO_MOVIMIENTO = "tipo_movimiento";
    public static final String FECHA_MOVIMIENTO = "fecha_movimiento";
    public static final String CANTIDAD_MOVIMIENTO = "cantidad_movimiento";
    public static final String MOTIVO_MOVIMIENTO = "motivo_movimiento";
    private Long id_movimiento;
    private Producto id_producto;
    private EnumTipoMovimiento tipo_movimiento;
    private Date fecha_movimiento;
    private Integer cantidad_movimiento;
    private String motivo_movimiento;

    public MovimientoInventario() {}

    public MovimientoInventario(Long id_movimiento, Producto id_producto, EnumTipoMovimiento tipo_movimiento, Date fecha_movimiento, Integer cantidad_movimiento, String motivo_movimiento) {
        this.id_movimiento = id_movimiento;
        this.id_producto = id_producto;
        this.tipo_movimiento = tipo_movimiento;
        this.fecha_movimiento = fecha_movimiento;
        this.cantidad_movimiento = cantidad_movimiento;
        this.motivo_movimiento = motivo_movimiento;
    }

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