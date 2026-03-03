package org.grupo3.technova.data.model;

import com.google.gson.JsonObject;
import org.grupo3.technova.data.enums.EnumCategoria;

/**
 * Modelo que representa un Producto de la tienda TechNova.
 * Implementa JsonSerializable para poder convertirse en JsonObject con GSON.
 */
public class Producto implements JsonSerializable {

    // Constantes con los nombres de columna de la tabla PRODUCTO en la BD.
    public static final String ID_PRODUCTO          = "id_producto";
    public static final String SKU                  = "sku";
    public static final String NOMBRE               = "nombre";
    public static final String DESCRIPCION          = "descripcion";
    public static final String PRECIO               = "precio";
    public static final String STOCK                = "stock";
    public static final String CATEGORIA            = "categoria";
    public static final String IMAGEN               = "imagen";

    private Long          id_producto;
    private String        sku;
    private String        nombre;
    private String        descripcion;
    private Double        precio;
    private int           stock;
    private EnumCategoria categoria;
    private String        imagen;

    // Constructor completo (para leer desde ResultSet)
    public Producto(Long id_producto, String sku, String nombre, String descripcion,
                    Double precio, int stock, EnumCategoria categoria, String imagen) {
        this.id_producto = id_producto;
        this.sku         = sku;
        this.nombre      = nombre;
        this.descripcion = descripcion;
        this.precio      = precio;
        this.stock       = stock;
        this.categoria   = categoria;
        this.imagen      = imagen;
    }

    // --- Getters y Setters ---

    public Long getId_producto()                      { return id_producto; }
    public void setId_producto(Long id_producto)      { this.id_producto = id_producto; }

    public String getSku()                            { return sku; }
    public void setSku(String sku)                    { this.sku = sku; }

    public String getNombre()                         { return nombre; }
    public void setNombre(String nombre)              { this.nombre = nombre; }

    public String getDescripcion()                    { return descripcion; }
    public void setDescripcion(String descripcion)    { this.descripcion = descripcion; }

    public Double getPrecio()                         { return precio; }
    public void setPrecio(Double precio)              { this.precio = precio; }

    public int getStock()                             { return stock; }
    public void setStock(int stock)                   { this.stock = stock; }

    public EnumCategoria getCategoria()               { return categoria; }
    public void setCategoria(EnumCategoria categoria) { this.categoria = categoria; }

    public String getImagen()                         { return imagen; }
    public void setImagen(String imagen)              { this.imagen = imagen; }

    /**
     * Convierte este Producto en un JsonObject de GSON.
     * Se usará en los controllers para construir la respuesta JSON.
     */
    @Override
    public JsonObject toJsonObject() {
        JsonObject json = new JsonObject();
        json.addProperty(ID_PRODUCTO, id_producto);
        json.addProperty(SKU,         sku);
        json.addProperty(NOMBRE,      nombre);
        json.addProperty(DESCRIPCION, descripcion);
        json.addProperty(PRECIO,      precio);       // numérico, no String
        json.addProperty(STOCK,       stock);        // numérico
        json.addProperty(CATEGORIA,   categoria != null ? categoria.name() : null);
        json.addProperty(IMAGEN,      imagen);
        return json;
    }
}
