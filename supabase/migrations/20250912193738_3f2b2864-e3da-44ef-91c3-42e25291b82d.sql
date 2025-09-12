-- Create function to set session context for RLS policies
CREATE OR REPLACE FUNCTION public.set_session_context(session_id_param text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Set the session context that RLS policies can access
  PERFORM set_config('app.current_session_id', session_id_param, true);
END;
$$;