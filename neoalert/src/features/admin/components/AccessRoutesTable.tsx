import type { AccessRoute, Permission } from '../types/admin.types'

interface AccessRoutesTableProps {
  routes: AccessRoute[]
  permissions: Permission[]
  selectedPermissionIds: Set<string>
  onTogglePermission: (permissionId: string, checked: boolean) => void
  disabled?: boolean
}

function findPermissionId(permissions: Permission[], code: string): string | undefined {
  return permissions.find((permission) => permission.code === code)?.id
}

export function AccessRoutesTable({
  routes,
  permissions,
  selectedPermissionIds,
  onTogglePermission,
  disabled = false,
}: AccessRoutesTableProps) {
  const groups = routes.reduce<Record<string, AccessRoute[]>>((acc, route) => {
    acc[route.group] = acc[route.group] ?? []
    acc[route.group].push(route)
    return acc
  }, {})

  return (
    <div className="space-y-6">
      {Object.entries(groups).map(([group, groupRoutes]) => (
        <div key={group}>
          <h3 className="mb-2 text-sm font-semibold text-slate-800">{group}</h3>
          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="neo-table w-full">
              <thead>
                <tr>
                  <th>Ruta</th>
                  <th>Módulo</th>
                  <th>Lectura</th>
                  <th>Escritura</th>
                </tr>
              </thead>
              <tbody>
                {groupRoutes.map((route) => {
                  const readId = findPermissionId(permissions, route.permission_code)
                  const writeId = route.write_permission_code
                    ? findPermissionId(permissions, route.write_permission_code)
                    : undefined

                  return (
                    <tr key={route.route}>
                      <td className="font-mono text-xs text-slate-600">{route.route}</td>
                      <td>{route.label}</td>
                      <td>
                        {readId ? (
                          <label className="inline-flex items-center gap-2 text-sm">
                            <input
                              type="checkbox"
                              checked={selectedPermissionIds.has(readId)}
                              disabled={disabled}
                              onChange={(event) => onTogglePermission(readId, event.target.checked)}
                            />
                            {route.permission_code}
                          </label>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td>
                        {writeId ? (
                          <label className="inline-flex items-center gap-2 text-sm">
                            <input
                              type="checkbox"
                              checked={selectedPermissionIds.has(writeId)}
                              disabled={disabled}
                              onChange={(event) => onTogglePermission(writeId, event.target.checked)}
                            />
                            {route.write_permission_code}
                          </label>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  )
}
