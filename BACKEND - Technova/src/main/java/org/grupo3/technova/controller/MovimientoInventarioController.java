package org.grupo3.technova.controller;

import org.grupo3.technova.data.model.MovimientoInventario;
import org.grupo3.technova.repository.MovimientoInventarioRepository;
import org.grupo3.technova.data.dto.request.MovimientoInventarioRequest;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import javax.sql.DataSource;
import java.util.List;



@RestController
@RequestMapping("/api/movimientoinventario_listar")
public class MovimientoInventarioController {

    private final MovimientoInventarioRepository movimientoRepository;

    public MovimientoInventarioController(MovimientoInventarioRepository movimientoRepository) {
        this.movimientoRepository = movimientoRepository;
    }

    @GetMapping
    public List<MovimientoInventario> getAllMovimientos() {
        return movimientoRepository.findAll();
    }


    @GetMapping("/movimientoInventari/{id_movimiento}")
    public MovimientoInventario getMovimientoById(@PathVariable ("id_movimiento") Long id) {
        return movimientoRepository.findAll().stream()
                .filter(m -> m.getId_movimiento().equals(id))
                .findFirst()
                .orElse(null);
    }


    @GetMapping("/producto/{idProducto}")
    public List<MovimientoInventario> listarPorProducto(@PathVariable Long idProducto) {
        return movimientoRepository.findByProductoId(idProducto);
    }

    @PostMapping("/movimientoInventario/añadir")
    public void guardar(@RequestBody MovimientoInventarioRequest request) {
        movimientoRepository.save(request);
    }
}