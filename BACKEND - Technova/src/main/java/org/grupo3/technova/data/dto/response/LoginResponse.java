package org.grupo3.technova.data.dto.response;

import org.grupo3.technova.data.model.Pedido;
import org.grupo3.technova.data.model.Usuario;

import java.util.List;
/**
 DTO de respuesta para la operación de login.
 Contiene la información del usuario autenticado y la lista de pedidos asociados.
 Se utiliza para enviar datos al cliente después de un inicio de sesión exitoso.
 */
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