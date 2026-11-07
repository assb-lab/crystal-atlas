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

/** Retain every generation. Only explicitly folded branches hide descendants. */
export function derivationGraph(nodes, edges, anchor = null, collapsed = new Set()) {
    const ids = new Set(nodes.map(node => node.id));
    const directed = edges.filter(edge => !edge.undirected);
    const children = new Map(nodes.map(node => [node.id, []]));
    const parents = new Map(nodes.map(node => [node.id, []]));
    for (const edge of directed) {
        children.get(edge.a).push(edge.b);
        parents.get(edge.b).push(edge.a);
    }
    function walk(starts, links, stops = new Set()) {
        const seen = new Set(starts), queue = [...starts];
        for (const id of queue) {
            if (stops.has(id)) continue;
            for (const next of links.get(id) ?? []) if (!seen.has(next)) { seen.add(next); queue.push(next); }
        }
        return seen;
    }
    let included = ids;
    if (anchor !== null) {
        if (!ids.has(anchor)) return { nodes: [], edges: [], groups: [], positions: new Map() };
        included = new Set([...walk([anchor], children), ...walk([anchor], parents)]);
        // Direct comparisons provide context but never stand in for a derivation.
        for (const edge of edges.filter(edge => edge.undirected)) {
            if (edge.a === anchor) included.add(edge.b);
            if (edge.b === anchor) included.add(edge.a);
        }
    }
    const scopedNodes = nodes.filter(node => included.has(node.id));
    const scopedEdges = edges.filter(edge => included.has(edge.a) && included.has(edge.b));
    const scopedChildren = new Map(scopedNodes.map(node => [node.id, []]));
    const childIds = new Set();
    for (const edge of scopedEdges.filter(edge => !edge.undirected)) {
        scopedChildren.get(edge.a).push(edge.b); childIds.add(edge.b);
    }
    const roots = scopedNodes.filter(node => !childIds.has(node.id)).map(node => node.id);
    // A shared descendant stays visible if another unfolded parent still reaches it.
    const visible = collapsed.size ? walk(roots, scopedChildren, collapsed) : included;
    const groups = [];
    for (const id of collapsed) {
        if (!visible.has(id) || !included.has(id)) continue;
        const hidden = [...walk([id], scopedChildren)].filter(child => !visible.has(child));
        if (hidden.length) groups.push({ id: `group:${id}`, key: id, parent: id, count: hidden.length });
    }
    const positions = derivationPositions(scopedNodes, scopedEdges);
    const shownNodes = scopedNodes.filter(node => visible.has(node.id));
    const shownEdges = scopedEdges.filter(edge => visible.has(edge.a) && visible.has(edge.b));
    if (!groups.length) return { nodes: shownNodes, edges: shownEdges, groups, positions };
    // Keep original generation heights while closing the horizontal gaps of folded branches.
    const rows = new Map();
    const marks = [...shownNodes.map(node => ({ id: node.id, ...positions.get(node.id) })),
        ...groups.map(group => ({ id: group.id, x: positions.get(group.parent).x, y: positions.get(group.parent).y + 180 }))];
    for (const mark of marks) {
        if (!rows.has(mark.y)) rows.set(mark.y, []);
        rows.get(mark.y).push(mark);
    }
    const compact = new Map();
    for (const [y, row] of rows) {
        row.sort((a, b) => a.x - b.x);
        row.forEach((mark, i) => compact.set(mark.id, { x: (i - (row.length - 1) / 2) * 270, y }));
    }
    return { nodes: shownNodes, edges: shownEdges, groups, positions: compact };
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
