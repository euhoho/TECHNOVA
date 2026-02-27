package org.grupo3.technova.data.dto.request;

import org.grupo3.technova.data.enums.EnumRol;

public class UsuarioRequest {

    private String email;
    private String password;
    private EnumRol rol;

    public UsuarioRequest() {}

    public String getEmail() {
        return email;
    }

    public String getPassword() {
        return password;
    }

    public EnumRol getRol() {
        return rol;
    }
}