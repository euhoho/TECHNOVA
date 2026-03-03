package org.grupo3.technova.data.dto.request;

import java.util.List;

/**
 * DTO para crear un pedido.
 * Contiene las credenciales del usuario que realiza el pedido
 * y la lista de líneas (productos con cantidad y precio).
 *
 * Ejemplo de JSON que recibe POST /api/pedidos:
 * {
 *   "usuario": { "email": "cliente@mail.com", "password": "1234" },
 *   "lineas": [
 *     { "idProducto": 1, "cantidad": 2, "precioUnitario": 299.99 },
 *     { "idProducto": 3, "cantidad": 1, "precioUnitario": 49.99 }
 *   ]
 * }
 */
public class PedidoRequest {

    private UsuarioRequest        usuario;
    private List<LineaPedidoRequest> lineas;

    public UsuarioRequest getUsuario()                      { return usuario; }
    public void setUsuario(UsuarioRequest usuario)          { this.usuario = usuario; }

    public List<LineaPedidoRequest> getLineas()             { return lineas; }
    public void setLineas(List<LineaPedidoRequest> lineas)  { this.lineas = lineas; }
}
