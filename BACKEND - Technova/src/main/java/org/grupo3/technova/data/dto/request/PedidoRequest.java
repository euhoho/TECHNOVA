package org.grupo3.technova.data.dto.request;

import org.grupo3.technova.data.model.Pedido;

import java.util.List;

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
