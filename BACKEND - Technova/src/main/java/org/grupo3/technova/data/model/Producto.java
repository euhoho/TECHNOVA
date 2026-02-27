    package org.grupo3.technova.data.model;
    import jakarta.persistence.Entity;
    import jakarta.persistence.Table;
    import org.grupo3.technova.data.enums.EnumCategoria;
    // se declara los campos que existieran en nuestra tabla Producto de la BD
    public class Producto {
        // Constantes que representan los nombres de las columnas de la tabla Producto en la base de datos.
        public static final String ID_PRODUCTO = "id_producto";
        public static final String SKU = "sku";
        public static final String NOMBRE = "nombre";
        public static final String DESCRIPCION = "descripcion";
        public static final String PRECIO = "precio";
        public static final String STOCK = "stock";
        public static final String CATEGORIA = "categoria";
        public static final String IMAGEN = "imagen";

        private Long id_producto;
        private String sku;
        private String nombre;
        private String descripcion;
        private Double precio;
        private int stock;
        private EnumCategoria categoria;
        private String imagen;
//Constructor de producto
        public Producto(Long id_producto, String sku, String nombre, String descripcion, Double precio, int stock, EnumCategoria categoria, String imagen) {
            this.id_producto = id_producto;
            this.sku = sku;
            this.nombre = nombre;
            this.descripcion = descripcion;
            this.precio = precio;
            this.stock = stock;
            this.categoria = categoria;
            this.imagen = imagen;
        }
    // realizamos el get y post de cada campo
        public Long getId_producto() {return id_producto;}
        public void setId_producto(Long id_producto) {this.id_producto = id_producto;}

        public String getSku() {return sku;}
        public void setSku(String sku) {this.sku = sku;}

        public String getNombre() {return nombre;}
        public void setNombre(String nombre) {this.nombre = nombre;}

        public String getDescripcion() {return descripcion;}
        public void setDescripcion(String descripcion) {this.descripcion = descripcion;}

        public Double getPrecio() {return precio;}
        public void setPrecio(Double precio) {this.precio = precio;}

        public int getStock() {return stock;}
        public void setStock(int stock) {this.stock = stock;}

        public EnumCategoria getCategoria() {return categoria;}
        public void setCategoria(EnumCategoria categoria) {this.categoria = categoria;}

        public String getImagen() {return imagen;}
        public void setImagen(String imagen) {this.imagen = imagen;}
    }