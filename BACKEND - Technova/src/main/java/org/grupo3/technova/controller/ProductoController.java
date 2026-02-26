package org.grupo3.technova.controller;

import org.grupo3.technova.data.enums.EnumCategoria;
import org.grupo3.technova.data.model.Producto;
import org.grupo3.technova.repository.ProductoRepository;

import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/productos")
public class ProductoController {

    private final ProductoRepository productoRepository;

    public ProductoController(ProductoRepository ProductoRepository) {
        this.productoRepository = ProductoRepository;
    }
    @GetMapping
    public List<Producto> listar(){
        return productoRepository.listar();
    }

    @GetMapping("/{categoria}")
    public List<Producto> listarPorCategoria(@PathVariable EnumCategoria categoria){ return productoRepository.findByCategoria(categoria);}
    @PostMapping
    public void crear(@RequestBody Producto producto){
        productoRepository.save(producto);
    }
}