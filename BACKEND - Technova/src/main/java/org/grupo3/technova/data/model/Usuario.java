package org.grupo3.technova.data.model;

import org.grupo3.technova.data.enums.EnumRol;
// se declara los campos que existieran en nuestra tabla Usuario de la BD
public class Usuario {

    private Long id_usuario;
    private String email;
    private String password;
    private EnumRol rol;

    public Usuario() {}
// se hace un constructor de usuario
    public Usuario(Long id_usuario, String email, String password, EnumRol rol) {
        this.id_usuario = id_usuario;
        this.email = email;
        this.password = password;
        this.rol = rol;
    }

    public Long getId_usuario() {
        return id_usuario;
    }

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