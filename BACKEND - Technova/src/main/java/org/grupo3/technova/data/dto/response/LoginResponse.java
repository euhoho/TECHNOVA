package org.grupo3.technova.data.dto.response;

import org.grupo3.technova.data.model.Pedido;
import org.grupo3.technova.data.model.Usuario;

import java.util.List;

public class LoginResponse {

    private Usuario usuario;
    private List<Pedido> pedidos;

    public LoginResponse(Usuario usuario, List<Pedido> pedidos) {
        this.usuario = usuario;
        this.pedidos = pedidos;
    }

    public Usuario getUsuario() {
        return usuario;
    }

    public List<Pedido> getPedidos() {
        return pedidos;
    }
}