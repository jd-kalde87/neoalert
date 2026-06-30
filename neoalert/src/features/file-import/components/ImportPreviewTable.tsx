interface ImportPreviewTableProps {
  headers: string[]
  rows: string[][]
  totalRows: number
}

export function ImportPreviewTable({ headers, rows, totalRows }: ImportPreviewTableProps) {
  if (headers.length === 0) {
    return <p className="text-sm text-slate-500">No hay datos para previsualizar.</p>
  }

  return (
    <div>
      <p className="mb-2 text-[0.8125rem] text-slate-500">
        Mostrando {rows.length} de {totalRows} filas
      </p>
      <div className="neo-scroll max-h-[280px] overflow-x-auto rounded-md border border-slate-200">
        <table className="w-full border-collapse text-[0.8125rem]">
          <thead>
            <tr>
              {headers.map((header) => (
                <th
                  key={header}
                  className="sticky top-0 border-b border-slate-200 bg-white px-2.5 py-2 text-left font-semibold"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={index}>
                {headers.map((_, colIndex) => (
                  <td
                    key={colIndex}
                    className="whitespace-nowrap border-b border-slate-200 px-2.5 py-2 text-left"
                  >
                    {row[colIndex] ?? ''}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
