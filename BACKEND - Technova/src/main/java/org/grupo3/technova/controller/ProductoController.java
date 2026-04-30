package org.grupo3.technova.controller;

import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import org.grupo3.technova.data.enums.EnumCategoria;
import org.grupo3.technova.data.enums.EnumRol;
import org.grupo3.technova.data.model.Producto;
import org.grupo3.technova.data.model.Usuario;
import org.grupo3.technova.repository.ProductoRepository;
import org.grupo3.technova.repository.UsuarioRepository;
import org.grupo3.technova.repository.impl.UsuarioRepositoryImpl;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import javax.print.attribute.standard.Media;
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
    private final UsuarioRepositoryImpl usuarioRepositoryImpl;
    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    // Spring inyecta todas las dependencias automáticamente por constructor.
    public ProductoController(ProductoRepository productoRepository, UsuarioRepositoryImpl usuarioRepositoryImpl, UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder) {
        this.productoRepository = productoRepository;
        this.usuarioRepositoryImpl = usuarioRepositoryImpl;
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * GET /api/productos
     * Devuelve el array completo de productos (llama al stored procedure sp_productos_listar).
     */
    @GetMapping
    public ResponseEntity<String> listar() {
        try {
            List<Producto> productos = productoRepository.listar();

            // Construimos el JsonArray con GSON usando el método toJsonObject() de cada producto.
            JsonArray array = new JsonArray();
            for (Producto p : productos) {
                array.add(p.toJsonObject());
            }

            return ResponseEntity
                    .status(200)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(array.toString());

        } catch (Exception e) {
            // Si algo falla en BD devolvemos un 500 con el mensaje de error.
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
            // Convertimos el String recibido en la URL a su valor del enum para validarlo.
            // Si la categoría no existe en el enum, lanza IllegalArgumentException → 400.
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
            // La categoría que mandó el cliente no existe en nuestro enum → 400 Bad Request.
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
     * POST /api/productos/crear-producto
     * Crea un nuevo producto en la base de datos.
     * Solo accesible para usuarios con rol ADMINISTRADOR.
     * Las credenciales se pasan por cabeceras HTTP (email y password).
     */
    @PostMapping("/crear-producto")
    public ResponseEntity<String> crear(
            @RequestBody Producto producto,
            @RequestHeader(value = "email", required = false) String email,
            @RequestHeader(value = "password", required = false) String password) {

        // Comprobamos que el usuario que hace la petición existe y tiene rol de administrador.
        // Si no, devolvemos 403 Forbidden directamente sin llegar a la BD.
        Usuario usuario = usuarioRepository.login(email, password);

        if (usuario == null || usuario.getRol() != EnumRol.ADMINISTRADOR) {
            JsonObject error = new JsonObject();
            error.addProperty("error", "Acceso denegado");
            error.addProperty("mensaje", "Acceso restringido. Solo los ADMINISTRADORES pueden acceder");

            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(error.toString());
        }

        // Si el usuario es administrador, intentamos guardar el producto.
        try {
            productoRepository.save(producto);

        } catch (Exception e) {
            JsonObject error = new JsonObject();
            error.addProperty("error", "Error creando producto: " + e.getMessage());
            return ResponseEntity
                    .status(500)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(error.toString());
        }

        // Todo fue bien → 201 Created con confirmación.
        JsonObject respuesta = new JsonObject();
        respuesta.addProperty("status", "ok");
        respuesta.addProperty("mensaje", "Producto creado correctamente");
        return ResponseEntity
                .status(201).contentType(MediaType.APPLICATION_JSON).body(respuesta.toString());
    }

}
