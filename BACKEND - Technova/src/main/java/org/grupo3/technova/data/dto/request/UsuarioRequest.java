package org.grupo3.technova.data.dto.request;

/**
 * DTO con las credenciales del usuario dentro de un PedidoRequest.
 * Ejemplo: { "email": "cliente@mail.com", "password": "miPassword" }
 */
public class UsuarioRequest {

    private String email;
    private String password;

    public UsuarioRequest() {}

    public String getEmail()                  { return email; }
    public void setEmail(String email)        { this.email = email; }

    public String getPassword()               { return password; }
    public void setPassword(String password)  { this.password = password; }
}
