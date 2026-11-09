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
export const EXTRACTION_RUN_QUERY = `MATCH (review:CoverageReview)-[:Reviews]->(a:Asset {id: $id}), (review)-[:ByRun]->(r:ProcessingRun)
RETURN DISTINCT r.id AS id, r.payload AS payload ORDER BY r.id`;
export const MENTIONS_QUERY = `MATCH (s:SourceSpan)-[:LocatedIn]->(a:Asset {id: $id}), (s)-[:ContainsMention]->(m:Mention), (m)-[:MentionByRun]->(run:ProcessingRun)
RETURN m.id AS id, m.rawName AS rawName, m.status AS status, m.payload AS payload, s.payload AS reference, run.id AS runId ORDER BY m.id`;
export const ENTITY_CANDIDATES_QUERY = `MATCH (m:Mention {id: $id})-[c:CandidateRefersTo]->(e:Entity)
RETURN e.id AS id, e.title AS title, c.note AS note ORDER BY e.id`;
export const RELATION_CANDIDATES_QUERY = `MATCH (r:RelationCandidate)-[:CandidateEvidence]->(s:SourceSpan)-[:LocatedIn]->(a:Asset {id: $id}), (r)-[:CandidateByRun]->(run:ProcessingRun)
RETURN DISTINCT r.id AS id, r.domain AS domain, r.operation AS operation, r.status AS status, r.payload AS payload, run.id AS runId ORDER BY r.id`;
export const CANDIDATE_EVIDENCE_QUERY = `MATCH (r:RelationCandidate {id: $id})-[:CandidateEvidence]->(s:SourceSpan)
RETURN s.payload AS reference ORDER BY s.id`;
export const ASSERTION_MATCHES_QUERY = `MATCH (r:RelationCandidate {id: $id})-[c:CandidateMatches]->(a:Assertion)
RETURN a.id AS id, a.label AS label, c.note AS note ORDER BY a.id`;
export const DECISIONS_QUERY = `MATCH (d:CandidateDecision)-[:DecisionEvidence]->(s:SourceSpan)-[:LocatedIn]->(a:Asset {id: $id})
RETURN DISTINCT d.id AS id, d.candidateId AS candidateId, d.candidateKind AS candidateKind, d.outcome AS outcome, d.reason AS reason, d.payload AS payload ORDER BY d.id`;
export const DECISION_RESULT_QUERY = `MATCH (d:CandidateDecision {id: $id})-[:ResolvedEntity]->(e:Entity)
RETURN e.id AS id, e.title AS title, e.kind AS kind, e.payload AS payload`;
export const ADOPTED_ASSERTION_QUERY = `MATCH (d:CandidateDecision {id: $id})-[:AdoptedAssertion]->(a:Assertion)-[:Subject]->(s:Entity)
RETURN a.id AS id, a.label AS title, a.domain AS domain, s.id AS subjectId`;
export const DECISION_EVIDENCE_QUERY = `MATCH (d:CandidateDecision {id: $id})-[:DecisionEvidence]->(s:SourceSpan)
RETURN s.payload AS reference ORDER BY s.id`;

/** A current decision has no later decision pointing to it. History stays queryable. */
export const CURRENT_DECISIONS_QUERY = `MATCH (d:CandidateDecision)-[:DecisionEvidence]->(s:SourceSpan)-[:LocatedIn]->(a:Asset {id: $id})
WHERE NOT EXISTS { MATCH (:CandidateDecision)-[:SupersedesDecision]->(d) }
RETURN DISTINCT d.id AS id, d.candidateId AS candidateId, d.candidateKind AS candidateKind, d.outcome AS outcome, d.reason AS reason, d.payload AS payload ORDER BY d.id`;
export const ENTITY_PROFILE_QUERY = `MATCH (e:Entity {id: $id}) RETURN e.id AS id, e.title AS title, e.kind AS kind, e.payload AS payload`;

export const OCCUPATION_QUERY = `MATCH (a:Assertion {id: $id})-[h:HasStep]->(step:OperationStep)-[:HasOccupationSpec]->(spec:OccupationSpec)-[:HostMotif]->(host:Entity)
RETURN spec.id AS id, spec.payload AS payload, host.id AS hostId, host.title AS hostTitle ORDER BY h.ordinal, spec.id`;

export const MODEL_CONTEXT_QUERY = `MATCH (m:StructureModel)-[:Models]->(e:Entity {id: $id}), (c:ModelContext)-[:ContextFor]->(m)
RETURN m.id AS id, c.kind AS kind, c.payload AS payload ORDER BY m.id`;
export const PROTOTYPE_MODEL_QUERY = `MATCH (m:StructureModel)-[i:IllustratesPrototype]->(e:Entity {id: $id}), (c:ModelContext)-[:ContextFor]->(m)
RETURN m.id AS id, c.kind AS kind, c.payload AS payload, i.note AS note ORDER BY m.id`;
export const IDENTITY_STATUS_QUERY = `MATCH (e:Entity) RETURN e.kind AS kind, count(e) AS count ORDER BY kind`;

export const LABEL_MAP_QUERY = `MATCH (a:Assertion {id: $id})-[h:HasStep]->(step:OperationStep)-[:HasLabelMap]->(spec:LabelMapSpec)
RETURN spec.id AS id, spec.payload AS payload ORDER BY h.ordinal`;
export const ROUTES_QUERY = `MATCH (r:DerivationRoute) RETURN r.id AS id, r.title AS title, r.payload AS payload ORDER BY r.title`;
export const ROUTE_MEMBERS_QUERY = `MATCH (r:DerivationRoute {id: $id})-[m:RouteMember]->(a:Assertion)-[:Subject]->(s:Entity), (a)-[:Object]->(t:Entity)
RETURN a.id AS id, a.label AS label, a.domain AS domain, a.status AS status, a.payload AS payload, s.id AS subjectId, s.title AS subjectTitle, t.id AS objectId, t.title AS objectTitle ORDER BY m.ordinal`;
export const OPERATION_VOCABULARY_QUERY = `MATCH (op:OperationDefinition) RETURN op.id AS id, op.title AS title, op.payload AS payload ORDER BY op.title`;
export const VOCABULARY_EXAMPLES_QUERY = `MATCH (a:Assertion)-[:VocabularyExample]->(op:OperationDefinition {id: $id}) RETURN a.id AS id, a.label AS label, a.status AS status ORDER BY a.id`;

export const CLASSIFICATION_SCHEMES_QUERY = `MATCH (s:ClassificationScheme) RETURN s.id AS id, s.title AS title, s.payload AS payload ORDER BY s.title`;
export const CLASSIFICATION_ITEMS_QUERY = `MATCH (s:ClassificationScheme {id:$id})-[:SchemeItem]->(e:Entity) RETURN e.id AS id,e.title AS title,e.payload AS payload ORDER BY e.title`;
export const CLASSIFICATION_CLAIMS_QUERY = `MATCH (a:Assertion)-[:ClaimInScheme]->(scheme:ClassificationScheme {id:$id}), (a)-[:Subject]->(s:Entity), (a)-[:Object]->(t:Entity) RETURN a.id AS id,a.operation AS operation,a.status AS status,a.basis AS basis,a.description AS description,s.id AS subjectId,s.title AS subjectTitle,t.id AS objectId,t.title AS objectTitle ORDER BY a.id`;
export const ENTITY_CLASSIFICATIONS_QUERY = `MATCH (a:Assertion)-[:Subject]->(e:Entity {id:$id}), (a)-[:Object]->(item:Entity), (a)-[:ClaimInScheme]->(scheme:ClassificationScheme) WHERE a.operation='member_of' RETURN a.id AS id,a.status AS status,a.basis AS basis,item.title AS itemTitle,scheme.id AS schemeId,scheme.title AS schemeTitle ORDER BY scheme.title,item.title`;
export const SYMMETRY_MAPPING_QUERY = `MATCH (m:SymmetryMapping)-[:MappingFor]->(a:Assertion {id:$id}) RETURN m.id AS id,m.payload AS payload ORDER BY m.id`;
export const SYMMETRY_VALIDATION_QUERY = `MATCH (v:SymmetryValidation)-[:Validates]->(m:SymmetryMapping {id:$id}) RETURN v.id AS id,v.payload AS payload`;
export const SYMMETRY_MODEL_QUERY = `MATCH (m:SymmetryMapping {id:$id})-[:MappingModel]->(model:DeclaredSymmetryModel) RETURN model.id AS id,model.payload AS payload`;
export const SYMMETRY_TREE_QUERY = `MATCH (m:SymmetryMapping)-[:MappingFor]->(a:Assertion)-[:Subject]->(s:Entity), (a)-[:Object]->(t:Entity) RETURN a.id AS id,a.label AS label,a.status AS status,m.id AS mappingId,m.payload AS payload,s.id AS subjectId,s.title AS subjectTitle,t.id AS objectId,t.title AS objectTitle ORDER BY a.id`;
export const ASSERTION_ENDPOINT_QUERY = `MATCH (a:Assertion {id:$id})-[:Subject]->(s:Entity), (a)-[:Object]->(t:Entity) RETURN a.domain AS domain,s.id AS subjectId,s.title AS subjectTitle,t.id AS objectId,t.title AS objectTitle`;
