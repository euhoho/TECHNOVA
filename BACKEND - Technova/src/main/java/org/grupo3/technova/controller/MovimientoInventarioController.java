package org.grupo3.technova.controller;

import org.grupo3.technova.data.model.MovimientoInventario;
import org.grupo3.technova.repository.MovimientoInventarioRepository;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import javax.sql.DataSource;
import java.util.List;



@RestController
@RequestMapping("/api/movimientoinventario")
public class MovimientoInventarioController {

    private final MovimientoInventarioRepository movimientoRepository;
    public MovimientoInventarioController(MovimientoInventarioRepository movimientoRepository) {
        this.movimientoRepository = movimientoRepository;
    }
    // GET: Obtener todos los movimientos
    @GetMapping
    public List<MovimientoInventario> getAllMovimientos() {
        return movimientoRepository.findAll();
    }


    @GetMapping("/{id}")
    public MovimientoInventario getMovimientoById(@PathVariable Long id) {
        return movimientoRepository.findAll().stream()
                .filter(m -> m.getId_movimiento().equals(id))
                .findFirst()
                .orElse(null);
    }


    @GetMapping("/producto/{idProducto}")
    public List<MovimientoInventario> listarPorProducto(@PathVariable Long idProducto) {
        return movimientoRepository.findByProductoId(idProducto);
    }

    @PostMapping
    public void guardar(@RequestBody MovimientoInventario movimiento) {
        movimientoRepository.save(movimiento);
    }
}