package org.grupo3.technova.data.dto.request;

import org.grupo3.technova.data.enums.EnumTipoMovimiento;

public class MovimientoInventarioRequest {

    private Long id_producto;
    private EnumTipoMovimiento tipo_movimiento;
    private Integer cantidad_movimiento;
    private String motivo_movimiento;

    public Long getId_producto() {
        return id_producto;
    }

    public void setId_producto(Long id_producto) {
        this.id_producto = id_producto;
    }

    public EnumTipoMovimiento getTipo_movimiento() {
        return tipo_movimiento;
    }

    public void setTipo_movimiento(EnumTipoMovimiento tipo_movimiento) {
        this.tipo_movimiento = tipo_movimiento;
    }

    public Integer getCantidad_movimiento() {
        return cantidad_movimiento;
    }

    public void setCantidad_movimiento(Integer cantidad_movimiento) {
        this.cantidad_movimiento = cantidad_movimiento;
    }

    public String getMotivo_movimiento() {
        return motivo_movimiento;
    }

    public void setMotivo_movimiento(String motivo_movimiento) {
        this.motivo_movimiento = motivo_movimiento;
    }
}