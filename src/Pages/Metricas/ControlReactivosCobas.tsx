// src/components/cobas/ControlReactivosCobas.tsx
// Sistema de Control Analítico de Reactivos y Auditoría de Inventario Roche Cobas 6000 (c501 / ISE1)
import React, { useState, useEffect, useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  AreaChart,
  Area,
} from 'recharts';
import {
  Activity,
  Layers,
  Database,
  Download,
  RotateCcw,
  Save,
  Search,
  CheckCircle2,
  Server,
  TrendingDown,
  BarChart3,
  ClipboardList,
  AlertCircle,
  FileSpreadsheet,
  UploadCloud,
} from 'lucide-react';
import { CATALAGO_PRUEBAS_PLANTA, type PruebaPlanta } from '../../../utils/reactivosCatalogos';
import './ControlReactivosCobas.css';

export interface FilaInventarioInput {
  prueba: PruebaPlanta;
  recuentoAnterior: number;
  recuentoActual: number | '';
  consumoReal: number;
  rutina: number;
  reproc: number;
  urg: number;
  calib: number;
  cc: number;
  loteReactivo: string;
  observaciones: string;
}

export interface RegistroHistoricoCobas {
  periodo: string;
  fecha_cierre: string;
  prueba_id: number;
  prueba_codigo: string;
  prueba_nombre: string;
  acn: number;
  unidad: 'c5-1' | 'ISE1';
  recuento_anterior: number;
  recuento_actual: number;
  consumo_real: number;
  rutina: number;
  reproc: number;
  urg: number;
  calib: number;
  cc: number;
  tasa_reproceso_pct?: number;
  lote_reactivo?: string;
  observaciones?: string;
  usuario?: string;
}

interface TendenciaMensualItem {
  periodo: string;
  total_consumo_real: number;
  total_rutina: number;
  total_urgencias: number;
  total_reprocesos: number;
  tasa_reproceso_pct: number;
}

interface TopAnalitoItem {
  prueba_id: number;
  codigo: string;
  nombre: string;
  acn: number;
  unidad: 'c5-1' | 'ISE1';
  consumo_real: number;
  reprocesos: number;
  tasa_reproceso: number;
}

export const ControlReactivosCobas: React.FC<{ tabInicial?: 'metricas' | 'carga' }> = ({
  tabInicial = 'metricas',
}) => {
  const [pestanaActiva, setPestanaActiva] = useState<'metricas' | 'carga'>(tabInicial);
  const [filtroUnidad, setFiltroUnidad] = useState<'todos' | 'c5-1' | 'ISE1'>('todos');
  const [periodoCarga, setPeriodoCarga] = useState<string>('2026-11');
  const [fechaCierre, setFechaCierre] = useState<string>(new Date().toISOString().slice(0, 10));
  const [observacionesCierre, setObservacionesCierre] = useState<string>('');
  const [operadorCierre, setOperadorCierre] = useState<string>('Bioq. Ramos');

  // ESTADOS SIN MOCK / DATOS REALES DE BD
  const [historico, setHistorico] = useState<RegistroHistoricoCobas[]>([]);
  const [filasCarga, setFilasCarga] = useState<FilaInventarioInput[]>([]);
  const [tendenciaMensual, setTendenciaMensual] = useState<TendenciaMensualItem[]>([]);
  const [topAnalitos, setTopAnalitos] = useState<TopAnalitoItem[]>([]);
  const [conexionBackend, setConexionBackend] = useState<boolean | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [guardando, setGuardando] = useState<boolean>(false);
  const [subiendoArchivo, setSubiendoArchivo] = useState<boolean>(false);
  const [alertaMensaje, setAlertaMensaje] = useState<{ tipo: 'success' | 'info' | 'error'; texto: string } | null>(null);
  const [busquedaHistorico, setBusquedaHistorico] = useState<string>('');
  const [filtroMesHistorico, setFiltroMesHistorico] = useState<string>('todos');

 const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

  // 1. Inicialización de la planilla a partir del catálogo
  useEffect(() => {
    const inicializarPlanilla = (recuentosAnterioresMap?: Map<number, number>) => {
      const nuevasFilas: FilaInventarioInput[] = CATALAGO_PRUEBAS_PLANTA.map((p, idx) => {
        const idPrueba = p.id || idx + 1;
        let recAnterior = 0;

        if (recuentosAnterioresMap && recuentosAnterioresMap.has(idPrueba)) {
          recAnterior = recuentosAnterioresMap.get(idPrueba)!;
        } else {
          const anteriorEnHistorial = historico.find(
            (h) => h.prueba_id === idPrueba || h.prueba_codigo === p.codigo
          );
          if (anteriorEnHistorial) {
            recAnterior = anteriorEnHistorial.recuento_actual;
          }
        }

        return {
          prueba: { ...p, id: idPrueba },
          recuentoAnterior: recAnterior,
          recuentoActual: '',
          consumoReal: 0,
          rutina: 0,
          reproc: 0,
          urg: 0,
          calib: 0,
          cc: 0,
          loteReactivo: '',
          observaciones: '',
        };
      });

      setFilasCarga(nuevasFilas);
    };

    inicializarPlanilla();
  }, [periodoCarga, historico]);

  // 2. Cargar datos desde Backend MySQL
  const cargarDatosServidor = async () => {
    setLoading(true);
    try {
      const [resHistorico, resMetricas] = await Promise.all([
        fetch(`${API_URL}/cierres-mensuales/historico`).catch(() => null),
        fetch(`${API_URL}/metricas/consumos-mensuales`).catch(() => null),
      ]);

      if (resHistorico && resHistorico.ok && resMetricas && resMetricas.ok) {
        const dataHist = await resHistorico.json();
        const dataMetr = await resMetricas.json();

        setHistorico(dataHist.data || []);
        if (dataMetr.data) {
          setTendenciaMensual(dataMetr.data.tendencia_mensual || []);
          setTopAnalitos(dataMetr.data.top_analitos_consumo || []);
        }
        setConexionBackend(true);
      } else {
        setConexionBackend(false);
        setHistorico([]);
        setTendenciaMensual([]);
        setTopAnalitos([]);
      }
    } catch (err) {
      console.warn('Conexión con el backend no disponible:', err);
      setConexionBackend(false);
      setHistorico([]);
      setTendenciaMensual([]);
      setTopAnalitos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatosServidor();
  }, []);

  // 3. Manejo de cambios en planilla (Lógica Diferencial)
  const handleRecuentoActualChange = (index: number, valorStr: string) => {
    setFilasCarga((prev) => {
      const actualizadas = [...prev];
      const fila = { ...actualizadas[index] };

      if (valorStr === '') {
        fila.recuentoActual = '';
        fila.consumoReal = 0;
      } else {
        const valNum = Number(valorStr);
        fila.recuentoActual = isNaN(valNum) ? 0 : valNum;
        fila.consumoReal = fila.recuentoAnterior - (isNaN(valNum) ? 0 : valNum);
      }

      actualizadas[index] = fila;
      return actualizadas;
    });
  };

  const handleRecuentoAnteriorChange = (index: number, valorStr: string) => {
    setFilasCarga((prev) => {
      const actualizadas = [...prev];
      const fila = { ...actualizadas[index] };
      const valNum = Number(valorStr) || 0;
      fila.recuentoAnterior = valNum;

      if (fila.recuentoActual !== '') {
        fila.consumoReal = valNum - Number(fila.recuentoActual);
      }

      actualizadas[index] = fila;
      return actualizadas;
    });
  };

  const handleCampoDetalleChange = (
    index: number,
    campo: 'rutina' | 'reproc' | 'urg' | 'calib' | 'cc' | 'loteReactivo' | 'observaciones',
    valor: any
  ) => {
    setFilasCarga((prev) => {
      const actualizadas = [...prev];
      actualizadas[index] = {
        ...actualizadas[index],
        [campo]: valor,
      };
      return actualizadas;
    });
  };

  // 4. Precargar recuentos del mes anterior desde MySQL
  const precargarRecuentosMesAnterior = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/cierres-mensuales/ultimo-recuento?periodo=${periodoCarga}`);
      if (res.ok) {
        const resData = await res.json();
        const mapa = new Map<number, number>();
        resData.data.forEach((item: any) => {
          mapa.set(item.prueba_id, item.recuento_anterior);
        });

        setFilasCarga((prev) =>
          prev.map((fila) => {
            const idPrueba = fila.prueba.id || 0;
            const recAnt = mapa.has(idPrueba) ? mapa.get(idPrueba)! : fila.recuentoAnterior;
            const consReal = fila.recuentoActual !== '' ? recAnt - Number(fila.recuentoActual) : 0;
            return {
              ...fila,
              recuentoAnterior: recAnt,
              consumoReal: consReal,
            };
          })
        );

        setAlertaMensaje({
          tipo: 'success',
          texto: `Recuentos del mes anterior para el período ${periodoCarga} cargados exitosamente.`,
        });
      } else {
        setAlertaMensaje({
          tipo: 'info',
          texto: 'No se encontraron recuentos anteriores registrados en la base de datos.',
        });
      }
    } catch (e) {
      console.error(e);
      setAlertaMensaje({
        tipo: 'error',
        texto: 'Error al conectar con la BD para traer recuentos anteriores.',
      });
    } finally {
      setLoading(false);
    }
  };

  // 5. Carga por Pendrive (Importación CSV/TXT de Cobas)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('archivo', file);

    setSubiendoArchivo(true);
    setAlertaMensaje({
      tipo: 'info',
      texto: 'Procesando e importando reporte del pendrive Cobas c 501...',
    });

    try {
      const response = await fetch(`${API_URL}/cierres-mensuales/importar-csv`, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok && result.status === 'SUCCESS') {
        setAlertaMensaje({
          tipo: 'success',
          texto: `¡Importación masiva exitosa! Se procesaron ${result.total_filas} filas del Cobas.`,
        });
        cargarDatosServidor();
      } else {
        setAlertaMensaje({
          tipo: 'error',
          texto: `Error al procesar el archivo: ${result.mensaje || 'Formato no soportado'}`,
        });
      }
    } catch (error) {
      console.error('Error al subir el archivo:', error);
      setAlertaMensaje({
        tipo: 'error',
        texto: 'Error de red al intentar conectar con el servidor backend.',
      });
    } finally {
      setSubiendoArchivo(false);
      e.target.value = '';
    }
  };

  // 6. Guardar cierre mensual en MySQL
  const guardarCierreMensual = async (e: React.FormEvent) => {
    e.preventDefault();

    const filasValidas = filasCarga.filter((f) => f.recuentoActual !== '');

    if (filasValidas.length === 0) {
      alert('Por favor ingrese al menos un Recuento Actual para procesar el cierre del mes.');
      return;
    }

    setGuardando(true);

    const payload = {
      periodo: periodoCarga,
      fecha_cierre: fechaCierre,
      usuario: operadorCierre,
      observaciones_generales: observacionesCierre,
      lecturas: filasValidas.map((f) => ({
        prueba_id: f.prueba.id || 1,
        recuento_anterior: f.recuentoAnterior,
        recuento_actual: Number(f.recuentoActual),
        rutina: f.rutina,
        reproc: f.reproc,
        urg: f.urg,
        calib: f.calib,
        cc: f.cc,
        lote_reactivo: f.loteReactivo || undefined,
        observaciones: f.observaciones || undefined,
      })),
    };

    try {
      const res = await fetch(`${API_URL}/cierres-mensuales/lote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setAlertaMensaje({
          tipo: 'success',
          texto: `¡Cierre mensual ${periodoCarga} guardado con éxito en MySQL (${filasValidas.length} reactivos auditados)!`,
        });
        cargarDatosServidor();
      } else {
        throw new Error('Error al guardar en base de datos.');
      }
    } catch (err) {
      setAlertaMensaje({
        tipo: 'error',
        texto: 'No se pudo guardar el cierre. Verifique la conexión con la base de datos MySQL.',
      });
    } finally {
      setGuardando(false);
    }
  };

  // 7. Exportar histórico a CSV
  const exportarHistoricoCSV = () => {
    if (historico.length === 0) {
      alert('No hay registros históricos en la base de datos para exportar.');
      return;
    }

    const encabezados = [
      'Periodo',
      'Fecha_Cierre',
      'Codigo_Roche',
      'ACN',
      'Unidad_Cobas',
      'Nombre_Analito',
      'Recuento_Anterior',
      'Recuento_Actual',
      'Consumo_Real_Diferencial',
      'Rutina',
      'Reprocesos',
      'Urgencias',
      'Calibraciones',
      'Controles_CC',
      'Tasa_Reproceso_Pct',
      'Lote_Reactivo',
      'Observaciones',
      'Usuario',
    ];

    const filasCSV = historico.map((h) => [
      `"${h.periodo}"`,
      `"${h.fecha_cierre}"`,
      `"${h.prueba_codigo}"`,
      h.acn,
      `"${h.unidad}"`,
      `"${h.prueba_nombre}"`,
      h.recuento_anterior,
      h.recuento_actual,
      h.consumo_real,
      h.rutina,
      h.reproc,
      h.urg,
      h.calib,
      h.cc,
      h.tasa_reproceso_pct || 0,
      `"${h.lote_reactivo || ''}"`,
      `"${h.observaciones || ''}"`,
      `"${h.usuario || ''}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [encabezados.join(';'), ...filasCSV.map((e) => e.join(';'))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Cobas_Consumo_Real_PowerBy_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const kpisCalculados = useMemo(() => {
    const datosFiltrados =
      filtroUnidad === 'todos'
        ? historico
        : historico.filter((h) => h.unidad === filtroUnidad);

    const totalConsumoReal = datosFiltrados.reduce((acc, h) => acc + h.consumo_real, 0);
    const totalRutina = datosFiltrados.reduce((acc, h) => acc + h.rutina, 0);
    const totalUrg = datosFiltrados.reduce((acc, h) => acc + h.urg, 0);
    const totalReproc = datosFiltrados.reduce((acc, h) => acc + h.reproc, 0);
    const totalCalib = datosFiltrados.reduce((acc, h) => acc + h.calib, 0);
    const totalCC = datosFiltrados.reduce((acc, h) => acc + h.cc, 0);

    const totalProcesado = totalRutina + totalUrg + totalReproc + totalCalib + totalCC;
    const tasaReprocGlobal =
      totalRutina + totalUrg + totalReproc > 0
        ? Number(((totalReproc * 100) / (totalRutina + totalUrg + totalReproc)).toFixed(2))
        : 0;

    return {
      totalConsumoReal,
      totalProcesado,
      totalReproc,
      tasaReprocGlobal,
      totalCalib,
      totalCC,
    };
  }, [historico, filtroUnidad]);

  const filasPlanillaVisibles = useMemo(() => {
    if (filtroUnidad === 'todos') return filasCarga;
    return filasCarga.filter((f) => f.prueba.unidad === filtroUnidad);
  }, [filasCarga, filtroUnidad]);

  const historicoFiltrado = useMemo(() => {
    return historico.filter((h) => {
      const cumpleMes = filtroMesHistorico === 'todos' || h.periodo === filtroMesHistorico;
      const cumpleUnidad = filtroUnidad === 'todos' || h.unidad === filtroUnidad;
      const cumpleBusqueda =
        busquedaHistorico === '' ||
        h.prueba_codigo.toLowerCase().includes(busquedaHistorico.toLowerCase()) ||
        h.prueba_nombre.toLowerCase().includes(busquedaHistorico.toLowerCase()) ||
        String(h.acn).includes(busquedaHistorico);

      return cumpleMes && cumpleUnidad && cumpleBusqueda;
    });
  }, [historico, filtroMesHistorico, filtroUnidad, busquedaHistorico]);

  const periodosDisponibles = useMemo(() => {
    const sets = new Set(historico.map((h) => h.periodo));
    return Array.from(sets).sort().reverse();
  }, [historico]);

  return (
    <div className="cobas-main-container">
      {/* 1. Header Superior Roche Cobas */}
      <header className="cobas-app-header">
        <div className="cobas-brand-bar">
          <div className="cobas-title-group">
            <div className="cobas-icon-badge">
              <Activity size={28} />
            </div>
            <div>
              <h1 className="cobas-main-heading">
                cobas 6000 | Control de Reactivos & Auditoría LIS
              </h1>
              <p className="cobas-system-sub">
                Módulos Analíticos Cobas c 501 (Química Clínica) & ISE 1 (Electrolitos)
              </p>
            </div>
          </div>

          <div className="roche-hitachi-badge">
            <span className="roche-logo-text">Roche</span>
            <span className="hitachi-logo-sub">HITACHI</span>
          </div>
        </div>

        {/* 2. Navegación de Pestañas */}
        <div className="cobas-nav-tabs-wrapper">
          <div className="cobas-tabs-container">
            <button
              type="button"
              onClick={() => setPestanaActiva('metricas')}
              className={`cobas-tab-btn ${pestanaActiva === 'metricas' ? 'active' : ''}`}
            >
              <BarChart3 size={18} />
              <span>Pestaña 1: Panel de Control & Métricas Cobas</span>
              <span className="tab-badge badge-blue">Analítica</span>
            </button>

            <button
              type="button"
              onClick={() => setPestanaActiva('carga')}
              className={`cobas-tab-btn ${pestanaActiva === 'carga' ? 'active' : ''}`}
            >
              <ClipboardList size={18} />
              <span>Pestaña 2: Planilla Carga Mensual & Auditoría</span>
              <span className="tab-badge badge-emerald">Diferencial</span>
            </button>
          </div>

          {/* Estado de conexión real con el servidor */}
          <div className="status-connection-wrapper">
            {loading ? (
              <span className="backend-status-pill status-connecting">
                <span className="pulse-dot warning"></span>
                <Server size={14} /> Conectando con el servidor...
              </span>
            ) : conexionBackend ? (
              <span className="backend-status-pill status-online">
                <span className="pulse-dot"></span>
                <Server size={14} /> Base de Datos Conectada (MySQL 8.0)
              </span>
            ) : (
              <span className="backend-status-pill status-offline">
                <span className="pulse-dot danger"></span>
                <AlertCircle size={14} /> Sin conexión con el Servidor
                <button
                  type="button"
                  onClick={cargarDatosServidor}
                  className="btn-reconectar"
                >
                  Reconectar
                </button>
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Alerta de mensaje */}
      {alertaMensaje && (
        <div className={`alerta-container alerta-${alertaMensaje.tipo}`}>
          <div className="alerta-content">
            <CheckCircle2 size={18} />
            <span>{alertaMensaje.texto}</span>
          </div>
          <button
            type="button"
            onClick={() => setAlertaMensaje(null)}
            className="btn-cerrar-alerta"
          >
            ✕
          </button>
        </div>
      )}

      {/* Subtoolbar de Filtros de Módulo */}
      <div className="cobas-subtoolbar">
        <div className="unit-filters">
          <span className="unit-label-tag">MÓDULO:</span>
          <button
            type="button"
            onClick={() => setFiltroUnidad('todos')}
            className={`unit-btn ${filtroUnidad === 'todos' ? 'active' : ''}`}
          >
            🌐 Plataforma Completa
          </button>
          <button
            type="button"
            onClick={() => setFiltroUnidad('c5-1')}
            className={`unit-btn ${filtroUnidad === 'c5-1' ? 'active' : ''}`}
          >
            🏭 c5-1 (Planta / Rutina)
          </button>
          <button
            type="button"
            onClick={() => setFiltroUnidad('ISE1')}
            className={`unit-btn ${filtroUnidad === 'ISE1' ? 'active' : ''}`}
          >
            🚨 ISE1 (Guardia / Electrolitos)
          </button>
        </div>
        <div className="toolbar-actions-right">
          <button
            type="button"
            onClick={exportarHistoricoCSV}
            className="btn-cobas-action btn-secondary-cobas"
          >
            <Download size={14} /> Exportar a CSV (PowerBy / BI)
          </button>
        </div>
      </div>

      {/* PESTAÑA 1: PANEL ANALÍTICO DE MÉTRICAS */}
      {pestanaActiva === 'metricas' && (
        <section className="pestana-metricas-content">
          <div className="kpi-grid-cobas">
            <div className="kpi-card-cobas card-green">
              <div className="kpi-header-row">
                <span className="kpi-label-title">Consumo Real Neto Acumulado</span>
                <Database size={16} color="#059669" />
              </div>
              <div className="kpi-main-number">
                {kpisCalculados.totalConsumoReal.toLocaleString()}
                <span className="kpi-unit-tag">det.</span>
              </div>
              <div className="kpi-audit-formula">
                Fórmula: Rec. Anterior - Rec. Actual
              </div>
              <div className="kpi-footer-cobas">
                <span>Auditoría de inventario físico</span>
                <span className="status-tag tag-green">Auditado</span>
              </div>
            </div>

            <div className="kpi-card-cobas card-blue">
              <div className="kpi-header-row">
                <span className="kpi-label-title">Volumen Total Procesado</span>
                <Activity size={16} color="#2563eb" />
              </div>
              <div className="kpi-main-number">
                {kpisCalculados.totalProcesado.toLocaleString()}
                <span className="kpi-unit-tag">tests</span>
              </div>
              <div className="kpi-audit-formula kpi-formula-blue">
                Rutina + Urgencias + Reproc + Cal/CC
              </div>
              <div className="kpi-footer-cobas">
                <span>Capacidad operativa óptima</span>
                <span className="status-tag tag-blue">Cobas 6000 Activo</span>
              </div>
            </div>

            <div className="kpi-card-cobas card-amber">
              <div className="kpi-header-row">
                <span className="kpi-label-title">Tasa Global de Reproceso</span>
                <TrendingDown size={16} color="#d97706" />
              </div>
              <div className="kpi-main-number">
                {kpisCalculados.tasaReprocGlobal}%
                <span className="kpi-unit-tag">rework</span>
              </div>
              <div className="kpi-audit-formula kpi-formula-amber">
                Objetivo de Calidad: &lt; 2.50%
              </div>
              <div className="kpi-footer-cobas">
                <span>{kpisCalculados.totalReproc} repeticiones analíticas</span>
                <span className={`status-tag ${kpisCalculados.tasaReprocGlobal < 2.5 ? 'tag-green' : 'tag-amber'}`}>
                  {kpisCalculados.tasaReprocGlobal < 2.5 ? 'Dentro de Meta' : 'En Observación'}
                </span>
              </div>
            </div>

            <div className="kpi-card-cobas card-indigo">
              <div className="kpi-header-row">
                <span className="kpi-label-title">Controles & Calibraciones</span>
                <Layers size={16} color="#6366f1" />
              </div>
              <div className="kpi-main-number">
                {(kpisCalculados.totalCalib + kpisCalculados.totalCC).toLocaleString()}
                <span className="kpi-unit-tag">pruebas</span>
              </div>
              <div className="kpi-audit-formula kpi-formula-indigo">
                Calibración: {kpisCalculados.totalCalib} | CC: {kpisCalculados.totalCC}
              </div>
              <div className="kpi-footer-cobas">
                <span>Trazabilidad metrológica</span>
                <span className="status-tag tag-blue">ISO 15189</span>
              </div>
            </div>
          </div>

          {/* Gráficos de Producción y Consumo */}
          <div className="charts-grid-cobas">
            <div className="chart-card-cobas">
              <div className="chart-header-group">
                <div className="chart-heading-text">
                  <h3>Evolución Mensual del Consumo Real de Reactivos</h3>
                  <p>Diferencial de inventario acumulado mes a mes vs determinaciones de rutina y urgencias</p>
                </div>
              </div>
              <div className="chart-wrapper-320">
                {tendenciaMensual.length === 0 ? (
                  <div className="empty-chart-msg">Conectando con la base de datos o sin registros históricos.</div>
                ) : (
                  <ResponsiveContainer>
                    <BarChart data={tendenciaMensual} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="periodo" stroke="#64748b" style={{ fontSize: '0.75rem' }} />
                      <YAxis stroke="#64748b" style={{ fontSize: '0.75rem' }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0f172a',
                          color: '#ffffff',
                          borderRadius: 8,
                          fontSize: '0.75rem',
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: '0.75rem' }} />
                      <Bar dataKey="total_consumo_real" name="Consumo Real Neto" fill="#10b981" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="total_rutina" name="Rutina Ambulatoria" fill="#2563eb" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="total_urgencias" name="Urgencias / Guardia" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            <div className="chart-card-cobas">
              <div className="chart-header-group">
                <div className="chart-heading-text">
                  <h3>Tendencia de Reprocesos (%)</h3>
                  <p>Porcentaje de no conformidades analíticas por mes</p>
                </div>
              </div>
              <div className="chart-wrapper-320">
                {tendenciaMensual.length === 0 ? (
                  <div className="empty-chart-msg">Conectando con la base de datos o sin registros históricos.</div>
                ) : (
                  <ResponsiveContainer>
                    <AreaChart data={tendenciaMensual} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="periodo" stroke="#64748b" style={{ fontSize: '0.75rem' }} />
                      <YAxis stroke="#64748b" style={{ fontSize: '0.75rem' }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0f172a',
                          color: '#ffffff',
                          borderRadius: 8,
                          fontSize: '0.75rem',
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="tasa_reproceso_pct"
                        name="% Tasa Reproceso"
                        stroke="#d97706"
                        fill="#fef3c7"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>

          {/* Top Analitos Consumidos */}
          <div className="chart-card-cobas mb-24">
            <div className="chart-header-group">
              <div className="chart-heading-text">
                <h3>Top Analitos con Mayor Consumo Real Acumulado</h3>
                <p>Volumen consumido por analito/canal ACN de Roche Cobas</p>
              </div>
            </div>
            <div className="chart-wrapper-260">
              {topAnalitos.length === 0 ? (
                <div className="empty-chart-msg">Esperando respuesta de la base de datos MySQL...</div>
              ) : (
                <ResponsiveContainer>
                  <BarChart data={topAnalitos} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis type="number" stroke="#64748b" style={{ fontSize: '0.72rem' }} />
                    <YAxis dataKey="codigo" type="category" stroke="#0f172a" style={{ fontSize: '0.75rem', fontWeight: 'bold' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        color: '#ffffff',
                        borderRadius: 8,
                        fontSize: '0.75rem',
                      }}
                    />
                    <Bar dataKey="consumo_real" name="Consumo Real (Pruebas)" fill="#2563eb" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </section>
      )}

      {/* PESTAÑA 2: PLANILLA DE CARGA MENSUAL & AUDITORÍA DIFERENCIAL */}
      {pestanaActiva === 'carga' && (
        <section className="pestana-carga-content">
          <div className="cobas-report-sheet">
            <div className="cobas-print-header">
              <div className="print-brand-row">
                <div>
                  <h2 className="print-title">
                    {filtroUnidad === 'ISE1' ? 'cobas ISE 1 - GUARDIA' : 'cobas c 501 - PLANTA & LIS'}
                  </h2>
                  <h3 className="print-sub">
                    Contador de prueba detallado (Módulo{' '}
                    {filtroUnidad === 'ISE1' ? 'ISE1 / Electrolitos Séricos' : 'c5-1 / Rutina Bioquímica'})
                  </h3>
                </div>
                <div className="roche-hitachi-badge">
                  <span className="roche-logo-text">Roche</span>
                  <span className="hitachi-logo-sub">HITACHI</span>
                </div>
              </div>

              <div className="print-meta-grid">
                <div className="print-meta-item">
                  <strong>Período Cierre:</strong>{' '}
                  <input
                    type="month"
                    value={periodoCarga}
                    onChange={(e) => setPeriodoCarga(e.target.value)}
                    className="input-date-cobas"
                  />
                </div>
                <div className="print-meta-item">
                  <strong>Fecha de Corte:</strong>{' '}
                  <input
                    type="date"
                    value={fechaCierre}
                    onChange={(e) => setFechaCierre(e.target.value)}
                    className="input-date-cobas"
                  />
                </div>
                <div className="print-meta-item">
                  <strong>Operador / Bioquímico:</strong>{' '}
                  <input
                    type="text"
                    value={operadorCierre}
                    onChange={(e) => setOperadorCierre(e.target.value)}
                    className="input-operador-cobas"
                  />
                </div>
                <div className="print-meta-item">
                  <strong>Sistema:</strong> cobas 6000
                </div>
              </div>
            </div>

            {/* SECCIÓN DE IMPORTACIÓN MASIVA POR PENDRIVE */}
            <div className="p-4 mb-4 bg-slate-50 border border-slate-200 rounded-lg flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-100 text-blue-700 rounded-lg">
                  <UploadCloud size={24} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800">
                    Carga Masiva desde Pendrive (Cobas c 501)
                  </h4>
                  <p className="text-xs text-slate-500">
                    Selecciona el archivo CSV/TXT exportado desde la workstation de Roche para omitir la carga manual.
                  </p>
                </div>
              </div>

              <label className={`btn-cobas-action ${subiendoArchivo ? 'bg-slate-400' : 'bg-blue-600 hover:bg-blue-700'} text-white cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-md font-medium text-sm transition-colors`}>
                <FileSpreadsheet size={16} />
                <span>{subiendoArchivo ? 'Procesando File...' : 'Seleccionar Archivo USB'}</span>
                <input
                  type="file"
                  accept=".csv, .txt"
                  onChange={handleFileUpload}
                  disabled={subiendoArchivo}
                  className="hidden"
                />
              </label>
            </div>

            <div className="carga-toolbar-banner">
              <button
                type="button"
                onClick={precargarRecuentosMesAnterior}
                className="btn-cobas-action btn-secondary-cobas"
                title="Consulta el último recuento registrado en la base de datos para precargar el mes anterior"
              >
                <RotateCcw size={14} /> Cargar Recuentos del Mes Anterior Automáticamente
              </button>
              <div className="formula-info-tag">
                💡 <strong>Lógica Diferencial:</strong> Ingrese el recuento actual que muestra el Cobas.{' '}
                <code>Rec. Mes Anterior - Rec. Mes Actual = Consumo Real</code>
              </div>
            </div>

            <form onSubmit={guardarCierreMensual}>
              <div className="cobas-table-container">
                <table className="cobas-matrix-table">
                  <thead>
                    <tr>
                      <th className="min-w-160">Prueba / Analito</th>
                      <th className="text-center w-70">ACN</th>
                      <th className="text-center w-60">Módulo</th>
                      <th className="text-right w-130 th-highlight-prev">Rec. Mes Anterior</th>
                      <th className="text-right w-140 th-highlight-act">Rec. Mes Actual (Cobas)</th>
                      <th className="text-right w-150 th-highlight-real">Consumo Real del Mes</th>
                      <th className="text-right w-75">Rutina</th>
                      <th className="text-right w-75">Reproc.</th>
                      <th className="text-right w-75">Urg.</th>
                      <th className="text-right w-75">Calib.</th>
                      <th className="text-right w-75">CC</th>
                      <th className="text-center min-w-130">Lote / Obs.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filasPlanillaVisibles.map((fila, index) => {
                      const indexGlobal = filasCarga.findIndex(
                        (f) => f.prueba.codigo === fila.prueba.codigo
                      );
                      const esRecarga =
                        fila.recuentoActual !== '' && Number(fila.recuentoActual) > fila.recuentoAnterior;

                      return (
                        <tr key={fila.prueba.codigo} className={esRecarga ? 'row-recarga-advertencia' : ''}>
                          <td className="font-semibold text-slate-800">
                            {fila.prueba.nombre}
                            <span className="text-xs text-slate-400 block font-normal">{fila.prueba.codigo}</span>
                          </td>
                          <td className="text-center font-mono text-xs">{fila.prueba.acn}</td>
                          <td className="text-center">
                            <span className={`tag-unidad ${fila.prueba.unidad === 'ISE1' ? 'tag-ise' : 'tag-c501'}`}>
                              {fila.prueba.unidad}
                            </span>
                          </td>
                          <td className="text-right">
                            <input
                              type="number"
                              value={fila.recuentoAnterior}
                              onChange={(e) =>
                                handleRecuentoAnteriorChange(
                                  indexGlobal !== -1 ? indexGlobal : index,
                                  e.target.value
                                )
                              }
                              className="input-table-num input-previo"
                            />
                          </td>
                          <td className="text-right">
                            <input
                              type="number"
                              value={fila.recuentoActual}
                              placeholder="0"
                              onChange={(e) =>
                                handleRecuentoActualChange(
                                  indexGlobal !== -1 ? indexGlobal : index,
                                  e.target.value
                                )
                              }
                              className="input-table-num input-actual"
                            />
                          </td>
                          <td className="text-right font-bold text-emerald-700 bg-emerald-50">
                            {fila.recuentoActual === '' ? (
                              <span className="badge-consumo-cero">—</span>
                            ) : esRecarga ? (
                              <span className="badge-consumo-recarga" title="Contador actual superior indica reemplazo de casete">
                                🔄 Recarga (+{Math.abs(fila.consumoReal)})
                              </span>
                            ) : (
                              <span className="badge-consumo-pos">
                                +{fila.consumoReal.toLocaleString()}
                              </span>
                            )}
                          </td>
                          <td className="text-right">
                            <input
                              type="number"
                              value={fila.rutina || ''}
                              placeholder="0"
                              onChange={(e) =>
                                handleCampoDetalleChange(
                                  indexGlobal !== -1 ? indexGlobal : index,
                                  'rutina',
                                  Number(e.target.value) || 0
                                )
                              }
                              className="input-table-num"
                            />
                          </td>
                          <td className="text-right">
                            <input
                              type="number"
                              value={fila.reproc || ''}
                              placeholder="0"
                              onChange={(e) =>
                                handleCampoDetalleChange(
                                  indexGlobal !== -1 ? indexGlobal : index,
                                  'reproc',
                                  Number(e.target.value) || 0
                                )
                              }
                              className="input-table-num input-amber"
                            />
                          </td>
                          <td className="text-right">
                            <input
                              type="number"
                              value={fila.urg || ''}
                              placeholder="0"
                              onChange={(e) =>
                                handleCampoDetalleChange(
                                  indexGlobal !== -1 ? indexGlobal : index,
                                  'urg',
                                  Number(e.target.value) || 0
                                )
                              }
                              className="input-table-num"
                            />
                          </td>
                          <td className="text-right">
                            <input
                              type="number"
                              value={fila.calib || ''}
                              placeholder="0"
                              onChange={(e) =>
                                handleCampoDetalleChange(
                                  indexGlobal !== -1 ? indexGlobal : index,
                                  'calib',
                                  Number(e.target.value) || 0
                                )
                              }
                              className="input-table-num"
                            />
                          </td>
                          <td className="text-right">
                            <input
                              type="number"
                              value={fila.cc || ''}
                              placeholder="0"
                              onChange={(e) =>
                                handleCampoDetalleChange(
                                  indexGlobal !== -1 ? indexGlobal : index,
                                  'cc',
                                  Number(e.target.value) || 0
                                )
                              }
                              className="input-table-num"
                            />
                          </td>
                          <td className="text-center">
                            <input
                              type="text"
                              value={fila.loteReactivo}
                              placeholder="LOT-XXXX"
                              onChange={(e) =>
                                handleCampoDetalleChange(
                                  indexGlobal !== -1 ? indexGlobal : index,
                                  'loteReactivo',
                                  e.target.value
                                )
                              }
                              className="input-table-text text-left fs-72"
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="cierre-footer-container">
                <label className="cierre-obs-label">
                  Observaciones de Cierre Mensual ({periodoCarga})
                </label>
                <textarea
                  rows={2}
                  value={observacionesCierre}
                  onChange={(e) => setObservacionesCierre(e.target.value)}
                  placeholder="Anotar novedades sobre lotes de reactivo cambiados..."
                  className="textarea-cierre-obs"
                />
                <div className="cierre-submit-wrapper">
                  <button
                    type="submit"
                    disabled={guardando}
                    className="btn-cobas-action btn-success-cobas py-12 px-24 fs-85"
                  >
                    <Save size={18} />
                    {guardando ? 'Guardando en Base de Datos...' : `Guardar Cierre Mensual (${periodoCarga})`}
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Tabla Histórica de la BD */}
          <div className="historico-section-card">
            <div className="historico-header-row">
              <div className="historico-title-group">
                <h3>Historial Estructurado de Consumo Real Mes a Mes</h3>
                <p>Registro histórico de recuentos acumulados obtenido desde la base de datos MySQL</p>
              </div>

              <div className="historico-filter-group">
                <div className="search-box-wrapper">
                  <Search size={14} color="#64748b" />
                  <input
                    type="text"
                    value={busquedaHistorico}
                    onChange={(e) => setBusquedaHistorico(e.target.value)}
                    placeholder="Buscar analito o ACN..."
                    className="input-search-inline"
                  />
                </div>

                <select
                  value={filtroMesHistorico}
                  onChange={(e) => setFiltroMesHistorico(e.target.value)}
                  className="select-cobas"
                >
                  <option value="todos">Todos los Períodos</option>
                  {periodosDisponibles.map((p) => (
                    <option key={p} value={p}>
                      Período {p}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="historico-table">
                <thead>
                  <tr>
                    <th>Período</th>
                    <th>Fecha Cierre</th>
                    <th>Código</th>
                    <th>Analito</th>
                    <th className="text-center">ACN</th>
                    <th className="text-center">Módulo</th>
                    <th className="text-right">Recuento Anterior</th>
                    <th className="text-right">Recuento Actual</th>
                    <th className="text-right th-highlight-real">Consumo Real</th>
                    <th className="text-right">Rutina</th>
                    <th className="text-right">Reproc.</th>
                    <th className="text-right">Urg.</th>
                    <th className="text-center">Lote</th>
                    <th className="text-center">Usuario</th>
                  </tr>
                </thead>
                <tbody>
                  {historicoFiltrado.length === 0 ? (
                    <tr>
                      <td colSpan={14} className="text-center py-24 text-slate-400">
                        {loading
                          ? 'Conectando con el servidor...'
                          : 'No se encontraron registros de inventario en la base de datos.'}
                      </td>
                    </tr>
                  ) : (
                    historicoFiltrado.map((h, i) => (
                      <tr key={`${h.periodo}-${h.prueba_codigo}-${i}`}>
                        <td>
                          <span className="badge-periodo">{h.periodo}</span>
                        </td>
                        <td className="fs-72 text-slate-500">{h.fecha_cierre}</td>
                        <td className="fw-800">{h.prueba_codigo}</td>
                        <td>{h.prueba_nombre}</td>
                        <td className="text-center font-mono">{h.acn}</td>
                        <td className="text-center">
                          <span className={`cell-unit ${h.unidad === 'c5-1' ? 'unit-c5' : 'unit-ise'}`}>
                            {h.unidad}
                          </span>
                        </td>
                        <td className="text-right font-mono">{h.recuento_anterior.toLocaleString()}</td>
                        <td className="text-right font-mono">{h.recuento_actual.toLocaleString()}</td>
                        <td className="text-right font-mono">
                          <span className="badge-consumo-pos">+{h.consumo_real.toLocaleString()}</span>
                        </td>
                        <td className="text-right font-mono">{h.rutina}</td>
                        <td className="text-right font-mono">{h.reproc}</td>
                        <td className="text-right font-mono">{h.urg}</td>
                        <td className="text-center fs-72">{h.lote_reactivo || '—'}</td>
                        <td className="text-center fs-72 text-slate-500">{h.usuario || 'Sistema'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default ControlReactivosCobas;