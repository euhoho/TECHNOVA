package org.grupo3.technova.controller;

import org.grupo3.technova.data.dto.request.PedidoRequest;
import org.grupo3.technova.data.enums.EnumPedidoEstado;
import org.grupo3.technova.data.model.Pedido;
import org.grupo3.technova.repository.PedidoRepository;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

//Indica que esta clase es un controlador REST.
@RestController
//Todas las rutas de este controller empezarán por /api/pedidos
@RequestMapping("/api/pedidos")
public class PedidoController {
    // Repositorio que contiene la lógica de acceso a base de datos
    private final PedidoRepository pedidoRepository;

    public PedidoController(PedidoRepository pedidoRepository) {
        this.pedidoRepository = pedidoRepository;
    }

    @PostMapping
    public ResponseEntity<?> crearPedido(
            @RequestBody PedidoRequest request,
            @RequestParam(defaultValue = "false") boolean descontarStock
    ) {
        try {
            Long idPedido = pedidoRepository.crearPedido(request, descontarStock);
            // Devolvemos HTTP 201 (Created) con id del pedido creado
            return ResponseEntity.status(201).body(Map.of("status", "ok", "idPedido", idPedido));

        } catch (SecurityException e) {
            // Si las credenciales no son válidas → 401 Unauthorized
            return ResponseEntity.status(401).body(e.getMessage());

        } catch (IllegalArgumentException e) {
            // Errores de validación → 400 Bad Request
            return ResponseEntity.status(400).body(e.getMessage());

        } catch (Exception e) {
            // Cualquier error inesperado → 500 Internal Server Error
            return ResponseEntity.status(500).body("Error guardando el pedido: " + e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<?> listar(
            @RequestParam(required = false) EnumPedidoEstado pedidoEstado,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fechaInicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fechaFin) {
        try {
            // Caso 1: sin filtros.
            if (pedidoEstado == null && fechaInicio == null && fechaFin == null) {
                List<Pedido> pedidos = pedidoRepository.listarPedidos();
                return ResponseEntity.ok(pedidos);
            }
            // Caso 2: filtros.
            if (pedidoEstado == null || fechaInicio == null || fechaFin == null) {
                return ResponseEntity.badRequest().body(
                        "Para filtrar debes enviar pedidoEstado, fechaInicio y fechaFin"
                );
            }
            // Llamamos al repository que ejecuta el procedure con filtros
            List<Pedido> pedidos = pedidoRepository.listarPedidosPorEstadoYFecha(pedidoEstado, fechaInicio, fechaFin);
            return ResponseEntity.ok(pedidos);

        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(400).body(e.getMessage());

        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error listando pedidos: " + e.getMessage());
        }
    }
}