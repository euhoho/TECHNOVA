package org.grupo3.technova.data.dto.request;

import java.util.List;

public class PedidoRequest {
        private UsuarioRequest usuario;
        private List<LineaPedidoRequest> lineas;

        public UsuarioRequest getUsuario() { return usuario; }
        public void setUsuario(UsuarioRequest usuario) { this.usuario = usuario; }

        public List<LineaPedidoRequest> getLineas() { return lineas; }
        public void setLineas(List<LineaPedidoRequest> lineas) { this.lineas = lineas; }
}
