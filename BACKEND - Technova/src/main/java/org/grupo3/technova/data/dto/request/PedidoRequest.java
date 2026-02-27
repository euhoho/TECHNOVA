package org.grupo3.technova.data.dto.request;

import org.grupo3.technova.data.model.Pedido;

import java.util.List;
/**
 DTO utilizado para enviar los datos necesarios al crear un pedido.
 Contiene información del usuario que realiza el pedido, los detalles del pedido
 y la lista de líneas de pedido (productos con cantidad y precio unitario).
       **/
public class PedidoRequest {
        private UsuarioRequest usuario;
        private Pedido pedido;
        private List<LineaPedidoRequest> lineas;

        public UsuarioRequest getUsuario() { return usuario; }
        public void setUsuario(UsuarioRequest usuario) { this.usuario = usuario; }

        public Pedido getPedido() { return pedido; }
        public void setPedido() { this.pedido = pedido; }

        public List<LineaPedidoRequest> getLineas() { return lineas; }
        public void setLineas(List<LineaPedidoRequest> lineas) { this.lineas = lineas; }
}
