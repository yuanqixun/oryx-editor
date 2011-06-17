drop function get_identity_from_hierarchy(hierarchy text)
CREATE OR REPLACE FUNCTION "public"."get_identity_from_hierarchy" (
  "archy" text
)
RETURNS "public"."identity" AS
$body$
 DECLARE
	result identity;
BEGIN
	SELECT identity.* INTO result FROM identity, structure WHERE identity.id=structure.ident_id AND structure.hierarchy=archy;
	RETURN result;
END;
$body$
LANGUAGE 'plpgsql'
VOLATILE
CALLED ON NULL INPUT
SECURITY INVOKER
COST 100;
