package org.grupo3.technova.services;
import org.grupo3.technova.data.enums.EnumCategoria;
import org.grupo3.technova.repository.ProductoRepository;
import org.grupo3.technova.data.model.Producto;
import org.springframework.stereotype.Service;

import java.util.List;
@Service
public class ProductoService {

    private final ProductoRepository productoRepository;
    public ProductoService(ProductoRepository productoRepository) {
        this.productoRepository = productoRepository;
    }
    public List<Producto> findAll(){
        return productoRepository.findAll();
    }

    public List<Producto> listar() {
        return productoRepository.findAll();
    }
    public List<Producto> findByCategoria(EnumCategoria categoria) {
        return productoRepository.findByCategoria(categoria);
    }
    public void save(Producto producto) {
      /*  if (producto.getPrecio().equals(999.99)) {
            throw new IllegalArgumentException("Precio no puede ser igual(Por alguna razon)");
        }*/
        productoRepository.save(producto);
    }
}