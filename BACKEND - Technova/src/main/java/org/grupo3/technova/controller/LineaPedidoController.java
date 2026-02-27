package org.grupo3.technova.controller;

import org.grupo3.technova.data.model.LineaPedido;
import org.grupo3.technova.data.dto.request.LineaPedidoRequest;
import org.grupo3.technova.repository.impl.LineaPedidoRepositoryImpl;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/lineaspedido")
public class LineaPedidoController {

    private final LineaPedidoRepositoryImpl lineaPedidoRepository;

    public LineaPedidoController(LineaPedidoRepositoryImpl lineaPedidoRepository) {
        this.lineaPedidoRepository = lineaPedidoRepository;
    }

    @GetMapping
    public List<LineaPedido> getAllLineas() {
        return lineaPedidoRepository.findAll();
    }

    @GetMapping("/{id}")
    public LineaPedido getLineaById(@PathVariable int id) {
        return lineaPedidoRepository.findAll().stream()
                .filter(l -> l.getId_linea_pedido() == id)
                .findFirst()
                .orElse(null);
    }

    @GetMapping("/pedido/{idPedido}")
    public List<LineaPedido> getLineasByPedido(@PathVariable int idPedido) {
        return lineaPedidoRepository.findByIdPedido(idPedido);
    }

    @GetMapping("/producto/{idProducto}")
    public List<LineaPedido> getLineasByProducto(@PathVariable int idProducto) {
        return lineaPedidoRepository.findByIdProducto(idProducto);
    }

    @PostMapping
    public void crearLinea(@RequestBody LineaPedidoRequest request) {
        lineaPedidoRepository.save(request);
    }
}