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
export const EXTRACTION_RUN_QUERY = `MATCH (m:Mention)-[:MentionByRun]->(r:ProcessingRun), (s:SourceSpan)-[:ContainsMention]->(m), (s)-[:LocatedIn]->(a:Asset {id: $id})
RETURN DISTINCT r.id AS id, r.payload AS payload ORDER BY r.id`;
export const MENTIONS_QUERY = `MATCH (s:SourceSpan)-[:LocatedIn]->(a:Asset {id: $id}), (s)-[:ContainsMention]->(m:Mention)
RETURN m.id AS id, m.rawName AS rawName, m.status AS status, m.payload AS payload, s.payload AS reference ORDER BY m.id`;
export const ENTITY_CANDIDATES_QUERY = `MATCH (m:Mention {id: $id})-[c:CandidateRefersTo]->(e:Entity)
RETURN e.id AS id, e.title AS title, c.note AS note ORDER BY e.id`;
export const RELATION_CANDIDATES_QUERY = `MATCH (r:RelationCandidate)-[:CandidateEvidence]->(s:SourceSpan)-[:LocatedIn]->(a:Asset {id: $id})
RETURN DISTINCT r.id AS id, r.domain AS domain, r.operation AS operation, r.status AS status, r.payload AS payload ORDER BY r.id`;
export const CANDIDATE_EVIDENCE_QUERY = `MATCH (r:RelationCandidate {id: $id})-[:CandidateEvidence]->(s:SourceSpan)
RETURN s.payload AS reference ORDER BY s.id`;
export const ASSERTION_MATCHES_QUERY = `MATCH (r:RelationCandidate {id: $id})-[c:CandidateMatches]->(a:Assertion)
RETURN a.id AS id, a.label AS label, c.note AS note ORDER BY a.id`;
export const DECISIONS_QUERY = `MATCH (d:CandidateDecision)-[:DecisionEvidence]->(s:SourceSpan)-[:LocatedIn]->(a:Asset {id: $id})
RETURN DISTINCT d.id AS id, d.candidateId AS candidateId, d.candidateKind AS candidateKind, d.outcome AS outcome, d.reason AS reason, d.payload AS payload ORDER BY d.id`;
export const DECISION_RESULT_QUERY = `MATCH (d:CandidateDecision {id: $id})-[:ResolvedEntity]->(e:Entity)
RETURN e.id AS id, e.title AS title`;
export const ADOPTED_ASSERTION_QUERY = `MATCH (d:CandidateDecision {id: $id})-[:AdoptedAssertion]->(a:Assertion)-[:Subject]->(s:Entity)
RETURN a.id AS id, a.label AS title, a.domain AS domain, s.id AS subjectId`;
export const DECISION_EVIDENCE_QUERY = `MATCH (d:CandidateDecision {id: $id})-[:DecisionEvidence]->(s:SourceSpan)
RETURN s.payload AS reference ORDER BY s.id`;
