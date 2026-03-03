package org.grupo3.technova.data.model;

import com.google.gson.JsonObject;
import org.grupo3.technova.data.enums.EnumRol;

/**
 * Modelo que representa un Usuario del sistema TechNova.
 * Implementa JsonSerializable. NUNCA incluye el password en toJsonObject()
 * por seguridad: el hash no debe salir en las respuestas HTTP.
 */
public class Usuario implements JsonSerializable {

    private Long   id_usuario;
    private String email;
    private String password; // solo se usa internamente, nunca se serializa
    private EnumRol rol;

    public Usuario() {}

    public Usuario(Long id_usuario, String email, String password, EnumRol rol) {
        this.id_usuario = id_usuario;
        this.email      = email;
        this.password   = password;
        this.rol        = rol;
    }

    // --- Getters y Setters ---

    public Long getId_usuario()              { return id_usuario; }
    public void setId_usuario(Long v)        { this.id_usuario = v; }

    public String getEmail()                 { return email; }
    public void setEmail(String email)       { this.email = email; }

    public String getPassword()              { return password; }
    public void setPassword(String password) { this.password = password; }

    public EnumRol getRol()                  { return rol; }
    public void setRol(EnumRol rol)          { this.rol = rol; }

    /**
     * Convierte este Usuario en un JsonObject de GSON.
     * El campo password NO se incluye por seguridad.
     */
    @Override
    public JsonObject toJsonObject() {
        JsonObject json = new JsonObject();
        json.addProperty("id_usuario", id_usuario);
        json.addProperty("email",      email);
        json.addProperty("rol",        rol != null ? rol.name() : null);
        // password: omitido intencionalmente
        return json;
    }
}
