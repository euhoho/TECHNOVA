package org.grupo3.technova.controller;

import org.grupo3.technova.data.enums.EnumCategoria;
import org.grupo3.technova.data.model.Producto;
import org.grupo3.technova.repository.ProductoRepository;
import org.springframework.web.bind.annotation.*;
import java.util.List;

/**
 Controlador REST para gestionar productos.
 Permite listar todos los productos, filtrar por categoría y crear nuevos productos.
 */
@RestController
@RequestMapping("/api/productos")
public class ProductoController {

    private final ProductoRepository productoRepository;

    public ProductoController(ProductoRepository productoRepository) {
        this.productoRepository = productoRepository;
    }

    /**
     Obtiene la lista de todos los productos.
     @return Lista completa de productos.
     */
    @GetMapping
    public List<Producto> listar() {
        return productoRepository.listar();
    }

    /**
     Obtiene la lista de productos filtrados por categoría.
     @param categoria Categoría de los productos a filtrar.
     @return Lista de productos que pertenecen a la categoría indicada.
     */
    @GetMapping("/{categoria}")
    public List<Producto> listarPorCategoria(@PathVariable EnumCategoria categoria) {
        return productoRepository.findByCategoria(categoria);
    }

    /**
     Crea un nuevo producto en la base de datos.
     @param producto Objeto Producto con todos los datos a guardar.
     */
    @PostMapping
    public void crear(@RequestBody Producto producto) {
        productoRepository.save(producto);
    }
}