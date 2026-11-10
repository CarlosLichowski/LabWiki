// reactivosCatalogos.ts

export interface PruebaPlanta {
  id?: number;
  codigo: string;
  nombre: string;
  acn: number;
  unidad: 'c5-1' | 'ISE1';
}

export const CATALAGO_PRUEBAS_PLANTA: PruebaPlanta[] = [
  // --- MÓDULO c5-1 (Página 1) ---
  { id: 1, codigo: 'ALBT2', nombre: 'Albúmina Sérica', acn: 20060, unidad: 'c5-1' },
  { id: 2, codigo: 'ALBT2U', nombre: 'Albúmina U', acn: 20061, unidad: 'c5-1' },
  { id: 3, codigo: 'ALB2-G', nombre: 'Albúmina G', acn: 20090, unidad: 'c5-1' },
  { id: 4, codigo: 'ALP2', nombre: 'Fosfatasa Alcalina', acn: 20110, unidad: 'c5-1' },
  { id: 5, codigo: 'AMYL2', nombre: 'Amilasa Total', acn: 20170, unidad: 'c5-1' },
  { id: 6, codigo: 'AMYL2U', nombre: 'Amilasa Urinaria', acn: 20171, unidad: 'c5-1' },
  { id: 7, codigo: 'APOAT', nombre: 'Apolipoproteína A1', acn: 20190, unidad: 'c5-1' },
  { id: 8, codigo: 'APOBT', nombre: 'Apolipoproteína B', acn: 20200, unidad: 'c5-1' },
  { id: 9, codigo: 'ASLOT', nombre: 'Estreptolisina O (ASO)', acn: 20210, unidad: 'c5-1' },
  { id: 10, codigo: 'ASTP2', nombre: 'GOT / AST', acn: 20230, unidad: 'c5-1' },
  { id: 11, codigo: 'B2MG', nombre: 'Beta-2 Microglobulina', acn: 20250, unidad: 'c5-1' },
  { id: 12, codigo: 'B2MGU', nombre: 'Beta-2 Microglobulina Urinaria', acn: 20251, unidad: 'c5-1' },
  { id: 13, codigo: 'BILD2-D', nombre: 'Bilirrubina Directa', acn: 20300, unidad: 'c5-1' },
  { id: 14, codigo: 'BILT3', nombre: 'Bilirrubina Total', acn: 20310, unidad: 'c5-1' },
  { id: 15, codigo: 'C3C-2', nombre: 'Complemento C3', acn: 20320, unidad: 'c5-1' },
  { id: 16, codigo: 'C4-2', nombre: 'Complemento C4', acn: 20330, unidad: 'c5-1' },
  { id: 17, codigo: 'CA2', nombre: 'Calcio Sérico', acn: 20340, unidad: 'c5-1' },
  { id: 18, codigo: 'CA2U', nombre: 'Calcio Urinario', acn: 20341, unidad: 'c5-1' },
  { id: 19, codigo: 'CARB-4', nombre: 'Carbamazepina', acn: 20351, unidad: 'c5-1' },
  { id: 20, codigo: 'CHOL2-A', nombre: 'Colesterol Total Enzimático', acn: 20410, unidad: 'c5-1' },
  { id: 21, codigo: 'CK2', nombre: 'Creatina Kinasa (CK)', acn: 20420, unidad: 'c5-1' },

  // --- MÓDULO c5-1 (Página 2) ---
  { id: 22, codigo: 'CREJ2', nombre: 'Creatinina Jaffe Compensada', acn: 20470, unidad: 'c5-1' },
  { id: 23, codigo: 'CREJ2U', nombre: 'Creatinina Jaffe Urinaria', acn: 20471, unidad: 'c5-1' },
  { id: 24, codigo: 'CRP-HS', nombre: 'PCR Alta Sensibilidad', acn: 20480, unidad: 'c5-1' },
  { id: 25, codigo: 'CRP4', nombre: 'Proteína C Reactiva', acn: 20500, unidad: 'c5-1' },
  { id: 26, codigo: 'FRA', nombre: 'Fructosamina', acn: 20580, unidad: 'c5-1' },
  { id: 27, codigo: 'GGT2-I', nombre: 'Gamma GT', acn: 20600, unidad: 'c5-1' },
  { id: 28, codigo: 'GLUC3', nombre: 'Glucosa HK (Hexoquinasa)', acn: 20630, unidad: 'c5-1' },
  { id: 29, codigo: 'GLUC3U', nombre: 'Glucosa Urinaria', acn: 20631, unidad: 'c5-1' },
  { id: 30, codigo: 'A1W3', nombre: 'Hemoglobina A1c', acn: 20661, unidad: 'c5-1' },
  { id: 31, codigo: 'HDLC4', nombre: 'HDL Colesterol Directo', acn: 20710, unidad: 'c5-1' },
  { id: 32, codigo: 'IGA2', nombre: 'Inmunoglobulina A', acn: 20720, unidad: 'c5-1' },
  { id: 33, codigo: 'IGG2', nombre: 'Inmunoglobulina G', acn: 20740, unidad: 'c5-1' },
  { id: 34, codigo: 'IGM2', nombre: 'Inmunoglobulina M', acn: 20750, unidad: 'c5-1' },
  { id: 35, codigo: 'LDHI2', nombre: 'Lactato Deshidrogenasa (LDH)', acn: 20810, unidad: 'c5-1' },
  { id: 36, codigo: 'LDLC3', nombre: 'LDL Colesterol Directo', acn: 20820, unidad: 'c5-1' },
  { id: 37, codigo: 'MG2', nombre: 'Magnesio Sérico', acn: 20890, unidad: 'c5-1' },
  { id: 38, codigo: 'MG2U', nombre: 'Magnesio Urinario', acn: 20891, unidad: 'c5-1' },
  { id: 39, codigo: 'PHNO2', nombre: 'Fenobarbital', acn: 20970, unidad: 'c5-1' },
  { id: 40, codigo: 'PHNY2', nombre: 'Fenitoína', acn: 20980, unidad: 'c5-1' },
  { id: 41, codigo: 'PHOS2', nombre: 'Fósforo Sérico', acn: 20990, unidad: 'c5-1' },
  { id: 42, codigo: 'PHOS2U', nombre: 'Fósforo Urinario', acn: 20991, unidad: 'c5-1' },
  { id: 43, codigo: 'RF-II', nombre: 'Factor Reumatoideo', acn: 21040, unidad: 'c5-1' },
  { id: 44, codigo: 'TP2', nombre: 'Proteínas Totales', acn: 21110, unidad: 'c5-1' },

  // --- MÓDULO c5-1 (Página 3) ---
  { id: 45, codigo: 'TPU3', nombre: 'Proteínas en Orina', acn: 21122, unidad: 'c5-1' },
  { id: 46, codigo: 'TPC3', nombre: 'Proteínas en LCR', acn: 21123, unidad: 'c5-1' },
  { id: 47, codigo: 'TRIGL', nombre: 'Triglicéridos Enzimático', acn: 21130, unidad: 'c5-1' },
  { id: 48, codigo: 'UA2', nombre: 'Ácido Úrico Enzimático', acn: 21170, unidad: 'c5-1' },
  { id: 49, codigo: 'UA2U', nombre: 'Ácido Úrico Urinario', acn: 21171, unidad: 'c5-1' },
  { id: 50, codigo: 'UREAL', nombre: 'Urea / BUN Cinética UV', acn: 21190, unidad: 'c5-1' },
  { id: 51, codigo: 'URELU', nombre: 'Urea Urinaria', acn: 21191, unidad: 'c5-1' },
  { id: 52, codigo: 'VALP2', nombre: 'Ácido Valproico', acn: 21200, unidad: 'c5-1' },
  { id: 53, codigo: 'VAN C3O', nombre: 'Vancomicina TDM', acn: 21211, unidad: 'c5-1' },

  // --- MÓDULO ISE1 (Electrodos - Página 3 y 4) ---
  { id: 54, codigo: 'ISE NA', nombre: 'Sodio Sérico (Na)', acn: 29070, unidad: 'ISE1' },
  { id: 55, codigo: 'ISE NA-U', nombre: 'Sodio Urinario (Na-U)', acn: 29071, unidad: 'ISE1' },
  { id: 56, codigo: 'ISE K', nombre: 'Potasio Sérico (K)', acn: 29080, unidad: 'ISE1' },
  { id: 57, codigo: 'ISE K-U', nombre: 'Potasio Urinario (K-U)', acn: 29081, unidad: 'ISE1' },
  { id: 58, codigo: 'ISE CL', nombre: 'Cloro Sérico (Cl)', acn: 29090, unidad: 'ISE1' },
  { id: 59, codigo: 'ISE CL-U', nombre: 'Cloro Urinario (Cl-U)', acn: 29091, unidad: 'ISE1' },
];
