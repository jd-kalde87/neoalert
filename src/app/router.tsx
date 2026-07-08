import { Navigate, createBrowserRouter } from 'react-router-dom'
import { AppLayout } from '@layouts/AppLayout'
import { AuthLayout } from '@layouts/AuthLayout'
import { MapLayout } from '@layouts/MapLayout'
import { ROUTES } from '@shared/constants/routes'
import { AuthGuard, GuestGuard } from '@shared/hooks/useAuthGuard'
import {
  ForgotPasswordPage,
  LoginPage,
  MfaPage,
  SelectTenantPage,
} from '@features/auth'
import { SessionExpiredPage, UnauthorizedPage } from '@features/auth/pages/SystemPages'
import { DashboardPage } from '@features/dashboard'
import { AttendancePage } from '@features/attendance'
import { HeatmapPage, MapsPage } from '@features/maps'
import {
  IncidentCreatePage,
  IncidentDetailPage,
  IncidentsListPage,
} from '@features/incidents'
import { NotificationsPage } from '@features/notifications'
import { NewsInterestPage } from '@features/news'
import { FileImportPage, ImportDetailPage, ImportUploadPage } from '@features/file-import'
import {
  ImportTemplateCreatePage,
  ImportTemplateEditPage,
  ImportTemplatesPage,
} from '@features/import-templates'
import {
  OperationsPage,
  PlantFormPage,
  RouteFormPage,
  WorkSiteFormPage,
} from '@features/operations'
import { ReportDetailPage, ReportsPage } from '@features/reports'
import { AuditDetailPage, AuditPage } from '@features/audit'

export const appRouter = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to={ROUTES.dashboard} replace />,
  },
  {
    element: (
      <GuestGuard>
        <AuthLayout />
      </GuestGuard>
    ),
    children: [
      { path: ROUTES.login, element: <LoginPage /> },
      { path: ROUTES.forgotPassword, element: <ForgotPasswordPage /> },
      { path: ROUTES.mfa, element: <MfaPage /> },
      { path: ROUTES.selectTenant, element: <SelectTenantPage /> },
    ],
  },
  {
    path: ROUTES.unauthorized,
    element: <UnauthorizedPage />,
  },
  {
    path: ROUTES.sessionExpired,
    element: <SessionExpiredPage />,
  },
  {
    element: (
      <AuthGuard>
        <AppLayout />
      </AuthGuard>
    ),
    children: [
      { path: ROUTES.dashboard, element: <DashboardPage /> },
      { path: ROUTES.attendance, element: <AttendancePage /> },
      { path: ROUTES.incidents, element: <IncidentsListPage /> },
      { path: ROUTES.incidentNew, element: <IncidentCreatePage /> },
      { path: ROUTES.incidentDetail, element: <IncidentDetailPage /> },
      { path: ROUTES.notifications, element: <NotificationsPage /> },
      { path: ROUTES.newsInterest, element: <NewsInterestPage /> },
      { path: ROUTES.imports, element: <FileImportPage /> },
      { path: ROUTES.importUpload, element: <ImportUploadPage /> },
      { path: ROUTES.importDetail, element: <ImportDetailPage /> },
      { path: ROUTES.importTemplates, element: <ImportTemplatesPage /> },
      { path: ROUTES.importTemplateNew, element: <ImportTemplateCreatePage /> },
      { path: ROUTES.importTemplateDetail, element: <ImportTemplateEditPage /> },
      { path: ROUTES.reports, element: <ReportsPage /> },
      { path: ROUTES.reportDetail, element: <ReportDetailPage /> },
      { path: ROUTES.audit, element: <AuditPage /> },
      { path: ROUTES.auditDetail, element: <AuditDetailPage /> },
      { path: ROUTES.operations, element: <OperationsPage /> },
      { path: ROUTES.operationsPlantNew, element: <PlantFormPage /> },
      { path: ROUTES.operationsPlantEdit, element: <PlantFormPage /> },
      { path: ROUTES.operationsSiteNew, element: <WorkSiteFormPage /> },
      { path: ROUTES.operationsSiteEdit, element: <WorkSiteFormPage /> },
      { path: ROUTES.operationsRouteNew, element: <RouteFormPage /> },
      { path: ROUTES.operationsRouteEdit, element: <RouteFormPage /> },
      {
        element: <MapLayout />,
        children: [
          { path: ROUTES.maps, element: <MapsPage /> },
          { path: ROUTES.heatmap, element: <HeatmapPage /> },
        ],
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to={ROUTES.dashboard} replace />,
  },
])
