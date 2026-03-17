DROP DATABASE IF EXISTS db_technova;
CREATE DATABASE db_technova;
USE db_technova;

CREATE TABLE usuario (
id_usuario INT AUTO_INCREMENT PRIMARY KEY,
email VARCHAR(100) UNIQUE NOT NULL,
password VARCHAR(255) NOT NULL,
rol ENUM('CLIENTE', 'OFICINA', 'ADMINISTRADOR') NOT NULL
);

CREATE TABLE producto (
id_producto INT AUTO_INCREMENT PRIMARY KEY,
sku VARCHAR(20) NOT NULL UNIQUE,
nombre VARCHAR(100) NOT NULL,
descripcion TEXT,
precio DECIMAL(10, 2) NOT NULL CHECK(precio >= 0),
stock INT NOT NULL CHECK (stock >= 0),
categoria ENUM('COMPONENTES', 'PERIFERICOS', 'REDES', 'SOFTWARE') NOT NULL,
imagen VARCHAR(255)
);
CREATE TABLE pedido (
id_pedido INT AUTO_INCREMENT PRIMARY KEY,	
id_usuario INT NOT NULL,
fecha DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
total_pedido DECIMAL(10, 2) NOT NULL,
pedido_estado ENUM ('CONFIRMADO', 'PREPARADO', 'ENVIADO', 'ENTREGADO'),
FOREIGN KEY (id_usuario) REFERENCES usuario (id_usuario)
);

CREATE TABLE linea_pedido (
id_linea_pedido INT AUTO_INCREMENT PRIMARY KEY,
id_pedido INT NOT NULL,
id_producto INT NOT NULL,
cantidad INT NOT NULL CHECK (cantidad > 0),
precio_unitario_momento DECIMAL (10, 2) NOT NULL,
FOREIGN KEY (id_pedido) REFERENCES pedido (id_pedido),
FOREIGN KEY (id_producto) REFERENCES producto (id_producto)
);

CREATE TABLE movimiento_inventario (
id_movimiento INT auto_increment primary key,
id_producto int not null,
tipo_movimiento enum ('ENTRADA','SALIDA') not null, -- Entrada agregar, Salida quitar al stock --
fecha_movimiento datetime not null default current_timestamp,
cantidad_movimiento int not null check (cantidad_movimiento> 0), -- el check sirve par registar siempre una cantidad positiva --
motivo_movimiento varchar(255),
foreign key (id_producto) references producto(id_producto));

-- INSERTS --

INSERT INTO usuario (email, password, rol) VALUES 
('anagarcia@technova.es', '12345a!!FDDV', 'OFICINA'),
('saragonzalez@technova.es', 'asdjfj21!CC', 'OFICINA'),

('alvaromartin@technova.es', 'vfjjdll?Vj1', 'ADMINISTRADOR'),
('shaghyasghari@technova.es', 'bccvcc98!D7', 'ADMINISTRADOR'),
('davidfraile@technova.es', 'mdkdjsjk3?R742',  'ADMINISTRADOR'),
('rayantorres@technova.es', 'lfjgjbjd1!F3', 'ADMINISTRADOR'),

('javiervs@gmail.com', 'uyuyuyuy124.S', 'CLIENTE'),
('lorenzop@gmail.com', 'iuinkuhn987!A', 'CLIENTE'),
('danie23@gmail.com', 'lnhhbhhA!34', 'CLIENTE'),
('antoniosf@gmail.com', 'lnhsdkAhA!34', 'CLIENTE'),
('maria837a@gmail.com','mcsjfwDS!55', 'CLIENTE'),
('anitaflores69@gmail.com', 'dvjjdje%D2', 'CLIENTE');


INSERT INTO producto (sku, nombre, descripcion, precio, stock, categoria, imagen) VALUES
('PER-MG5','Monitor Samsung Odyssey G5','Monitor curvo, 165Hz, 32 pulgadas',199.99,30,'Perifericos','Monitor-Samsung-Odyssey-G5-frontal.png'),
('PER-TNEWSKILL','Teclado NewSkil Pyro pro','Teclado mecanico, 65%, inalambrico',75.00,100,'Perifericos','Teclado-NewSkill-Pyros-pro-frontal.png'),
('PER-RLOGITECH','Logitech G G102 LightSync','Ratón Gaming 8000 DPI',17.90,0,'Perifericos','Logitech-G-G102-LightSync-Frontal.png'),

('COM-MCORSAIR','Memoria Ram Corsair Vengeance','2x16GB DDR5 6000MHz',600.99,9,'Componentes','Memoria-RAM-Corsair-Vengeance-RGB-DDR5-32GB-Frontal.png'),
('COM-RTX','MSI GeForce RTX 5070 Ti VENTUS','3X OC 16GB GDDR7 Reflex 2 RTX AI DLSS4',1400.90,90,'Componentes','MSI-GeForce-RTX-5070-Ti-VENTUS-Frontal-Caja.png'),
('COM-MP600','Corsair MP600 GS 1TB M.2 Gen4','Velocidad lectura secuencial hasta 4800 MB/s',112.22,78,'Componentes','Corsair-MP600-GS-1TB-M.2-Gen4-Frontal.png'),

('SOF-WINDOWS','Windows 11 Pro','Licencia OEM 64 bits Español',200.99,3,'Software','Licencia-Windows-11-Pro-OEM-Frontal.png'),
('SOF-KASPERSKY','Kaspersky Pro','Licencia AntiVirus Kaspersky 1 año',29.95,3,'Software','Licencia-AntiVirus-Kaspersky-Frontal.png'),
('SOF-OFFICE','Microsoft Office Professional Plus','Descarga digital Microsoft Office Professional Plus ',149.99,3,'Software','Microsoft-Office-Professional-Plus-2024-Caja.png'),

('RED-DLINK','Módem D-Link F518/M 5G','Wi-Fi 6 dual band hasta 1800 Mbps',295.87,3,'Redes','Módem-D-Link-F518M-5G-Wi-Fi 6-dual-band-Trasera.png'),
('RED-USB','TP-Link UB5A','Adaptador Nano USB Bluetooth 5.0',9.99,1,'Redes','TP-Link-UB5A-Caja.png'),
('RED-TARJETA','ASUS PCE-AXE5400','Tarjeta de Red WiFi AXE5400 con Bluetooth',32.95,4,'Redes','ASUS-PCE-AXE5400-Frontal.png');


INSERT INTO pedido (id_usuario, total_pedido, pedido_estado) VALUES
(7, 217.89, 'ENVIADO'),   -- javiervs@gmail.com
(8, 475.99, 'CONFIRMADO'),   -- lorenzop@gmail.com
(9, 229.99, 'ENTREGADO'),   -- danie23@gmail.com
(11, 98.04, 'PREPARADO');   -- maria837a@gmail.com

INSERT INTO linea_pedido (id_pedido, id_producto, cantidad, precio_unitario_momento) VALUES
-- Pedido 1 pertenece al cliente: javiervs@gmail.com--
(1, 7, 1, 17.90),
(1, 2, 1, 75.00),
(1, 1, 1, 199.99),

-- Pedido 2 pertenece al cliente:lorenzop@gmail.com--
(2, 10, 1, 229.99),
(2, 2, 1, 75.00),
(2, 7, 1, 17.90),

-- Pedido 3 pertenece al cliente: danie23@gmail.com--
(3, 10, 1, 229.99),

-- Pedido 4 pertenece al cliente: maria837a@gmail.com --
(4, 7, 2, 17.90),
(4, 2, 1, 75.00);

INSERT INTO movimiento_inventario (id_producto, tipo_movimiento, cantidad_movimiento, motivo_movimiento) VALUES
(7, 'ENTRADA', 20, 'ALTA DE STOCK'),
(2, 'SALIDA', 1, 'ARTÍCULO DEFECTUOSO');

SELECT * FROM producto;