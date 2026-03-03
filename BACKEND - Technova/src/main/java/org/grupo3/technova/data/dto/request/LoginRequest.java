package org.grupo3.technova.data.dto.request;

/**
 * DTO para recibir las credenciales de login.
 * Ejemplo JSON: { "email": "admin@technova.com", "password": "miPassword" }
 */
public class LoginRequest {

    private String email;
    private String password;

    public LoginRequest() {}

    public String getEmail()                  { return email; }
    public void setEmail(String email)        { this.email = email; }

    public String getPassword()               { return password; }
    public void setPassword(String password)  { this.password = password; }
}
