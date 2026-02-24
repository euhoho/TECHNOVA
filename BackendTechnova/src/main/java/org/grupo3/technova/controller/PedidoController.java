package org.grupo3.technova.controller;

import org.grupo3.technova.data.dto.request.PedidoRequest;
import org.grupo3.technova.data.enums.EnumPedidoEstado;
import org.grupo3.technova.data.model.Pedido;
import org.grupo3.technova.repository.PedidoRepository;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/pedidos")
public class PedidoController {

    private final PedidoRepository pedidoRepository;

    public PedidoController(PedidoRepository pedidoRepository) {
        this.pedidoRepository = pedidoRepository;
    }

    @PostMapping
    public ResponseEntity<?> crearPedido(@RequestBody PedidoRequest request, @RequestParam(defaultValue = "false") boolean descontarStock) {
        try {
            Long idPedido = pedidoRepository.crearPedido(request, descontarStock);
            return ResponseEntity.status(201).body(Map.of("status", "ok", "idPedido", idPedido));

        } catch (SecurityException e) {
            return ResponseEntity.status(401).body(e.getMessage());

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());

        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error guardando el pedido: " + e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<List<Pedido>> findAll(
            @RequestParam(required = false) EnumPedidoEstado pedidoEstado,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fechaInicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fechaFin
    ) {
        return ResponseEntity.ok(pedidoRepository.findAll(pedidoEstado, fechaInicio, fechaFin));
    }

    @GetMapping("/{idPedido}")
    public ResponseEntity<?> findById(@PathVariable Long idPedido) {
        try {
            Pedido pedido = pedidoRepository.findById(idPedido);
            if (pedido == null) return ResponseEntity.status(404).body("Pedido no encontrado");
            return ResponseEntity.ok(pedido);

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());

        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error al buscar el pedido: " + e.getMessage());
        }
    }
}