require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const ws = require('ws');

const path = require('path');
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../web')));

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY, {
  realtime: { transport: ws }
});

// Verificar que el servidor funciona
app.get('/', (req, res) => {
  res.json({ mensaje: 'Backend de Delivery App funcionando ✓' });
});

// Listar todos los pedidos
app.get('/pedidos', async (req, res) => {
  const { data, error } = await supabase
    .from('pedidos')
    .select('*')
    .order('creado_en', { ascending: false });

  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// Crear un pedido nuevo
app.post('/pedidos', async (req, res) => {
  const { cliente_nombre, cliente_telefono, descripcion, restaurante_id } = req.body;
  const link_tracking = Math.random().toString(36).substring(2, 10);

  const { data, error } = await supabase
    .from('pedidos')
    .insert([{ cliente_nombre, cliente_telefono, descripcion, restaurante_id, link_tracking }])
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });
  res.json({ pedido: data, link: `http://localhost:3000/tracking/${link_tracking}` });
});

// Ver estado de un pedido (para el mapa del cliente)
app.get('/tracking/:link', async (req, res) => {
  const { data: pedido, error } = await supabase
    .from('pedidos')
    .select('*')
    .eq('link_tracking', req.params.link)
    .single();

  if (error || !pedido) return res.status(404).json({ error: 'Pedido no encontrado' });

  const { data: ubicacion } = await supabase
    .from('ubicaciones')
    .select('*')
    .eq('pedido_id', pedido.id)
    .order('registrado_en', { ascending: false })
    .limit(1)
    .single();

  res.json({ pedido, ubicacion: ubicacion || null });
});

// Repartidor actualiza su ubicación GPS
app.post('/ubicacion', async (req, res) => {
  const { pedido_id, latitud, longitud } = req.body;

  const { error } = await supabase
    .from('ubicaciones')
    .insert([{ pedido_id, latitud, longitud }]);

  if (error) return res.status(400).json({ error: error.message });
  res.json({ ok: true });
});

// Repartidor marca pedido como entregado
app.post('/pedidos/:id/entregado', async (req, res) => {
  const { error } = await supabase
    .from('pedidos')
    .update({ estado: 'entregado', entregado_en: new Date() })
    .eq('id', req.params.id);

  if (error) return res.status(400).json({ error: error.message });
  res.json({ ok: true });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
