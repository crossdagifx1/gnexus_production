-- Create a function to check if user is super_admin
CREATE OR REPLACE FUNCTION public.is_super_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = 'super_admin'
  )
$$;

-- Drop existing policies on user_roles
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;

-- Create new policies: super_admins can do everything
CREATE POLICY "Super admins can manage all roles"
ON public.user_roles
FOR ALL
USING (public.is_super_admin(auth.uid()));

-- Regular admins can view all roles
CREATE POLICY "Admins can view roles"
ON public.user_roles
FOR SELECT
USING (public.has_role(auth.uid(), 'admin') OR public.is_super_admin(auth.uid()));

-- Regular admins can only manage non-super_admin roles
CREATE POLICY "Admins can insert non-super_admin roles"
ON public.user_roles
FOR INSERT
WITH CHECK (
  public.has_role(auth.uid(), 'admin') 
  AND role != 'super_admin'
);

CREATE POLICY "Admins can update non-super_admin roles"
ON public.user_roles
FOR UPDATE
USING (
  public.has_role(auth.uid(), 'admin') 
  AND role != 'super_admin'
)
WITH CHECK (role != 'super_admin');

CREATE POLICY "Admins can delete non-super_admin roles"
ON public.user_roles
FOR DELETE
USING (
  public.has_role(auth.uid(), 'admin') 
  AND role != 'super_admin'
);