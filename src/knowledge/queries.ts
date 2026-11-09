/** Fixed, parameterized queries shared by the browser and the real snapshot verification. */
export const RELATIONSHIP_QUERY = `MATCH (a:Assertion)-[:Subject]->(s:Entity), (a)-[:Object]->(t:Entity)
WHERE a.domain = $domain AND (s.id = $id OR t.id = $id)
RETURN a.id AS id, a.domain AS domain, a.operation AS operation, a.label AS label,
a.description AS description, a.status AS status, a.basis AS basis, a.payload AS payload,
s.id AS subjectId, s.title AS subjectTitle, t.id AS objectId, t.title AS objectTitle
ORDER BY subjectTitle, objectTitle, id`;
export const EVIDENCE_QUERY = `MATCH (a:Assertion {id: $id})-[:HasEvidence]->(span:SourceSpan)-[:InDocument]->(d:Document)
RETURN span.payload AS reference, d.title AS document ORDER BY document, reference`;
export const STEP_QUERY = `MATCH (a:Assertion {id: $id})-[h:HasStep]->(s:OperationStep)
RETURN s.operation AS operation, s.target AS target, s.parameters AS parameters, s.payload AS payload ORDER BY h.ordinal`;
export const COUNTERPART_QUERY = `MATCH (s:Assertion)-[:ExplainsSymmetryOf]->(d:Assertion)
WHERE s.id = $id OR d.id = $id RETURN s.id AS symmetry, d.id AS derivation`;
export const CATALOG_QUERY = `MATCH (a:Asset) RETURN a.id AS id, a.payload AS payload ORDER BY a.id`;
export const COVERAGE_QUERY = `MATCH (r:CoverageReview)-[:Reviews]->(a:Asset {id: $id})
RETURN r.id AS id, r.status AS status, r.payload AS payload ORDER BY r.id`;
export const DOCUMENT_ASSETS_QUERY = `MATCH (d:Document {id: $id})-[r:HasAsset|CandidateAsset]->(a:Asset)
RETURN a.id AS id, a.payload AS payload ORDER BY a.id`;
