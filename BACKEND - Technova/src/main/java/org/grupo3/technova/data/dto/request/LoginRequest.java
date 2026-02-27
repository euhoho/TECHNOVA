package org.grupo3.technova.data.dto.request;

/**
 DTO utilizado para enviar los datos de inicio de sesión.
 Contiene la información necesaria para autenticar a un usuario.
 */
public class LoginRequest {

    private String email;
    private String password;

    public LoginRequest() {}

    public String getEmail() {
        return email;
    }

    public String getPassword() {
        return password;
    }
}