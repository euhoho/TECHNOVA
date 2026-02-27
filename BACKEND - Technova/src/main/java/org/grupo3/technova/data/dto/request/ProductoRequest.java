package org.grupo3.technova.data.dto.request;

import org.grupo3.technova.data.enums.EnumCategoria;

public class ProductoRequest {
    private String sku;
    private String nombre;
    private String descripcion;
    private Double precio;
    private int stock;
    private EnumCategoria categoria;
    private String imagen;

    public String getSku() {return sku;}
    public void setSku(String sku) {this.sku = sku;}

    public String getImagen() {return imagen;}
    public void setImagen(String imagen) {this.imagen = imagen;}

    public EnumCategoria getCategoria() {return categoria;}
    public void setCategoria(EnumCategoria categoria) {this.categoria = categoria;}

    public int getStock() {return stock;}
    public void setStock(int stock) {this.stock = stock;}

    public Double getPrecio() {return precio;}
    public void setPrecio(Double precio) {this.precio = precio;}

    public String getDescripcion() {return descripcion;}
    public void setDescripcion(String descripcion) {this.descripcion = descripcion;}

    public String getNombre() {return nombre;}
    public void setNombre(String nombre) {this.nombre = nombre;}
}
