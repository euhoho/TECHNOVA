package org.grupo3.technova.controller;

import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import org.grupo3.technova.data.enums.EnumCategoria;
import org.grupo3.technova.data.model.Producto;
import org.grupo3.technova.repository.ProductoRepository;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controlador REST para el catálogo de Productos.
 * GET /api/productos         → lista todos los productos
 * GET /api/productos/{cat}   → filtra por categoría
 * POST /api/productos        → crea un nuevo producto
 *
 * Todas las respuestas se devuelven en formato JSON usando GSON.
 */
@RestController
@RequestMapping("/api/productos")
public class ProductoController {

    private final ProductoRepository productoRepository;

    public ProductoController(ProductoRepository productoRepository) {
        this.productoRepository = productoRepository;
    }

    /**
     * GET /api/productos
     * Devuelve el array completo de productos (llama al stored procedure sp_productos_listar).
     */
    @GetMapping
    public ResponseEntity<String> listar() {
        try {
            List<Producto> productos = productoRepository.listar();

            // Construimos el JsonArray con GSON usando el método toJsonObject() de cada producto
            JsonArray array = new JsonArray();
            for (Producto p : productos) {
                array.add(p.toJsonObject());
            }

            return ResponseEntity
                    .status(200)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(array.toString());

        } catch (Exception e) {
            JsonObject error = new JsonObject();
            error.addProperty("error", "Error listando productos: " + e.getMessage());
            return ResponseEntity
                    .status(500)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(error.toString());
        }
    }

    /**
     * GET /api/productos/{categoria}
     * Devuelve los productos de una categoría concreta (llama a sp_productos_por_categoria).
     * Ejemplo: GET /api/productos/MONITORES
     */
    @GetMapping("/{categoria}")
    public ResponseEntity<String> listarPorCategoria(@PathVariable String categoria) {
        try {
            // Convertimos el String a enum para validarlo
            EnumCategoria enumCategoria = EnumCategoria.valueOf(categoria.toUpperCase());
            List<Producto> productos = productoRepository.findByCategoria(enumCategoria);

            JsonArray array = new JsonArray();
            for (Producto p : productos) {
                array.add(p.toJsonObject());
            }

            return ResponseEntity
                    .status(200)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(array.toString());

        } catch (IllegalArgumentException e) {
            // Categoría no válida
            JsonObject error = new JsonObject();
            error.addProperty("error", "Categoría no válida: " + categoria);
            return ResponseEntity
                    .status(400)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(error.toString());

        } catch (Exception e) {
            JsonObject error = new JsonObject();
            error.addProperty("error", "Error filtrando productos: " + e.getMessage());
            return ResponseEntity
                    .status(500)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(error.toString());
        }
    }

    /**
     * POST /api/productos
     * Crea un nuevo producto en la base de datos.
     */
    @PostMapping
    public ResponseEntity<String> crear(@RequestBody Producto producto) {
        try {
            productoRepository.save(producto);

            JsonObject respuesta = new JsonObject();
            respuesta.addProperty("status", "ok");
            respuesta.addProperty("mensaje", "Producto creado correctamente");

            return ResponseEntity
                    .status(201)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(respuesta.toString());

        } catch (Exception e) {
            JsonObject error = new JsonObject();
            error.addProperty("error", "Error creando producto: " + e.getMessage());
            return ResponseEntity
                    .status(500)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(error.toString());
        }
    }
}
