// src/components/ChatbotRAG/types.ts

export type TipoFuente = 'inserto' | 'manual' | 'derivacion' | 'base_de_datos';

export interface FuenteRAG {
  tipo: TipoFuente;
  titulo: string;
  archivoFuente: string;
  seccion: string;
  fragmento: string;
}

export interface MensajeChatbot {
  id: string;
  remitente: 'usuario' | 'asistente';
  texto: string;
  timestamp: string;
  fuentes?: FuenteRAG[];
  sugerencias?: string[];
  metadatos?: {
    modelo?: string;
    tiempoRespuestaMs?: number;
    consultaBaseDeDatos?: boolean;
  };
  esError?: boolean;
}

export type FiltroContexto = 'todos' | 'insertos' | 'manuales' | 'metricas' | 'derivaciones';

export interface ChatbotAPIResponse {
  status: 'SUCCESS' | 'PARTIAL' | 'ERROR';
  mensaje?: string;
  data: {
    status: string;
    respuesta: string;
    fuentes: FuenteRAG[];
    sugerencias: string[];
    metadatos: {
      modelo: string;
      tiempoRespuestaMs: number;
      fragmentosRecuperados: number;
      consultaBaseDeDatos: boolean;
    };
  };
}
