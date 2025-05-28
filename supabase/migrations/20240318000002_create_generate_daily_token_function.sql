-- Criar função para gerar tokens diários de forma atômica
CREATE OR REPLACE FUNCTION generate_daily_token(target_date DATE)
RETURNS TABLE (last_number INTEGER) AS $$
DECLARE
  current_number INTEGER;
BEGIN
  -- Inserir ou atualizar o contador do dia usando uma única operação atômica
  INSERT INTO token_counter (date, last_number)
  VALUES (target_date, 1)
  ON CONFLICT (date) DO UPDATE
  SET last_number = CASE 
    WHEN token_counter.last_number IS NULL THEN 1
    ELSE token_counter.last_number + 1
  END
  WHERE token_counter.date = target_date
  RETURNING token_counter.last_number INTO current_number;

  -- Validar o número gerado
  IF current_number IS NULL OR current_number < 1 THEN
    current_number := 1;
  END IF;

  -- Retornar o número gerado
  RETURN QUERY SELECT current_number;
END;
$$ LANGUAGE plpgsql; 