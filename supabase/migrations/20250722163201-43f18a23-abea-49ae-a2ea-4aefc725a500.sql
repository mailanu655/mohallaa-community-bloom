-- Add profile setup completion tracking
ALTER TABLE public.profiles 
ADD COLUMN profile_setup_completed BOOLEAN DEFAULT FALSE;

-- Create function to check if profile setup is complete
CREATE OR REPLACE FUNCTION check_profile_setup_complete(profile_id UUID)
RETURNS BOOLEAN 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  profile_data RECORD;
BEGIN
  SELECT * INTO profile_data 
  FROM public.profiles 
  WHERE id = profile_id;
  
  IF profile_data.id IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Check if minimum required fields are filled
  -- Name, profession, and neighborhood selection are mandatory
  RETURN (
    profile_data.first_name IS NOT NULL AND profile_data.first_name != '' AND
    profile_data.last_name IS NOT NULL AND profile_data.last_name != '' AND
    profile_data.profession IS NOT NULL AND profile_data.profession != '' AND
    profile_data.selected_neighborhood_id IS NOT NULL
  );
END;
$$;