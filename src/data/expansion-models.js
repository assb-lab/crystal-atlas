/** Source-derived unit cells for the expanded catalog. */
export const expansionModels = {
  "bt-cubic": {
    kind: "literature",
    source: {"label": "COD 1542140 · Miyake 1947", "url": "https://www.crystallography.net/cod/1542140.html"},
    spaceGroup: 221,
    parameters: [3.996, 3.996, 3.996, 90.0, 90.0, 90.0],
    groups: [
      { wyckoff: "1a", occupants: {"Ba": 1.0}, positions: [
        [0.0, 0.0, 0.0],
      ] },
      { wyckoff: "1b", occupants: {"Ti": 1.0}, positions: [
        [0.5, 0.5, 0.5],
      ] },
      { wyckoff: "3c", occupants: {"O": 1.0}, positions: [
        [0.0, 0.5, 0.5], [0.5, 0.0, 0.5], [0.5, 0.5, 0.0],
      ] },
    ],
  },
  "bt-ortho": {
    kind: "prototype",
    source: {"label": "AFLOW · AB3C_oC10_38_a_ae_b-002", "url": "https://www.aflow.org/prototype-encyclopedia/AB3C_oC10_38_a_ae_b-002/"},
    spaceGroup: 38,
    parameters: [3.99, 5.669, 5.682, 90.0, 90.0, 90.0],
    groups: [
      { wyckoff: "2a", occupants: {"Ba": 1.0}, positions: [
        [0.0, 0.0, 0.0], [0.0, 0.5, 0.5],
      ] },
      { wyckoff: "2a", occupants: {"O": 1.0}, positions: [
        [0.0, 0.0, 0.49], [0.0, 0.5, 0.99],
      ] },
      { wyckoff: "2b", occupants: {"Ti": 1.0}, positions: [
        [0.5, 0.0, 0.51], [0.5, 0.5, 0.01],
      ] },
      { wyckoff: "4e", occupants: {"O": 1.0}, positions: [
        [0.5, 0.247, 0.737], [0.5, 0.253, 0.237], [0.5, 0.747, 0.237], [0.5, 0.753, 0.737],
      ] },
    ],
  },
  "bt-rhombo": {
    kind: "prototype",
    source: {"label": "AFLOW · AB3C_hR5_160_a_b_a-001", "url": "https://www.aflow.org/prototype-encyclopedia/AB3C_hR5_160_a_b_a-001/"},
    spaceGroup: 160,
    parameters: [5.6508569614, 5.6508569614, 6.948054102, 90.0, 90.0, 120.0],
    groups: [
      { wyckoff: "3a", occupants: {"Ba": 1.0}, positions: [
        [0.0, 0.0, 0.013], [0.33333333, 0.66666667, 0.67966667], [0.66666667, 0.33333333, 0.34633333],
      ] },
      { wyckoff: "3a", occupants: {"Ti": 1.0}, positions: [
        [0.0, 0.0, 0.5], [0.33333333, 0.66666667, 0.16666667], [0.66666667, 0.33333333, 0.83333333],
      ] },
      { wyckoff: "9b", occupants: {"O": 1.0}, positions: [
        [0.00466667, 0.50233333, 0.02633333], [0.16433333, 0.32866667, 0.35966667], [0.16433333, 0.83566667, 0.35966667], [0.338, 0.169, 0.693],
        [0.49766667, 0.50233333, 0.02633333], [0.49766667, 0.99533333, 0.02633333], [0.67133333, 0.83566667, 0.35966667], [0.831, 0.169, 0.693],
        [0.831, 0.662, 0.693],
      ] },
    ],
  },
  "kto": {
    kind: "literature",
    source: {"label": "COD 2102087 · Zhurova 2000 · 298 K", "url": "https://www.crystallography.net/cod/2102087.html"},
    spaceGroup: 221,
    parameters: [3.9883, 3.9883, 3.9883, 90.0, 90.0, 90.0],
    groups: [
      { wyckoff: "1b", occupants: {"K": 1.0}, positions: [
        [0.5, 0.5, 0.5],
      ] },
      { wyckoff: "3d", occupants: {"O": 1.0}, positions: [
        [0.0, 0.0, 0.5], [0.0, 0.5, 0.0], [0.5, 0.0, 0.0],
      ] },
      { wyckoff: "1a", occupants: {"Ta": 1.0}, positions: [
        [0.0, 0.0, 0.0],
      ] },
    ],
  },
  "kno-tet": {
    kind: "literature",
    source: {"label": "COD 1531431 · Hewat 1973", "url": "https://www.crystallography.net/cod/1531431.html"},
    spaceGroup: 99,
    parameters: [3.996, 3.996, 4.063, 90.0, 90.0, 90.0],
    groups: [
      { wyckoff: "1b", occupants: {"Nb": 1.0}, positions: [
        [0.5, 0.5, 0.5],
      ] },
      { wyckoff: "1b", occupants: {"O": 1.0}, positions: [
        [0.5, 0.5, 0.044],
      ] },
      { wyckoff: "1a", occupants: {"K": 1.0}, positions: [
        [0.0, 0.0, 0.018],
      ] },
      { wyckoff: "2c", occupants: {"O": 1.0}, positions: [
        [0.0, 0.5, 0.54], [0.5, 0.0, 0.54],
      ] },
    ],
  },
  "kno-ortho": {
    kind: "literature",
    source: {"label": "COD 2310011 · Katz 1967", "url": "https://www.crystallography.net/cod/2310011.html"},
    spaceGroup: 38,
    parameters: [5.697, 3.971, 5.72, 90.0, 90.0, 90.0],
    note: "CIF は Bmm2 設定。",
    groups: [
      { wyckoff: "2a", occupants: {"Nb": 1.0}, positions: [
        [0.0, 0.0, 0.0], [0.5, 0.0, 0.5],
      ] },
      { wyckoff: "2b", occupants: {"K": 1.0}, positions: [
        [0.0, 0.5, 0.517], [0.5, 0.5, 0.017],
      ] },
      { wyckoff: "2b", occupants: {"O": 1.0}, positions: [
        [0.0, 0.5, 0.021], [0.5, 0.5, 0.521],
      ] },
      { wyckoff: "4d", occupants: {"O": 1.0}, positions: [
        [0.246, 0.0, 0.785], [0.254, 0.0, 0.285], [0.746, 0.0, 0.285], [0.754, 0.0, 0.785],
      ] },
    ],
  },
  "nno-afe": {
    kind: "prototype",
    source: {"label": "AFLOW · ABC3_oP40_57_cd_e_cd2e-001", "url": "https://www.aflow.org/prototype-encyclopedia/ABC3_oP40_57_cd_e_cd2e-001/"},
    spaceGroup: 57,
    parameters: [5.506, 5.566, 15.52, 90.0, 90.0, 90.0],
    groups: [
      { wyckoff: "4c", occupants: {"Na": 1.0}, positions: [
        [0.243, 0.25, 0.0], [0.243, 0.25, 0.5], [0.757, 0.75, 0.0], [0.757, 0.75, 0.5],
      ] },
      { wyckoff: "4c", occupants: {"O": 1.0}, positions: [
        [0.304, 0.75, 0.0], [0.304, 0.75, 0.5], [0.696, 0.25, 0.0], [0.696, 0.25, 0.5],
      ] },
      { wyckoff: "4d", occupants: {"Na": 1.0}, positions: [
        [0.239, 0.218, 0.25], [0.239, 0.282, 0.75], [0.761, 0.718, 0.25], [0.761, 0.782, 0.75],
      ] },
      { wyckoff: "4d", occupants: {"O": 1.0}, positions: [
        [0.191, 0.733, 0.75], [0.191, 0.767, 0.25], [0.809, 0.233, 0.75], [0.809, 0.267, 0.25],
      ] },
      { wyckoff: "8e", occupants: {"Nb": 1.0}, positions: [
        [0.2566, 0.7278, 0.1262], [0.2566, 0.7278, 0.3738], [0.2566, 0.7722, 0.6262], [0.2566, 0.7722, 0.8738],
        [0.7434, 0.2278, 0.1262], [0.7434, 0.2278, 0.3738], [0.7434, 0.2722, 0.6262], [0.7434, 0.2722, 0.8738],
      ] },
      { wyckoff: "8e", occupants: {"O": 1.0}, positions: [
        [0.464, 0.032, 0.64], [0.464, 0.032, 0.86], [0.464, 0.468, 0.14], [0.464, 0.468, 0.36],
        [0.536, 0.532, 0.64], [0.536, 0.532, 0.86], [0.536, 0.968, 0.14], [0.536, 0.968, 0.36],
      ] },
      { wyckoff: "8e", occupants: {"O": 1.0}, positions: [
        [0.034, 0.033, 0.11], [0.034, 0.033, 0.39], [0.034, 0.467, 0.61], [0.034, 0.467, 0.89],
        [0.966, 0.533, 0.11], [0.966, 0.533, 0.39], [0.966, 0.967, 0.61], [0.966, 0.967, 0.89],
      ] },
    ],
  },
  "pto": {
    kind: "literature",
    source: {"label": "COD 2107521 · Yoshiasa 2016 · 298 K", "url": "https://www.crystallography.net/cod/2107521.html"},
    spaceGroup: 99,
    parameters: [3.8992, 3.8992, 4.1499, 90.0, 90.0, 90.0],
    groups: [
      { wyckoff: "1a", occupants: {"Pb": 1.0}, positions: [
        [0.0, 0.0, 0.0],
      ] },
      { wyckoff: "1b", occupants: {"Ti": 1.0}, positions: [
        [0.5, 0.5, 0.5382],
      ] },
      { wyckoff: "1b", occupants: {"O": 1.0}, positions: [
        [0.5, 0.5, 0.113],
      ] },
      { wyckoff: "2c", occupants: {"O": 1.0}, positions: [
        [0.0, 0.5, 0.615], [0.5, 0.0, 0.615],
      ] },
    ],
  },
  "pzo": {
    kind: "literature",
    source: {"label": "COD 2003138 · Teslic 1998", "url": "https://www.crystallography.net/cod/2003138.html"},
    spaceGroup: 55,
    parameters: [5.8779, 11.7846, 8.2042, 90.0, 90.0, 90.0],
    groups: [
      { wyckoff: "4g", occupants: {"Pb": 1.0}, positions: [
        [0.204, 0.375, 0.0], [0.296, 0.875, 0.0], [0.704, 0.125, 0.0], [0.796, 0.625, 0.0],
      ] },
      { wyckoff: "4h", occupants: {"Pb": 1.0}, positions: [
        [0.204, 0.375, 0.5], [0.296, 0.875, 0.5], [0.704, 0.125, 0.5], [0.796, 0.625, 0.5],
      ] },
      { wyckoff: "8i", occupants: {"Zr": 1.0}, positions: [
        [0.245, 0.125, 0.25], [0.245, 0.125, 0.75], [0.255, 0.625, 0.25], [0.255, 0.625, 0.75],
        [0.745, 0.375, 0.25], [0.745, 0.375, 0.75], [0.755, 0.875, 0.25], [0.755, 0.875, 0.75],
      ] },
      { wyckoff: "4g", occupants: {"O": 1.0}, positions: [
        [0.23, 0.654, 0.0], [0.27, 0.154, 0.0], [0.73, 0.846, 0.0], [0.77, 0.346, 0.0],
      ] },
      { wyckoff: "4h", occupants: {"O": 1.0}, positions: [
        [0.195, 0.593, 0.5], [0.305, 0.093, 0.5], [0.695, 0.907, 0.5], [0.805, 0.407, 0.5],
      ] },
      { wyckoff: "8i", occupants: {"O": 1.0}, positions: [
        [0.034, 0.262, 0.284], [0.034, 0.262, 0.716], [0.466, 0.762, 0.284], [0.466, 0.762, 0.716],
        [0.534, 0.238, 0.284], [0.534, 0.238, 0.716], [0.966, 0.738, 0.284], [0.966, 0.738, 0.716],
      ] },
      { wyckoff: "4f", occupants: {"O": 1.0}, positions: [
        [0.0, 0.5, 0.201], [0.0, 0.5, 0.799], [0.5, 0.0, 0.201], [0.5, 0.0, 0.799],
      ] },
      { wyckoff: "4e", occupants: {"O": 1.0}, positions: [
        [0.0, 0.0, 0.229], [0.0, 0.0, 0.771], [0.5, 0.5, 0.229], [0.5, 0.5, 0.771],
      ] },
    ],
  },
  "sto-tet": {
    kind: "literature",
    source: {"label": "COD 2310687 · Tsuda 1995", "url": "https://www.crystallography.net/cod/2310687.html"},
    spaceGroup: 140,
    parameters: [5.511, 5.511, 7.796, 90.0, 90.0, 90.0],
    groups: [
      { wyckoff: "4b", occupants: {"Sr": 1.0}, positions: [
        [0.0, 0.5, 0.25], [0.0, 0.5, 0.75], [0.5, 0.0, 0.25], [0.5, 0.0, 0.75],
      ] },
      { wyckoff: "4a", occupants: {"O": 1.0}, positions: [
        [0.0, 0.0, 0.25], [0.0, 0.0, 0.75], [0.5, 0.5, 0.25], [0.5, 0.5, 0.75],
      ] },
      { wyckoff: "4c", occupants: {"Ti": 1.0}, positions: [
        [0.0, 0.0, 0.0], [0.0, 0.0, 0.5], [0.5, 0.5, 0.0], [0.5, 0.5, 0.5],
      ] },
      { wyckoff: "8h", occupants: {"O": 1.0}, positions: [
        [0.2451, 0.2549, 0.5], [0.2451, 0.7451, 0.0], [0.2549, 0.2451, 0.0], [0.2549, 0.7549, 0.5],
        [0.7451, 0.2451, 0.5], [0.7451, 0.7549, 0.0], [0.7549, 0.2549, 0.0], [0.7549, 0.7451, 0.5],
      ] },
    ],
  },
  "srzro3-tet": {
    kind: "prototype",
    source: {"label": "AFLOW · A3BC_tI20_140_ah_b_c-002", "url": "https://www.aflow.org/prototype-encyclopedia/A3BC_tI20_140_ah_b_c-002/"},
    spaceGroup: 140,
    parameters: [5.8456, 5.8456, 8.2808, 90.0, 90.0, 90.0],
    groups: [
      { wyckoff: "4a", occupants: {"O": 1.0}, positions: [
        [0.0, 0.0, 0.25], [0.0, 0.0, 0.75], [0.5, 0.5, 0.25], [0.5, 0.5, 0.75],
      ] },
      { wyckoff: "4b", occupants: {"Sr": 1.0}, positions: [
        [0.0, 0.5, 0.25], [0.0, 0.5, 0.75], [0.5, 0.0, 0.25], [0.5, 0.0, 0.75],
      ] },
      { wyckoff: "4c", occupants: {"Zr": 1.0}, positions: [
        [0.0, 0.0, 0.0], [0.0, 0.0, 0.5], [0.5, 0.5, 0.0], [0.5, 0.5, 0.5],
      ] },
      { wyckoff: "8h", occupants: {"O": 1.0}, positions: [
        [0.2136, 0.2864, 0.0], [0.2136, 0.7136, 0.5], [0.2864, 0.2136, 0.5], [0.2864, 0.7864, 0.0],
        [0.7136, 0.2136, 0.0], [0.7136, 0.7864, 0.5], [0.7864, 0.2864, 0.5], [0.7864, 0.7136, 0.0],
      ] },
    ],
  },
  "gfo": {
    kind: "literature",
    source: {"label": "COD 1528359 · Blasco 2006", "url": "https://www.crystallography.net/cod/1528359.html"},
    spaceGroup: 62,
    parameters: [5.349, 5.6089, 7.6687, 90.0, 90.0, 90.0],
    note: "CIF は Pbnm 設定。",
    groups: [
      { wyckoff: "4c", occupants: {"O": 1.0}, positions: [
        [0.1116, 0.4569, 0.25], [0.3884, 0.9569, 0.25], [0.6116, 0.0431, 0.75], [0.8884, 0.5431, 0.75],
      ] },
      { wyckoff: "8d", occupants: {"O": 1.0}, positions: [
        [0.196, 0.1979, 0.5521], [0.196, 0.1979, 0.9479], [0.304, 0.6979, 0.5521], [0.304, 0.6979, 0.9479],
        [0.696, 0.3021, 0.0521], [0.696, 0.3021, 0.4479], [0.804, 0.8021, 0.0521], [0.804, 0.8021, 0.4479],
      ] },
      { wyckoff: "4c", occupants: {"Gd": 1.0}, positions: [
        [0.0154, 0.9371, 0.75], [0.4846, 0.4371, 0.75], [0.5154, 0.5629, 0.25], [0.9846, 0.0629, 0.25],
      ] },
      { wyckoff: "4b", occupants: {"Fe": 1.0}, positions: [
        [0.0, 0.5, 0.0], [0.0, 0.5, 0.5], [0.5, 0.0, 0.0], [0.5, 0.0, 0.5],
      ] },
    ],
  },
  "lmo": {
    kind: "literature",
    source: {"label": "COD 1006141 · Rodriguez-Carvajal 1998 · 298 K", "url": "https://www.crystallography.net/cod/1006141.html"},
    spaceGroup: 62,
    parameters: [5.5367, 5.7473, 7.6929, 90.0, 90.0, 90.0],
    note: "CIF は Pbnm 設定。",
    groups: [
      { wyckoff: "4c", occupants: {"La": 1.0}, positions: [
        [0.0078, 0.951, 0.75], [0.4922, 0.451, 0.75], [0.5078, 0.549, 0.25], [0.9922, 0.049, 0.25],
      ] },
      { wyckoff: "4b", occupants: {"Mn": 1.0}, positions: [
        [0.0, 0.5, 0.0], [0.0, 0.5, 0.5], [0.5, 0.0, 0.0], [0.5, 0.0, 0.5],
      ] },
      { wyckoff: "4c", occupants: {"O": 1.0}, positions: [
        [0.0745, 0.4874, 0.25], [0.4255, 0.9874, 0.25], [0.5745, 0.0126, 0.75], [0.9255, 0.5126, 0.75],
      ] },
      { wyckoff: "8d", occupants: {"O": 1.0}, positions: [
        [0.2256, 0.1934, 0.5384], [0.2256, 0.1934, 0.9616], [0.2744, 0.6934, 0.5384], [0.2744, 0.6934, 0.9616],
        [0.7256, 0.3066, 0.0384], [0.7256, 0.3066, 0.4616], [0.7744, 0.8066, 0.0384], [0.7744, 0.8066, 0.4616],
      ] },
    ],
  },
  "lao": {
    kind: "literature",
    source: {"label": "COD 1521190 · Howard 2000", "url": "https://www.crystallography.net/cod/1521190.html"},
    spaceGroup: 167,
    parameters: [5.3598, 5.3598, 13.0859, 90.0, 90.0, 120.0],
    groups: [
      { wyckoff: "6a", occupants: {"La": 1.0}, positions: [
        [0.0, 0.0, 0.25], [0.0, 0.0, 0.75], [0.33333333, 0.66666667, 0.41666667], [0.33333333, 0.66666667, 0.91666667],
        [0.66666667, 0.33333333, 0.08333333], [0.66666667, 0.33333333, 0.58333333],
      ] },
      { wyckoff: "6b", occupants: {"Al": 1.0}, positions: [
        [0.0, 0.0, 0.0], [0.0, 0.0, 0.5], [0.33333333, 0.66666667, 0.16666667], [0.33333333, 0.66666667, 0.66666667],
        [0.66666667, 0.33333333, 0.33333333], [0.66666667, 0.33333333, 0.83333333],
      ] },
      { wyckoff: "18e", occupants: {"O": 1.0}, positions: [
        [0.0, 0.4719, 0.75], [0.0, 0.5281, 0.25], [0.13856667, 0.33333333, 0.08333333], [0.13856667, 0.80523333, 0.58333333],
        [0.19476667, 0.33333333, 0.58333333], [0.19476667, 0.86143333, 0.08333333], [0.33333333, 0.13856667, 0.41666667], [0.33333333, 0.19476667, 0.91666667],
        [0.4719, 0.0, 0.75], [0.4719, 0.4719, 0.25], [0.5281, 0.0, 0.25], [0.5281, 0.5281, 0.75],
        [0.66666667, 0.80523333, 0.08333333], [0.66666667, 0.86143333, 0.58333333], [0.80523333, 0.13856667, 0.91666667], [0.80523333, 0.66666667, 0.41666667],
        [0.86143333, 0.19476667, 0.41666667], [0.86143333, 0.66666667, 0.91666667],
      ] },
    ],
  },
  "bfo": {
    kind: "literature",
    source: {"label": "COD 2102909 · Palewicz 2007 · 298 K", "url": "https://www.crystallography.net/cod/2102909.html"},
    spaceGroup: 161,
    parameters: [5.57882, 5.57882, 13.86932, 90.0, 90.0, 120.0],
    note: "CIF の O 占有率 1.00001 は丸めて 1 としました。",
    groups: [
      { wyckoff: "6a", occupants: {"Bi": 1.0}, positions: [
        [0.0, 0.0, 0.0], [0.0, 0.0, 0.5], [0.33333333, 0.66666667, 0.16666667], [0.33333333, 0.66666667, 0.66666667],
        [0.66666667, 0.33333333, 0.33333333], [0.66666667, 0.33333333, 0.83333333],
      ] },
      { wyckoff: "6a", occupants: {"Fe": 1.0}, positions: [
        [0.0, 0.0, 0.22021], [0.0, 0.0, 0.72021], [0.33333333, 0.66666667, 0.38687667], [0.33333333, 0.66666667, 0.88687667],
        [0.66666667, 0.33333333, 0.05354333], [0.66666667, 0.33333333, 0.55354333],
      ] },
      { wyckoff: "18b", occupants: {"O": 1}, positions: [
        [0.11356667, 0.35143333, 0.28516333], [0.11356667, 0.76213333, 0.78516333], [0.23786667, 0.35143333, 0.78516333], [0.23786667, 0.88643333, 0.28516333],
        [0.31523333, 0.09546667, 0.61849667], [0.31523333, 0.21976667, 0.11849667], [0.4469, 0.0181, 0.95183], [0.4469, 0.4288, 0.45183],
        [0.5712, 0.0181, 0.45183], [0.5712, 0.5531, 0.95183], [0.64856667, 0.76213333, 0.28516333], [0.64856667, 0.88643333, 0.78516333],
        [0.78023333, 0.09546667, 0.11849667], [0.78023333, 0.68476667, 0.61849667], [0.90453333, 0.21976667, 0.61849667], [0.90453333, 0.68476667, 0.11849667],
        [0.9819, 0.4288, 0.95183], [0.9819, 0.5531, 0.45183],
      ] },
    ],
  },
  "bamgwo6": {
    kind: "literature",
    source: {"label": "COD 1563080 · Day 2012", "url": "https://www.crystallography.net/cod/1563080.html"},
    spaceGroup: 225,
    parameters: [8.1078, 8.1078, 8.1078, 90.0, 90.0, 90.0],
    groups: [
      { wyckoff: "8c", occupants: {"Ba": 1.0}, positions: [
        [0.25, 0.25, 0.25], [0.25, 0.25, 0.75], [0.25, 0.75, 0.25], [0.25, 0.75, 0.75],
        [0.75, 0.25, 0.25], [0.75, 0.25, 0.75], [0.75, 0.75, 0.25], [0.75, 0.75, 0.75],
      ] },
      { wyckoff: "4a", occupants: {"Mg": 1.0}, positions: [
        [0.0, 0.0, 0.0], [0.0, 0.5, 0.5], [0.5, 0.0, 0.5], [0.5, 0.5, 0.0],
      ] },
      { wyckoff: "4b", occupants: {"W": 1.0}, positions: [
        [0.0, 0.0, 0.5], [0.0, 0.5, 0.0], [0.5, 0.0, 0.0], [0.5, 0.5, 0.5],
      ] },
      { wyckoff: "24e", occupants: {"O": 1.0}, positions: [
        [0.0, 0.0, 0.26203], [0.0, 0.0, 0.73797], [0.0, 0.23797, 0.5], [0.0, 0.26203, 0.0],
        [0.0, 0.5, 0.23797], [0.0, 0.5, 0.76203], [0.0, 0.73797, 0.0], [0.0, 0.76203, 0.5],
        [0.23797, 0.0, 0.5], [0.23797, 0.5, 0.0], [0.26203, 0.0, 0.0], [0.26203, 0.5, 0.5],
        [0.5, 0.0, 0.23797], [0.5, 0.0, 0.76203], [0.5, 0.23797, 0.0], [0.5, 0.26203, 0.5],
        [0.5, 0.5, 0.26203], [0.5, 0.5, 0.73797], [0.5, 0.73797, 0.5], [0.5, 0.76203, 0.0],
        [0.73797, 0.0, 0.0], [0.73797, 0.5, 0.5], [0.76203, 0.0, 0.5], [0.76203, 0.5, 0.0],
      ] },
    ],
  },
  "srniwo6": {
    kind: "prototype",
    source: {"label": "AFLOW · AB6C2D_tI20_87_a_eh_d_b-001", "url": "https://www.aflow.org/prototype-encyclopedia/AB6C2D_tI20_87_a_eh_d_b-001/"},
    spaceGroup: 87,
    parameters: [5.5571, 5.5571, 7.9131, 90.0, 90.0, 90.0],
    groups: [
      { wyckoff: "2a", occupants: {"Ni": 1.0}, positions: [
        [0.0, 0.0, 0.0], [0.5, 0.5, 0.5],
      ] },
      { wyckoff: "2b", occupants: {"W": 1.0}, positions: [
        [0.0, 0.0, 0.5], [0.5, 0.5, 0.0],
      ] },
      { wyckoff: "4d", occupants: {"Sr": 1.0}, positions: [
        [0.0, 0.5, 0.25], [0.0, 0.5, 0.75], [0.5, 0.0, 0.25], [0.5, 0.0, 0.75],
      ] },
      { wyckoff: "4e", occupants: {"O": 1.0}, positions: [
        [0.0, 0.0, 0.255], [0.0, 0.0, 0.745], [0.5, 0.5, 0.245], [0.5, 0.5, 0.755],
      ] },
      { wyckoff: "8h", occupants: {"O": 1.0}, positions: [
        [0.211, 0.273, 0.5], [0.227, 0.711, 0.0], [0.273, 0.789, 0.5], [0.289, 0.227, 0.0],
        [0.711, 0.773, 0.0], [0.727, 0.211, 0.5], [0.773, 0.289, 0.0], [0.789, 0.727, 0.5],
      ] },
    ],
  },
  "srfemoo6": {
    kind: "literature",
    source: {"label": "COD 1528327 · Azad 2006", "url": "https://www.crystallography.net/cod/1528327.html"},
    spaceGroup: 87,
    parameters: [5.5529, 5.5529, 7.8993, 90.0, 90.0, 90.0],
    groups: [
      { wyckoff: "4e", occupants: {"O": 1.0}, positions: [
        [0.0, 0.0, 0.2528], [0.0, 0.0, 0.7472], [0.5, 0.5, 0.2472], [0.5, 0.5, 0.7528],
      ] },
      { wyckoff: "2b", occupants: {"Mo": 1.0}, positions: [
        [0.0, 0.0, 0.5], [0.5, 0.5, 0.0],
      ] },
      { wyckoff: "8h", occupants: {"O": 1.0}, positions: [
        [0.2241, 0.2733, 0.5], [0.2267, 0.7241, 0.0], [0.2733, 0.7759, 0.5], [0.2759, 0.2267, 0.0],
        [0.7241, 0.7733, 0.0], [0.7267, 0.2241, 0.5], [0.7733, 0.2759, 0.0], [0.7759, 0.7267, 0.5],
      ] },
      { wyckoff: "4e", occupants: {"Sr": 1.0}, positions: [
        [0.0, 0.0, 0.25], [0.0, 0.0, 0.75], [0.5, 0.5, 0.25], [0.5, 0.5, 0.75],
      ] },
      { wyckoff: "2a", occupants: {"Fe": 1.0}, positions: [
        [0.0, 0.0, 0.0], [0.5, 0.5, 0.5],
      ] },
    ],
  },
  "camgwo6": {
    kind: "literature",
    source: {"label": "COD 2013468 · Yang 2003 · 293 K", "url": "https://www.crystallography.net/cod/2013468.html"},
    spaceGroup: 14,
    parameters: [5.4199, 5.5479, 7.7147, 90.0, 90.092, 90.0],
    note: "CIF は P2₁/n 設定。",
    groups: [
      { wyckoff: "4e", occupants: {"Ca": 1.0}, positions: [
        [0.0108, 0.0469, 0.248], [0.4892, 0.5469, 0.252], [0.5108, 0.4531, 0.748], [0.9892, 0.9531, 0.752],
      ] },
      { wyckoff: "2c", occupants: {"Mg": 1.0}, positions: [
        [0.0, 0.5, 0.0], [0.5, 0.0, 0.5],
      ] },
      { wyckoff: "2b", occupants: {"W": 1.0}, positions: [
        [0.0, 0.5, 0.5], [0.5, 0.0, 0.0],
      ] },
      { wyckoff: "4e", occupants: {"O": 1.0}, positions: [
        [0.2134, 0.8037, 0.0419], [0.2866, 0.3037, 0.4581], [0.7134, 0.6963, 0.5419], [0.7866, 0.1963, 0.9581],
      ] },
      { wyckoff: "4e", occupants: {"O": 1.0}, positions: [
        [0.1941, 0.7838, 0.4536], [0.3059, 0.2838, 0.0464], [0.6941, 0.7162, 0.9536], [0.8059, 0.2162, 0.5464],
      ] },
      { wyckoff: "4e", occupants: {"O": 1.0}, positions: [
        [0.0845, 0.5252, 0.7402], [0.4155, 0.0252, 0.7598], [0.5845, 0.9748, 0.2402], [0.9155, 0.4748, 0.2598],
      ] },
    ],
  },
  "bast": {
    kind: "literature",
    source: {"label": "COD 4124646 · Galasso 1961 / F. S. Galasso, Structure, Properties and Preparation of Perovskite-Type Compounds, 1st ed. (Pergamon Press, Oxford, 1969) · §2.2, pp. 13–14", "url": "https://www.crystallography.net/cod/4124646.html"},
    spaceGroup: 164,
    parameters: [5.95, 5.95, 7.47, 90.0, 90.0, 120.0],
    groups: [
      { wyckoff: "2d", occupants: {"Ta": 1.0}, positions: [
        [0.3333, 0.6667, 0.1667], [0.6667, 0.3333, 0.8333],
      ] },
      { wyckoff: "6i", occupants: {"O": 1.0}, positions: [
        [0.1667, 0.3334, 0.3333], [0.1667, 0.8333, 0.3333], [0.3334, 0.1667, 0.6667], [0.6666, 0.8333, 0.3333],
        [0.8333, 0.1667, 0.6667], [0.8333, 0.6666, 0.6667],
      ] },
      { wyckoff: "1b", occupants: {"Sr": 1.0}, positions: [
        [0.0, 0.0, 0.5],
      ] },
      { wyckoff: "1a", occupants: {"Ba": 1.0}, positions: [
        [0.0, 0.0, 0.0],
      ] },
      { wyckoff: "3e", occupants: {"O": 1.0}, positions: [
        [0.0, 0.5, 0.0], [0.5, 0.0, 0.0], [0.5, 0.5, 0.0],
      ] },
      { wyckoff: "2d", occupants: {"Ba": 1.0}, positions: [
        [0.3333, 0.6667, 0.6667], [0.6667, 0.3333, 0.3333],
      ] },
    ],
  },
  "bamt": {
    kind: "literature",
    source: {"label": "COD 4000400 · Chem. Mater. (2004) · DOI: 10.1021/cm049831k", "url": "https://www.crystallography.net/cod/4000400.html"},
    spaceGroup: 164,
    parameters: [5.77385, 5.77385, 7.09376, 90.0, 90.0, 120.0],
    groups: [
      { wyckoff: "2d", occupants: {"Ba": 1.0}, positions: [
        [0.33333, 0.66667, 0.665], [0.66667, 0.33333, 0.335],
      ] },
      { wyckoff: "1a", occupants: {"Ba": 1.0}, positions: [
        [0.0, 0.0, 0.0],
      ] },
      { wyckoff: "1b", occupants: {"Mg": 1.0}, positions: [
        [0.0, 0.0, 0.5],
      ] },
      { wyckoff: "2d", occupants: {"Ta": 1.0}, positions: [
        [0.33333, 0.66667, 0.1776], [0.66667, 0.33333, 0.8224],
      ] },
      { wyckoff: "3e", occupants: {"O": 1.0}, positions: [
        [0.0, 0.5, 0.0], [0.5, 0.0, 0.0], [0.5, 0.5, 0.0],
      ] },
      { wyckoff: "6i", occupants: {"O": 1.0}, positions: [
        [0.17082, 0.34164, 0.32515], [0.17082, 0.82918, 0.32515], [0.34164, 0.17082, 0.67485], [0.65836, 0.82918, 0.32515],
        [0.82918, 0.17082, 0.67485], [0.82918, 0.65836, 0.67485],
      ] },
    ],
  },
  "bamnb": {
    kind: "literature",
    source: {"label": "COD 4000398 · Chem. Mater. (2004) · DOI: 10.1021/cm049831k", "url": "https://www.crystallography.net/cod/4000398.html"},
    spaceGroup: 164,
    parameters: [5.77544, 5.77544, 7.08762, 90.0, 90.0, 120.0],
    groups: [
      { wyckoff: "2d", occupants: {"Ba": 1.0}, positions: [
        [0.33333, 0.66667, 0.66814], [0.66667, 0.33333, 0.33186],
      ] },
      { wyckoff: "1a", occupants: {"Ba": 1.0}, positions: [
        [0.0, 0.0, 0.0],
      ] },
      { wyckoff: "1b", occupants: {"Mg": 1.0}, positions: [
        [0.0, 0.0, 0.5],
      ] },
      { wyckoff: "2d", occupants: {"Nb": 1.0}, positions: [
        [0.33333, 0.66667, 0.17921], [0.66667, 0.33333, 0.82079],
      ] },
      { wyckoff: "3e", occupants: {"O": 1.0}, positions: [
        [0.0, 0.5, 0.0], [0.5, 0.0, 0.0], [0.5, 0.5, 0.0],
      ] },
      { wyckoff: "6i", occupants: {"O": 1.0}, positions: [
        [0.17061, 0.34122, 0.3257], [0.17061, 0.82939, 0.3257], [0.34122, 0.17061, 0.6743], [0.65878, 0.82939, 0.3257],
        [0.82939, 0.17061, 0.6743], [0.82939, 0.65878, 0.6743],
      ] },
    ],
  },
  "bbio3": {
    kind: "literature",
    source: {"label": "COD 2100569 · Kennedy 2006", "url": "https://www.crystallography.net/cod/2100569.html"},
    spaceGroup: 14,
    parameters: [6.1741, 6.12484, 8.6522, 90.0, 90.2691, 90.0],
    note: "CIF は P2₁/n 設定。",
    groups: [
      { wyckoff: "4e", occupants: {"Ba": 1.0}, positions: [
        [0.0045, 0.513, 0.7493], [0.4955, 0.013, 0.7507], [0.5045, 0.987, 0.2493], [0.9955, 0.487, 0.2507],
      ] },
      { wyckoff: "2a", occupants: {"Bi": 1.0}, positions: [
        [0.0, 0.0, 0.0], [0.5, 0.5, 0.5],
      ] },
      { wyckoff: "2d", occupants: {"Bi": 1.0}, positions: [
        [0.0, 0.0, 0.5], [0.5, 0.5, 0.0],
      ] },
      { wyckoff: "4e", occupants: {"O": 1.0}, positions: [
        [0.0689, 0.0068, 0.2613], [0.4311, 0.5068, 0.2387], [0.5689, 0.4932, 0.7613], [0.9311, 0.9932, 0.7387],
      ] },
      { wyckoff: "4e", occupants: {"O": 1.0}, positions: [
        [0.2465, 0.2735, 0.9635], [0.2535, 0.7735, 0.5365], [0.7465, 0.2265, 0.4635], [0.7535, 0.7265, 0.0365],
      ] },
      { wyckoff: "4e", occupants: {"O": 1.0}, positions: [
        [0.2222, 0.2584, 0.5371], [0.2778, 0.7584, 0.9629], [0.7222, 0.2416, 0.0371], [0.7778, 0.7416, 0.4629],
      ] },
    ],
  },
  "ccto": {
    kind: "literature",
    source: {"label": "COD 1008180 · Bochu 1979", "url": "https://www.crystallography.net/cod/1008180.html"},
    spaceGroup: 204,
    parameters: [7.391, 7.391, 7.391, 90.0, 90.0, 90.0],
    groups: [
      { wyckoff: "2a", occupants: {"Ca": 1.0}, positions: [
        [0.0, 0.0, 0.0], [0.5, 0.5, 0.5],
      ] },
      { wyckoff: "6b", occupants: {"Cu": 1.0}, positions: [
        [0.0, 0.0, 0.5], [0.0, 0.5, 0.0], [0.0, 0.5, 0.5], [0.5, 0.0, 0.0],
        [0.5, 0.0, 0.5], [0.5, 0.5, 0.0],
      ] },
      { wyckoff: "8c", occupants: {"Ti": 1.0}, positions: [
        [0.25, 0.25, 0.25], [0.25, 0.25, 0.75], [0.25, 0.75, 0.25], [0.25, 0.75, 0.75],
        [0.75, 0.25, 0.25], [0.75, 0.25, 0.75], [0.75, 0.75, 0.25], [0.75, 0.75, 0.75],
      ] },
      { wyckoff: "24g", occupants: {"O": 1.0}, positions: [
        [0.0, 0.3038, 0.1786], [0.0, 0.3038, 0.8214], [0.0, 0.6962, 0.1786], [0.0, 0.6962, 0.8214],
        [0.1786, 0.0, 0.3038], [0.1786, 0.0, 0.6962], [0.1962, 0.3214, 0.5], [0.1962, 0.6786, 0.5],
        [0.3038, 0.1786, 0.0], [0.3038, 0.8214, 0.0], [0.3214, 0.5, 0.1962], [0.3214, 0.5, 0.8038],
        [0.5, 0.1962, 0.3214], [0.5, 0.1962, 0.6786], [0.5, 0.8038, 0.3214], [0.5, 0.8038, 0.6786],
        [0.6786, 0.5, 0.1962], [0.6786, 0.5, 0.8038], [0.6962, 0.1786, 0.0], [0.6962, 0.8214, 0.0],
        [0.8038, 0.3214, 0.5], [0.8038, 0.6786, 0.5], [0.8214, 0.0, 0.3038], [0.8214, 0.0, 0.6962],
      ] },
    ],
  },
  "sr2fe2o5": {
    kind: "average",
    source: {"label": "COD 2106510 · Greaves 1975", "url": "https://www.crystallography.net/cod/2106510.html"},
    spaceGroup: 74,
    parameters: [5.6727, 15.582, 5.5303, 90.0, 90.0, 90.0],
    note: "I c m m 設定。鎖の配列を平均化した回折モデル。",
    groups: [
      { wyckoff: "8i", occupants: {"O": 0.5}, positions: [
        [0.141, 0.75, 0.377], [0.141, 0.75, 0.623], [0.359, 0.75, 0.123], [0.359, 0.75, 0.877],
        [0.641, 0.25, 0.123], [0.641, 0.25, 0.877], [0.859, 0.25, 0.377], [0.859, 0.25, 0.623],
      ] },
      { wyckoff: "8h", occupants: {"Sr": 1.0}, positions: [
        [0.0165, 0.1092, 0.5], [0.0165, 0.3908, 0.5], [0.4835, 0.1092, 0.0], [0.4835, 0.3908, 0.0],
        [0.5165, 0.6092, 0.0], [0.5165, 0.8908, 0.0], [0.9835, 0.6092, 0.5], [0.9835, 0.8908, 0.5],
      ] },
      { wyckoff: "8i", occupants: {"Fe": 0.5}, positions: [
        [0.0686, 0.75, 0.0416], [0.0686, 0.75, 0.9584], [0.4314, 0.75, 0.4584], [0.4314, 0.75, 0.5416],
        [0.5686, 0.25, 0.4584], [0.5686, 0.25, 0.5416], [0.9314, 0.25, 0.0416], [0.9314, 0.25, 0.9584],
      ] },
      { wyckoff: "8g", occupants: {"O": 1.0}, positions: [
        [0.25, 0.5091, 0.25], [0.25, 0.5091, 0.75], [0.25, 0.9909, 0.25], [0.25, 0.9909, 0.75],
        [0.75, 0.0091, 0.25], [0.75, 0.0091, 0.75], [0.75, 0.4909, 0.25], [0.75, 0.4909, 0.75],
      ] },
      { wyckoff: "8h", occupants: {"O": 1.0}, positions: [
        [0.0513, 0.1401, 0.0], [0.0513, 0.3599, 0.0], [0.4487, 0.1401, 0.5], [0.4487, 0.3599, 0.5],
        [0.5513, 0.6401, 0.5], [0.5513, 0.8599, 0.5], [0.9487, 0.6401, 0.0], [0.9487, 0.8599, 0.0],
      ] },
      { wyckoff: "4a", occupants: {"Fe": 1.0}, positions: [
        [0.0, 0.0, 0.0], [0.0, 0.5, 0.0], [0.5, 0.0, 0.5], [0.5, 0.5, 0.5],
      ] },
    ],
  },
  "srfeo2": {
    kind: "literature",
    source: {"label": "COD 4124111 · Tassel 2008", "url": "https://www.crystallography.net/cod/4124111.html"},
    spaceGroup: 123,
    parameters: [3.99107, 3.99107, 3.47481, 90.0, 90.0, 90.0],
    groups: [
      { wyckoff: "1d", occupants: {"Sr": 1.0}, positions: [
        [0.5, 0.5, 0.5],
      ] },
      { wyckoff: "1a", occupants: {"Fe": 1.0}, positions: [
        [0.0, 0.0, 0.0],
      ] },
      { wyckoff: "2f", occupants: {"O": 1.0}, positions: [
        [0.0, 0.5, 0.0], [0.5, 0.0, 0.0],
      ] },
    ],
  },
  "kmgf3": {
    kind: "literature",
    source: {"label": "COD 9006966 · Chakhmouradian 2001", "url": "https://www.crystallography.net/cod/9006966.html"},
    spaceGroup: 221,
    parameters: [3.9897, 3.9897, 3.9897, 90.0, 90.0, 90.0],
    groups: [
      { wyckoff: "1b", occupants: {"K": 1.0}, positions: [
        [0.5, 0.5, 0.5],
      ] },
      { wyckoff: "1a", occupants: {"Mg": 1.0}, positions: [
        [0.0, 0.0, 0.0],
      ] },
      { wyckoff: "3d", occupants: {"F": 1.0}, positions: [
        [0.0, 0.0, 0.5], [0.0, 0.5, 0.0], [0.5, 0.0, 0.0],
      ] },
    ],
  },
  "knif3": {
    kind: "literature",
    source: {"label": "COD 5910032 · Wyckoff 1931", "url": "https://www.crystallography.net/cod/5910032.html"},
    spaceGroup: 221,
    parameters: [4.0, 4.0, 4.0, 90.0, 90.0, 90.0],
    groups: [
      { wyckoff: "1a", occupants: {"K": 1.0}, positions: [
        [0.0, 0.0, 0.0],
      ] },
      { wyckoff: "1b", occupants: {"Ni": 1.0}, positions: [
        [0.5, 0.5, 0.5],
      ] },
      { wyckoff: "3c", occupants: {"F": 1.0}, positions: [
        [0.0, 0.5, 0.5], [0.5, 0.0, 0.5], [0.5, 0.5, 0.0],
      ] },
    ],
  },
  "kfef3": {
    kind: "literature",
    source: {"label": "COD 2106894 · Miyata 1983", "url": "https://www.crystallography.net/cod/2106894.html"},
    spaceGroup: 221,
    parameters: [4.1198, 4.1198, 4.1198, 90.0, 90.0, 90.0],
    groups: [
      { wyckoff: "1a", occupants: {"Fe": 1.0}, positions: [
        [0.0, 0.0, 0.0],
      ] },
      { wyckoff: "1b", occupants: {"K": 1.0}, positions: [
        [0.5, 0.5, 0.5],
      ] },
      { wyckoff: "3d", occupants: {"F": 1.0}, positions: [
        [0.0, 0.0, 0.5], [0.0, 0.5, 0.0], [0.5, 0.0, 0.0],
      ] },
    ],
  },
  "rbcaf3": {
    kind: "literature",
    source: {"label": "COD 1530112 · Hutton 1981", "url": "https://www.crystallography.net/cod/1530112.html"},
    spaceGroup: 221,
    parameters: [4.445, 4.445, 4.445, 90.0, 90.0, 90.0],
    groups: [
      { wyckoff: "3c", occupants: {"F": 1.0}, positions: [
        [0.0, 0.5, 0.5], [0.5, 0.0, 0.5], [0.5, 0.5, 0.0],
      ] },
      { wyckoff: "1a", occupants: {"Rb": 1.0}, positions: [
        [0.0, 0.0, 0.0],
      ] },
      { wyckoff: "1b", occupants: {"Ca": 1.0}, positions: [
        [0.5, 0.5, 0.5],
      ] },
    ],
  },
  "kcuf3": {
    kind: "prototype",
    source: {"label": "AFLOW · AB3C_tI20_140_d_bh_a-001", "url": "https://www.aflow.org/prototype-encyclopedia/AB3C_tI20_140_d_bh_a-001/"},
    spaceGroup: 140,
    parameters: [5.855, 5.855, 7.852, 90.0, 90.0, 90.0],
    groups: [
      { wyckoff: "4a", occupants: {"K": 1.0}, positions: [
        [0.0, 0.0, 0.25], [0.0, 0.0, 0.75], [0.5, 0.5, 0.25], [0.5, 0.5, 0.75],
      ] },
      { wyckoff: "4b", occupants: {"F": 1.0}, positions: [
        [0.0, 0.5, 0.25], [0.0, 0.5, 0.75], [0.5, 0.0, 0.25], [0.5, 0.0, 0.75],
      ] },
      { wyckoff: "4d", occupants: {"Cu": 1.0}, positions: [
        [0.0, 0.5, 0.0], [0.0, 0.5, 0.5], [0.5, 0.0, 0.0], [0.5, 0.0, 0.5],
      ] },
      { wyckoff: "8h", occupants: {"F": 1.0}, positions: [
        [0.228, 0.272, 0.5], [0.228, 0.728, 0.0], [0.272, 0.228, 0.0], [0.272, 0.772, 0.5],
        [0.728, 0.228, 0.5], [0.728, 0.772, 0.0], [0.772, 0.272, 0.0], [0.772, 0.728, 0.5],
      ] },
    ],
  },
  "kcrf3": {
    kind: "literature",
    source: {"label": "COD 4124105 · Margadonna 2006", "url": "https://www.crystallography.net/cod/4124105.html"},
    spaceGroup: 140,
    parameters: [6.0523, 6.0523, 8.02196, 90.0, 90.0, 90.0],
    groups: [
      { wyckoff: "4b", occupants: {"F": 1.0}, positions: [
        [0.0, 0.5, 0.25], [0.0, 0.5, 0.75], [0.5, 0.0, 0.25], [0.5, 0.0, 0.75],
      ] },
      { wyckoff: "4d", occupants: {"Cr": 1.0}, positions: [
        [0.0, 0.5, 0.0], [0.0, 0.5, 0.5], [0.5, 0.0, 0.0], [0.5, 0.0, 0.5],
      ] },
      { wyckoff: "4a", occupants: {"K": 1.0}, positions: [
        [0.0, 0.0, 0.25], [0.0, 0.0, 0.75], [0.5, 0.5, 0.25], [0.5, 0.5, 0.75],
      ] },
      { wyckoff: "8h", occupants: {"F": 1.0}, positions: [
        [0.232, 0.268, 0.5], [0.232, 0.732, 0.0], [0.268, 0.232, 0.0], [0.268, 0.768, 0.5],
        [0.732, 0.232, 0.5], [0.732, 0.768, 0.0], [0.768, 0.268, 0.0], [0.768, 0.732, 0.5],
      ] },
    ],
  },
  "cspbcl3-cubic": {
    kind: "literature",
    source: {"label": "COD 1542142 · Moller 1958", "url": "https://www.crystallography.net/cod/1542142.html"},
    spaceGroup: 221,
    parameters: [5.605, 5.605, 5.605, 90.0, 90.0, 90.0],
    groups: [
      { wyckoff: "1a", occupants: {"Cs": 1.0}, positions: [
        [0.0, 0.0, 0.0],
      ] },
      { wyckoff: "1b", occupants: {"Pb": 1.0}, positions: [
        [0.5, 0.5, 0.5],
      ] },
      { wyckoff: "3c", occupants: {"Cl": 1.0}, positions: [
        [0.0, 0.5, 0.5], [0.5, 0.0, 0.5], [0.5, 0.5, 0.0],
      ] },
    ],
  },
  "cspbbr3-cubic": {
    kind: "literature",
    source: {"label": "COD 1533063 · Rodova 2003", "url": "https://www.crystallography.net/cod/1533063.html"},
    spaceGroup: 221,
    parameters: [5.87, 5.87, 5.87, 90.0, 90.0, 90.0],
    groups: [
      { wyckoff: "3c", occupants: {"Br": 1.0}, positions: [
        [0.0, 0.5, 0.5], [0.5, 0.0, 0.5], [0.5, 0.5, 0.0],
      ] },
      { wyckoff: "1b", occupants: {"Pb": 1.0}, positions: [
        [0.5, 0.5, 0.5],
      ] },
      { wyckoff: "1a", occupants: {"Cs": 1.0}, positions: [
        [0.0, 0.0, 0.0],
      ] },
    ],
  },
  "cspbbr3-ortho": {
    kind: "literature",
    source: {"label": "COD 4510745 · Stoumpos 2013 · 293 K", "url": "https://www.crystallography.net/cod/4510745.html"},
    spaceGroup: 62,
    parameters: [8.244, 11.7351, 8.1982, 90.0, 90.0, 90.0],
    groups: [
      { wyckoff: "4a", occupants: {"Pb": 1.0}, positions: [
        [0.0, 0.0, 0.0], [0.0, 0.5, 0.0], [0.5, 0.0, 0.5], [0.5, 0.5, 0.5],
      ] },
      { wyckoff: "4c", occupants: {"Cs": 1.0}, positions: [
        [0.031, 0.25, 0.49298], [0.469, 0.75, 0.99298], [0.531, 0.25, 0.00702], [0.969, 0.75, 0.50702],
      ] },
      { wyckoff: "8d", occupants: {"Br": 1.0}, positions: [
        [0.20653, 0.52389, 0.70607], [0.20653, 0.97611, 0.70607], [0.29347, 0.02389, 0.20607], [0.29347, 0.47611, 0.20607],
        [0.70653, 0.52389, 0.79393], [0.70653, 0.97611, 0.79393], [0.79347, 0.02389, 0.29393], [0.79347, 0.47611, 0.29393],
      ] },
      { wyckoff: "4c", occupants: {"Br": 1.0}, positions: [
        [0.0037, 0.75, 0.0455], [0.4963, 0.25, 0.5455], [0.5037, 0.75, 0.4545], [0.9963, 0.25, 0.9545],
      ] },
    ],
  },
  "elpasolite": {
    kind: "literature",
    source: {"label": "COD 9009341 · Sabelli 1987", "url": "https://www.crystallography.net/cod/9009341.html"},
    spaceGroup: 225,
    parameters: [8.116, 8.116, 8.116, 90.0, 90.0, 90.0],
    groups: [
      { wyckoff: "8c", occupants: {"K": 1.0}, positions: [
        [0.25, 0.25, 0.25], [0.25, 0.25, 0.75], [0.25, 0.75, 0.25], [0.25, 0.75, 0.75],
        [0.75, 0.25, 0.25], [0.75, 0.25, 0.75], [0.75, 0.75, 0.25], [0.75, 0.75, 0.75],
      ] },
      { wyckoff: "4b", occupants: {"Na": 1.0}, positions: [
        [0.0, 0.0, 0.5], [0.0, 0.5, 0.0], [0.5, 0.0, 0.0], [0.5, 0.5, 0.5],
      ] },
      { wyckoff: "4a", occupants: {"Al": 1.0}, positions: [
        [0.0, 0.0, 0.0], [0.0, 0.5, 0.5], [0.5, 0.0, 0.5], [0.5, 0.5, 0.0],
      ] },
      { wyckoff: "24e", occupants: {"F": 1.0}, positions: [
        [0.0, 0.0, 0.2225], [0.0, 0.0, 0.7775], [0.0, 0.2225, 0.0], [0.0, 0.2775, 0.5],
        [0.0, 0.5, 0.2775], [0.0, 0.5, 0.7225], [0.0, 0.7225, 0.5], [0.0, 0.7775, 0.0],
        [0.2225, 0.0, 0.0], [0.2225, 0.5, 0.5], [0.2775, 0.0, 0.5], [0.2775, 0.5, 0.0],
        [0.5, 0.0, 0.2775], [0.5, 0.0, 0.7225], [0.5, 0.2225, 0.5], [0.5, 0.2775, 0.0],
        [0.5, 0.5, 0.2225], [0.5, 0.5, 0.7775], [0.5, 0.7225, 0.0], [0.5, 0.7775, 0.5],
        [0.7225, 0.0, 0.5], [0.7225, 0.5, 0.0], [0.7775, 0.0, 0.0], [0.7775, 0.5, 0.5],
      ] },
    ],
  },
  "cryolite": {
    kind: "prototype",
    source: {"label": "AFLOW · AB6C3_mP20_14_a_3e_be-001", "url": "https://www.aflow.org/prototype-encyclopedia/AB6C3_mP20_14_a_3e_be-001/"},
    spaceGroup: 14,
    parameters: [7.7768983199, 5.6012, 9.489964451, 90.0, 145.2160202088, 90.0],
    groups: [
      { wyckoff: "2a", occupants: {"Al": 1.0}, positions: [
        [0.0, 0.0, 0.0], [0.0, 0.5, 0.5],
      ] },
      { wyckoff: "2b", occupants: {"Na": 1.0}, positions: [
        [0.5, 0.0, 0.0], [0.5, 0.5, 0.5],
      ] },
      { wyckoff: "4e", occupants: {"F": 1.0}, positions: [
        [0.3204, 0.5442, 0.6016], [0.3204, 0.9558, 0.1016], [0.6796, 0.0442, 0.8984], [0.6796, 0.4558, 0.3984],
      ] },
      { wyckoff: "4e", occupants: {"F": 1.0}, positions: [
        [0.2272, 0.1733, 0.2722], [0.2272, 0.3267, 0.7722], [0.7728, 0.6733, 0.2278], [0.7728, 0.8267, 0.7278],
      ] },
      { wyckoff: "4e", occupants: {"F": 1.0}, positions: [
        [0.1005, 0.7313, 0.1622], [0.1005, 0.7687, 0.6622], [0.8995, 0.2313, 0.3378], [0.8995, 0.2687, 0.8378],
      ] },
      { wyckoff: "4e", occupants: {"Na": 1.0}, positions: [
        [0.2405, 0.5508, 0.9879], [0.2405, 0.9492, 0.4879], [0.7595, 0.0508, 0.5121], [0.7595, 0.4492, 0.0121],
      ] },
    ],
  },
  "fe4n": {
    kind: "literature",
    source: {"label": "F. S. Galasso, Structure, Properties and Preparation of Perovskite-Type Compounds, 1st ed. (Pergamon Press, Oxford, 1969) · Table 11.1, p. 186"},
    spaceGroup: 221,
    parameters: [3.795, 3.795, 3.795, 90, 90, 90],
    groups: [
      { wyckoff: "1a", occupants: {"Fe": 1}, positions: [
        [0, 0, 0],
      ] },
      { wyckoff: "1b", occupants: {"N": 1}, positions: [
        [0.5, 0.5, 0.5],
      ] },
      { wyckoff: "3c", occupants: {"Fe": 1}, positions: [
        [0, 0.5, 0.5], [0.5, 0, 0.5], [0.5, 0.5, 0],
      ] },
    ],
  },
  "mn3alc": {
    kind: "literature",
    source: {"label": "F. S. Galasso, Structure, Properties and Preparation of Perovskite-Type Compounds, 1st ed. (Pergamon Press, Oxford, 1969) · §11.2, pp. 184–185"},
    spaceGroup: 221,
    parameters: [3.869, 3.869, 3.869, 90, 90, 90],
    groups: [
      { wyckoff: "1a", occupants: {"Al": 1}, positions: [
        [0, 0, 0],
      ] },
      { wyckoff: "1b", occupants: {"C": 1}, positions: [
        [0.5, 0.5, 0.5],
      ] },
      { wyckoff: "3c", occupants: {"Mn": 1}, positions: [
        [0, 0.5, 0.5], [0.5, 0, 0.5], [0.5, 0.5, 0],
      ] },
    ],
  },
  "bt-6h": {
    kind: "prototype",
    source: {"label": "AFLOW · AB3C_hP30_194_bf_hk_af-001", "url": "https://www.aflow.org/prototype-encyclopedia/AB3C_hP30_194_bf_hk_af-001/"},
    spaceGroup: 194,
    parameters: [5.7238, 5.7238, 13.9649, 90.0, 90.0, 120.0],
    groups: [
      { wyckoff: "2a", occupants: {"Ti": 1.0}, positions: [
        [0.0, 0.0, 0.0], [0.0, 0.0, 0.5],
      ] },
      { wyckoff: "2b", occupants: {"Ba": 1.0}, positions: [
        [0.0, 0.0, 0.25], [0.0, 0.0, 0.75],
      ] },
      { wyckoff: "4f", occupants: {"Ba": 1.0}, positions: [
        [0.33333, 0.66667, 0.09671], [0.33333, 0.66667, 0.40329], [0.66666, 0.33333, 0.59671], [0.66667, 0.33334, 0.90329],
      ] },
      { wyckoff: "4f", occupants: {"Ti": 1.0}, positions: [
        [0.33333, 0.66667, 0.65367], [0.33333, 0.66667, 0.84633], [0.66666, 0.33333, 0.34633], [0.66667, 0.33334, 0.15367],
      ] },
      { wyckoff: "6h", occupants: {"O": 1.0}, positions: [
        [0.037, 0.5185, 0.75], [0.4815, 0.5185, 0.75], [0.4815, 0.963, 0.75], [0.5185, 0.037, 0.25],
        [0.5185, 0.4815, 0.25], [0.963, 0.4815, 0.25],
      ] },
      { wyckoff: "12k", occupants: {"O": 1.0}, positions: [
        [0.1651, 0.3302, 0.5802], [0.1651, 0.3302, 0.9198], [0.1651, 0.8349, 0.5802], [0.1651, 0.8349, 0.9198],
        [0.3302, 0.1651, 0.0802], [0.3302, 0.1651, 0.4198], [0.6698, 0.8349, 0.5802], [0.6698, 0.8349, 0.9198],
        [0.8349, 0.1651, 0.0802], [0.8349, 0.1651, 0.4198], [0.8349, 0.6698, 0.0802], [0.8349, 0.6698, 0.4198],
      ] },
    ],
  },
  "baru-9r": {
    kind: "prototype",
    source: {"label": "AFLOW · AB3C_hR15_166_bc_dh_ac-001", "url": "https://www.aflow.org/prototype-encyclopedia/AB3C_hR15_166_bc_dh_ac-001/"},
    spaceGroup: 166,
    parameters: [5.75, 5.75, 21.6, 90.0, 90.0, 120.0],
    groups: [
      { wyckoff: "3a", occupants: {"Ru": 1.0}, positions: [
        [0.0, 0.0, 0.0], [0.33333333, 0.66666667, 0.66666667], [0.66666667, 0.33333333, 0.33333333],
      ] },
      { wyckoff: "3b", occupants: {"Ba": 1.0}, positions: [
        [0.0, 0.0, 0.5], [0.33333333, 0.66666667, 0.16666667], [0.66666667, 0.33333333, 0.83333333],
      ] },
      { wyckoff: "6c", occupants: {"Ba": 1.0}, positions: [
        [0.0, 0.0, 0.2819], [0.0, 0.0, 0.7181], [0.33333333, 0.66666667, 0.38476667], [0.33333333, 0.66666667, 0.94856667],
        [0.66666667, 0.33333333, 0.05143333], [0.66666667, 0.33333333, 0.61523333],
      ] },
      { wyckoff: "6c", occupants: {"Ru": 1.0}, positions: [
        [0.0, 0.0, 0.1181], [0.0, 0.0, 0.8819], [0.33333333, 0.66666667, 0.54856667], [0.33333333, 0.66666667, 0.78476667],
        [0.66666667, 0.33333333, 0.21523333], [0.66666667, 0.33333333, 0.45143333],
      ] },
      { wyckoff: "9d", occupants: {"O": 1.0}, positions: [
        [0.0, 0.5, 0.5], [0.16666667, 0.33333333, 0.83333333], [0.16666667, 0.83333333, 0.83333333], [0.33333333, 0.16666667, 0.16666667],
        [0.5, 0.0, 0.5], [0.5, 0.5, 0.5], [0.66666667, 0.83333333, 0.83333333], [0.83333333, 0.16666667, 0.16666667],
        [0.83333333, 0.66666667, 0.16666667],
      ] },
      { wyckoff: "18h", occupants: {"O": 1.0}, positions: [
        [0.02133333, 0.51066667, 0.72466667], [0.156, 0.312, 0.058], [0.156, 0.844, 0.058], [0.17733333, 0.35466667, 0.60866667],
        [0.17733333, 0.82266667, 0.60866667], [0.312, 0.156, 0.942], [0.35466667, 0.17733333, 0.39133333], [0.48933333, 0.51066667, 0.72466667],
        [0.48933333, 0.97866667, 0.72466667], [0.51066667, 0.02133333, 0.27533333], [0.51066667, 0.48933333, 0.27533333], [0.64533333, 0.82266667, 0.60866667],
        [0.688, 0.844, 0.058], [0.82266667, 0.17733333, 0.39133333], [0.82266667, 0.64533333, 0.39133333], [0.844, 0.156, 0.942],
        [0.844, 0.688, 0.942], [0.97866667, 0.48933333, 0.27533333],
      ] },
    ],
  },
  "bamn-4h": {
    kind: "prototype",
    source: {"label": "AFLOW · ABC3_hP20_194_ac_f_gh-001", "url": "https://www.aflow.org/prototype-encyclopedia/ABC3_hP20_194_ac_f_gh-001/"},
    spaceGroup: 194,
    parameters: [5.63723, 5.63723, 9.22355, 90.0, 90.0, 120.0],
    groups: [
      { wyckoff: "2a", occupants: {"Ba": 1.0}, positions: [
        [0.0, 0.0, 0.0], [0.0, 0.0, 0.5],
      ] },
      { wyckoff: "2c", occupants: {"Ba": 1.0}, positions: [
        [0.33333, 0.66667, 0.25], [0.66666, 0.33333, 0.75],
      ] },
      { wyckoff: "4f", occupants: {"Mn": 1.0}, positions: [
        [0.33333, 0.66667, 0.6131], [0.33333, 0.66667, 0.8869], [0.66666, 0.33333, 0.1131], [0.66667, 0.33334, 0.3869],
      ] },
      { wyckoff: "6g", occupants: {"O": 1.0}, positions: [
        [0.0, 0.5, 0.0], [0.0, 0.5, 0.5], [0.5, 0.0, 0.0], [0.5, 0.0, 0.5],
        [0.5, 0.5, 0.0], [0.5, 0.5, 0.5],
      ] },
      { wyckoff: "6h", occupants: {"O": 1.0}, positions: [
        [0.1909, 0.3818, 0.75], [0.1909, 0.8091, 0.75], [0.3818, 0.1909, 0.25], [0.6182, 0.8091, 0.75],
        [0.8091, 0.1909, 0.25], [0.8091, 0.6182, 0.25],
      ] },
    ],
  },
  "srmno3-4h": {
    kind: "literature",
    source: {"label": "COD 1529598 · Battle 1988", "url": "https://www.crystallography.net/cod/1529598.html"},
    spaceGroup: 194,
    parameters: [5.4434, 5.4434, 9.0704, 90.0, 90.0, 120.0],
    groups: [
      { wyckoff: "2a", occupants: {"Sr": 1.0}, positions: [
        [0.0, 0.0, 0.0], [0.0, 0.0, 0.5],
      ] },
      { wyckoff: "6h", occupants: {"O": 1.0}, positions: [
        [0.1807, 0.3614, 0.75], [0.1807, 0.8193, 0.75], [0.3614, 0.1807, 0.25], [0.6386, 0.8193, 0.75],
        [0.8193, 0.1807, 0.25], [0.8193, 0.6386, 0.25],
      ] },
      { wyckoff: "2c", occupants: {"Sr": 1.0}, positions: [
        [0.3333, 0.6667, 0.25], [0.6666, 0.3333, 0.75],
      ] },
      { wyckoff: "4f", occupants: {"Mn": 1.0}, positions: [
        [0.3333, 0.6667, 0.6122], [0.3333, 0.6667, 0.8878], [0.6666, 0.3333, 0.1122], [0.6667, 0.3334, 0.3878],
      ] },
      { wyckoff: "6g", occupants: {"O": 1.0}, positions: [
        [0.0, 0.5, 0.0], [0.0, 0.5, 0.5], [0.5, 0.0, 0.0], [0.5, 0.0, 0.5],
        [0.5, 0.5, 0.0], [0.5, 0.5, 0.5],
      ] },
    ],
  },
  "rp3": {
    kind: "prototype",
    source: {"label": "AFLOW · A10B4C3_tI34_139_c2eg_2e_ae-001", "url": "https://www.aflow.org/prototype-encyclopedia/A10B4C3_tI34_139_c2eg_2e_ae-001/"},
    spaceGroup: 139,
    parameters: [3.9, 3.9, 28.1, 90.0, 90.0, 90.0],
    groups: [
      { wyckoff: "2a", occupants: {"Ti": 1.0}, positions: [
        [0.0, 0.0, 0.0], [0.5, 0.5, 0.5],
      ] },
      { wyckoff: "4c", occupants: {"O": 1.0}, positions: [
        [0.0, 0.5, 0.0], [0.0, 0.5, 0.5], [0.5, 0.0, 0.0], [0.5, 0.0, 0.5],
      ] },
      { wyckoff: "4e", occupants: {"O": 1.0}, positions: [
        [0.0, 0.0, 0.068], [0.0, 0.0, 0.932], [0.5, 0.5, 0.432], [0.5, 0.5, 0.568],
      ] },
      { wyckoff: "4e", occupants: {"O": 1.0}, positions: [
        [0.0, 0.0, 0.204], [0.0, 0.0, 0.796], [0.5, 0.5, 0.296], [0.5, 0.5, 0.704],
      ] },
      { wyckoff: "4e", occupants: {"Sr": 1.0}, positions: [
        [0.0, 0.0, 0.432], [0.0, 0.0, 0.568], [0.5, 0.5, 0.068], [0.5, 0.5, 0.932],
      ] },
      { wyckoff: "4e", occupants: {"Sr": 1.0}, positions: [
        [0.0, 0.0, 0.296], [0.0, 0.0, 0.704], [0.5, 0.5, 0.204], [0.5, 0.5, 0.796],
      ] },
      { wyckoff: "4e", occupants: {"Ti": 1.0}, positions: [
        [0.0, 0.0, 0.136], [0.0, 0.0, 0.864], [0.5, 0.5, 0.364], [0.5, 0.5, 0.636],
      ] },
      { wyckoff: "8g", occupants: {"O": 1.0}, positions: [
        [0.0, 0.5, 0.136], [0.0, 0.5, 0.364], [0.0, 0.5, 0.636], [0.0, 0.5, 0.864],
        [0.5, 0.0, 0.136], [0.5, 0.0, 0.364], [0.5, 0.0, 0.636], [0.5, 0.0, 0.864],
      ] },
    ],
  },
  "cairo3": {
    kind: "literature",
    source: {"label": "COD 2241059 · Nakatsuka 2015 · 298 K", "url": "https://www.crystallography.net/cod/2241059.html"},
    spaceGroup: 63,
    parameters: [3.1466, 9.869, 7.3019, 90.0, 90.0, 90.0],
    groups: [
      { wyckoff: "4c", occupants: {"Ca": 1.0}, positions: [
        [0.0, 0.2498, 0.75], [0.0, 0.7502, 0.25], [0.5, 0.2502, 0.25], [0.5, 0.7498, 0.75],
      ] },
      { wyckoff: "4a", occupants: {"Ir": 1.0}, positions: [
        [0.0, 0.0, 0.0], [0.0, 0.0, 0.5], [0.5, 0.5, 0.0], [0.5, 0.5, 0.5],
      ] },
      { wyckoff: "4c", occupants: {"O": 1.0}, positions: [
        [0.0, 0.0756, 0.25], [0.0, 0.9244, 0.75], [0.5, 0.4244, 0.75], [0.5, 0.5756, 0.25],
      ] },
      { wyckoff: "8f", occupants: {"O": 1.0}, positions: [
        [0.0, 0.3724, 0.0505], [0.0, 0.3724, 0.4495], [0.0, 0.6276, 0.5505], [0.0, 0.6276, 0.9495],
        [0.5, 0.1276, 0.5505], [0.5, 0.1276, 0.9495], [0.5, 0.8724, 0.0505], [0.5, 0.8724, 0.4495],
      ] },
    ],
  },
  "la2ti2o7": {
    kind: "literature",
    source: {"label": "COD 1001022 · Gasperin 1975", "url": "https://www.crystallography.net/cod/1001022.html"},
    spaceGroup: 4,
    parameters: [7.8, 13.011, 5.546, 90.0, 90.0, 98.6],
    note: "CIF は非標準設定 P 1 1 2₁。単斜角は γ。",
    groups: [
      { wyckoff: "2a", occupants: {"La": 1.0}, positions: [
        [0.2789, 0.1138, 0.25], [0.7211, 0.8862, 0.75],
      ] },
      { wyckoff: "2a", occupants: {"La": 1.0}, positions: [
        [0.2259, 0.9007, 0.7543], [0.7741, 0.0993, 0.2543],
      ] },
      { wyckoff: "2a", occupants: {"La": 1.0}, positions: [
        [0.3502, 0.3909, 0.8026], [0.6498, 0.6091, 0.3026],
      ] },
      { wyckoff: "2a", occupants: {"La": 1.0}, positions: [
        [0.1475, 0.5836, 0.3413], [0.8525, 0.4164, 0.8413],
      ] },
      { wyckoff: "2a", occupants: {"Ti": 1.0}, positions: [
        [0.032, 0.1191, 0.763], [0.968, 0.8809, 0.263],
      ] },
      { wyckoff: "2a", occupants: {"Ti": 1.0}, positions: [
        [0.4729, 0.88, 0.2598], [0.5271, 0.12, 0.7598],
      ] },
      { wyckoff: "2a", occupants: {"Ti": 1.0}, positions: [
        [0.078, 0.3228, 0.2946], [0.922, 0.6772, 0.7946],
      ] },
      { wyckoff: "2a", occupants: {"Ti": 1.0}, positions: [
        [0.4167, 0.6737, 0.7975], [0.5833, 0.3263, 0.2975],
      ] },
      { wyckoff: "2a", occupants: {"O": 1.0}, positions: [
        [0.224, 0.891, 0.299], [0.776, 0.109, 0.799],
      ] },
      { wyckoff: "2a", occupants: {"O": 1.0}, positions: [
        [0.275, 0.09, 0.698], [0.725, 0.91, 0.198],
      ] },
      { wyckoff: "2a", occupants: {"O": 1.0}, positions: [
        [0.03, 0.016, 0.024], [0.97, 0.984, 0.524],
      ] },
      { wyckoff: "2a", occupants: {"O": 1.0}, positions: [
        [0.479, 0.02, 0.026], [0.521, 0.98, 0.526],
      ] },
      { wyckoff: "2a", occupants: {"O": 1.0}, positions: [
        [0.098, 0.226, 0.969], [0.902, 0.774, 0.469],
      ] },
      { wyckoff: "2a", occupants: {"O": 1.0}, positions: [
        [0.483, 0.771, 0.463], [0.517, 0.229, 0.963],
      ] },
      { wyckoff: "2a", occupants: {"O": 1.0}, positions: [
        [0.033, 0.187, 0.46], [0.967, 0.813, 0.96],
      ] },
      { wyckoff: "2a", occupants: {"O": 1.0}, positions: [
        [0.441, 0.811, 0.955], [0.559, 0.189, 0.455],
      ] },
      { wyckoff: "2a", occupants: {"O": 1.0}, positions: [
        [0.089, 0.409, 0.554], [0.911, 0.591, 0.054],
      ] },
      { wyckoff: "2a", occupants: {"O": 1.0}, positions: [
        [0.387, 0.602, 0.069], [0.613, 0.398, 0.569],
      ] },
      { wyckoff: "2a", occupants: {"O": 1.0}, positions: [
        [0.121, 0.432, 0.078], [0.879, 0.568, 0.578],
      ] },
      { wyckoff: "2a", occupants: {"O": 1.0}, positions: [
        [0.401, 0.56, 0.589], [0.599, 0.44, 0.089],
      ] },
      { wyckoff: "2a", occupants: {"O": 1.0}, positions: [
        [0.327, 0.312, 0.323], [0.673, 0.688, 0.823],
      ] },
      { wyckoff: "2a", occupants: {"O": 1.0}, positions: [
        [0.175, 0.7, 0.721], [0.825, 0.3, 0.221],
      ] },
    ],
  },
  "la2ti2o7-ht": {
    kind: "literature",
    source: {"label": "COD 2108044 · Ishizawa 1982 · 1173 K", "url": "https://www.crystallography.net/cod/2108044.html"},
    spaceGroup: 36,
    parameters: [3.954, 25.952, 5.607, 90.0, 90.0, 90.0],
    groups: [
      { wyckoff: "4a", occupants: {"La": 1.0}, positions: [
        [0.0, 0.44609, 0.75], [0.0, 0.55391, 0.25], [0.5, 0.05391, 0.25], [0.5, 0.94609, 0.75],
      ] },
      { wyckoff: "4a", occupants: {"La": 1.0}, positions: [
        [0.0, 0.29808, 0.1757], [0.0, 0.70192, 0.6757], [0.5, 0.20192, 0.6757], [0.5, 0.79808, 0.1757],
      ] },
      { wyckoff: "4a", occupants: {"Ti": 1.0}, positions: [
        [0.0, 0.0596, 0.7452], [0.0, 0.9404, 0.2452], [0.5, 0.4404, 0.2452], [0.5, 0.5596, 0.7452],
      ] },
      { wyckoff: "4a", occupants: {"Ti": 1.0}, positions: [
        [0.0, 0.163, 0.2095], [0.0, 0.837, 0.7095], [0.5, 0.337, 0.7095], [0.5, 0.663, 0.2095],
      ] },
      { wyckoff: "4a", occupants: {"O": 1.0}, positions: [
        [0.0, 0.0088, 0.475], [0.0, 0.9912, 0.975], [0.5, 0.4912, 0.975], [0.5, 0.5088, 0.475],
      ] },
      { wyckoff: "4a", occupants: {"O": 1.0}, positions: [
        [0.0, 0.0923, 0.042], [0.0, 0.9077, 0.542], [0.5, 0.4077, 0.542], [0.5, 0.5923, 0.042],
      ] },
      { wyckoff: "4a", occupants: {"O": 1.0}, positions: [
        [0.0, 0.2036, 0.958], [0.0, 0.7964, 0.458], [0.5, 0.2964, 0.458], [0.5, 0.7036, 0.958],
      ] },
      { wyckoff: "4a", occupants: {"O": 1.0}, positions: [
        [0.0, 0.4511, 0.255], [0.0, 0.5489, 0.755], [0.5, 0.0489, 0.755], [0.5, 0.9511, 0.255],
      ] },
      { wyckoff: "4a", occupants: {"O": 1.0}, positions: [
        [0.0, 0.3472, 0.72], [0.0, 0.6528, 0.22], [0.5, 0.1528, 0.22], [0.5, 0.8472, 0.72],
      ] },
      { wyckoff: "4a", occupants: {"O": 1.0}, positions: [
        [0.0, 0.1109, 0.539], [0.0, 0.8891, 0.039], [0.5, 0.3891, 0.039], [0.5, 0.6109, 0.539],
      ] },
      { wyckoff: "4a", occupants: {"O": 1.0}, positions: [
        [0.0, 0.2182, 0.435], [0.0, 0.7818, 0.935], [0.5, 0.2818, 0.935], [0.5, 0.7182, 0.435],
      ] },
    ],
  },
  "bi4ti3o12": {
    kind: "prototype",
    source: {"label": "AFLOW · A4B12C3_mP38_7_4a_12a_3a-001", "url": "https://www.aflow.org/prototype-encyclopedia/A4B12C3_mP38_7_4a_12a_3a-001/"},
    spaceGroup: 7,
    parameters: [16.64705, 5.40938, 5.44472, 90.0, 99.36458, 90.0],
    groups: [
      { wyckoff: "2a", occupants: {"Bi": 1.0}, positions: [
        [0.86624, 0.24518, 0.93856], [0.86624, 0.75482, 0.43856],
      ] },
      { wyckoff: "2a", occupants: {"Bi": 1.0}, positions: [
        [0.57736, 0.2674, 0.79428], [0.57736, 0.7326, 0.29428],
      ] },
      { wyckoff: "2a", occupants: {"Bi": 1.0}, positions: [
        [0.13376, 0.25482, 0.07232], [0.13376, 0.74518, 0.57232],
      ] },
      { wyckoff: "2a", occupants: {"Bi": 1.0}, positions: [
        [0.42264, 0.2326, 0.21692], [0.42264, 0.7674, 0.71692],
      ] },
      { wyckoff: "2a", occupants: {"O": 1.0}, positions: [
        [0.75228, 0.0408, 0.73554], [0.75228, 0.9592, 0.23554],
      ] },
      { wyckoff: "2a", occupants: {"O": 1.0}, positions: [
        [0.01536, 0.0362, 0.86788], [0.01536, 0.9638, 0.36788],
      ] },
      { wyckoff: "2a", occupants: {"O": 1.0}, positions: [
        [0.4998, 0.0079, 0.5286], [0.4998, 0.9921, 0.0286],
      ] },
      { wyckoff: "2a", occupants: {"O": 1.0}, positions: [
        [0.11846, 0.31, 0.65373], [0.11846, 0.69, 0.15373],
      ] },
      { wyckoff: "2a", occupants: {"O": 1.0}, positions: [
        [0.36318, 0.2017, 0.74409], [0.36318, 0.7983, 0.24409],
      ] },
      { wyckoff: "2a", occupants: {"O": 1.0}, positions: [
        [0.2237, 0.0243, 0.41175], [0.2237, 0.9757, 0.91175],
      ] },
      { wyckoff: "2a", occupants: {"O": 1.0}, positions: [
        [0.24572, 0.4592, 0.98226], [0.24572, 0.5408, 0.48226],
      ] },
      { wyckoff: "2a", occupants: {"O": 1.0}, positions: [
        [0.98464, 0.4822, 0.29952], [0.98464, 0.5178, 0.79952],
      ] },
      { wyckoff: "2a", occupants: {"O": 1.0}, positions: [
        [0.5002, 0.4921, 0.0288], [0.5002, 0.5079, 0.5288],
      ] },
      { wyckoff: "2a", occupants: {"O": 1.0}, positions: [
        [0.88154, 0.19, 0.53527], [0.88154, 0.81, 0.03527],
      ] },
      { wyckoff: "2a", occupants: {"O": 1.0}, positions: [
        [0.63682, 0.2983, 0.38091], [0.63682, 0.7017, 0.88091],
      ] },
      { wyckoff: "2a", occupants: {"O": 1.0}, positions: [
        [0.7763, 0.4757, 0.18805], [0.7763, 0.5243, 0.68805],
      ] },
      { wyckoff: "2a", occupants: {"Ti": 1.0}, positions: [
        [0.0, 0.25, 0.5454], [0.0, 0.75, 0.0454],
      ] },
      { wyckoff: "2a", occupants: {"Ti": 1.0}, positions: [
        [0.74364, 0.2523, 0.43032], [0.74364, 0.7477, 0.93032],
      ] },
      { wyckoff: "2a", occupants: {"Ti": 1.0}, positions: [
        [0.25636, 0.2477, 0.68668], [0.25636, 0.7523, 0.18668],
      ] },
    ],
  },
  "srbi2ta2o9": {
    kind: "literature",
    source: {"label": "COD 1521923 · Shimakawa 1999", "url": "https://www.crystallography.net/cod/1521923.html"},
    spaceGroup: 36,
    parameters: [5.52237, 5.52408, 25.0264, 90.0, 90.0, 90.0],
    note: "CIF は A2₁am 設定。",
    groups: [
      { wyckoff: "4a", occupants: {"O": 1.0}, positions: [
        [0.0248, 0.2108, 0.5], [0.0248, 0.7108, 0.0], [0.5248, 0.2892, 0.0], [0.5248, 0.7892, 0.5],
      ] },
      { wyckoff: "8b", occupants: {"Ta": 1.0}, positions: [
        [0.0104, 0.252, 0.41482], [0.0104, 0.252, 0.58518], [0.0104, 0.752, 0.08518], [0.0104, 0.752, 0.91482],
        [0.5104, 0.248, 0.08518], [0.5104, 0.248, 0.91482], [0.5104, 0.748, 0.41482], [0.5104, 0.748, 0.58518],
      ] },
      { wyckoff: "8b", occupants: {"O": 1.0}, positions: [
        [0.2909, 0.0193, 0.41641], [0.2909, 0.0193, 0.58359], [0.2909, 0.5193, 0.08359], [0.2909, 0.5193, 0.91641],
        [0.7909, 0.4807, 0.08359], [0.7909, 0.4807, 0.91641], [0.7909, 0.9807, 0.41641], [0.7909, 0.9807, 0.58359],
      ] },
      { wyckoff: "8b", occupants: {"Bi": 1.0}, positions: [
        [0.4634, 0.2764, 0.30004], [0.4634, 0.2764, 0.69996], [0.4634, 0.7764, 0.19996], [0.4634, 0.7764, 0.80004],
        [0.9634, 0.2236, 0.19996], [0.9634, 0.2236, 0.80004], [0.9634, 0.7236, 0.30004], [0.9634, 0.7236, 0.69996],
      ] },
      { wyckoff: "4a", occupants: {"Sr": 1.0}, positions: [
        [0.0, 0.2567, 0.0], [0.0, 0.7567, 0.5], [0.5, 0.2433, 0.5], [0.5, 0.7433, 0.0],
      ] },
      { wyckoff: "8b", occupants: {"O": 1.0}, positions: [
        [0.2381, 0.0077, 0.25076], [0.2381, 0.0077, 0.74924], [0.2381, 0.5077, 0.24924], [0.2381, 0.5077, 0.75076],
        [0.7381, 0.4923, 0.24924], [0.7381, 0.4923, 0.75076], [0.7381, 0.9923, 0.25076], [0.7381, 0.9923, 0.74924],
      ] },
      { wyckoff: "8b", occupants: {"O": 1.0}, positions: [
        [0.0219, 0.301, 0.34187], [0.0219, 0.301, 0.65813], [0.0219, 0.801, 0.15813], [0.0219, 0.801, 0.84187],
        [0.5219, 0.199, 0.15813], [0.5219, 0.199, 0.84187], [0.5219, 0.699, 0.34187], [0.5219, 0.699, 0.65813],
      ] },
      { wyckoff: "8b", occupants: {"O": 1.0}, positions: [
        [0.2554, 0.0133, 0.06964], [0.2554, 0.0133, 0.93036], [0.2554, 0.5133, 0.43036], [0.2554, 0.5133, 0.56964],
        [0.7554, 0.4867, 0.43036], [0.7554, 0.4867, 0.56964], [0.7554, 0.9867, 0.06964], [0.7554, 0.9867, 0.93036],
      ] },
    ],
  },
  "bi2wo6": {
    kind: "literature",
    source: {"label": "COD 2108252 · Okudera 2018 · 296 K", "url": "https://www.crystallography.net/cod/2108252.html"},
    spaceGroup: 29,
    parameters: [5.4345, 16.4324, 5.4558, 90.0, 90.0, 90.0],
    groups: [
      { wyckoff: "4a", occupants: {"Bi": 1.0}, positions: [
        [0.0261, 0.5803, 0.973], [0.4739, 0.5803, 0.473], [0.5261, 0.4197, 0.973], [0.9739, 0.4197, 0.473],
      ] },
      { wyckoff: "4a", occupants: {"Bi": 1.0}, positions: [
        [0.0141, 0.0747, 0.485], [0.4859, 0.0747, 0.985], [0.5141, 0.9253, 0.485], [0.9859, 0.9253, 0.985],
      ] },
      { wyckoff: "4a", occupants: {"W": 1.0}, positions: [
        [0.0016, 0.7512, 0.5], [0.4984, 0.7512, 0.0], [0.5016, 0.2488, 0.5], [0.9984, 0.2488, 0.0],
      ] },
      { wyckoff: "4a", occupants: {"O": 1.0}, positions: [
        [0.045, 0.1388, 0.08], [0.455, 0.1388, 0.58], [0.545, 0.8612, 0.08], [0.955, 0.8612, 0.58],
      ] },
      { wyckoff: "4a", occupants: {"O": 1.0}, positions: [
        [0.238, 0.999, 0.767], [0.262, 0.999, 0.267], [0.738, 0.001, 0.767], [0.762, 0.001, 0.267],
      ] },
      { wyckoff: "4a", occupants: {"O": 1.0}, positions: [
        [0.241, 0.5032, 0.258], [0.259, 0.5032, 0.758], [0.741, 0.4968, 0.258], [0.759, 0.4968, 0.758],
      ] },
      { wyckoff: "4a", occupants: {"O": 1.0}, positions: [
        [0.205, 0.7651, 0.256], [0.295, 0.7651, 0.756], [0.705, 0.2349, 0.256], [0.795, 0.2349, 0.756],
      ] },
      { wyckoff: "4a", occupants: {"O": 1.0}, positions: [
        [0.212, 0.265, 0.333], [0.288, 0.265, 0.833], [0.712, 0.735, 0.333], [0.788, 0.735, 0.833],
      ] },
      { wyckoff: "4a", occupants: {"O": 1.0}, positions: [
        [0.071, 0.6435, 0.563], [0.429, 0.6435, 0.063], [0.571, 0.3565, 0.563], [0.929, 0.3565, 0.063],
      ] },
    ],
  },
  "bi2moo6": {
    kind: "prototype",
    source: {"label": "AFLOW · A2BC6_oP36_29_2a_a_6a-001", "url": "https://www.aflow.org/prototype-encyclopedia/A2BC6_oP36_29_2a_a_6a-001/"},
    spaceGroup: 29,
    parameters: [5.4822, 16.1986, 5.5091, 90.0, 90.0, 90.0],
    groups: [
      { wyckoff: "4a", occupants: {"Bi": 1.0}, positions: [
        [0.018, 0.5768, 0.9814], [0.482, 0.5768, 0.4814], [0.518, 0.4232, 0.9814], [0.982, 0.4232, 0.4814],
      ] },
      { wyckoff: "4a", occupants: {"Bi": 1.0}, positions: [
        [0.0178, 0.0783, 0.4897], [0.4822, 0.0783, 0.9897], [0.5178, 0.9217, 0.4897], [0.9822, 0.9217, 0.9897],
      ] },
      { wyckoff: "4a", occupants: {"Mo": 1.0}, positions: [
        [0.0028, 0.2488, 0.0], [0.4972, 0.2488, 0.5], [0.5028, 0.7512, 0.0], [0.9972, 0.7512, 0.5],
      ] },
      { wyckoff: "4a", occupants: {"O": 1.0}, positions: [
        [0.0556, 0.1407, 0.0959], [0.4444, 0.1407, 0.5959], [0.5556, 0.8593, 0.0959], [0.9444, 0.8593, 0.5959],
      ] },
      { wyckoff: "4a", occupants: {"O": 1.0}, positions: [
        [0.2406, 0.9983, 0.7776], [0.2594, 0.9983, 0.2776], [0.7406, 0.0017, 0.7776], [0.7594, 0.0017, 0.2776],
      ] },
      { wyckoff: "4a", occupants: {"O": 1.0}, positions: [
        [0.236, 0.5006, 0.2664], [0.264, 0.5006, 0.7664], [0.736, 0.4994, 0.2664], [0.764, 0.4994, 0.7664],
      ] },
      { wyckoff: "4a", occupants: {"O": 1.0}, positions: [
        [0.1917, 0.7678, 0.2524], [0.3083, 0.7678, 0.7524], [0.6917, 0.2322, 0.2524], [0.8083, 0.2322, 0.7524],
      ] },
      { wyckoff: "4a", occupants: {"O": 1.0}, positions: [
        [0.2121, 0.2634, 0.355], [0.2879, 0.2634, 0.855], [0.7121, 0.7366, 0.355], [0.7879, 0.7366, 0.855],
      ] },
      { wyckoff: "4a", occupants: {"O": 1.0}, positions: [
        [0.0654, 0.6411, 0.57], [0.4346, 0.6411, 0.07], [0.5654, 0.3589, 0.57], [0.9346, 0.3589, 0.07],
      ] },
    ],
  },
  "nacrs2": {
    kind: "prototype",
    source: {"label": "AFLOW · ABC2_hR4_166_a_b_c-001", "url": "https://www.aflow.org/prototype-encyclopedia/ABC2_hR4_166_a_b_c-001/"},
    spaceGroup: 166,
    parameters: [3.5561, 3.5561, 19.365, 90.0, 90.0, 120.0],
    groups: [
      { wyckoff: "3a", occupants: {"Cr": 1.0}, positions: [
        [0.0, 0.0, 0.0], [0.33333333, 0.66666667, 0.66666667], [0.66666667, 0.33333333, 0.33333333],
      ] },
      { wyckoff: "3b", occupants: {"Na": 1.0}, positions: [
        [0.0, 0.0, 0.5], [0.33333333, 0.66666667, 0.16666667], [0.66666667, 0.33333333, 0.83333333],
      ] },
      { wyckoff: "6c", occupants: {"S": 1.0}, positions: [
        [0.0, 0.0, 0.2667], [0.0, 0.0, 0.7333], [0.33333333, 0.66666667, 0.39996667], [0.33333333, 0.66666667, 0.93336667],
        [0.66666667, 0.33333333, 0.06663333], [0.66666667, 0.33333333, 0.60003333],
      ] },
    ],
  },
  "licoo2": {
    kind: "literature",
    source: {"label": "COD 4505482 · Lin 2012 · 298 K", "url": "https://www.crystallography.net/cod/4505482.html"},
    spaceGroup: 166,
    parameters: [2.815, 2.815, 14.0516, 90.0, 90.0, 120.0],
    groups: [
      { wyckoff: "3a", occupants: {"Li": 1.0}, positions: [
        [0.0, 0.0, 0.0], [0.33333333, 0.66666667, 0.66666667], [0.66666667, 0.33333333, 0.33333333],
      ] },
      { wyckoff: "3b", occupants: {"Co": 1.0}, positions: [
        [0.0, 0.0, 0.5], [0.33333333, 0.66666667, 0.16666667], [0.66666667, 0.33333333, 0.83333333],
      ] },
      { wyckoff: "6c", occupants: {"O": 1.0}, positions: [
        [0.0, 0.0, 0.2397], [0.0, 0.0, 0.7603], [0.33333333, 0.66666667, 0.42696667], [0.33333333, 0.66666667, 0.90636667],
        [0.66666667, 0.33333333, 0.09363333], [0.66666667, 0.33333333, 0.57303333],
      ] },
    ],
  },
  "nafeo2-alpha": {
    kind: "prototype",
    source: {"label": "AFLOW · ABC2_hR4_166_a_b_c-009", "url": "https://www.aflow.org/prototype-encyclopedia/ABC2_hR4_166_a_b_c-009/"},
    spaceGroup: 166,
    parameters: [3.025, 3.025, 16.112, 90.0, 90.0, 120.0],
    groups: [
      { wyckoff: "3a", occupants: {"Fe": 1.0}, positions: [
        [0.0, 0.0, 0.0], [0.33333333, 0.66666667, 0.66666667], [0.66666667, 0.33333333, 0.33333333],
      ] },
      { wyckoff: "3b", occupants: {"Na": 1.0}, positions: [
        [0.0, 0.0, 0.5], [0.33333333, 0.66666667, 0.16666667], [0.66666667, 0.33333333, 0.83333333],
      ] },
      { wyckoff: "6c", occupants: {"O": 1.0}, positions: [
        [0.0, 0.0, 0.2664], [0.0, 0.0, 0.7336], [0.33333333, 0.66666667, 0.40026667], [0.33333333, 0.66666667, 0.93306667],
        [0.66666667, 0.33333333, 0.06693333], [0.66666667, 0.33333333, 0.59973333],
      ] },
    ],
  },
  "nafeo2-beta": {
    kind: "prototype",
    source: {"label": "AFLOW · ABC2_oP16_33_a_a_2a-001", "url": "https://www.aflow.org/prototype-encyclopedia/ABC2_oP16_33_a_a_2a-001/"},
    spaceGroup: 33,
    parameters: [5.6793, 7.1243, 5.3784, 90.0, 90.0, 90.0],
    groups: [
      { wyckoff: "4a", occupants: {"Fe": 1.0}, positions: [
        [0.06822, 0.12658, 0.0], [0.43178, 0.62658, 0.5], [0.56822, 0.37342, 0.0], [0.93178, 0.87342, 0.5],
      ] },
      { wyckoff: "4a", occupants: {"Na": 1.0}, positions: [
        [0.0759, 0.6229, 0.003], [0.4241, 0.1229, 0.503], [0.5759, 0.8771, 0.003], [0.9241, 0.3771, 0.503],
      ] },
      { wyckoff: "4a", occupants: {"O": 1.0}, positions: [
        [0.0424, 0.0875, 0.656], [0.4576, 0.5875, 0.156], [0.5424, 0.4125, 0.656], [0.9576, 0.9125, 0.156],
      ] },
      { wyckoff: "4a", occupants: {"O": 1.0}, positions: [
        [0.1123, 0.661, 0.4169], [0.3877, 0.161, 0.9169], [0.6123, 0.839, 0.4169], [0.8877, 0.339, 0.9169],
      ] },
    ],
  },
  "gese": {
    kind: "literature",
    source: {"label": "COD 4003515 · Murgatroyd 2020 · 250.72 K", "url": "https://www.crystallography.net/cod/4003515.html"},
    spaceGroup: 62,
    parameters: [10.833, 3.8355, 4.3954, 90.0, 90.0, 90.0],
    groups: [
      { wyckoff: "4c", occupants: {"Se": 1.0}, positions: [
        [0.1465, 0.75, 0.4976], [0.3535, 0.25, 0.9976], [0.6465, 0.75, 0.0024], [0.8535, 0.25, 0.5024],
      ] },
      { wyckoff: "4c", occupants: {"Ge": 1.0}, positions: [
        [0.12101, 0.25, 0.1113], [0.37899, 0.75, 0.6113], [0.62101, 0.25, 0.3887], [0.87899, 0.75, 0.8887],
      ] },
    ],
  },
  "sns": {
    kind: "prototype",
    source: {"label": "AFLOW · AB_oP8_62_c_c-004", "url": "https://www.aflow.org/prototype-encyclopedia/AB_oP8_62_c_c-004/"},
    spaceGroup: 62,
    parameters: [11.18, 3.982, 4.329, 90.0, 90.0, 90.0],
    groups: [
      { wyckoff: "4c", occupants: {"S": 1.0}, positions: [
        [0.1493, 0.25, 0.4799], [0.3507, 0.75, 0.9799], [0.6493, 0.25, 0.0201], [0.8507, 0.75, 0.5201],
      ] },
      { wyckoff: "4c", occupants: {"Sn": 1.0}, positions: [
        [0.11937, 0.75, 0.8806], [0.38063, 0.25, 0.3806], [0.61937, 0.75, 0.6194], [0.88063, 0.25, 0.1194],
      ] },
    ],
  },
  "tis2": {
    kind: "literature",
    source: {"label": "COD 1537865 · Ehrlich 1949", "url": "https://www.crystallography.net/cod/1537865.html"},
    spaceGroup: 164,
    parameters: [3.412, 3.412, 5.695, 90.0, 90.0, 120.0],
    groups: [
      { wyckoff: "2d", occupants: {"S": 1.0}, positions: [
        [0.3333, 0.6667, 0.25], [0.6667, 0.3333, 0.75],
      ] },
      { wyckoff: "1a", occupants: {"Ti": 1.0}, positions: [
        [0.0, 0.0, 0.0],
      ] },
    ],
  },
  "ptse2": {
    kind: "literature",
    source: {"label": "COD 1537202 · Furuseth 1965", "url": "https://www.crystallography.net/cod/1537202.html"},
    spaceGroup: 164,
    parameters: [3.7278, 3.7278, 5.0313, 90.0, 90.0, 120.0],
    groups: [
      { wyckoff: "2d", occupants: {"Se": 1.0}, positions: [
        [0.3333, 0.6667, 0.255], [0.6667, 0.3333, 0.745],
      ] },
      { wyckoff: "1a", occupants: {"Pt": 1.0}, positions: [
        [0.0, 0.0, 0.0],
      ] },
    ],
  },
  "mos2-2h": {
    kind: "prototype",
    source: {"label": "AFLOW · AB2_hP6_194_c_f-001", "url": "https://www.aflow.org/prototype-encyclopedia/AB2_hP6_194_c_f-001/"},
    spaceGroup: 194,
    parameters: [3.161, 3.161, 12.295, 90.0, 90.0, 120.0],
    groups: [
      { wyckoff: "2c", occupants: {"Mo": 1.0}, positions: [
        [0.33333333, 0.66666667, 0.25], [0.66666667, 0.33333333, 0.75],
      ] },
      { wyckoff: "4f", occupants: {"S": 1.0}, positions: [
        [0.33333333, 0.66666667, 0.6275], [0.33333333, 0.66666667, 0.8725], [0.66666667, 0.33333333, 0.1275], [0.66666667, 0.33333333, 0.3725],
      ] },
    ],
  },
  "mos2-3r": {
    kind: "prototype",
    source: {"label": "AFLOW · AB2_hR3_160_a_2a-001", "url": "https://www.aflow.org/prototype-encyclopedia/AB2_hR3_160_a_2a-001/"},
    spaceGroup: 160,
    parameters: [3.17, 3.17, 18.38, 90.0, 90.0, 120.0],
    groups: [
      { wyckoff: "3a", occupants: {"Mo": 1.0}, positions: [
        [0.0, 0.0, 0.0], [0.33333333, 0.66666667, 0.66666667], [0.66666667, 0.33333333, 0.33333333],
      ] },
      { wyckoff: "3a", occupants: {"S": 1.0}, positions: [
        [0.0, 0.0, 0.25], [0.33333333, 0.66666667, 0.91666667], [0.66666667, 0.33333333, 0.58333333],
      ] },
      { wyckoff: "3a", occupants: {"S": 1.0}, positions: [
        [0.0, 0.0, 0.41667], [0.33333333, 0.66666667, 0.08333667], [0.66666667, 0.33333333, 0.75000333],
      ] },
    ],
  },
  "mote2-2h": {
    kind: "literature",
    source: {"label": "COD 2310465 · Puotinen 1961", "url": "https://www.crystallography.net/cod/2310465.html"},
    spaceGroup: 194,
    parameters: [3.519, 3.519, 13.964, 90.0, 90.0, 120.0],
    groups: [
      { wyckoff: "2c", occupants: {"Mo": 1.0}, positions: [
        [0.3333, 0.6667, 0.25], [0.6666, 0.3333, 0.75],
      ] },
      { wyckoff: "4f", occupants: {"Te": 1.0}, positions: [
        [0.3333, 0.6667, 0.625], [0.3333, 0.6667, 0.875], [0.6666, 0.3333, 0.125], [0.6667, 0.3334, 0.375],
      ] },
    ],
  },
  "mote2-1t": {
    kind: "literature",
    source: {"label": "COD 2310356 · Brown 1966", "url": "https://www.crystallography.net/cod/2310356.html"},
    spaceGroup: 11,
    parameters: [6.33, 3.469, 13.86, 90.0, 93.917, 90.0],
    groups: [
      { wyckoff: "2e", occupants: {"Te": 1.0}, positions: [
        [0.4432, 0.25, 0.6484], [0.5568, 0.75, 0.3516],
      ] },
      { wyckoff: "2e", occupants: {"Te": 1.0}, positions: [
        [0.4112, 0.75, 0.8955], [0.5888, 0.25, 0.1045],
      ] },
      { wyckoff: "2e", occupants: {"Te": 1.0}, positions: [
        [0.097, 0.75, 0.1486], [0.903, 0.25, 0.8514],
      ] },
      { wyckoff: "2e", occupants: {"Mo": 1.0}, positions: [
        [0.3181, 0.75, 0.5066], [0.6819, 0.25, 0.4934],
      ] },
      { wyckoff: "2e", occupants: {"Te": 1.0}, positions: [
        [0.0563, 0.25, 0.3955], [0.9437, 0.75, 0.6045],
      ] },
      { wyckoff: "2e", occupants: {"Mo": 1.0}, positions: [
        [0.1833, 0.25, 0.0074], [0.8167, 0.75, 0.9926],
      ] },
    ],
  },
  "wte2-td": {
    kind: "prototype",
    source: {"label": "AFLOW · A2B_oP12_31_4a_2a-001", "url": "https://www.aflow.org/prototype-encyclopedia/A2B_oP12_31_4a_2a-001/"},
    spaceGroup: 31,
    parameters: [3.496, 6.282, 14.07, 90.0, 90.0, 90.0],
    groups: [
      { wyckoff: "2a", occupants: {"Te": 1.0}, positions: [
        [0.0, 0.2941, 0.5965], [0.5, 0.7059, 0.0965],
      ] },
      { wyckoff: "2a", occupants: {"Te": 1.0}, positions: [
        [0.0, 0.1998, 0.14], [0.5, 0.8002, 0.64],
      ] },
      { wyckoff: "2a", occupants: {"Te": 1.0}, positions: [
        [0.0, 0.6441, 0.3449], [0.5, 0.3559, 0.8449],
      ] },
      { wyckoff: "2a", occupants: {"Te": 1.0}, positions: [
        [0.0, 0.8517, 0.8893], [0.5, 0.1483, 0.3893],
      ] },
      { wyckoff: "2a", occupants: {"W": 1.0}, positions: [
        [0.0, 0.9005, 0.5], [0.5, 0.0995, 0.0],
      ] },
      { wyckoff: "2a", occupants: {"W": 1.0}, positions: [
        [0.0, 0.4586, 0.9851], [0.5, 0.5414, 0.4851],
      ] },
    ],
  },
  "lonsdaleite": {
    kind: "prototype",
    source: {"label": "AFLOW · A_hP4_194_f-001", "url": "https://www.aflow.org/prototype-encyclopedia/A_hP4_194_f-001/"},
    spaceGroup: 194,
    parameters: [2.508, 2.508, 4.183, 90.0, 90.0, 120.0],
    note: "2H のプロトタイプ配置。積層欠陥を含む試料の相同定とは区別します。",
    groups: [
      { wyckoff: "4f", occupants: {"C": 1.0}, positions: [
        [0.33333333, 0.66666667, 0.05995], [0.33333333, 0.66666667, 0.44005], [0.66666667, 0.33333333, 0.55995], [0.66666667, 0.33333333, 0.94005],
      ] },
    ],
  },
  "sic-4h": {
    kind: "prototype",
    source: {"label": "AFLOW · AB_hP8_186_ab_ab-001", "url": "https://www.aflow.org/prototype-encyclopedia/AB_hP8_186_ab_ab-001/"},
    spaceGroup: 186,
    parameters: [3.08051, 3.08051, 10.0848, 90.0, 90.0, 120.0],
    groups: [
      { wyckoff: "2a", occupants: {"C": 1.0}, positions: [
        [0.0, 0.0, 0.18784], [0.0, 0.0, 0.68784],
      ] },
      { wyckoff: "2a", occupants: {"Si": 1.0}, positions: [
        [0.0, 0.0, 0.0], [0.0, 0.0, 0.5],
      ] },
      { wyckoff: "2b", occupants: {"C": 1.0}, positions: [
        [0.33333333, 0.66666667, 0.43671], [0.66666667, 0.33333333, 0.93671],
      ] },
      { wyckoff: "2b", occupants: {"Si": 1.0}, positions: [
        [0.33333333, 0.66666667, 0.24982], [0.66666667, 0.33333333, 0.74982],
      ] },
    ],
  },
  "sic-6h": {
    kind: "prototype",
    source: {"label": "AFLOW · AB_hP12_186_a2b_a2b-001", "url": "https://www.aflow.org/prototype-encyclopedia/AB_hP12_186_a2b_a2b-001/"},
    spaceGroup: 186,
    parameters: [3.08129, 3.08129, 15.11976, 90.0, 90.0, 120.0],
    groups: [
      { wyckoff: "2a", occupants: {"C": 1.0}, positions: [
        [0.0, 0.0, 0.1254], [0.0, 0.0, 0.6254],
      ] },
      { wyckoff: "2a", occupants: {"Si": 1.0}, positions: [
        [0.0, 0.0, 0.0], [0.0, 0.0, 0.5],
      ] },
      { wyckoff: "2b", occupants: {"C": 1.0}, positions: [
        [0.33333333, 0.66666667, 0.29215], [0.66666667, 0.33333333, 0.79215],
      ] },
      { wyckoff: "2b", occupants: {"C": 1.0}, positions: [
        [0.33333333, 0.66666667, 0.9585], [0.66666667, 0.33333333, 0.4585],
      ] },
      { wyckoff: "2b", occupants: {"Si": 1.0}, positions: [
        [0.33333333, 0.66666667, 0.16675], [0.66666667, 0.33333333, 0.66675],
      ] },
      { wyckoff: "2b", occupants: {"Si": 1.0}, positions: [
        [0.33333333, 0.66666667, 0.8335], [0.66666667, 0.33333333, 0.3335],
      ] },
    ],
  },
  "chalcopyrite": {
    kind: "prototype",
    source: {"label": "AFLOW · ABC2_tI16_122_a_b_d-001", "url": "https://www.aflow.org/prototype-encyclopedia/ABC2_tI16_122_a_b_d-001/"},
    spaceGroup: 122,
    parameters: [5.289, 5.289, 10.423, 90.0, 90.0, 90.0],
    groups: [
      { wyckoff: "4a", occupants: {"Cu": 1.0}, positions: [
        [0.0, 0.0, 0.0], [0.0, 0.5, 0.25], [0.5, 0.0, 0.75], [0.5, 0.5, 0.5],
      ] },
      { wyckoff: "4b", occupants: {"Fe": 1.0}, positions: [
        [0.0, 0.0, 0.5], [0.0, 0.5, 0.75], [0.5, 0.0, 0.25], [0.5, 0.5, 0.0],
      ] },
      { wyckoff: "8d", occupants: {"S": 1.0}, positions: [
        [0.2426, 0.25, 0.625], [0.25, 0.7426, 0.875], [0.25, 0.7574, 0.375], [0.2574, 0.25, 0.125],
        [0.7426, 0.75, 0.125], [0.75, 0.2426, 0.375], [0.75, 0.2574, 0.875], [0.7574, 0.75, 0.625],
      ] },
    ],
  },
  "cuinse2": {
    kind: "literature",
    source: {"label": "COD 1563481 · Souilah 2010 · 293 K", "url": "https://www.crystallography.net/cod/1563481.html"},
    spaceGroup: 122,
    parameters: [5.78361, 5.78361, 11.6214, 90.0, 90.0, 90.0],
    groups: [
      { wyckoff: "4a", occupants: {"Cu": 1.0}, positions: [
        [0.0, 0.0, 0.0], [0.0, 0.5, 0.25], [0.5, 0.0, 0.75], [0.5, 0.5, 0.5],
      ] },
      { wyckoff: "4b", occupants: {"In": 1.0}, positions: [
        [0.0, 0.0, 0.5], [0.0, 0.5, 0.75], [0.5, 0.0, 0.25], [0.5, 0.5, 0.0],
      ] },
      { wyckoff: "8d", occupants: {"Se": 1.0}, positions: [
        [0.22738, 0.25, 0.125], [0.25, 0.72738, 0.375], [0.25, 0.77262, 0.875], [0.27262, 0.25, 0.625],
        [0.72738, 0.75, 0.625], [0.75, 0.22738, 0.875], [0.75, 0.27262, 0.375], [0.77262, 0.75, 0.125],
      ] },
    ],
  },
  "stannite": {
    kind: "prototype",
    source: {"label": "AFLOW · A2BC4D_tI16_121_d_a_i_b-001", "url": "https://www.aflow.org/prototype-encyclopedia/A2BC4D_tI16_121_d_a_i_b-001/"},
    spaceGroup: 121,
    parameters: [5.46, 5.46, 10.725, 90.0, 90.0, 90.0],
    groups: [
      { wyckoff: "2a", occupants: {"Fe": 1.0}, positions: [
        [0.0, 0.0, 0.0], [0.5, 0.5, 0.5],
      ] },
      { wyckoff: "2b", occupants: {"Sn": 1.0}, positions: [
        [0.0, 0.0, 0.5], [0.5, 0.5, 0.0],
      ] },
      { wyckoff: "4d", occupants: {"Cu": 1.0}, positions: [
        [0.0, 0.5, 0.25], [0.0, 0.5, 0.75], [0.5, 0.0, 0.25], [0.5, 0.0, 0.75],
      ] },
      { wyckoff: "8i", occupants: {"S": 1.0}, positions: [
        [0.245, 0.245, 0.132], [0.245, 0.755, 0.868], [0.255, 0.255, 0.632], [0.255, 0.745, 0.368],
        [0.745, 0.255, 0.368], [0.745, 0.745, 0.632], [0.755, 0.245, 0.868], [0.755, 0.755, 0.132],
      ] },
    ],
  },
  "kesterite": {
    kind: "prototype",
    source: {"label": "AFLOW · A2B4CD_tI16_82_ac_g_b_d-001", "url": "https://www.aflow.org/prototype-encyclopedia/A2B4CD_tI16_82_ac_g_b_d-001/"},
    spaceGroup: 82,
    parameters: [5.427, 5.427, 10.871, 90.0, 90.0, 90.0],
    groups: [
      { wyckoff: "2a", occupants: {"Cu": 1.0}, positions: [
        [0.0, 0.0, 0.0], [0.5, 0.5, 0.5],
      ] },
      { wyckoff: "2b", occupants: {"Sn": 1.0}, positions: [
        [0.0, 0.0, 0.5], [0.5, 0.5, 0.0],
      ] },
      { wyckoff: "2c", occupants: {"Cu": 1.0}, positions: [
        [0.0, 0.5, 0.25], [0.5, 0.0, 0.75],
      ] },
      { wyckoff: "2d", occupants: {"Zn": 1.0}, positions: [
        [0.0, 0.5, 0.75], [0.5, 0.0, 0.25],
      ] },
      { wyckoff: "8g", occupants: {"S": 1.0}, positions: [
        [0.2434, 0.756, 0.1278], [0.244, 0.2434, 0.8722], [0.256, 0.2566, 0.3722], [0.2566, 0.744, 0.6278],
        [0.7434, 0.256, 0.6278], [0.744, 0.7434, 0.3722], [0.756, 0.7566, 0.8722], [0.7566, 0.244, 0.1278],
      ] },
    ],
  },
  "cu2sns3": {
    kind: "literature",
    source: {"label": "COD 7246217 · Pavan Kumar 2021 · 293 K", "url": "https://www.crystallography.net/cod/7246217.html"},
    spaceGroup: 9,
    parameters: [6.6561, 11.5249, 6.6579, 90.0, 109.515, 90.0],
    groups: [
      { wyckoff: "4a", occupants: {"Cu": 1.0}, positions: [
        [0.00949, 0.08316, 0.03978], [0.00949, 0.91684, 0.53978], [0.50949, 0.41684, 0.53978], [0.50949, 0.58316, 0.03978],
      ] },
      { wyckoff: "4a", occupants: {"Cu": 1.0}, positions: [
        [0.01401, 0.24753, 0.53938], [0.01401, 0.75247, 0.03938], [0.51401, 0.25247, 0.03938], [0.51401, 0.74753, 0.53938],
      ] },
      { wyckoff: "4a", occupants: {"Sn": 1.0}, positions: [
        [0.01649, 0.41466, 0.04206], [0.01649, 0.58534, 0.54206], [0.51649, 0.08534, 0.54206], [0.51649, 0.91466, 0.04206],
      ] },
      { wyckoff: "4a", occupants: {"S": 1.0}, positions: [
        [0.4138, 0.41044, 0.14922], [0.4138, 0.58956, 0.64922], [0.9138, 0.08956, 0.64922], [0.9138, 0.91044, 0.14922],
      ] },
      { wyckoff: "4a", occupants: {"S": 1.0}, positions: [
        [0.38456, 0.26791, 0.67252], [0.38456, 0.73209, 0.17252], [0.88456, 0.23209, 0.17252], [0.88456, 0.76791, 0.67252],
      ] },
      { wyckoff: "4a", occupants: {"S": 1.0}, positions: [
        [0.3658, 0.09048, 0.13646], [0.3658, 0.90952, 0.63646], [0.8658, 0.40952, 0.63646], [0.8658, 0.59048, 0.13646],
      ] },
    ],
  },
  "sulvanite": {
    kind: "prototype",
    source: {"label": "AFLOW · A3B4C_cP8_215_c_e_b-001", "url": "https://www.aflow.org/prototype-encyclopedia/A3B4C_cP8_215_c_e_b-001/"},
    spaceGroup: 215,
    parameters: [5.3912, 5.3912, 5.3912, 90.0, 90.0, 90.0],
    groups: [
      { wyckoff: "1b", occupants: {"V": 1.0}, positions: [
        [0.5, 0.5, 0.5],
      ] },
      { wyckoff: "3c", occupants: {"Cu": 1.0}, positions: [
        [0.0, 0.5, 0.5], [0.5, 0.0, 0.5], [0.5, 0.5, 0.0],
      ] },
      { wyckoff: "4e", occupants: {"S": 1.0}, positions: [
        [0.2628, 0.2628, 0.7372], [0.2628, 0.7372, 0.2628], [0.7372, 0.2628, 0.2628], [0.7372, 0.7372, 0.7372],
      ] },
    ],
  },
  "graphite": {
    kind: "prototype",
    source: {"label": "AFLOW · A_hP4_194_bc-001", "url": "https://www.aflow.org/prototype-encyclopedia/A_hP4_194_bc-001/"},
    spaceGroup: 194,
    parameters: [2.464, 2.464, 6.711, 90.0, 90.0, 120.0],
    groups: [
      { wyckoff: "2b", occupants: {"C": 1.0}, positions: [
        [0.0, 0.0, 0.25], [0.0, 0.0, 0.75],
      ] },
      { wyckoff: "2c", occupants: {"C": 1.0}, positions: [
        [0.33333, 0.66667, 0.25], [0.66666, 0.33333, 0.75],
      ] },
    ],
  },
  "hbn": {
    kind: "prototype",
    source: {"label": "AFLOW · AB_hP4_194_c_d-001", "url": "https://www.aflow.org/prototype-encyclopedia/AB_hP4_194_c_d-001/"},
    spaceGroup: 194,
    parameters: [2.50399, 2.50399, 6.6612, 90.0, 90.0, 120.0],
    groups: [
      { wyckoff: "2c", occupants: {"B": 1.0}, positions: [
        [0.33333333, 0.66666667, 0.25], [0.66666667, 0.33333333, 0.75],
      ] },
      { wyckoff: "2d", occupants: {"N": 1.0}, positions: [
        [0.33333333, 0.66666667, 0.75], [0.66666667, 0.33333333, 0.25],
      ] },
    ],
  },
  "blackp": {
    kind: "prototype",
    source: {"label": "AFLOW · A_oC8_64_f-002", "url": "https://www.aflow.org/prototype-encyclopedia/A_oC8_64_f-002/"},
    spaceGroup: 64,
    parameters: [3.3136, 10.478, 4.3763, 90.0, 90.0, 90.0],
    groups: [
      { wyckoff: "8f", occupants: {"P": 1.0}, positions: [
        [0.0, 0.10168, 0.08056], [0.0, 0.39832, 0.58056], [0.0, 0.60168, 0.41944], [0.0, 0.89832, 0.91944],
        [0.5, 0.10168, 0.41944], [0.5, 0.39832, 0.91944], [0.5, 0.60168, 0.08056], [0.5, 0.89832, 0.58056],
      ] },
    ],
  },
  "chalcocite-high": {
    kind: "average",
    source: {"label": "COD 1529746 · Cava 1981", "url": "https://www.crystallography.net/cod/1529746.html"},
    spaceGroup: 194,
    parameters: [3.959, 3.959, 6.784, 90.0, 90.0, 120.0],
    note: "同じ単位胞で複数のCu位置を部分占有として精密化した平均構造。",
    groups: [
      { wyckoff: "2b", occupants: {"Cu": 0.705}, positions: [
        [0.0, 0.0, 0.25], [0.0, 0.0, 0.75],
      ] },
      { wyckoff: "2d", occupants: {"S": 1.0}, positions: [
        [0.33334, 0.66667, 0.75], [0.66667, 0.33333, 0.25],
      ] },
      { wyckoff: "12k", occupants: {"Cu": 0.2158}, positions: [
        [0.2573, 0.5146, 0.0661], [0.2573, 0.5146, 0.4339], [0.2573, 0.7427, 0.0661], [0.2573, 0.7427, 0.4339],
        [0.4854, 0.7427, 0.0661], [0.4854, 0.7427, 0.4339], [0.5146, 0.2573, 0.5661], [0.5146, 0.2573, 0.9339],
        [0.7427, 0.2573, 0.5661], [0.7427, 0.2573, 0.9339], [0.7427, 0.4854, 0.5661], [0.7427, 0.4854, 0.9339],
      ] },
    ],
  },
  "chalcocite-low": {
    kind: "literature",
    source: {"label": "COD 9008287 · Evans 1979", "url": "https://www.crystallography.net/cod/9008287.html"},
    spaceGroup: 14,
    parameters: [15.246, 11.884, 13.494, 90.0, 116.35, 90.0],
    groups: [
      { wyckoff: "4e", occupants: {"Cu": 1.0}, positions: [
        [0.1355, 0.7496, 0.2073], [0.1355, 0.7504, 0.7073], [0.8645, 0.2496, 0.2927], [0.8645, 0.2504, 0.7927],
      ] },
      { wyckoff: "4e", occupants: {"Cu": 1.0}, positions: [
        [0.3829, 0.574, 0.8235], [0.3829, 0.926, 0.3235], [0.6171, 0.074, 0.6765], [0.6171, 0.426, 0.1765],
      ] },
      { wyckoff: "4e", occupants: {"Cu": 1.0}, positions: [
        [0.3898, 0.5916, 0.3323], [0.3898, 0.9084, 0.8323], [0.6102, 0.0916, 0.1677], [0.6102, 0.4084, 0.6677],
      ] },
      { wyckoff: "4e", occupants: {"Cu": 1.0}, positions: [
        [0.3628, 0.24, 0.0731], [0.3628, 0.26, 0.5731], [0.6372, 0.74, 0.4269], [0.6372, 0.76, 0.9269],
      ] },
      { wyckoff: "4e", occupants: {"Cu": 1.0}, positions: [
        [0.1276, 0.0849, 0.9451], [0.1276, 0.4151, 0.4451], [0.8724, 0.5849, 0.5549], [0.8724, 0.9151, 0.0549],
      ] },
      { wyckoff: "4e", occupants: {"Cu": 1.0}, positions: [
        [0.1065, 0.0783, 0.4429], [0.1065, 0.4217, 0.9429], [0.8935, 0.5783, 0.0571], [0.8935, 0.9217, 0.5571],
      ] },
      { wyckoff: "4e", occupants: {"Cu": 1.0}, positions: [
        [0.0655, 0.6233, 0.5077], [0.0655, 0.8767, 0.0077], [0.9345, 0.1233, 0.9923], [0.9345, 0.3767, 0.4923],
      ] },
      { wyckoff: "4e", occupants: {"Cu": 1.0}, positions: [
        [0.0586, 0.6412, 0.9901], [0.0586, 0.8588, 0.4901], [0.9414, 0.1412, 0.5099], [0.9414, 0.3588, 0.0099],
      ] },
      { wyckoff: "4e", occupants: {"Cu": 1.0}, positions: [
        [0.2385, 0.7496, 0.5891], [0.2385, 0.7504, 0.0891], [0.7615, 0.2496, 0.9109], [0.7615, 0.2504, 0.4109],
      ] },
      { wyckoff: "4e", occupants: {"Cu": 1.0}, positions: [
        [0.4429, 0.1477, 0.9348], [0.4429, 0.3523, 0.4348], [0.5571, 0.6477, 0.5652], [0.5571, 0.8523, 0.0652],
      ] },
      { wyckoff: "4e", occupants: {"Cu": 1.0}, positions: [
        [0.4254, 0.1229, 0.4388], [0.4254, 0.3771, 0.9388], [0.5746, 0.6229, 0.0612], [0.5746, 0.8771, 0.5612],
      ] },
      { wyckoff: "4e", occupants: {"Cu": 1.0}, positions: [
        [0.2578, 0.2357, 0.8507], [0.2578, 0.2643, 0.3507], [0.7422, 0.7357, 0.6493], [0.7422, 0.7643, 0.1493],
      ] },
      { wyckoff: "4e", occupants: {"Cu": 1.0}, positions: [
        [0.1791, 0.5358, 0.817], [0.1791, 0.9642, 0.317], [0.8209, 0.0358, 0.683], [0.8209, 0.4642, 0.183],
      ] },
      { wyckoff: "4e", occupants: {"Cu": 1.0}, positions: [
        [0.217, 0.5624, 0.3329], [0.217, 0.9376, 0.8329], [0.783, 0.0624, 0.1671], [0.783, 0.4376, 0.6671],
      ] },
      { wyckoff: "4e", occupants: {"Cu": 1.0}, positions: [
        [0.0261, 0.2045, 0.7722], [0.0261, 0.2955, 0.2722], [0.9739, 0.7045, 0.7278], [0.9739, 0.7955, 0.2278],
      ] },
      { wyckoff: "4e", occupants: {"Cu": 1.0}, positions: [
        [0.4974, 0.5795, 0.2166], [0.4974, 0.9205, 0.7166], [0.5026, 0.0795, 0.2834], [0.5026, 0.4205, 0.7834],
      ] },
      { wyckoff: "4e", occupants: {"Cu": 1.0}, positions: [
        [0.3022, 0.0434, 0.623], [0.3022, 0.4566, 0.123], [0.6978, 0.5434, 0.877], [0.6978, 0.9566, 0.377],
      ] },
      { wyckoff: "4e", occupants: {"Cu": 1.0}, positions: [
        [0.305, 0.0431, 0.1339], [0.305, 0.4569, 0.6339], [0.695, 0.5431, 0.3661], [0.695, 0.9569, 0.8661],
      ] },
      { wyckoff: "4e", occupants: {"Cu": 1.0}, positions: [
        [0.4757, 0.7082, 0.7457], [0.4757, 0.7918, 0.2457], [0.5243, 0.2082, 0.7543], [0.5243, 0.2918, 0.2543],
      ] },
      { wyckoff: "4e", occupants: {"Cu": 1.0}, positions: [
        [0.0008, 0.5856, 0.2834], [0.0008, 0.9144, 0.7834], [0.9992, 0.0856, 0.2166], [0.9992, 0.4144, 0.7166],
      ] },
      { wyckoff: "4e", occupants: {"Cu": 1.0}, positions: [
        [0.3773, 0.6032, 0.5469], [0.3773, 0.8968, 0.0469], [0.6227, 0.1032, 0.9531], [0.6227, 0.3968, 0.4531],
      ] },
      { wyckoff: "4e", occupants: {"Cu": 1.0}, positions: [
        [0.2963, 0.6944, 0.9341], [0.2963, 0.8056, 0.4341], [0.7037, 0.1944, 0.5659], [0.7037, 0.3056, 0.0659],
      ] },
      { wyckoff: "4e", occupants: {"Cu": 1.0}, positions: [
        [0.2028, 0.2069, 0.1398], [0.2028, 0.2931, 0.6398], [0.7972, 0.7069, 0.3602], [0.7972, 0.7931, 0.8602],
      ] },
      { wyckoff: "4e", occupants: {"Cu": 1.0}, positions: [
        [0.1308, 0.0966, 0.6791], [0.1308, 0.4034, 0.1791], [0.8692, 0.5966, 0.8209], [0.8692, 0.9034, 0.3209],
      ] },
      { wyckoff: "4e", occupants: {"S": 1.0}, positions: [
        [0.0425, 0.5829, 0.6578], [0.0425, 0.9171, 0.1578], [0.9575, 0.0829, 0.8422], [0.9575, 0.4171, 0.3422],
      ] },
      { wyckoff: "4e", occupants: {"S": 1.0}, positions: [
        [0.0587, 0.5768, 0.1538], [0.0587, 0.9232, 0.6538], [0.9413, 0.0768, 0.3462], [0.9413, 0.4232, 0.8462],
      ] },
      { wyckoff: "4e", occupants: {"S": 1.0}, positions: [
        [0.206, 0.5824, 0.9932], [0.206, 0.9176, 0.4932], [0.794, 0.0824, 0.5068], [0.794, 0.4176, 0.0068],
      ] },
      { wyckoff: "4e", occupants: {"S": 1.0}, positions: [
        [0.2083, 0.5817, 0.494], [0.2083, 0.9183, 0.994], [0.7917, 0.0817, 0.006], [0.7917, 0.4183, 0.506],
      ] },
      { wyckoff: "4e", occupants: {"S": 1.0}, positions: [
        [0.4491, 0.0883, 0.6133], [0.4491, 0.4117, 0.1133], [0.5509, 0.5883, 0.8867], [0.5509, 0.9117, 0.3867],
      ] },
      { wyckoff: "4e", occupants: {"S": 1.0}, positions: [
        [0.4444, 0.0726, 0.0957], [0.4444, 0.4274, 0.5957], [0.5556, 0.5726, 0.4043], [0.5556, 0.9274, 0.9043],
      ] },
      { wyckoff: "4e", occupants: {"S": 1.0}, positions: [
        [0.2999, 0.0781, 0.7868], [0.2999, 0.4219, 0.2868], [0.7001, 0.5781, 0.7132], [0.7001, 0.9219, 0.2132],
      ] },
      { wyckoff: "4e", occupants: {"S": 1.0}, positions: [
        [0.2843, 0.0832, 0.2869], [0.2843, 0.4168, 0.7869], [0.7157, 0.5832, 0.2131], [0.7157, 0.9168, 0.7131],
      ] },
      { wyckoff: "4e", occupants: {"S": 1.0}, positions: [
        [0.304, 0.7481, 0.778], [0.304, 0.7519, 0.278], [0.696, 0.2481, 0.722], [0.696, 0.2519, 0.222],
      ] },
      { wyckoff: "4e", occupants: {"S": 1.0}, positions: [
        [0.4521, 0.7237, 0.0833], [0.4521, 0.7763, 0.5833], [0.5479, 0.2237, 0.4167], [0.5479, 0.2763, 0.9167],
      ] },
      { wyckoff: "4e", occupants: {"S": 1.0}, positions: [
        [0.197, 0.2384, 0.4766], [0.197, 0.2616, 0.9766], [0.803, 0.7384, 0.0234], [0.803, 0.7616, 0.5234],
      ] },
      { wyckoff: "4e", occupants: {"S": 1.0}, positions: [
        [0.0483, 0.2324, 0.1332], [0.0483, 0.2676, 0.6332], [0.9517, 0.7324, 0.3668], [0.9517, 0.7676, 0.8668],
      ] },
    ],
  },
  "digenite": {
    kind: "prototype",
    source: {"label": "COD 1536218 · Daams 1993", "url": "https://www.crystallography.net/cod/1536218.html"},
    spaceGroup: 166,
    parameters: [3.93, 3.93, 48.14, 90.0, 90.0, 120.0],
    note: "長周期の構造型データ。硫化銅では組成、温度、Cu秩序によって異なる相が現れます。",
    groups: [
      { wyckoff: "3a", occupants: {"S": 1.0}, positions: [
        [0.0, 0.0, 0.0], [0.33333333, 0.66666667, 0.66666667], [0.66666667, 0.33333333, 0.33333333],
      ] },
      { wyckoff: "6c", occupants: {"Cu": 1.0}, positions: [
        [0.0, 0.0, 0.06], [0.0, 0.0, 0.94], [0.33333333, 0.66666667, 0.60666667], [0.33333333, 0.66666667, 0.72666667],
        [0.66666667, 0.33333333, 0.27333333], [0.66666667, 0.33333333, 0.39333333],
      ] },
      { wyckoff: "6c", occupants: {"S": 1.0}, positions: [
        [0.0, 0.0, 0.2], [0.0, 0.0, 0.8], [0.33333333, 0.66666667, 0.46666667], [0.33333333, 0.66666667, 0.86666667],
        [0.66666667, 0.33333333, 0.13333333], [0.66666667, 0.33333333, 0.53333333],
      ] },
      { wyckoff: "6c", occupants: {"Cu": 1.0}, positions: [
        [0.0, 0.0, 0.35], [0.0, 0.0, 0.65], [0.33333333, 0.66666667, 0.01666667], [0.33333333, 0.66666667, 0.31666667],
        [0.66666667, 0.33333333, 0.68333333], [0.66666667, 0.33333333, 0.98333333],
      ] },
      { wyckoff: "6c", occupants: {"Cu": 1.0}, positions: [
        [0.0, 0.0, 0.133], [0.0, 0.0, 0.867], [0.33333333, 0.66666667, 0.53366667], [0.33333333, 0.66666667, 0.79966667],
        [0.66666667, 0.33333333, 0.20033333], [0.66666667, 0.33333333, 0.46633333],
      ] },
      { wyckoff: "3b", occupants: {"Cu": 1.0}, positions: [
        [0.0, 0.0, 0.5], [0.33333333, 0.66666667, 0.16666667], [0.66666667, 0.33333333, 0.83333333],
      ] },
      { wyckoff: "6c", occupants: {"Cu": 1.0}, positions: [
        [0.0, 0.0, 0.25], [0.0, 0.0, 0.75], [0.33333333, 0.66666667, 0.41666667], [0.33333333, 0.66666667, 0.91666667],
        [0.66666667, 0.33333333, 0.08333333], [0.66666667, 0.33333333, 0.58333333],
      ] },
      { wyckoff: "6c", occupants: {"S": 1.0}, positions: [
        [0.0, 0.0, 0.4], [0.0, 0.0, 0.6], [0.33333333, 0.66666667, 0.06666667], [0.33333333, 0.66666667, 0.26666667],
        [0.66666667, 0.33333333, 0.73333333], [0.66666667, 0.33333333, 0.93333333],
      ] },
    ],
  },
  "covellite": {
    kind: "prototype",
    source: {"label": "AFLOW · AB_hP12_194_cf_de-001", "url": "https://www.aflow.org/prototype-encyclopedia/AB_hP12_194_cf_de-001/"},
    spaceGroup: 194,
    parameters: [3.976, 3.976, 16.382, 90.0, 90.0, 120.0],
    groups: [
      { wyckoff: "2c", occupants: {"Cu": 1.0}, positions: [
        [0.33333333, 0.66666667, 0.25], [0.66666667, 0.33333333, 0.75],
      ] },
      { wyckoff: "2d", occupants: {"S": 1.0}, positions: [
        [0.33333333, 0.66666667, 0.75], [0.66666667, 0.33333333, 0.25],
      ] },
      { wyckoff: "4e", occupants: {"S": 1.0}, positions: [
        [0.0, 0.0, 0.0637], [0.0, 0.0, 0.4363], [0.0, 0.0, 0.5637], [0.0, 0.0, 0.9363],
      ] },
      { wyckoff: "4f", occupants: {"Cu": 1.0}, positions: [
        [0.33333333, 0.66666667, 0.60724], [0.33333333, 0.66666667, 0.89276], [0.66666667, 0.33333333, 0.10724], [0.66666667, 0.33333333, 0.39276],
      ] },
    ],
  },
  "pentlandite": {
    kind: "prototype",
    source: {"label": "AFLOW · A9B8_cF68_225_af_ce-001", "url": "https://www.aflow.org/prototype-encyclopedia/A9B8_cF68_225_af_ce-001/"},
    spaceGroup: 225,
    parameters: [9.928, 9.928, 9.928, 90.0, 90.0, 90.0],
    groups: [
      { wyckoff: "4a", occupants: {"Co": 1.0}, positions: [
        [0.0, 0.0, 0.0], [0.0, 0.5, 0.5], [0.5, 0.0, 0.5], [0.5, 0.5, 0.0],
      ] },
      { wyckoff: "8c", occupants: {"S": 1.0}, positions: [
        [0.25, 0.25, 0.25], [0.25, 0.25, 0.75], [0.25, 0.75, 0.25], [0.25, 0.75, 0.75],
        [0.75, 0.25, 0.25], [0.75, 0.25, 0.75], [0.75, 0.75, 0.25], [0.75, 0.75, 0.75],
      ] },
      { wyckoff: "24e", occupants: {"S": 1.0}, positions: [
        [0.0, 0.0, 0.2409], [0.0, 0.0, 0.7591], [0.0, 0.2409, 0.0], [0.0, 0.2591, 0.5],
        [0.0, 0.5, 0.2591], [0.0, 0.5, 0.7409], [0.0, 0.7409, 0.5], [0.0, 0.7591, 0.0],
        [0.2409, 0.0, 0.0], [0.2409, 0.5, 0.5], [0.2591, 0.0, 0.5], [0.2591, 0.5, 0.0],
        [0.5, 0.0, 0.2591], [0.5, 0.0, 0.7409], [0.5, 0.2409, 0.5], [0.5, 0.2591, 0.0],
        [0.5, 0.5, 0.2409], [0.5, 0.5, 0.7591], [0.5, 0.7409, 0.0], [0.5, 0.7591, 0.5],
        [0.7409, 0.0, 0.5], [0.7409, 0.5, 0.0], [0.7591, 0.0, 0.0], [0.7591, 0.5, 0.5],
      ] },
      { wyckoff: "32f", occupants: {"Co": 1.0}, positions: [
        [0.126, 0.126, 0.374], [0.126, 0.126, 0.626], [0.126, 0.374, 0.126], [0.126, 0.374, 0.874],
        [0.126, 0.626, 0.126], [0.126, 0.626, 0.874], [0.126, 0.874, 0.374], [0.126, 0.874, 0.626],
        [0.374, 0.126, 0.126], [0.374, 0.126, 0.874], [0.374, 0.374, 0.374], [0.374, 0.374, 0.626],
        [0.374, 0.626, 0.374], [0.374, 0.626, 0.626], [0.374, 0.874, 0.126], [0.374, 0.874, 0.874],
        [0.626, 0.126, 0.126], [0.626, 0.126, 0.874], [0.626, 0.374, 0.374], [0.626, 0.374, 0.626],
        [0.626, 0.626, 0.374], [0.626, 0.626, 0.626], [0.626, 0.874, 0.126], [0.626, 0.874, 0.874],
        [0.874, 0.126, 0.374], [0.874, 0.126, 0.626], [0.874, 0.374, 0.126], [0.874, 0.374, 0.874],
        [0.874, 0.626, 0.126], [0.874, 0.626, 0.874], [0.874, 0.874, 0.374], [0.874, 0.874, 0.626],
      ] },
    ],
  },
  "cemg2si2": {
    kind: "literature",
    source: {"label": "COD 1528260 · Zmii 1970", "url": "https://www.crystallography.net/cod/1528260.html"},
    spaceGroup: 123,
    parameters: [4.25, 4.25, 5.765, 90.0, 90.0, 90.0],
    groups: [
      { wyckoff: "2e", occupants: {"Mg": 1.0}, positions: [
        [0.0, 0.5, 0.5], [0.5, 0.0, 0.5],
      ] },
      { wyckoff: "2h", occupants: {"Si": 1.0}, positions: [
        [0.5, 0.5, 0.24], [0.5, 0.5, 0.76],
      ] },
      { wyckoff: "1a", occupants: {"Ce": 1.0}, positions: [
        [0.0, 0.0, 0.0],
      ] },
    ],
  },
  "srau3ge": {
    kind: "literature",
    source: {"label": "COD 4117645 · Qisheng Lin 2012 · 295 K", "url": "https://www.crystallography.net/cod/4117645.html"},
    spaceGroup: 129,
    parameters: [6.2741, 6.2741, 5.4944, 90.0, 90.0, 90.0],
    groups: [
      { wyckoff: "4e", occupants: {"Au": 1.0}, positions: [
        [0.0, 0.0, 0.5], [0.0, 0.5, 0.5], [0.5, 0.0, 0.5], [0.5, 0.5, 0.5],
      ] },
      { wyckoff: "2c", occupants: {"Au": 1.0}, positions: [
        [0.25, 0.25, 0.82128], [0.75, 0.75, 0.17872],
      ] },
      { wyckoff: "2c", occupants: {"Ge": 1.0}, positions: [
        [0.25, 0.25, 0.2683], [0.75, 0.75, 0.7317],
      ] },
      { wyckoff: "2a", occupants: {"Sr": 1.0}, positions: [
        [0.25, 0.75, 0.0], [0.75, 0.25, 0.0],
      ] },
    ],
  },
  "laru2al2b": {
    kind: "literature",
    source: {"label": "COD 4315144 · Julia V. Zaikina 2010 · 295 K", "url": "https://www.crystallography.net/cod/4315144.html"},
    spaceGroup: 123,
    parameters: [4.2105, 4.2105, 5.6613, 90.0, 90.0, 90.0],
    groups: [
      { wyckoff: "1b", occupants: {"La": 1.0}, positions: [
        [0.0, 0.0, 0.5],
      ] },
      { wyckoff: "1a", occupants: {"B": 1.0}, positions: [
        [0.0, 0.0, 0.0],
      ] },
      { wyckoff: "2h", occupants: {"Al": 1.0}, positions: [
        [0.5, 0.5, 0.2537], [0.5, 0.5, 0.7463],
      ] },
      { wyckoff: "2f", occupants: {"Ru": 1.0}, positions: [
        [0.0, 0.5, 0.0], [0.5, 0.0, 0.0],
      ] },
    ],
  },
  "banisn3": {
    kind: "prototype",
    source: {"label": "AFLOW · ABC3_tI10_107_a_a_ab-001", "url": "https://www.aflow.org/prototype-encyclopedia/ABC3_tI10_107_a_a_ab-001/"},
    spaceGroup: 107,
    parameters: [4.82, 4.82, 10.93001, 90.0, 90.0, 90.0],
    groups: [
      { wyckoff: "2a", occupants: {"Ba": 1.0}, positions: [
        [0.0, 0.0, 0.0], [0.5, 0.5, 0.5],
      ] },
      { wyckoff: "2a", occupants: {"Ni": 1.0}, positions: [
        [0.0, 0.0, 0.6554], [0.5, 0.5, 0.1554],
      ] },
      { wyckoff: "2a", occupants: {"Sn": 1.0}, positions: [
        [0.0, 0.0, 0.4241], [0.5, 0.5, 0.9241],
      ] },
      { wyckoff: "4b", occupants: {"Sn": 1.0}, positions: [
        [0.0, 0.5, 0.2516], [0.0, 0.5, 0.7516], [0.5, 0.0, 0.2516], [0.5, 0.0, 0.7516],
      ] },
    ],
  },
  "tlco2s2": {
    kind: "prototype",
    source: {"label": "AFLOW · A2B2C_tI10_139_d_e_a-002", "url": "https://www.aflow.org/prototype-encyclopedia/A2B2C_tI10_139_d_e_a-002/"},
    spaceGroup: 139,
    parameters: [3.741, 3.741, 12.95601, 90.0, 90.0, 90.0],
    groups: [
      { wyckoff: "2a", occupants: {"Tl": 1.0}, positions: [
        [0.0, 0.0, 0.0], [0.5, 0.5, 0.5],
      ] },
      { wyckoff: "4d", occupants: {"Co": 1.0}, positions: [
        [0.0, 0.5, 0.25], [0.0, 0.5, 0.75], [0.5, 0.0, 0.25], [0.5, 0.0, 0.75],
      ] },
      { wyckoff: "4e", occupants: {"S": 1.0}, positions: [
        [0.0, 0.0, 0.3474], [0.0, 0.0, 0.6526], [0.5, 0.5, 0.1526], [0.5, 0.5, 0.8474],
      ] },
    ],
  },
  "laves-c15": {
    kind: "prototype",
    source: {"label": "AFLOW · A2B_cF24_227_c_b-001", "url": "https://www.aflow.org/prototype-encyclopedia/A2B_cF24_227_c_b-001/"},
    spaceGroup: 227,
    parameters: [7.02, 7.02, 7.02, 90.0, 90.0, 90.0],
    groups: [
      { wyckoff: "8b", occupants: {"Mg": 1.0}, positions: [
        [0.125, 0.125, 0.625], [0.125, 0.625, 0.125], [0.375, 0.375, 0.375], [0.375, 0.875, 0.875],
        [0.625, 0.125, 0.125], [0.625, 0.625, 0.625], [0.875, 0.375, 0.875], [0.875, 0.875, 0.375],
      ] },
      { wyckoff: "16c", occupants: {"Cu": 1.0}, positions: [
        [0.0, 0.0, 0.0], [0.0, 0.25, 0.25], [0.0, 0.5, 0.5], [0.0, 0.75, 0.75],
        [0.25, 0.0, 0.25], [0.25, 0.25, 0.0], [0.25, 0.5, 0.75], [0.25, 0.75, 0.5],
        [0.5, 0.0, 0.5], [0.5, 0.25, 0.75], [0.5, 0.5, 0.0], [0.5, 0.75, 0.25],
        [0.75, 0.0, 0.75], [0.75, 0.25, 0.5], [0.75, 0.5, 0.25], [0.75, 0.75, 0.0],
      ] },
    ],
  },
  "laves-c14": {
    kind: "prototype",
    source: {"label": "AFLOW · AB2_hP12_194_f_ah-001", "url": "https://www.aflow.org/prototype-encyclopedia/AB2_hP12_194_f_ah-001/"},
    spaceGroup: 194,
    parameters: [5.223, 5.223, 8.566, 90.0, 90.0, 120.0],
    groups: [
      { wyckoff: "2a", occupants: {"Zn": 1.0}, positions: [
        [3.33e-06, 0.99999667, 0.0], [6.67e-06, 3.33e-06, 0.5],
      ] },
      { wyckoff: "4f", occupants: {"Mg": 1.0}, positions: [
        [0.33333333, 0.66666667, 0.06286], [0.33333333, 0.66666667, 0.43714], [0.66666667, 0.33333333, 0.56286], [0.66666667, 0.33333333, 0.93714],
      ] },
      { wyckoff: "6h", occupants: {"Zn": 1.0}, positions: [
        [0.16951667, 0.33903333, 0.75], [0.16951667, 0.83048333, 0.75], [0.33903333, 0.16951667, 0.25], [0.66096667, 0.83048333, 0.75],
        [0.83048333, 0.16951667, 0.25], [0.83048333, 0.66096667, 0.25],
      ] },
    ],
  },
  "laves-c36": {
    kind: "prototype",
    source: {"label": "AFLOW · AB2_hP24_194_ef_fgh-001", "url": "https://www.aflow.org/prototype-encyclopedia/AB2_hP24_194_ef_fgh-001/"},
    spaceGroup: 194,
    parameters: [4.824, 4.824, 15.826, 90.0, 90.0, 120.0],
    groups: [
      { wyckoff: "4e", occupants: {"Mg": 1.0}, positions: [
        [0.0, 0.0, 0.094], [0.0, 0.0, 0.406], [0.0, 0.0, 0.594], [0.0, 0.0, 0.906],
      ] },
      { wyckoff: "4f", occupants: {"Mg": 1.0}, positions: [
        [0.33333, 0.66667, 0.65583], [0.33333, 0.66667, 0.84417], [0.66666, 0.33333, 0.34417], [0.66667, 0.33334, 0.15583],
      ] },
      { wyckoff: "4f", occupants: {"Ni": 1.0}, positions: [
        [0.33333, 0.66667, 0.12514], [0.33333, 0.66667, 0.37486], [0.66666, 0.33333, 0.62514], [0.66667, 0.33334, 0.87486],
      ] },
      { wyckoff: "6g", occupants: {"Ni": 1.0}, positions: [
        [0.0, 0.5, 0.0], [0.0, 0.5, 0.5], [0.5, 0.0, 0.0], [0.5, 0.0, 0.5],
        [0.5, 0.5, 0.0], [0.5, 0.5, 0.5],
      ] },
      { wyckoff: "6h", occupants: {"Ni": 1.0}, positions: [
        [0.16429, 0.32858, 0.25], [0.16429, 0.83571, 0.25], [0.32858, 0.16429, 0.75], [0.67142, 0.83571, 0.25],
        [0.83571, 0.16429, 0.75], [0.83571, 0.67142, 0.75],
      ] },
    ],
  },
  "cacu5": {
    kind: "prototype",
    source: {"label": "AFLOW · AB5_hP6_191_a_cg-001", "url": "https://www.aflow.org/prototype-encyclopedia/AB5_hP6_191_a_cg-001/"},
    spaceGroup: 191,
    parameters: [5.082, 5.082, 4.078, 90.0, 90.0, 120.0],
    groups: [
      { wyckoff: "1a", occupants: {"Ca": 1.0}, positions: [
        [0.0, 0.0, 0.0],
      ] },
      { wyckoff: "2c", occupants: {"Cu": 1.0}, positions: [
        [0.33333, 0.66667, 0.0], [0.66666, 0.33333, 0.0],
      ] },
      { wyckoff: "3g", occupants: {"Cu": 1.0}, positions: [
        [0.0, 0.5, 0.5], [0.5, 0.0, 0.5], [0.5, 0.5, 0.5],
      ] },
    ],
  },
  "cscdcl3": {
    kind: "literature",
    source: {"label": "COD 2310670 · Siegel 1964", "url": "https://www.crystallography.net/cod/2310670.html"},
    spaceGroup: 194,
    parameters: [7.418, 7.418, 18.39, 90.0, 90.0, 120.0],
    groups: [
      { wyckoff: "6h", occupants: {"Cl": 1.0}, positions: [
        [0.018, 0.509, 0.75], [0.491, 0.509, 0.75], [0.491, 0.982, 0.75], [0.509, 0.018, 0.25],
        [0.509, 0.491, 0.25], [0.982, 0.491, 0.25],
      ] },
      { wyckoff: "12k", occupants: {"Cl": 1.0}, positions: [
        [0.166, 0.332, 0.5838], [0.166, 0.332, 0.9162], [0.166, 0.834, 0.5838], [0.166, 0.834, 0.9162],
        [0.332, 0.166, 0.0838], [0.332, 0.166, 0.4162], [0.668, 0.834, 0.5838], [0.668, 0.834, 0.9162],
        [0.834, 0.166, 0.0838], [0.834, 0.166, 0.4162], [0.834, 0.668, 0.0838], [0.834, 0.668, 0.4162],
      ] },
      { wyckoff: "4f", occupants: {"Cs": 1.0}, positions: [
        [0.3333, 0.6667, 0.091], [0.3333, 0.6667, 0.409], [0.6666, 0.3333, 0.591], [0.6667, 0.3334, 0.909],
      ] },
      { wyckoff: "2b", occupants: {"Cs": 1.0}, positions: [
        [0.0, 0.0, 0.25], [0.0, 0.0, 0.75],
      ] },
      { wyckoff: "4f", occupants: {"Cd": 1.0}, positions: [
        [0.3333, 0.6667, 0.662], [0.3333, 0.6667, 0.838], [0.6666, 0.3333, 0.338], [0.6667, 0.3334, 0.162],
      ] },
      { wyckoff: "2a", occupants: {"Cd": 1.0}, positions: [
        [0.0, 0.0, 0.0], [0.0, 0.0, 0.5],
      ] },
    ],
  },
  "rbca2nb3o10": {
    kind: "literature",
    source: {"label": "COD 2238958 · Liang 2009 · 298 K", "url": "https://www.crystallography.net/cod/2238958.html"},
    spaceGroup: 123,
    parameters: [3.85865, 3.85865, 14.9108, 90.0, 90.0, 90.0],
    groups: [
      { wyckoff: "1d", occupants: {"Rb": 1.0}, positions: [
        [0.5, 0.5, 0.5],
      ] },
      { wyckoff: "2h", occupants: {"Ca": 1.0}, positions: [
        [0.5, 0.5, 0.14706], [0.5, 0.5, 0.85294],
      ] },
      { wyckoff: "1a", occupants: {"Nb": 1.0}, positions: [
        [0.0, 0.0, 0.0],
      ] },
      { wyckoff: "2g", occupants: {"Nb": 1.0}, positions: [
        [0.0, 0.0, 0.28537], [0.0, 0.0, 0.71463],
      ] },
      { wyckoff: "2f", occupants: {"O": 1.0}, positions: [
        [0.0, 0.5, 0.0], [0.5, 0.0, 0.0],
      ] },
      { wyckoff: "2g", occupants: {"O": 1.0}, positions: [
        [0.0, 0.0, 0.1258], [0.0, 0.0, 0.8742],
      ] },
      { wyckoff: "4i", occupants: {"O": 1.0}, positions: [
        [0.0, 0.5, 0.2599], [0.0, 0.5, 0.7401], [0.5, 0.0, 0.2599], [0.5, 0.0, 0.7401],
      ] },
      { wyckoff: "2g", occupants: {"O": 1.0}, positions: [
        [0.0, 0.0, 0.396], [0.0, 0.0, 0.604],
      ] },
    ],
  },
  "biocl": {
    kind: "literature",
    source: {"label": "COD 4509949 · Biswas 2014 · 293 K", "url": "https://www.crystallography.net/cod/4509949.html"},
    spaceGroup: 129,
    parameters: [3.88551, 3.88551, 7.3489, 90.0, 90.0, 90.0],
    groups: [
      { wyckoff: "2c", occupants: {"Bi": 1.0}, positions: [
        [0.25, 0.25, 0.32904], [0.75, 0.75, 0.67096],
      ] },
      { wyckoff: "2c", occupants: {"Cl": 1.0}, positions: [
        [0.25, 0.25, 0.8528], [0.75, 0.75, 0.1472],
      ] },
      { wyckoff: "2b", occupants: {"O": 1.0}, positions: [
        [0.25, 0.75, 0.5], [0.75, 0.25, 0.5],
      ] },
    ],
  },
  "lacuos": {
    kind: "literature",
    source: {"label": "COD 1532334 · Ueda 2002", "url": "https://www.crystallography.net/cod/1532334.html"},
    spaceGroup: 129,
    parameters: [3.99625, 3.99625, 8.51743, 90.0, 90.0, 90.0],
    groups: [
      { wyckoff: "2a", occupants: {"O": 1.0}, positions: [
        [0.25, 0.75, 0.0], [0.75, 0.25, 0.0],
      ] },
      { wyckoff: "2c", occupants: {"S": 1.0}, positions: [
        [0.25, 0.25, 0.661], [0.75, 0.75, 0.339],
      ] },
      { wyckoff: "2c", occupants: {"La": 1.0}, positions: [
        [0.25, 0.25, 0.1478], [0.75, 0.75, 0.8522],
      ] },
      { wyckoff: "2b", occupants: {"Cu": 1.0}, positions: [
        [0.25, 0.75, 0.5], [0.75, 0.25, 0.5],
      ] },
    ],
  },
  "cosb3": {
    kind: "literature",
    source: {"label": "COD 1566759 · Glazyrin 2022 · 293 K", "url": "https://www.crystallography.net/cod/1566759.html"},
    spaceGroup: 204,
    parameters: [9.036, 9.036, 9.036, 90.0, 90.0, 90.0],
    groups: [
      { wyckoff: "24g", occupants: {"Sb": 1.0}, positions: [
        [0.0, 0.15785, 0.33509], [0.0, 0.15785, 0.66491], [0.0, 0.84215, 0.33509], [0.0, 0.84215, 0.66491],
        [0.15785, 0.33509, 0.0], [0.15785, 0.66491, 0.0], [0.16491, 0.5, 0.34215], [0.16491, 0.5, 0.65785],
        [0.33509, 0.0, 0.15785], [0.33509, 0.0, 0.84215], [0.34215, 0.16491, 0.5], [0.34215, 0.83509, 0.5],
        [0.5, 0.34215, 0.16491], [0.5, 0.34215, 0.83509], [0.5, 0.65785, 0.16491], [0.5, 0.65785, 0.83509],
        [0.65785, 0.16491, 0.5], [0.65785, 0.83509, 0.5], [0.66491, 0.0, 0.15785], [0.66491, 0.0, 0.84215],
        [0.83509, 0.5, 0.34215], [0.83509, 0.5, 0.65785], [0.84215, 0.33509, 0.0], [0.84215, 0.66491, 0.0],
      ] },
      { wyckoff: "8c", occupants: {"Co": 1.0}, positions: [
        [0.25, 0.25, 0.25], [0.25, 0.25, 0.75], [0.25, 0.75, 0.25], [0.25, 0.75, 0.75],
        [0.75, 0.25, 0.25], [0.75, 0.25, 0.75], [0.75, 0.75, 0.25], [0.75, 0.75, 0.75],
      ] },
    ],
  },
  "bif3": {
    kind: "prototype",
    source: {"label": "AFLOW · AB3_cF16_225_a_bc-001", "url": "https://www.aflow.org/prototype-encyclopedia/AB3_cF16_225_a_bc-001/"},
    spaceGroup: 225,
    parameters: [5.853, 5.853, 5.853, 90.0, 90.0, 90.0],
    groups: [
      { wyckoff: "4a", occupants: {"Bi": 1.0}, positions: [
        [0.0, 0.0, 0.0], [0.0, 0.5, 0.5], [0.5, 0.0, 0.5], [0.5, 0.5, 0.0],
      ] },
      { wyckoff: "4b", occupants: {"F": 1.0}, positions: [
        [0.0, 0.0, 0.5], [0.0, 0.5, 0.0], [0.5, 0.0, 0.0], [0.5, 0.5, 0.5],
      ] },
      { wyckoff: "8c", occupants: {"F": 1.0}, positions: [
        [0.25, 0.25, 0.25], [0.25, 0.25, 0.75], [0.25, 0.75, 0.25], [0.25, 0.75, 0.75],
        [0.75, 0.25, 0.25], [0.75, 0.25, 0.75], [0.75, 0.75, 0.25], [0.75, 0.75, 0.75],
      ] },
    ],
  },
  "k2ptcl6": {
    kind: "prototype",
    source: {"label": "AFLOW · A6B2C_cF36_225_e_c_a-001", "url": "https://www.aflow.org/prototype-encyclopedia/A6B2C_cF36_225_e_c_a-001/"},
    spaceGroup: 225,
    parameters: [9.725, 9.725, 9.725, 90.0, 90.0, 90.0],
    groups: [
      { wyckoff: "4a", occupants: {"Pt": 1.0}, positions: [
        [0.0, 0.0, 0.0], [0.0, 0.5, 0.5], [0.5, 0.0, 0.5], [0.5, 0.5, 0.0],
      ] },
      { wyckoff: "8c", occupants: {"K": 1.0}, positions: [
        [0.25, 0.25, 0.25], [0.25, 0.25, 0.75], [0.25, 0.75, 0.25], [0.25, 0.75, 0.75],
        [0.75, 0.25, 0.25], [0.75, 0.25, 0.75], [0.75, 0.75, 0.25], [0.75, 0.75, 0.75],
      ] },
      { wyckoff: "24e", occupants: {"Cl": 1.0}, positions: [
        [0.0, 0.0, 0.24], [0.0, 0.0, 0.76], [0.0, 0.24, 0.0], [0.0, 0.26, 0.5],
        [0.0, 0.5, 0.26], [0.0, 0.5, 0.74], [0.0, 0.74, 0.5], [0.0, 0.76, 0.0],
        [0.24, 0.0, 0.0], [0.24, 0.5, 0.5], [0.26, 0.0, 0.5], [0.26, 0.5, 0.0],
        [0.5, 0.0, 0.26], [0.5, 0.0, 0.74], [0.5, 0.24, 0.5], [0.5, 0.26, 0.0],
        [0.5, 0.5, 0.24], [0.5, 0.5, 0.76], [0.5, 0.74, 0.0], [0.5, 0.76, 0.5],
        [0.74, 0.0, 0.5], [0.74, 0.5, 0.0], [0.76, 0.0, 0.0], [0.76, 0.5, 0.5],
      ] },
    ],
  },
  "scheelite": {
    kind: "prototype",
    source: {"label": "AFLOW · AB4C_tI24_88_a_f_b-003", "url": "https://www.aflow.org/prototype-encyclopedia/AB4C_tI24_88_a_f_b-003/"},
    spaceGroup: 88,
    parameters: [5.2429, 5.2429, 11.3737, 90.0, 90.0, 90.0],
    note: "蛍石からの幾何学的説明は F. S. Galasso, Structure and Properties of Inorganic Solids, 1st ed. (Pergamon Press, Oxford, 1970) · §5.9.",
    groups: [
      { wyckoff: "4a", occupants: {"Ca": 1.0}, positions: [
        [0.0, 0.25, 0.125], [0.0, 0.75, 0.875], [0.5, 0.25, 0.375], [0.5, 0.75, 0.625],
      ] },
      { wyckoff: "4b", occupants: {"W": 1.0}, positions: [
        [0.0, 0.25, 0.625], [0.0, 0.75, 0.375], [0.5, 0.25, 0.875], [0.5, 0.75, 0.125],
      ] },
      { wyckoff: "16f", occupants: {"O": 1.0}, positions: [
        [0.1488, 0.0038, 0.7159], [0.1488, 0.5038, 0.2841], [0.2462, 0.3988, 0.5341], [0.2462, 0.8988, 0.4659],
        [0.2538, 0.1012, 0.9659], [0.2538, 0.6012, 0.0341], [0.3512, 0.4962, 0.7841], [0.3512, 0.9962, 0.2159],
        [0.6488, 0.0038, 0.7841], [0.6488, 0.5038, 0.2159], [0.7462, 0.3988, 0.9659], [0.7462, 0.8988, 0.0341],
        [0.7538, 0.1012, 0.5341], [0.7538, 0.6012, 0.4659], [0.8512, 0.4962, 0.7159], [0.8512, 0.9962, 0.2841],
      ] },
    ],
  },
  "pbwo4": {
    kind: "literature",
    source: {"label": "COD 9009811 · Chipaux 2001 · 290 K", "url": "https://www.crystallography.net/cod/9009811.html"},
    spaceGroup: 88,
    parameters: [5.46979, 5.46979, 12.06339, 90.0, 90.0, 90.0],
    groups: [
      { wyckoff: "4a", occupants: {"Pb": 1.0}, positions: [
        [0.0, 0.25, 0.625], [0.0, 0.75, 0.375], [0.5, 0.25, 0.875], [0.5, 0.75, 0.125],
      ] },
      { wyckoff: "4b", occupants: {"W": 1.0}, positions: [
        [0.0, 0.25, 0.125], [0.0, 0.75, 0.875], [0.5, 0.25, 0.375], [0.5, 0.75, 0.625],
      ] },
      { wyckoff: "16f", occupants: {"O": 1.0}, positions: [
        [0.1378, 0.4817, 0.207], [0.1378, 0.9817, 0.793], [0.2317, 0.1122, 0.043], [0.2317, 0.6122, 0.957],
        [0.2683, 0.3878, 0.457], [0.2683, 0.8878, 0.543], [0.3622, 0.0183, 0.293], [0.3622, 0.5183, 0.707],
        [0.6378, 0.4817, 0.293], [0.6378, 0.9817, 0.707], [0.7317, 0.1122, 0.457], [0.7317, 0.6122, 0.543],
        [0.7683, 0.3878, 0.043], [0.7683, 0.8878, 0.957], [0.8622, 0.0183, 0.207], [0.8622, 0.5183, 0.793],
      ] },
    ],
  },
  "zircon": {
    kind: "prototype",
    source: {"label": "AFLOW · A4BC_tI24_141_h_a_b-001", "url": "https://www.aflow.org/prototype-encyclopedia/A4BC_tI24_141_h_a_b-001/"},
    spaceGroup: 141,
    parameters: [6.6042, 6.6042, 5.9796, 90.0, 90.0, 90.0],
    groups: [
      { wyckoff: "4a", occupants: {"Si": 1.0}, positions: [
        [0.0, 0.25, 0.875], [0.0, 0.75, 0.125], [0.5, 0.25, 0.625], [0.5, 0.75, 0.375],
      ] },
      { wyckoff: "4b", occupants: {"Zr": 1.0}, positions: [
        [0.0, 0.25, 0.375], [0.0, 0.75, 0.625], [0.5, 0.25, 0.125], [0.5, 0.75, 0.875],
      ] },
      { wyckoff: "16h", occupants: {"O": 1.0}, positions: [
        [0.0, 0.066, 0.6951], [0.0, 0.434, 0.6951], [0.0, 0.566, 0.3049], [0.0, 0.934, 0.3049],
        [0.184, 0.25, 0.0549], [0.184, 0.75, 0.9451], [0.316, 0.25, 0.4451], [0.316, 0.75, 0.5549],
        [0.5, 0.066, 0.8049], [0.5, 0.434, 0.8049], [0.5, 0.566, 0.1951], [0.5, 0.934, 0.1951],
        [0.684, 0.25, 0.4451], [0.684, 0.75, 0.5549], [0.816, 0.25, 0.0549], [0.816, 0.75, 0.9451],
      ] },
    ],
  },
  "zro2-c": {
    kind: "literature",
    source: {"label": "COD 1521753 · Katz 1971", "url": "https://www.crystallography.net/cod/1521753.html"},
    spaceGroup: 225,
    parameters: [5.09, 5.09, 5.09, 90.0, 90.0, 90.0],
    note: "回折文献の立方蛍石型。相の安定性は温度や試料条件に依存します。",
    groups: [
      { wyckoff: "4a", occupants: {"Zr": 1.0}, positions: [
        [0.0, 0.0, 0.0], [0.0, 0.5, 0.5], [0.5, 0.0, 0.5], [0.5, 0.5, 0.0],
      ] },
      { wyckoff: "8c", occupants: {"O": 1.0}, positions: [
        [0.25, 0.25, 0.25], [0.25, 0.25, 0.75], [0.25, 0.75, 0.25], [0.25, 0.75, 0.75],
        [0.75, 0.25, 0.25], [0.75, 0.25, 0.75], [0.75, 0.75, 0.25], [0.75, 0.75, 0.75],
      ] },
    ],
  },
  "zro2-t": {
    kind: "prototype",
    source: {"label": "AFLOW · A2B_tP6_137_d_a-001", "url": "https://www.aflow.org/prototype-encyclopedia/A2B_tP6_137_d_a-001/"},
    spaceGroup: 137,
    parameters: [3.64, 3.64, 5.27, 90.0, 90.0, 90.0],
    groups: [
      { wyckoff: "2a", occupants: {"Zr": 1.0}, positions: [
        [0.25, 0.75, 0.25], [0.75, 0.25, 0.75],
      ] },
      { wyckoff: "4d", occupants: {"O": 1.0}, positions: [
        [0.25, 0.25, 0.065], [0.25, 0.25, 0.565], [0.75, 0.75, 0.435], [0.75, 0.75, 0.935],
      ] },
    ],
  },
  "zro2-m": {
    kind: "prototype",
    source: {"label": "AFLOW · A2B_mP12_14_2e_e-001", "url": "https://www.aflow.org/prototype-encyclopedia/A2B_mP12_14_2e_e-001/"},
    spaceGroup: 14,
    parameters: [5.1505, 5.2116, 5.3173, 90.0, 99.23, 90.0],
    groups: [
      { wyckoff: "4e", occupants: {"O": 1.0}, positions: [
        [0.07, 0.6683, 0.3447], [0.07, 0.8317, 0.8447], [0.93, 0.1683, 0.1553], [0.93, 0.3317, 0.6553],
      ] },
      { wyckoff: "4e", occupants: {"O": 1.0}, positions: [
        [0.4496, 0.2431, 0.4792], [0.4496, 0.2569, 0.9792], [0.5504, 0.7431, 0.0208], [0.5504, 0.7569, 0.5208],
      ] },
      { wyckoff: "4e", occupants: {"Zr": 1.0}, positions: [
        [0.2754, 0.5395, 0.7083], [0.2754, 0.9605, 0.2083], [0.7246, 0.0395, 0.7917], [0.7246, 0.4605, 0.2917],
      ] },
    ],
  },
  "cristobalite-b": {
    kind: "average",
    source: {"label": "AFLOW · A2B_cF24_227_c_a-001", "url": "https://www.aflow.org/prototype-encyclopedia/A2B_cF24_227_c_a-001/"},
    spaceGroup: 227,
    parameters: [7.166, 7.166, 7.166, 90.0, 90.0, 90.0],
    note: "高対称の平均骨格を表示。局所的な酸素変位は含めていません。",
    groups: [
      { wyckoff: "8a", occupants: {"Si": 1.0}, positions: [
        [0.125, 0.125, 0.125], [0.125, 0.625, 0.625], [0.375, 0.375, 0.875], [0.375, 0.875, 0.375],
        [0.625, 0.125, 0.625], [0.625, 0.625, 0.125], [0.875, 0.375, 0.375], [0.875, 0.875, 0.875],
      ] },
      { wyckoff: "16c", occupants: {"O": 1.0}, positions: [
        [0.0, 0.0, 0.0], [0.0, 0.25, 0.25], [0.0, 0.5, 0.5], [0.0, 0.75, 0.75],
        [0.25, 0.0, 0.25], [0.25, 0.25, 0.0], [0.25, 0.5, 0.75], [0.25, 0.75, 0.5],
        [0.5, 0.0, 0.5], [0.5, 0.25, 0.75], [0.5, 0.5, 0.0], [0.5, 0.75, 0.25],
        [0.75, 0.0, 0.75], [0.75, 0.25, 0.5], [0.75, 0.5, 0.25], [0.75, 0.75, 0.0],
      ] },
    ],
  },
  "cristobalite-a": {
    kind: "prototype",
    source: {"label": "AFLOW · A2B_tP12_92_b_a-001", "url": "https://www.aflow.org/prototype-encyclopedia/A2B_tP12_92_b_a-001/"},
    spaceGroup: 92,
    parameters: [4.957, 4.957, 6.8903, 90.0, 90.0, 90.0],
    note: "低温型の一方の鏡像設定を表示。",
    groups: [
      { wyckoff: "4a", occupants: {"Si": 1.0}, positions: [
        [0.1953, 0.8047, 0.25], [0.3047, 0.3047, 0.0], [0.6953, 0.6953, 0.5], [0.8047, 0.1953, 0.75],
      ] },
      { wyckoff: "8b", occupants: {"O": 1.0}, positions: [
        [0.1109, 0.2381, 0.8174], [0.2381, 0.1109, 0.1826], [0.2619, 0.6109, 0.0674], [0.3891, 0.7381, 0.4326],
        [0.6109, 0.2619, 0.9326], [0.7381, 0.3891, 0.5674], [0.7619, 0.8891, 0.6826], [0.8891, 0.7619, 0.3174],
      ] },
    ],
  },
  "quartz-a": {
    kind: "prototype",
    source: {"label": "AFLOW · A2B_hP9_152_c_a-001", "url": "https://www.aflow.org/prototype-encyclopedia/A2B_hP9_152_c_a-001/"},
    spaceGroup: 152,
    parameters: [4.914, 4.914, 5.406, 90.0, 90.0, 120.0],
    note: "一方の鏡像型を表示。",
    groups: [
      { wyckoff: "3a", occupants: {"Si": 1.0}, positions: [
        [0.0, 0.4699, 0.66666667], [0.4699, 0.0, 0.33333333], [0.5301, 0.5301, 0.0],
      ] },
      { wyckoff: "6c", occupants: {"O": 1.0}, positions: [
        [0.1462, 0.7332, 0.45266667], [0.2668, 0.413, 0.786], [0.413, 0.2668, 0.214], [0.587, 0.8538, 0.11933333],
        [0.7332, 0.1462, 0.54733333], [0.8538, 0.587, 0.88066667],
      ] },
    ],
  },
  "yag": {
    kind: "prototype",
    source: {"label": "AFLOW · A5B12C3_cI160_230_ad_h_c-001", "url": "https://www.aflow.org/prototype-encyclopedia/A5B12C3_cI160_230_ad_h_c-001/"},
    spaceGroup: 230,
    parameters: [12.0335, 12.0335, 12.0335, 90.0, 90.0, 90.0],
    groups: [
      { wyckoff: "16a", occupants: {"Al": 1.0}, positions: [
        [0.0, 0.0, 0.0], [0.0, 0.0, 0.5], [0.0, 0.5, 0.0], [0.0, 0.5, 0.5],
        [0.25, 0.25, 0.25], [0.25, 0.25, 0.75], [0.25, 0.75, 0.25], [0.25, 0.75, 0.75],
        [0.5, 0.0, 0.0], [0.5, 0.0, 0.5], [0.5, 0.5, 0.0], [0.5, 0.5, 0.5],
        [0.75, 0.25, 0.25], [0.75, 0.25, 0.75], [0.75, 0.75, 0.25], [0.75, 0.75, 0.75],
      ] },
      { wyckoff: "24c", occupants: {"Y": 1.0}, positions: [
        [0.0, 0.25, 0.125], [0.0, 0.25, 0.625], [0.0, 0.75, 0.375], [0.0, 0.75, 0.875],
        [0.125, 0.0, 0.25], [0.125, 0.5, 0.75], [0.25, 0.125, 0.0], [0.25, 0.375, 0.5],
        [0.25, 0.625, 0.0], [0.25, 0.875, 0.5], [0.375, 0.0, 0.75], [0.375, 0.5, 0.25],
        [0.5, 0.25, 0.375], [0.5, 0.25, 0.875], [0.5, 0.75, 0.125], [0.5, 0.75, 0.625],
        [0.625, 0.0, 0.25], [0.625, 0.5, 0.75], [0.75, 0.125, 0.5], [0.75, 0.375, 0.0],
        [0.75, 0.625, 0.5], [0.75, 0.875, 0.0], [0.875, 0.0, 0.75], [0.875, 0.5, 0.25],
      ] },
      { wyckoff: "24d", occupants: {"Al": 1.0}, positions: [
        [0.0, 0.25, 0.375], [0.0, 0.25, 0.875], [0.0, 0.75, 0.125], [0.0, 0.75, 0.625],
        [0.125, 0.0, 0.75], [0.125, 0.5, 0.25], [0.25, 0.125, 0.5], [0.25, 0.375, 0.0],
        [0.25, 0.625, 0.5], [0.25, 0.875, 0.0], [0.375, 0.0, 0.25], [0.375, 0.5, 0.75],
        [0.5, 0.25, 0.125], [0.5, 0.25, 0.625], [0.5, 0.75, 0.375], [0.5, 0.75, 0.875],
        [0.625, 0.0, 0.75], [0.625, 0.5, 0.25], [0.75, 0.125, 0.0], [0.75, 0.375, 0.5],
        [0.75, 0.625, 0.0], [0.75, 0.875, 0.5], [0.875, 0.0, 0.25], [0.875, 0.5, 0.75],
      ] },
      { wyckoff: "96h", occupants: {"O": 1.0}, positions: [
        [0.04, 0.055, 0.64], [0.04, 0.445, 0.14], [0.04, 0.555, 0.36], [0.04, 0.945, 0.86],
        [0.055, 0.14, 0.96], [0.055, 0.36, 0.46], [0.055, 0.64, 0.04], [0.055, 0.86, 0.54],
        [0.11, 0.195, 0.29], [0.11, 0.305, 0.79], [0.11, 0.695, 0.71], [0.11, 0.805, 0.21],
        [0.14, 0.04, 0.445], [0.14, 0.46, 0.945], [0.14, 0.54, 0.555], [0.14, 0.96, 0.055],
        [0.195, 0.21, 0.61], [0.195, 0.29, 0.11], [0.195, 0.71, 0.39], [0.195, 0.79, 0.89],
        [0.21, 0.11, 0.805], [0.21, 0.39, 0.305], [0.21, 0.61, 0.195], [0.21, 0.89, 0.695],
        [0.29, 0.11, 0.195], [0.29, 0.39, 0.695], [0.29, 0.61, 0.805], [0.29, 0.89, 0.305],
        [0.305, 0.21, 0.39], [0.305, 0.29, 0.89], [0.305, 0.71, 0.61], [0.305, 0.79, 0.11],
        [0.36, 0.04, 0.555], [0.36, 0.46, 0.055], [0.36, 0.54, 0.445], [0.36, 0.96, 0.945],
        [0.39, 0.195, 0.71], [0.39, 0.305, 0.21], [0.39, 0.695, 0.29], [0.39, 0.805, 0.79],
        [0.445, 0.14, 0.04], [0.445, 0.36, 0.54], [0.445, 0.64, 0.96], [0.445, 0.86, 0.46],
        [0.46, 0.055, 0.36], [0.46, 0.445, 0.86], [0.46, 0.555, 0.64], [0.46, 0.945, 0.14],
        [0.54, 0.055, 0.86], [0.54, 0.445, 0.36], [0.54, 0.555, 0.14], [0.54, 0.945, 0.64],
        [0.555, 0.14, 0.54], [0.555, 0.36, 0.04], [0.555, 0.64, 0.46], [0.555, 0.86, 0.96],
        [0.61, 0.195, 0.21], [0.61, 0.305, 0.71], [0.61, 0.695, 0.79], [0.61, 0.805, 0.29],
        [0.64, 0.04, 0.055], [0.64, 0.46, 0.555], [0.64, 0.54, 0.945], [0.64, 0.96, 0.445],
        [0.695, 0.21, 0.89], [0.695, 0.29, 0.39], [0.695, 0.71, 0.11], [0.695, 0.79, 0.61],
        [0.71, 0.11, 0.695], [0.71, 0.39, 0.195], [0.71, 0.61, 0.305], [0.71, 0.89, 0.805],
        [0.79, 0.11, 0.305], [0.79, 0.39, 0.805], [0.79, 0.61, 0.695], [0.79, 0.89, 0.195],
        [0.805, 0.21, 0.11], [0.805, 0.29, 0.61], [0.805, 0.71, 0.89], [0.805, 0.79, 0.39],
        [0.86, 0.04, 0.945], [0.86, 0.46, 0.445], [0.86, 0.54, 0.055], [0.86, 0.96, 0.555],
        [0.89, 0.195, 0.79], [0.89, 0.305, 0.29], [0.89, 0.695, 0.21], [0.89, 0.805, 0.71],
        [0.945, 0.14, 0.46], [0.945, 0.36, 0.96], [0.945, 0.64, 0.54], [0.945, 0.86, 0.04],
        [0.96, 0.055, 0.14], [0.96, 0.445, 0.64], [0.96, 0.555, 0.86], [0.96, 0.945, 0.36],
      ] },
    ],
  },
  "yig": {
    kind: "literature",
    source: {"label": "COD 2101364 · Nakatsuka 1995", "url": "https://www.crystallography.net/cod/2101364.html"},
    spaceGroup: 230,
    parameters: [12.375, 12.375, 12.375, 90.0, 90.0, 90.0],
    groups: [
      { wyckoff: "96h", occupants: {"O": 1.0}, positions: [
        [0.0269, 0.057, 0.6501], [0.0269, 0.443, 0.1501], [0.0269, 0.557, 0.3499], [0.0269, 0.943, 0.8499],
        [0.057, 0.1501, 0.9731], [0.057, 0.3499, 0.4731], [0.057, 0.6501, 0.0269], [0.057, 0.8499, 0.5269],
        [0.0999, 0.193, 0.2769], [0.0999, 0.307, 0.7769], [0.0999, 0.693, 0.7231], [0.0999, 0.807, 0.2231],
        [0.1501, 0.0269, 0.443], [0.1501, 0.4731, 0.943], [0.1501, 0.5269, 0.557], [0.1501, 0.9731, 0.057],
        [0.193, 0.2231, 0.5999], [0.193, 0.2769, 0.0999], [0.193, 0.7231, 0.4001], [0.193, 0.7769, 0.9001],
        [0.2231, 0.0999, 0.807], [0.2231, 0.4001, 0.307], [0.2231, 0.5999, 0.193], [0.2231, 0.9001, 0.693],
        [0.2769, 0.0999, 0.193], [0.2769, 0.4001, 0.693], [0.2769, 0.5999, 0.807], [0.2769, 0.9001, 0.307],
        [0.307, 0.2231, 0.4001], [0.307, 0.2769, 0.9001], [0.307, 0.7231, 0.5999], [0.307, 0.7769, 0.0999],
        [0.3499, 0.0269, 0.557], [0.3499, 0.4731, 0.057], [0.3499, 0.5269, 0.443], [0.3499, 0.9731, 0.943],
        [0.4001, 0.193, 0.7231], [0.4001, 0.307, 0.2231], [0.4001, 0.693, 0.2769], [0.4001, 0.807, 0.7769],
        [0.443, 0.1501, 0.0269], [0.443, 0.3499, 0.5269], [0.443, 0.6501, 0.9731], [0.443, 0.8499, 0.4731],
        [0.4731, 0.057, 0.3499], [0.4731, 0.443, 0.8499], [0.4731, 0.557, 0.6501], [0.4731, 0.943, 0.1501],
        [0.5269, 0.057, 0.8499], [0.5269, 0.443, 0.3499], [0.5269, 0.557, 0.1501], [0.5269, 0.943, 0.6501],
        [0.557, 0.1501, 0.5269], [0.557, 0.3499, 0.0269], [0.557, 0.6501, 0.4731], [0.557, 0.8499, 0.9731],
        [0.5999, 0.193, 0.2231], [0.5999, 0.307, 0.7231], [0.5999, 0.693, 0.7769], [0.5999, 0.807, 0.2769],
        [0.6501, 0.0269, 0.057], [0.6501, 0.4731, 0.557], [0.6501, 0.5269, 0.943], [0.6501, 0.9731, 0.443],
        [0.693, 0.2231, 0.9001], [0.693, 0.2769, 0.4001], [0.693, 0.7231, 0.0999], [0.693, 0.7769, 0.5999],
        [0.7231, 0.0999, 0.693], [0.7231, 0.4001, 0.193], [0.7231, 0.5999, 0.307], [0.7231, 0.9001, 0.807],
        [0.7769, 0.0999, 0.307], [0.7769, 0.4001, 0.807], [0.7769, 0.5999, 0.693], [0.7769, 0.9001, 0.193],
        [0.807, 0.2231, 0.0999], [0.807, 0.2769, 0.5999], [0.807, 0.7231, 0.9001], [0.807, 0.7769, 0.4001],
        [0.8499, 0.0269, 0.943], [0.8499, 0.4731, 0.443], [0.8499, 0.5269, 0.057], [0.8499, 0.9731, 0.557],
        [0.9001, 0.193, 0.7769], [0.9001, 0.307, 0.2769], [0.9001, 0.693, 0.2231], [0.9001, 0.807, 0.7231],
        [0.943, 0.1501, 0.4731], [0.943, 0.3499, 0.9731], [0.943, 0.6501, 0.5269], [0.943, 0.8499, 0.0269],
        [0.9731, 0.057, 0.1501], [0.9731, 0.443, 0.6501], [0.9731, 0.557, 0.8499], [0.9731, 0.943, 0.3499],
      ] },
      { wyckoff: "24c", occupants: {"Y": 1.0}, positions: [
        [0.0, 0.25, 0.125], [0.0, 0.25, 0.625], [0.0, 0.75, 0.375], [0.0, 0.75, 0.875],
        [0.125, 0.0, 0.25], [0.125, 0.5, 0.75], [0.25, 0.125, 0.0], [0.25, 0.375, 0.5],
        [0.25, 0.625, 0.0], [0.25, 0.875, 0.5], [0.375, 0.0, 0.75], [0.375, 0.5, 0.25],
        [0.5, 0.25, 0.375], [0.5, 0.25, 0.875], [0.5, 0.75, 0.125], [0.5, 0.75, 0.625],
        [0.625, 0.0, 0.25], [0.625, 0.5, 0.75], [0.75, 0.125, 0.5], [0.75, 0.375, 0.0],
        [0.75, 0.625, 0.5], [0.75, 0.875, 0.0], [0.875, 0.0, 0.75], [0.875, 0.5, 0.25],
      ] },
      { wyckoff: "24d", occupants: {"Fe": 1.0}, positions: [
        [0.0, 0.25, 0.375], [0.0, 0.25, 0.875], [0.0, 0.75, 0.125], [0.0, 0.75, 0.625],
        [0.125, 0.0, 0.75], [0.125, 0.5, 0.25], [0.25, 0.125, 0.5], [0.25, 0.375, 0.0],
        [0.25, 0.625, 0.5], [0.25, 0.875, 0.0], [0.375, 0.0, 0.25], [0.375, 0.5, 0.75],
        [0.5, 0.25, 0.125], [0.5, 0.25, 0.625], [0.5, 0.75, 0.375], [0.5, 0.75, 0.875],
        [0.625, 0.0, 0.75], [0.625, 0.5, 0.25], [0.75, 0.125, 0.0], [0.75, 0.375, 0.5],
        [0.75, 0.625, 0.0], [0.75, 0.875, 0.5], [0.875, 0.0, 0.25], [0.875, 0.5, 0.75],
      ] },
      { wyckoff: "16a", occupants: {"Fe": 1.0}, positions: [
        [0.0, 0.0, 0.0], [0.0, 0.0, 0.5], [0.0, 0.5, 0.0], [0.0, 0.5, 0.5],
        [0.25, 0.25, 0.25], [0.25, 0.25, 0.75], [0.25, 0.75, 0.25], [0.25, 0.75, 0.75],
        [0.5, 0.0, 0.0], [0.5, 0.0, 0.5], [0.5, 0.5, 0.0], [0.5, 0.5, 0.5],
        [0.75, 0.25, 0.25], [0.75, 0.25, 0.75], [0.75, 0.75, 0.25], [0.75, 0.75, 0.75],
      ] },
    ],
  },
  "magnetoplumbite": {
    kind: "literature",
    source: {"label": "COD 1008326 · Collomb 1986", "url": "https://www.crystallography.net/cod/1008326.html"},
    spaceGroup: 194,
    parameters: [5.929, 5.929, 23.413, 90.0, 90.0, 120.0],
    groups: [
      { wyckoff: "2d", occupants: {"Ba": 1.0}, positions: [
        [0.3334, 0.6667, 0.75], [0.6667, 0.3333, 0.25],
      ] },
      { wyckoff: "2a", occupants: {"Fe": 1.0}, positions: [
        [0.0, 0.0, 0.0], [0.0, 0.0, 0.5],
      ] },
      { wyckoff: "4e", occupants: {"Fe": 0.5}, positions: [
        [0.0, 0.0, 0.239], [0.0, 0.0, 0.261], [0.0, 0.0, 0.739], [0.0, 0.0, 0.761],
      ] },
      { wyckoff: "4f", occupants: {"Fe": 1.0}, positions: [
        [0.3333, 0.6667, 0.0264], [0.3333, 0.6667, 0.4736], [0.6666, 0.3333, 0.5264], [0.6667, 0.3334, 0.9736],
      ] },
      { wyckoff: "4f", occupants: {"Fe": 1.0}, positions: [
        [0.3333, 0.6667, 0.1897], [0.3333, 0.6667, 0.3103], [0.6666, 0.3333, 0.6897], [0.6667, 0.3334, 0.8103],
      ] },
      { wyckoff: "12k", occupants: {"Fe": 1.0}, positions: [
        [0.1667, 0.3334, 0.6081], [0.1667, 0.3334, 0.8919], [0.1667, 0.8333, 0.6081], [0.1667, 0.8333, 0.8919],
        [0.3334, 0.1667, 0.1081], [0.3334, 0.1667, 0.3919], [0.6666, 0.8333, 0.6081], [0.6666, 0.8333, 0.8919],
        [0.8333, 0.1667, 0.1081], [0.8333, 0.1667, 0.3919], [0.8333, 0.6666, 0.1081], [0.8333, 0.6666, 0.3919],
      ] },
      { wyckoff: "4e", occupants: {"O": 1.0}, positions: [
        [0.0, 0.0, 0.151], [0.0, 0.0, 0.349], [0.0, 0.0, 0.651], [0.0, 0.0, 0.849],
      ] },
      { wyckoff: "4f", occupants: {"O": 1.0}, positions: [
        [0.3333, 0.6667, 0.5558], [0.3333, 0.6667, 0.9442], [0.6666, 0.3333, 0.4442], [0.6667, 0.3334, 0.0558],
      ] },
      { wyckoff: "6h", occupants: {"O": 1.0}, positions: [
        [0.183, 0.366, 0.25], [0.183, 0.817, 0.25], [0.366, 0.183, 0.75], [0.634, 0.817, 0.25],
        [0.817, 0.183, 0.75], [0.817, 0.634, 0.75],
      ] },
      { wyckoff: "12k", occupants: {"O": 1.0}, positions: [
        [0.157, 0.314, 0.052], [0.157, 0.314, 0.448], [0.157, 0.843, 0.052], [0.157, 0.843, 0.448],
        [0.314, 0.157, 0.552], [0.314, 0.157, 0.948], [0.686, 0.843, 0.052], [0.686, 0.843, 0.448],
        [0.843, 0.157, 0.552], [0.843, 0.157, 0.948], [0.843, 0.686, 0.552], [0.843, 0.686, 0.948],
      ] },
      { wyckoff: "12k", occupants: {"O": 1.0}, positions: [
        [0.006, 0.503, 0.6494], [0.006, 0.503, 0.8506], [0.497, 0.503, 0.6494], [0.497, 0.503, 0.8506],
        [0.497, 0.994, 0.6494], [0.497, 0.994, 0.8506], [0.503, 0.006, 0.1494], [0.503, 0.006, 0.3506],
        [0.503, 0.497, 0.1494], [0.503, 0.497, 0.3506], [0.994, 0.497, 0.1494], [0.994, 0.497, 0.3506],
      ] },
    ],
  },
  "wc": {
    kind: "literature",
    source: {"label": "COD 1501516 · Litasov 2010 · 300 K", "url": "https://www.crystallography.net/cod/1501516.html"},
    spaceGroup: 187,
    parameters: [2.9059, 2.9059, 2.83767, 90.0, 90.0, 120.0],
    groups: [
      { wyckoff: "1a", occupants: {"W": 1.0}, positions: [
        [0.0, 0.0, 0.0],
      ] },
      { wyckoff: "1f", occupants: {"C": 1.0}, positions: [
        [0.66667, 0.3333, 0.5],
      ] },
    ],
  },
  "cab6": {
    kind: "prototype",
    source: {"label": "AFLOW · A6B_cP7_221_e_b-001", "url": "https://www.aflow.org/prototype-encyclopedia/A6B_cP7_221_e_b-001/"},
    spaceGroup: 221,
    parameters: [4.145, 4.145, 4.145, 90.0, 90.0, 90.0],
    groups: [
      { wyckoff: "1b", occupants: {"Ca": 1.0}, positions: [
        [0.5, 0.5, 0.5],
      ] },
      { wyckoff: "6e", occupants: {"B": 1.0}, positions: [
        [0.0, 0.0, 0.2883], [0.0, 0.0, 0.7117], [0.0, 0.2883, 0.0], [0.0, 0.7117, 0.0],
        [0.2883, 0.0, 0.0], [0.7117, 0.0, 0.0],
      ] },
    ],
  },
  "alb2": {
    kind: "prototype",
    source: {"label": "AFLOW · AB2_hP3_191_a_d-001", "url": "https://www.aflow.org/prototype-encyclopedia/AB2_hP3_191_a_d-001/"},
    spaceGroup: 191,
    parameters: [3.005, 3.005, 3.2537, 90.0, 90.0, 120.0],
    groups: [
      { wyckoff: "1a", occupants: {"Al": 1.0}, positions: [
        [0.0, 0.0, 0.0],
      ] },
      { wyckoff: "2d", occupants: {"B": 1.0}, positions: [
        [0.33333333, 0.66666667, 0.5], [0.66666667, 0.33333333, 0.5],
      ] },
    ],
  },
  "mgb2": {
    kind: "literature",
    source: {"label": "COD 1526507 · Jorgensen 2001", "url": "https://www.crystallography.net/cod/1526507.html"},
    spaceGroup: 191,
    parameters: [3.0823, 3.0823, 3.51461, 90.0, 90.0, 120.0],
    groups: [
      { wyckoff: "1a", occupants: {"Mg": 1.0}, positions: [
        [0.0, 0.0, 0.0],
      ] },
      { wyckoff: "2d", occupants: {"B": 1.0}, positions: [
        [0.3333, 0.6667, 0.5], [0.6666, 0.3333, 0.5],
      ] },
    ],
  },
  "nb3sn": {
    kind: "literature",
    source: {"label": "COD 1538679 · Mailfert 1969", "url": "https://www.crystallography.net/cod/1538679.html"},
    spaceGroup: 223,
    parameters: [5.2821, 5.2821, 5.2821, 90.0, 90.0, 90.0],
    groups: [
      { wyckoff: "6c", occupants: {"Nb": 1.0}, positions: [
        [0.0, 0.5, 0.25], [0.0, 0.5, 0.75], [0.25, 0.0, 0.5], [0.5, 0.25, 0.0],
        [0.5, 0.75, 0.0], [0.75, 0.0, 0.5],
      ] },
      { wyckoff: "2a", occupants: {"Sn": 1.0}, positions: [
        [0.0, 0.0, 0.0], [0.5, 0.5, 0.5],
      ] },
    ],
  },
  "cr3si": {
    kind: "prototype",
    source: {"label": "AFLOW · A3B_cP8_223_c_a-001", "url": "https://www.aflow.org/prototype-encyclopedia/A3B_cP8_223_c_a-001/"},
    spaceGroup: 223,
    parameters: [4.556, 4.556, 4.556, 90.0, 90.0, 90.0],
    groups: [
      { wyckoff: "2a", occupants: {"Si": 1.0}, positions: [
        [0.0, 0.0, 0.0], [0.5, 0.5, 0.5],
      ] },
      { wyckoff: "6c", occupants: {"Cr": 1.0}, positions: [
        [0.0, 0.5, 0.25], [0.0, 0.5, 0.75], [0.25, 0.0, 0.5], [0.5, 0.25, 0.0],
        [0.5, 0.75, 0.0], [0.75, 0.0, 0.5],
      ] },
    ],
  },
  "na3as": {
    kind: "literature",
    source: {"label": "COD 1010293 · Brauer 1937", "url": "https://www.crystallography.net/cod/1010293.html"},
    spaceGroup: 194,
    parameters: [5.088, 5.088, 8.982, 90.0, 90.0, 120.0],
    groups: [
      { wyckoff: "2c", occupants: {"As": 1.0}, positions: [
        [0.3333, 0.6667, 0.25], [0.6666, 0.3333, 0.75],
      ] },
      { wyckoff: "2b", occupants: {"Na": 1.0}, positions: [
        [0.0, 0.0, 0.25], [0.0, 0.0, 0.75],
      ] },
      { wyckoff: "4f", occupants: {"Na": 1.0}, positions: [
        [0.3333, 0.6667, 0.583], [0.3333, 0.6667, 0.917], [0.6666, 0.3333, 0.083], [0.6667, 0.3334, 0.417],
      ] },
    ],
  },
  "laf3": {
    kind: "literature",
    source: {"label": "COD 9011159 · Cheetham 1976", "url": "https://www.crystallography.net/cod/9011159.html"},
    spaceGroup: 165,
    parameters: [7.185, 7.185, 7.351, 90.0, 90.0, 120.0],
    groups: [
      { wyckoff: "6f", occupants: {"La": 1.0}, positions: [
        [0.0, 0.3391, 0.75], [0.0, 0.6609, 0.25], [0.3391, 0.0, 0.75], [0.3391, 0.3391, 0.25],
        [0.6609, 0.0, 0.25], [0.6609, 0.6609, 0.75],
      ] },
      { wyckoff: "12g", occupants: {"F": 1.0}, positions: [
        [0.054, 0.3667, 0.4176], [0.054, 0.6873, 0.9176], [0.3127, 0.3667, 0.9176], [0.3127, 0.946, 0.4176],
        [0.3667, 0.054, 0.0824], [0.3667, 0.3127, 0.5824], [0.6333, 0.6873, 0.4176], [0.6333, 0.946, 0.9176],
        [0.6873, 0.054, 0.5824], [0.6873, 0.6333, 0.0824], [0.946, 0.3127, 0.0824], [0.946, 0.6333, 0.5824],
      ] },
      { wyckoff: "4d", occupants: {"F": 1.0}, positions: [
        [0.33333, 0.66667, 0.1855], [0.33333, 0.66667, 0.6855], [0.66667, 0.33333, 0.3145], [0.66667, 0.33333, 0.8145],
      ] },
      { wyckoff: "2a", occupants: {"F": 1.0}, positions: [
        [0.0, 0.0, 0.25], [0.0, 0.0, 0.75],
      ] },
    ],
  },
  "yf3": {
    kind: "literature",
    source: {"label": "COD 9017377 · Cheetham 1974", "url": "https://www.crystallography.net/cod/9017377.html"},
    spaceGroup: 62,
    parameters: [6.3537, 6.8545, 4.3953, 90.0, 90.0, 90.0],
    groups: [
      { wyckoff: "4c", occupants: {"Y": 1.0}, positions: [
        [0.1327, 0.75, 0.5591], [0.3673, 0.25, 0.0591], [0.6327, 0.75, 0.9409], [0.8673, 0.25, 0.4409],
      ] },
      { wyckoff: "4c", occupants: {"F": 1.0}, positions: [
        [0.0227, 0.25, 0.909], [0.4773, 0.75, 0.409], [0.5227, 0.25, 0.591], [0.9773, 0.75, 0.091],
      ] },
      { wyckoff: "8d", occupants: {"F": 1.0}, positions: [
        [0.1652, 0.0643, 0.3755], [0.1652, 0.4357, 0.3755], [0.3348, 0.5643, 0.8755], [0.3348, 0.9357, 0.8755],
        [0.6652, 0.0643, 0.1245], [0.6652, 0.4357, 0.1245], [0.8348, 0.5643, 0.6245], [0.8348, 0.9357, 0.6245],
      ] },
    ],
  },
  "la2o3-a": {
    kind: "prototype",
    source: {"label": "AFLOW · A2B3_hP5_164_d_ad-001", "url": "https://www.aflow.org/prototype-encyclopedia/A2B3_hP5_164_d_ad-001/"},
    spaceGroup: 164,
    parameters: [3.9381, 3.9381, 6.1361, 90.0, 90.0, 120.0],
    groups: [
      { wyckoff: "1a", occupants: {"O": 1.0}, positions: [
        [3.33e-06, 0.99999667, 0.0],
      ] },
      { wyckoff: "2d", occupants: {"La": 1.0}, positions: [
        [0.33333333, 0.66666667, 0.2467], [0.66666667, 0.33333333, 0.7533],
      ] },
      { wyckoff: "2d", occupants: {"O": 1.0}, positions: [
        [0.33333333, 0.66666667, 0.647], [0.66666667, 0.33333333, 0.353],
      ] },
    ],
  },
  "mgf2": {
    kind: "literature",
    source: {"label": "COD 9007534 · Baur 1971", "url": "https://www.crystallography.net/cod/9007534.html"},
    spaceGroup: 136,
    parameters: [4.6213, 4.6213, 3.0159, 90.0, 90.0, 90.0],
    groups: [
      { wyckoff: "2a", occupants: {"Mg": 1.0}, positions: [
        [0.0, 0.0, 0.0], [0.5, 0.5, 0.5],
      ] },
      { wyckoff: "4f", occupants: {"F": 1.0}, positions: [
        [0.1972, 0.8028, 0.5], [0.3028, 0.3028, 0.0], [0.6972, 0.6972, 0.0], [0.8028, 0.1972, 0.5],
      ] },
    ],
  },
  "mgh2": {
    kind: "literature",
    source: {"label": "COD 4124639 · Ellinger 1955", "url": "https://www.crystallography.net/cod/4124639.html"},
    spaceGroup: 136,
    parameters: [4.5168, 4.5168, 3.0205, 90.0, 90.0, 90.0],
    groups: [
      { wyckoff: "4f", occupants: {"H": 1.0}, positions: [
        [0.194, 0.806, 0.5], [0.306, 0.306, 0.0], [0.694, 0.694, 0.0], [0.806, 0.194, 0.5],
      ] },
      { wyckoff: "2a", occupants: {"Mg": 1.0}, positions: [
        [0.0, 0.0, 0.0], [0.5, 0.5, 0.5],
      ] },
    ],
  },
  "sno2": {
    kind: "literature",
    source: {"label": "COD 1000062 · Baur 1971", "url": "https://www.crystallography.net/cod/1000062.html"},
    spaceGroup: 136,
    parameters: [4.738, 4.738, 3.1865, 90.0, 90.0, 90.0],
    groups: [
      { wyckoff: "2a", occupants: {"Sn": 1.0}, positions: [
        [0.0, 0.0, 0.0], [0.5, 0.5, 0.5],
      ] },
      { wyckoff: "4f", occupants: {"O": 1.0}, positions: [
        [0.1929, 0.8071, 0.5], [0.3071, 0.3071, 0.0], [0.6929, 0.6929, 0.0], [0.8071, 0.1929, 0.5],
      ] },
    ],
  },
  "pbo2-beta": {
    kind: "literature",
    source: {"label": "COD 9011216 · D'Antonio P 1980", "url": "https://www.crystallography.net/cod/9011216.html"},
    spaceGroup: 136,
    parameters: [4.9578, 4.9578, 3.3878, 90.0, 90.0, 90.0],
    groups: [
      { wyckoff: "2a", occupants: {"Pb": 1.0}, positions: [
        [0.0, 0.0, 0.0], [0.5, 0.5, 0.5],
      ] },
      { wyckoff: "4f", occupants: {"O": 1.0}, positions: [
        [0.1933, 0.8067, 0.5], [0.3067, 0.3067, 0.0], [0.6933, 0.6933, 0.0], [0.8067, 0.1933, 0.5],
      ] },
    ],
  },
  "cu3n": {
    kind: "literature",
    source: {"label": "COD 1536894 · Zachwieja 1990", "url": "https://www.crystallography.net/cod/1536894.html"},
    spaceGroup: 221,
    parameters: [3.814, 3.814, 3.814, 90.0, 90.0, 90.0],
    groups: [
      { wyckoff: "1a", occupants: {"N": 1.0}, positions: [
        [0.0, 0.0, 0.0],
      ] },
      { wyckoff: "3d", occupants: {"Cu": 1.0}, positions: [
        [0.0, 0.0, 0.5], [0.0, 0.5, 0.0], [0.5, 0.0, 0.0],
      ] },
    ],
  },
};
