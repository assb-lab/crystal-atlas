/** Fixed, parameterized queries shared by the browser and the real snapshot verification. */
export const RELATIONSHIP_QUERY = `MATCH (a:Assertion)-[:Subject]->(s:Entity), (a)-[:Object]->(t:Entity)
WHERE a.domain = $domain AND (s.id = $id OR t.id = $id)
RETURN a.id AS id, a.domain AS domain, a.operation AS operation, a.label AS label,
a.description AS description, a.status AS status, a.basis AS basis, a.payload AS payload,
s.id AS subjectId, s.title AS subjectTitle, t.id AS objectId, t.title AS objectTitle
ORDER BY subjectTitle, objectTitle, id`;
export const EVIDENCE_QUERY = `MATCH (a:Assertion {id: $id})-[:HasEvidence]->(span:SourceSpan)-[:InDocument]->(d:Document)
RETURN span.payload AS reference, d.title AS document ORDER BY document, reference`;
