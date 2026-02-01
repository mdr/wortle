UPDATE species
SET data = jsonb_set(data, '{alternativeScientificNames}', '[]'::jsonb)
WHERE NOT (data ? 'alternativeScientificNames');
