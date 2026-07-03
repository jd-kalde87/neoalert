import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CreateRiskDto, Risk, RiskSeverity } from '../types/risk.types'

const SEED_RISKS: Risk[] = [
  {
    id: 'risk-1',
    title: 'Bloqueo intermitente vía Ipiales',
    description: 'Manifestación con cierre parcial en horas pico.',
    type: 'Bloqueo vial',
    severity: 'high',
    status: 'active',
    latitude: 0.835,
    longitude: -77.635,
    municipalityId: 'muni-ipiales',
    municipalityLabel: 'Ipiales',
    departmentId: 'dept-narino',
    projectId: 'project-ipiales',
    sectorId: 'sector-km10',
    source: 'Supervisor',
    createdAt: '2026-06-25T08:00:00Z',
    updatedAt: '2026-06-25T08:00:00Z',
  },
  {
    id: 'risk-2',
    title: 'Zona con reportes de hurto — Cali',
    description: 'Varios reportes en las últimas 48 h.',
    type: 'Robo / hurto',
    severity: 'medium',
    status: 'monitored',
    latitude: 3.46,
    longitude: -76.525,
    municipalityId: 'muni-cali',
    municipalityLabel: 'Cali',
    departmentId: 'dept-valle',
    projectId: 'project-cali',
    sectorId: 'sector-km7',
    source: 'Centro de control',
    createdAt: '2026-06-26T14:30:00Z',
    updatedAt: '2026-06-26T14:30:00Z',
  },
  {
    id: 'risk-3',
    title: 'Talud inestable — Manizales',
    description: 'Deslizamiento parcial en bermas.',
    type: 'Inundación / derrumbe',
    severity: 'critical',
    status: 'active',
    latitude: 5.07,
    longitude: -75.51,
    municipalityId: 'muni-manizales',
    municipalityLabel: 'Manizales',
    departmentId: 'dept-caldas',
    projectId: 'project-manizales',
    sectorId: 'sector-antena12',
    source: 'Operador de campo',
    createdAt: '2026-06-27T10:15:00Z',
    updatedAt: '2026-06-27T10:15:00Z',
  },
]

function now() {
  return new Date().toISOString()
}

interface RisksState {
  risks: Risk[]
  createRisk: (payload: CreateRiskDto) => Risk
  updateRisk: (id: string, payload: Partial<CreateRiskDto>) => Risk
  deleteRisk: (id: string) => void
}

export const useRisksStore = create<RisksState>()(
  persist(
    (set, get) => ({
      risks: SEED_RISKS,

      createRisk: (payload) => {
        const risk: Risk = {
          id: crypto.randomUUID(),
          title: payload.title.trim(),
          description: payload.description?.trim() ?? '',
          type: payload.type,
          severity: payload.severity as RiskSeverity,
          status: 'active',
          latitude: payload.latitude,
          longitude: payload.longitude,
          municipalityId: payload.municipalityId,
          departmentId: payload.departmentId,
          projectId: payload.projectId,
          sectorId: payload.sectorId,
          source: payload.source,
          reportedBy: payload.reportedBy,
          createdAt: now(),
          updatedAt: now(),
        }
        set((state) => ({ risks: [risk, ...state.risks] }))
        return risk
      },

      updateRisk: (id, payload) => {
        let updated!: Risk
        set((state) => ({
          risks: state.risks.map((item) => {
            if (item.id !== id) return item
            updated = {
              ...item,
              ...payload,
              title: payload.title?.trim() ?? item.title,
              description: payload.description?.trim() ?? item.description,
              updatedAt: now(),
            }
            return updated
          }),
        }))
        return updated
      },

      deleteRisk: (id) => {
        set((state) => ({ risks: state.risks.filter((item) => item.id !== id) }))
        void get()
      },
    }),
    { name: 'neoalert-risks', version: 2, migrate: (persisted, version) => (version < 2 ? { risks: SEED_RISKS } : persisted) },
  ),
)
