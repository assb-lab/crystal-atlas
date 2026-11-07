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
    const isolated = [];
    for (const node of nodes) {
        const rank = ranks.get(node.id);
        if (rank === 0 && !children.get(node.id).length) {
            isolated.push(node);
            continue;
        }
        if (!rows.has(rank)) rows.set(rank, []);
        rows.get(rank).push(node);
    }
    if (!rows.size) return new Map(nodes.map(node => [node.id, { x: node.x, y: node.y }]));
    const last = Math.max(...rows.keys());
    for (let i = 0; i < isolated.length; i += 4) {
        rows.set(last + 1 + i / 4, isolated.slice(i, i + 4));
    }
    const positions = new Map();
    for (const [rank, row] of rows) {
        row.sort((a, b) => a.x - b.x);
        row.forEach((node, i) => positions.set(node.id, {
            x: (i - (row.length - 1) / 2) * 255,
            y: rank * 144,
        }));
    }
    return positions;
}
