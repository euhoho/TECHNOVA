		USE db_technova;
				
-- ======================== LISTAR USUARIOS ================================== --
DELIMITER $$
DROP PROCEDURE IF EXISTS sp_usuarios_listar $$
CREATE PROCEDURE sp_usuarios_listar()
BEGIN 
SELECT *
FROM usuario;
END $$
DELIMITER ;

CALL sp_usuarios_listar;

-- ======================== LISTAR PRODUCTOS (OBLIGATORIO) ================================= --
DELIMITER $$
DROP PROCEDURE IF EXISTS sp_productos_listar $$
CREATE PROCEDURE sp_productos_listar()
BEGIN
SELECT *
FROM producto;
END $$
DELIMITER ;
CALL sp_productos_listar;

-- ============= LISTAR PRODUCTOS POR CATEGORIAS(OBLIGATORIO) =========================== --
drop procedure if exists sp_productos_por_categoria;
DELIMITER $$
CREATE PROCEDURE sp_productos_por_categoria(IN p_categoria varchar(100))
BEGIN
SELECT *
FROM producto
WHERE producto.categoria = p_categoria;
END $$
DELIMITER ;
CALL sp_productos_por_categoria('componentes');

-- ========================= LISTAR PEDIDOS ===================================== --

DELIMITER $$
DROP PROCEDURE IF EXISTS  sp_pedidos $$
CREATE PROCEDURE sp_pedidos()
BEGIN 
SELECT * 
FROM pedido;
END $$
DELIMITER ;
CALL sp_pedidos;

-- ================= LISTAR PEDIDOS POR FECHA Y ESTADO(OBLIGATORIO) ============================ --
DELIMITER $$
DROP PROCEDURE IF EXISTS  sp_pedidos_filtro $$
CREATE PROCEDURE sp_pedidos_filtro(IN p_estado VARCHAR(30), IN p_fecha_ini DATETIME, IN p_fecha_fin DATETIME)
BEGIN 
SELECT * 
FROM pedido
WHERE pedido.pedido_estado = p_estado AND fecha BETWEEN p_fecha_ini AND p_fecha_fin ;
END $$
DELIMITER ;
call sp_pedidos_filtro('ENVIADO', '2026-02-12 09:39:56', '2026-02-19 09:39:56');

-- ============================= LISTAR LINEA DE PEDIDO ============================ --
DELIMITER $$
DROP PROCEDURE IF EXISTS  sp_lineapedido_listar $$
CREATE PROCEDURE sp_lineapedido_listar()
BEGIN 
SELECT * 
FROM linea_pedido;
END $$
DELIMITER ;
CALL sp_lineapedido_listar;

-- =========================== LISTAR MOVIMIENTO DE INVENTARIO ======================= --
DELIMITER $$
DROP PROCEDURE IF EXISTS  sp_movimientoinventario_listar $$
CREATE PROCEDURE sp_movimientoinventario_listar()
BEGIN 
SELECT * 
FROM movimiento_inventario;
END $$
DELIMITER ;
CALL sp_movimientoinventario_listar;


-- ====================== LISTAR LINEA DE PEDIDO POR USUARIOS ========================= --
DELIMITER $$
DROP PROCEDURE IF EXISTS  sp_lineapedido_listar_usuario $$
CREATE PROCEDURE sp_lineapedido_listar_usuario(in p_email varchar(100) ,in p_password varchar(255))
BEGIN 
SELECT * 
FROM pedido JOIN usuario ON pedido.id_usuario = usuario.id_usuario
where email =  p_email and p_password = password;
END $$
DELIMITER ;
CALL sp_lineapedido_listar_usuario('javiervs@gmail.com','uyuyuyuy124.S');

-- ========================= LISTAR USUARIO ============================================== --
/*
DELIMITER $$
DROP PROCEDURE IF EXISTS sp_usuario $$
CREATE PROCEDURE sp_usuario(in p_email varchar(100) ,in p_password varchar(255))
BEGIN 
SELECT *
FROM usuario
where email=  p_email and p_password= password;
END $$
DELIMITER ;
*/
DROP PROCEDURE IF EXISTS sp_usuario;

DELIMITER $$
CREATE PROCEDURE sp_usuario(IN p_email VARCHAR(100))
BEGIN 
    SELECT id_usuario, email, password, rol 
    FROM usuario 
    WHERE email = p_email;
END $$
DELIMITER ;
call sp_usuario ('javiervs@gmail.com','uyuyuyuy124.S');
-- ===========================  CREAR PEDIDOS ================================================= --

DELIMITER $$

DROP PROCEDURE IF EXISTS sp_crear_pedido $$

CREATE PROCEDURE sp_crear_pedido(
    IN p_id_usuario INT,
    IN p_total DECIMAL(10,2),
    OUT p_id_pedido INT
)
BEGIN
        INSERT INTO pedido (id_usuario, total_pedido, pedido_estado, fecha)
        VALUES (p_id_usuario, p_total, 'CONFIRMADO', NOW());
        SET p_id_pedido = LAST_INSERT_ID();
END $$

DELIMITER ;
-- ==================================CREAR LINEA PEDIDO ============================================ --
DELIMITER $$
Drop procedure if exists sp_crear_linea_pedido $$
create procedure sp_crear_linea_pedido(
in p_id_pedido INT,
in p_id_producto INT,
in p_cantidad int,
out p_nuevo_total_acumulado DECIMAL(10,2)
)
begin
DECLARE v_precio_real DECIMAL(10,2);
select precio into v_precio_real
from producto where id_producto = p_id_producto;
 insert into linea_pedido(id_pedido, id_producto, cantidad, precio_unitario_momento) values
 ( p_id_pedido, p_id_producto, p_cantidad,v_precio_real);
 UPDATE pedido 
    SET total_pedido = total_pedido + (v_precio_real * p_cantidad)
    WHERE id_pedido = p_id_pedido;
    
    SELECT total_pedido INTO p_nuevo_total_acumulado 
    FROM pedido 
    WHERE id_pedido = p_id_pedido;
    
 UPDATE producto 
 SET stock = stock - p_cantidad WHERE id_producto = p_id_producto;
END $$
delimiter ;

-- pruebas --
CALL sp_crear_pedido(1,0,@id);
SELECT @id;
CALL sp_crear_linea_pedido(1,1,2,@total);
SELECT @total;

select * from producto;
select * from pedido;
select * FROM linea_pedido;
-- ================================== Crear Producto ================================================ --
Drop procedure if exists sp_crear_producto;
Delimiter $$
Create procedure sp_crear_producto(
in p_sku varchar(20), 
in p_nombre VARCHAR(100),
in p_descripcion TEXT,
in p_precio DECIMAL(10, 2),
in p_stock INT,
in p_categoria varchar(100),
in p_imagen VARCHAR(255)
)
begin 
DECLARE EXIT HANDLER FOR SQLEXCEPTION	
    BEGIN
        ROLLBACK;
          SIGNAL SQLSTATE '45000'
    SET MESSAGE_TEXT = 'SKU duplicado';
    END;
    start transaction;
     if (select count(*) from producto where p_sku = sku) > 0 then 
     SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'SKU duplicado';

 else 
insert into producto (sku, nombre, descripcion, precio, stock, categoria, imagen)
values(p_sku, p_nombre, p_descripcion, p_precio, p_stock, p_categoria, p_imagen);
commit;
 end if;
 end $$
 Delimiter ;
 call sp_crear_producto('hola','porque','lees',9999.99,20,'PERIFERICOS','esto???');
 delete from producto where id_producto = 29;
 select * from producto;
 commit;
-- ============== Crear procedures 1.-mov inv crear/guardar mov inv  ===================== --

DROP PROCEDURE IF EXISTS sp_movimiento_inventario;
DELIMITER $$

CREATE PROCEDURE sp_movimiento_inventario(
    IN p_id_producto INT,
    IN p_tipo_movimiento VARCHAR(20),
    IN p_cantidad INT,
    IN p_motivo VARCHAR(255)
)
begin
DECLARE EXIT HANDLER FOR SQLEXCEPTION	
    BEGIN
		SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Stock insuficiente para este movimiento';
    END ;
 start transaction;
    INSERT INTO movimiento_inventario(
        id_producto,
        tipo_movimiento,
        cantidad_movimiento,
        motivo_movimiento
    )
    VALUES (
        p_id_producto,
        p_tipo_movimiento,
        p_cantidad,
        p_motivo
    );
    if p_tipo_movimiento = 'SALIDA' THEN
		IF (SELECT stock FROM producto WHERE id_producto = p_id_producto) < p_cantidad THEN
			SIGNAL SQLSTATE '45000'
			SET MESSAGE_TEXT = 'Stock insuficiente para este movimiento';
        ELSE
        UPDATE producto 
        SET stock = stock - p_cantidad 
        WHERE id_producto = p_id_producto;
        END IF;
	end if;
        
	IF p_tipo_movimiento = 'ENTRADA' THEN
        UPDATE producto 
        SET stock = stock + p_cantidad 
        WHERE id_producto = p_id_producto;
	end if; 
commit;
END $$
DELIMITER ;
call sp_movimiento_inventario(5, 'SALIDA', 20, 'VENTA');
select * from producto;
select * from movimiento_inventario;

-- ===   2.-Listar mov inv    === --

DROP PROCEDURE IF EXISTS sp_movimiento_inventario_listar;
DELIMITER $$

CREATE PROCEDURE sp_movimiento_inventario_listar()
BEGIN
    SELECT m.id_movimiento,
           m.id_producto,
           m.tipo_movimiento,
           m.fecha_movimiento,
           m.cantidad_movimiento,
           m.motivo_movimiento,
           p.sku,
           p.nombre,
           p.descripcion,
           p.precio,
           p.stock,
           p.categoria,
           p.imagen
    FROM movimiento_inventario m
    JOIN producto p ON m.id_producto = p.id_producto;
END $$

DELIMITER ;
CALL sp_movimiento_inventario_listar();

-- === 3.-Filtrar mov iv por id producto === --

DROP PROCEDURE IF EXISTS sp_movimiento_inventario_listar_id_producto;
DELIMITER $$

CREATE PROCEDURE sp_movimiento_inventario_listar_id_producto(IN p_id_producto INT)
BEGIN
    SELECT m.id_movimiento,
           m.id_producto,
           m.tipo_movimiento,
           m.fecha_movimiento,
           m.cantidad_movimiento,
           m.motivo_movimiento,
           p.sku,
           p.nombre,
           p.descripcion,
           p.precio,
           p.stock,
           p.categoria,
           p.imagen
    FROM movimiento_inventario m
    JOIN producto p ON m.id_producto = p.id_producto
    WHERE m.id_producto = p_id_producto;
END $$

DELIMITER ;
CALL sp_movimiento_inventario_listar_id_producto (2);


-- ======================= Crear Usuario ============== --
DROP PROCEDURE IF EXISTS sp_crear_usuario;
DELIMITER $$
create procedure sp_crear_usuario(in p_email varchar(100) ,in p_password varchar(255))
begin
insert into usuario (email, password,rol) values(p_email,p_password,'CLIENTE');
commit;
end $$
DELIMITER ;
call sp_crear_usuario('oyequemas@gmail.com','gola');
select * from usuario;
-- =============== pedido usuario =========== --
drop procedure if exists sp_pedidos_usuario;
DELIMITER $$
CREATE PROCEDURE sp_pedidos_usuario(IN p_id_usuario INT)
BEGIN
    SELECT id_pedido, id_usuario, fecha, total_pedido, pedido_estado 
    FROM pedido 
    WHERE id_usuario = p_id_usuario;
END $$
DELIMITER ;
