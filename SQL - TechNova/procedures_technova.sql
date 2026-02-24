-- Procedimientos TechNova --

-- Procedimiento para listar todos los productos
DELIMITER //
CREATE PROCEDURE sp_productos_listar()
BEGIN
    SELECT id_producto, sku, nombre, descripcion, precio, stock, categoria, imagen
    FROM producto;
END //
DELIMITER ;

-- Procedimiendo para listar productos por categoría
DELIMITER //
CREATE PROCEDURE sp_productos_por_categoria(IN p_categoria VARCHAR(20))
BEGIN
    SELECT id_producto, sku, nombre, descripcion, precio, stock, categoria, imagen
    FROM producto
    WHERE categoria = p_categoria;
END //
DELIMITER ;

-- Procedimiento para listar productos por rango de precio
DELIMITER //
CREATE PROCEDURE sp_usuarios_listar()
BEGIN
    SELECT id_usuario, email, password, rol
    FROM usuario;
END //
DELIMITER ;

-- Procedimiento para listar usuarios por rol
DELIMITER //
CREATE PROCEDURE sp_usuarios_por_rol(IN p_rol VARCHAR(20))
BEGIN
    SELECT id_usuario, email, password, rol
    FROM usuario
    WHERE rol = p_rol;
END //
DELIMITER ;

-- Procedimiento para obtener usuario por email
DELIMITER //
CREATE PROCEDURE sp_usuario_por_email(IN p_email VARCHAR(100))
BEGIN
    SELECT id_usuario, email, password, rol
    FROM usuario
    WHERE email = p_email;
END //
DELIMITER ;

-- Prodedimiento para listar todos los pedidos
DELIMITER //
CREATE PROCEDURE sp_pedidos_listar()
BEGIN
    SELECT id_pedido, id_usuario, fecha, total_pedido, pedido_estado
    FROM pedido;
END //
DELIMITER ;

-- Procedimiento para listar pedidos por usuario
DELIMITER //
CREATE PROCEDURE sp_pedidos_por_usuario(IN p_id_usuario INT)
BEGIN
    SELECT id_pedido, id_usuario, fecha, total_pedido, pedido_estado
    FROM pedido
    WHERE id_usuario = p_id_usuario;
END //
DELIMITER ;

-- Procedimiento para listar líneas de pedido por pedido
DELIMITER //
CREATE PROCEDURE sp_lineas_pedido_por_pedido(IN p_id_pedido INT)
BEGIN
    SELECT id_linea_pedido, id_pedido, id_producto, cantidad, precio_unitario_momento
    FROM linea_pedido
    WHERE id_pedido = p_id_pedido;
END //
DELIMITER ;

-- Procedimiento para listar movimientos de inventario por producto
DELIMITER //
CREATE PROCEDURE sp_movimientos_por_producto(IN p_id_producto INT)
BEGIN
    SELECT id_movimiento, id_producto, tipo_movimiento, fecha, cantidad, motivo
    FROM movimiento_inventario
    WHERE id_producto = p_id_producto;
END //
DELIMITER ;