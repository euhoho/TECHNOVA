package org.grupo3.technova.controller;

import org.grupo3.technova.data.enums.EnumCategoria;
import org.grupo3.technova.data.model.Producto;
import org.grupo3.technova.repository.ProductoRepository;
import org.grupo3.technova.services.ProductoService;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/productos")
public class ProductoController {

    private final ProductoService productoService;

    public ProductoController(ProductoService productoService) {
        this.productoService = productoService;
    }
    @GetMapping
    public List<Producto> listar(){
        return productoService.listar();
    }

    @GetMapping("/{categoria}")
    public List<Producto> listarPorCategoria(@PathVariable EnumCategoria categoria){ return productoService.findByCategoria(categoria);}
    @PostMapping
    public void crear(@RequestBody Producto producto){
        productoService.save(producto);
    }
}