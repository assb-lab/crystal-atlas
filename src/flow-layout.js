/** Rank the arrows by derivation depth. Comparisons without arrows do not set a rank. */
export function derivationPositions(nodes, edges) {
    const indegree = new Map(nodes.map(node => [node.id, 0]));
    const children = new Map(nodes.map(node => [node.id, []]));
    for (const edge of edges) {
        if (edge.undirected) continue;
        children.get(edge.a).push(edge.b);
        indegree.set(edge.b, indegree.get(edge.b) + 1);
    }
    const ranks = new Map(nodes.map(node => [node.id, 0]));
    const queue = nodes.filter(node => indegree.get(node.id) === 0).map(node => node.id);
    for (const id of queue) {
        for (const child of children.get(id)) {
            ranks.set(child, Math.max(ranks.get(child), ranks.get(id) + 1));
            indegree.set(child, indegree.get(child) - 1);
            if (indegree.get(child) === 0) queue.push(child);
        }
    }
    const rows = new Map();
    for (const node of nodes) {
        const rank = ranks.get(node.id);
        if (!rows.has(rank)) rows.set(rank, []);
        rows.get(rank).push(node);
    }
    const positions = new Map();
    let top = 0;
    for (const [, row] of [...rows].sort(([a], [b]) => a - b)) {
        row.sort((a, b) => a.x - b.x);
        row.forEach((node, i) => positions.set(node.id, {
            x: (i - (row.length - 1) / 2) * 270,
            y: top,
        }));
        top += 180;
    }
    return positions;
}

/** Only real incident edges enter this view. Summary connectors are not derivations. */
export function neighborhoodGraph(nodes, edges, anchor, expanded = new Set()) {
    const byId = new Map(nodes.map(node => [node.id, node]));
    if (!byId.has(anchor)) return { nodes: [], edges: [], groups: [], positions: new Map() };
    const incident = edges.filter(edge => edge.a === anchor || edge.b === anchor);
    const buckets = new Map();
    for (const edge of incident) {
        const direction = edge.undirected ? 'compare' : edge.a === anchor ? 'out' : 'in';
        const kind = direction === 'compare' ? 'analogy' : edge.kind;
        const key = `${direction}:${kind}`;
        if (!buckets.has(key)) buckets.set(key, { id: `group:${key}`, key, direction, kind, edges: [] });
        buckets.get(key).edges.push(edge);
    }
    const other = edge => edge.a === anchor ? edge.b : edge.a;
    const shown = new Set([anchor]);
    const active = [...buckets.values()].find(bucket => expanded.has(bucket.key));
    for (const bucket of buckets.values()) {
        if (active ? bucket === active : new Set(bucket.edges.map(other)).size === 1) {
            bucket.edges.forEach(edge => shown.add(other(edge)));
        }
    }
    const groups = [...buckets.values()].map(bucket => {
        const hidden = bucket.edges.filter(edge => active ? bucket !== active : !shown.has(other(edge)));
        return { ...bucket, edges: hidden, count: new Set(hidden.map(other)).size };
    }).filter(bucket => bucket.count);
    const visibleEdges = (active ? active.edges : incident).filter(edge => shown.has(other(edge)));
    const columns = { in: [], out: [], compare: [] };
    for (const id of shown) {
        if (id === anchor) continue;
        const edge = visibleEdges.find(edge => other(edge) === id && !edge.undirected)
            ?? visibleEdges.find(edge => other(edge) === id);
        columns[edge.undirected ? active ? 'out' : 'compare' : edge.a === anchor ? 'out' : 'in'].push(id);
    }
    if (!active) groups.forEach(group => columns[group.direction].push(group.id));
    const positions = new Map([[anchor, { x: 0, y: 0 }]]);
    for (const direction of ['in', 'out']) {
        columns[direction].forEach((id, i, list) => positions.set(id, {
            x: direction === 'in' ? -350 : 350, y: (i - (list.length - 1) / 2) * 116,
        }));
    }
    const bottom = Math.max(180, Math.max(columns.in.length, columns.out.length) * 58 + 100);
    columns.compare.forEach((id, i, list) => positions.set(id, {
        x: (i - (list.length - 1) / 2) * 270, y: bottom,
    }));
    return { nodes: nodes.filter(node => shown.has(node.id)), edges: visibleEdges, groups, positions };
}

/** Cubic connectors retain smooth tangents, including routes around intermediate ranks. */
export function relationshipCurve(p, q, positions, lane = 0, horizontal = false) {
    const dx = q.x - p.x, dy = q.y - p.y;
    let sx, sy, ex, ey, c1x, c1y, c2x, c2y;
    if (horizontal && Math.abs(dx) > 240) {
        const sign = Math.sign(dx);
        sx = p.x + sign * 110; sy = p.y; ex = q.x - sign * 110; ey = q.y;
        c1x = sx + sign * Math.abs(ex - sx) * .55; c1y = sy;
        c2x = ex - sign * Math.abs(ex - sx) * .55; c2y = ey;
    } else if (Math.abs(dy) > 230 && !horizontal) {
        const sign = Math.sign(dy), points = [...positions.values()];
        const sideSign = p.x + q.x < 0 ? -1 : 1;
        const side = sideSign < 0 ? Math.min(...points.map(point => point.x)) - 160 - lane * 12
            : Math.max(...points.map(point => point.x)) + 160 + lane * 12;
        sy = p.y + sign * 43; ey = q.y - sign * 43;
        const enter = sy + sign * 65, leave = ey - sign * 65, middle = (sy + ey) / 2;
        return { d: `M${p.x},${sy} C${p.x},${enter} ${side},${sy} ${side},${enter} C${side},${middle} ${side},${middle} ${side},${leave} C${side},${ey} ${q.x},${leave} ${q.x},${ey}`, mx: side, my: middle };
    } else if (Math.abs(dy) < 72) {
        sx = p.x; sy = p.y - 43; ex = q.x; ey = q.y - 43;
        c1x = sx; c2x = ex; c1y = c2y = Math.min(sy, ey) - 85 - lane * 12;
    } else {
        const sign = Math.sign(dy);
        sx = p.x; sy = p.y + sign * 43; ex = q.x; ey = q.y - sign * 43;
        const bend = Math.max(40, Math.abs(ey - sy) * .5);
        c1x = sx; c1y = sy + sign * bend; c2x = ex; c2y = ey - sign * bend;
    }
    return { d: `M${sx},${sy} C${c1x},${c1y} ${c2x},${c2y} ${ex},${ey}`,
        mx: (sx + 3 * c1x + 3 * c2x + ex) / 8, my: (sy + 3 * c1y + 3 * c2y + ey) / 8 };
}
