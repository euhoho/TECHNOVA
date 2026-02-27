package org.grupo3.technova.controller;

import org.grupo3.technova.data.model.LineaPedido;
import org.grupo3.technova.data.dto.request.LineaPedidoRequest;
import org.grupo3.technova.repository.impl.LineaPedidoRepositoryImpl;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 Controlador REST para gestionar las líneas de pedido.
 Permite consultar todas las líneas, buscar por pedido o producto,
 y crear nuevas líneas de pedido.
 */
@RestController
@RequestMapping("/api/lineaspedido")
public class LineaPedidoController {

    private final LineaPedidoRepositoryImpl lineaPedidoRepository;

    public LineaPedidoController(LineaPedidoRepositoryImpl lineaPedidoRepository) {
        this.lineaPedidoRepository = lineaPedidoRepository;
    }

    /**
     Obtiene todas las líneas de pedido.
     @return Lista de todas las líneas de pedido.
     */
    @GetMapping
    public List<LineaPedido> getAllLineas() {
        return lineaPedidoRepository.findAll();
    }

    /**
     Obtiene una línea de pedido por su ID.
     @param id ID de la línea de pedido.
     @return La línea de pedido correspondiente, o null si no existe.
     */
    @GetMapping("/{id}")
    public LineaPedido getLineaById(@PathVariable int id) {
        return lineaPedidoRepository.findAll().stream()
                .filter(l -> l.getId_linea_pedido() == id)
                .findFirst()
                .orElse(null);
    }

    /**
     Obtiene todas las líneas de un pedido específico.
     @param idPedido ID del pedido.
     @return Lista de líneas asociadas al pedido.
     */
    @GetMapping("/pedido/{idPedido}")
    public List<LineaPedido> getLineasByPedido(@PathVariable int idPedido) {
        return lineaPedidoRepository.findByIdPedido(idPedido);
    }

    /**
     Obtiene todas las líneas que incluyen un producto específico.
     @param idProducto ID del producto.
     @return Lista de líneas que contienen el producto.
     */
    @GetMapping("/producto/{idProducto}")
    public List<LineaPedido> getLineasByProducto(@PathVariable int idProducto) {
        return lineaPedidoRepository.findByIdProducto(idProducto);
    }

    /**
     Crea una nueva línea de pedido.
     @param request DTO con los datos de la línea a crear.
     */
    @PostMapping
    public void crearLinea(@RequestBody LineaPedidoRequest request) {
        lineaPedidoRepository.save(request);
    }
}