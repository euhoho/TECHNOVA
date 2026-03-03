package org.grupo3.technova.data.model;

import com.google.gson.JsonObject;

/**
 * Interfaz que deben implementar todos los modelos que necesiten
 * ser serializados a JSON usando GSON.
 * Cada modelo que implemente esta interfaz debe definir cómo
 * construir su propio JsonObject.
 */
public interface JsonSerializable {
    JsonObject toJsonObject();
}
