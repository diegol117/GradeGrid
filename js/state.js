export const DEFAULT_STATE = {
  courseName: 'Elementos Discretos I - Sección 01',
  courseMax: 20,
  coursePass: 10,
  evaluations: [
    { id: 'e1', name: 'Parcial 1',   weight: 4, maxScale: 20 },
    { id: 'e2', name: 'Parcial 2',   weight: 4, maxScale: 20 },
    { id: 'e3', name: 'Taller 1',    weight: 4, maxScale: 20 },
    { id: 'e4', name: 'Proyecto',    weight: 4, maxScale: 20 },
    { id: 'e5', name: 'Examen Final',weight: 4, maxScale: 20 }
  ],
  students: [
    { id: '001', name: 'Ana Sofía Mendoza',     grades: { e1: 18, e2: 16, e3: 20, e4: 17, e5: 17 } },
    { id: '002', name: 'Carlos Eduardo Rojas',  grades: { e1: 10, e2: 8,  e3: 11, e4: 9,  e5: 10 } },
    { id: '003', name: 'Valeria Isabel Torres', grades: { e1: 7,  e2: 9,  e3: 8,  e4: 6,  e5: 9  } },
    { id: '004', name: 'Luis Alejandro Gómez',  grades: { e1: 14, e2: 15, e3: 16, e4: 14, e5: 15 } },
    { id: '005', name: 'Mariana Gabriela Silva',grades: { e1: 12, e2: 11, e3: 14, e4: 13, e5: 11 } }
  ]
};

const deepClone = (obj) => JSON.parse(JSON.stringify(obj));

/**
 * Estado mutable compartido. Se muta *in-place* para que las referencias
 * importadas en otros módulos sigan siendo válidas.
 */
export const state = deepClone(DEFAULT_STATE);

export function resetState() {
  const fresh = deepClone(DEFAULT_STATE);
  Object.keys(state).forEach((k) => delete state[k]);
  Object.assign(state, fresh);
  return state;
}