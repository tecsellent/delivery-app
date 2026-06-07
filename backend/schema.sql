-- ============================================
-- DELIVERY APP - Base de datos en Supabase
-- ============================================

-- Restaurantes
CREATE TABLE restaurantes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre TEXT NOT NULL,
  telefono TEXT,
  creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Repartidores
CREATE TABLE repartidores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre TEXT NOT NULL,
  telefono TEXT NOT NULL,
  activo BOOLEAN DEFAULT TRUE,
  creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Pedidos
CREATE TABLE pedidos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurante_id UUID REFERENCES restaurantes(id),
  repartidor_id UUID REFERENCES repartidores(id),
  cliente_nombre TEXT NOT NULL,
  cliente_telefono TEXT NOT NULL,
  descripcion TEXT,
  estado TEXT DEFAULT 'pendiente',  -- pendiente, en_camino, entregado
  link_tracking TEXT UNIQUE,
  creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  entregado_en TIMESTAMP WITH TIME ZONE
);

-- Ubicaciones del repartidor (tiempo real)
CREATE TABLE ubicaciones (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  pedido_id UUID REFERENCES pedidos(id),
  latitud DOUBLE PRECISION NOT NULL,
  longitud DOUBLE PRECISION NOT NULL,
  registrado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Permitir lectura pública del tracking (para el cliente)
ALTER TABLE ubicaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE pedidos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tracking público" ON ubicaciones FOR SELECT USING (true);
CREATE POLICY "pedidos público" ON pedidos FOR SELECT USING (true);
