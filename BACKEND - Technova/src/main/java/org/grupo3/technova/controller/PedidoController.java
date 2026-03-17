package org.grupo3.technova.controller;

import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import org.grupo3.technova.data.dto.request.PedidoRequest;
import org.grupo3.technova.data.enums.EnumPedidoEstado;
import org.grupo3.technova.data.model.Pedido;
import org.grupo3.technova.repository.PedidoRepository;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Controlador REST para Pedidos.
 *
 * GET  /api/pedidos              → lista todos los pedidos
 * GET  /api/pedidos?pedidoEstado=X&fechaInicio=...&fechaFin=...  → filtra
 * POST /api/pedidos              → crea un nuevo pedido con sus líneas
 */
@RestController
@RequestMapping("/api/pedidos")
public class PedidoController {

    private final PedidoRepository pedidoRepository;

    public PedidoController(PedidoRepository pedidoRepository) {
        this.pedidoRepository = pedidoRepository;
    }

    /**
     * POST /api/pedidos
     * Recibe el carrito de la compra y crea el pedido + líneas en BD.
     * Se puede pasar ?descontarStock=true para descontar el stock (opcional).


      Ejemplo de pedido
      {
        "usuario": {
          "email": "javiervs@gmail.com",
          "password": "uyuyuyuy124.S"
        },
        "lineas": [
          {
            "idProducto": 1,
            "cantidad": 2,
            "precioUnitario": 199.99
          },
          {
            "idProducto": 3,
            "cantidad": 1,
            "precioUnitario": 17.90
          }
        ]
      }
     */
    @PostMapping("/crear")
    public ResponseEntity<String> crearPedido(
            @RequestBody PedidoRequest request,
            @RequestParam(defaultValue = "false") boolean descontarStock) {
        try {
            Long idPedido = pedidoRepository.crearPedido(request, descontarStock);

            JsonObject respuesta = new JsonObject();
            respuesta.addProperty("status",   "ok");
            respuesta.addProperty("idPedido", idPedido);

            return ResponseEntity
                    .status(201)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(respuesta.toString());

        } catch (SecurityException e) {
            // Credenciales incorrectas del usuario que hace el pedido → 401
            JsonObject error = new JsonObject();
            error.addProperty("status",  "error");
            error.addProperty("mensaje", e.getMessage());
            return ResponseEntity
                    .status(401)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(error.toString());

        } catch (IllegalArgumentException e) {
            // Datos inválidos del pedido → 400 Bad Request
            JsonObject error = new JsonObject();
            error.addProperty("status",  "error");
            error.addProperty("mensaje", e.getMessage());
            return ResponseEntity
                    .status(400)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(error.toString());

        } catch (Exception e) {
            JsonObject error = new JsonObject();
            error.addProperty("status",  "error");
            error.addProperty("mensaje", "Error guardando el pedido: " + e.getMessage());
            return ResponseEntity
                    .status(500)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(error.toString());
        }
    }

    /**
     * GET /api/pedidos
     * Sin parámetros → devuelve todos los pedidos.
     * Con parámetros → filtra por estado y rango de fechas.
     */
    @GetMapping
    public ResponseEntity<String> listar(
            @RequestParam(required = false) EnumPedidoEstado pedidoEstado,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fechaInicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fechaFin) {
        try {
            List<Pedido> pedidos;

            if (pedidoEstado == null && fechaInicio == null && fechaFin == null) {
                // Sin filtros: lista todos
                pedidos = pedidoRepository.listarPedidos();
            } else if (pedidoEstado == null || fechaInicio == null || fechaFin == null) {
                // Faltan parámetros de filtro → 400
                JsonObject error = new JsonObject();
                error.addProperty("status",  "error");
                error.addProperty("mensaje", "Para filtrar debes enviar pedidoEstado, fechaInicio y fechaFin");
                return ResponseEntity
                        .status(400)
                        .contentType(MediaType.APPLICATION_JSON)
                        .body(error.toString());
            } else {
                // Con todos los filtros
                pedidos = pedidoRepository.listarPedidosPorEstadoYFecha(pedidoEstado, fechaInicio, fechaFin);
            }

            // Construimos el JsonArray usando toJsonObject() de cada Pedido
            JsonArray array = new JsonArray();
            for (Pedido p : pedidos) {
                array.add(p.toJsonObject());
            }

            return ResponseEntity
                    .status(200)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(array.toString());

        } catch (Exception e) {
            JsonObject error = new JsonObject();
            error.addProperty("status",  "error");
            error.addProperty("mensaje", "Error listando pedidos: " + e.getMessage());
            return ResponseEntity
                    .status(500)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(error.toString());
        }
    }
}
