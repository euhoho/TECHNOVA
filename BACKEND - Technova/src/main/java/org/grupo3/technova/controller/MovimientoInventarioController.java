package org.grupo3.technova.controller;

import org.grupo3.technova.data.model.MovimientoInventario;
import org.grupo3.technova.repository.MovimientoInventarioRepository;
import org.grupo3.technova.data.dto.request.MovimientoInventarioRequest;
import org.springframework.web.bind.annotation.*;
import java.util.List;

/**
 Controlador REST para gestionar movimientos de inventario.
 Permite consultar todos los movimientos, buscar por ID o por producto,
 y crear nuevos movimientos de inventario.
 */
@RestController
@RequestMapping("/api/movimientoinventario_listar")
public class MovimientoInventarioController {

    private final MovimientoInventarioRepository movimientoRepository;

    public MovimientoInventarioController(MovimientoInventarioRepository movimientoRepository) {
        this.movimientoRepository = movimientoRepository;
    }

    /**
     Obtiene todos los movimientos de inventario registrados.
     @return Lista de todos los movimientos de inventario.
     */
    @GetMapping
    public List<MovimientoInventario> getAllMovimientos() {
        return movimientoRepository.findAll();
    }

    /**
     Obtiene un movimiento de inventario por su ID.
     @param id ID del movimiento.
     @return Movimiento correspondiente, o null si no existe.
     */
    @GetMapping("/movimientoInventari/{id_movimiento}")
    public MovimientoInventario getMovimientoById(@PathVariable("id_movimiento") Long id) {
        return movimientoRepository.findAll().stream()
                .filter(m -> m.getId_movimiento().equals(id))
                .findFirst()
                .orElse(null);
    }

    /**
     Lista todos los movimientos relacionados con un producto específico.
     @param idProducto ID del producto.
     @return Lista de movimientos asociados al producto.
     */
    @GetMapping("/producto/{idProducto}")
    public List<MovimientoInventario> listarPorProducto(@PathVariable Long idProducto) {
        return movimientoRepository.findByProductoId(idProducto);
    }

    /**
     Crea un nuevo movimiento de inventario.
     @param request DTO con los datos del movimiento a registrar.
     */
    @PostMapping("/ad")
    public void guardar(@RequestBody MovimientoInventarioRequest request) {
        movimientoRepository.save(request);
    }
}