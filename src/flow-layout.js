/** Rank the arrows by derivation depth. Comparisons without arrows do not set a rank. */
export function derivationPositions(nodes, edges, columns = 3) {
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
    const last = rows.size ? Math.max(...rows.keys()) : -1;
    if (isolated.length) rows.set(last + 1, isolated);
    const positions = new Map();
    let top = 0;
    for (const [, row] of [...rows].sort(([a], [b]) => a - b)) {
        row.sort((a, b) => a.x - b.x);
        for (let start = 0; start < row.length; start += columns) {
            const chunk = row.slice(start, start + columns);
            chunk.forEach((node, i) => positions.set(node.id, {
                x: (i - (chunk.length - 1) / 2) * 255,
                y: top,
            }));
            top += 144;
        }
    }
    return positions;
}
