-- ============================================================
-- RLS: lectura pública anónima para tablas públicas
-- ============================================================

-- categorias
ALTER TABLE categorias ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_read_categorias" ON categorias;
CREATE POLICY "anon_read_categorias"
  ON categorias FOR SELECT
  TO anon, authenticated
  USING (true);

-- proveedores
ALTER TABLE proveedores ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_read_proveedores" ON proveedores;
CREATE POLICY "anon_read_proveedores"
  ON proveedores FOR SELECT
  TO anon, authenticated
  USING (true);

-- comentarios
ALTER TABLE comentarios ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_read_comentarios" ON comentarios;
CREATE POLICY "anon_read_comentarios"
  ON comentarios FOR SELECT
  TO anon, authenticated
  USING (true);

-- scores
ALTER TABLE scores ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_read_scores" ON scores;
CREATE POLICY "anon_read_scores"
  ON scores FOR SELECT
  TO anon, authenticated
  USING (true);

-- categorias_proveedor
ALTER TABLE categorias_proveedor ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_read_categorias_proveedor" ON categorias_proveedor;
CREATE POLICY "anon_read_categorias_proveedor"
  ON categorias_proveedor FOR SELECT
  TO anon, authenticated
  USING (true);

-- fuentes
ALTER TABLE fuentes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_read_fuentes" ON fuentes;
CREATE POLICY "anon_read_fuentes"
  ON fuentes FOR SELECT
  TO anon, authenticated
  USING (true);
