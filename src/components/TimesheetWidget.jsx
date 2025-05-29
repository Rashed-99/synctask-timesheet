import { useState, useEffect, useMemo } from 'react'

export default function TimesheetWidget() {
  const API_BASE = import.meta.env.VITE_API_BASE || 'https://synctask-api.onrender.com'
  const API_TOKEN = import.meta.env.VITE_API_TOKEN || 'abc123'

  const categories = [
    'Normal Time', 'Public Holiday', 'Annual Leave', 'Sick Leave',
    'Tafe', 'OT x 1.5', 'OT x 2', 'RDO'
  ]

  const [employees, setEmployees] = useState([])
  const [rows, setRows] = useState([])

  useEffect(() => {
    fetch(`${API_BASE}/employees`, { 
      headers: { Authorization: `Bearer ${API_TOKEN}` }
    })
      .then(res => res.json())
      .then(data => setEmployees(data))
      .catch(console.error)
    
    addRow() // Initial empty row
  }, [])

  function addRow() {
    setRows(prev => [...prev, {
      id: Date.now(),
      employeeId: '',
      date: '',
      category: '',
      hours: '',
      remarks: '',
    }])
  }

  function updateRow(id, field, value) {
    setRows(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r))
  }

  const summary = useMemo(() => {
    const grouped = {}
    
    employees.forEach(emp => {
      grouped[emp.id] = {
        employeeName: emp.name,
        ...categories.reduce((acc, cat) => ({ ...acc, [cat]: 0 }), {}),
        total: 0,
        remarks: []
      }
    })

    rows.forEach(r => {
      if (!r.employeeId || !r.category || !r.hours) return
      const hrs = parseFloat(r.hours) || 0
      const rec = grouped[r.employeeId]
      if (rec) {
        rec[r.category] += hrs
        rec.total += hrs
        if (r.remarks) rec.remarks.push(r.remarks)
      }
    })

    return Object.values(grouped).map(item => ({
      ...item,
      remarks: [...new Set(item.remarks)].join('; ')
    }))
  }, [rows, employees])

  async function submitEntries() {
    const payload = rows
      .filter(r => r.employeeId && r.date && r.category && r.hours)
      .map(r => ({
        employeeId: r.employeeId,
        date: r.date,
        category: r.category,
        hours: parseFloat(r.hours),
        remarks: r.remarks
      }))

    try {
      const res = await fetch(`${API_BASE}/timeEntries`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ entries: payload })
      })
      
      if (!res.ok) throw new Error('Save failed')
      alert('Entries saved successfully!')
    } catch (err) {
      alert('Error saving entries')
      console.error(err)
    }
  }

  function exportCSV() {
    const header = ["Employee", ...categories, "Total", "Remarks"]
    const rowsData = summary.map(item => {
      const row = [item.employeeName]
      categories.forEach(cat => row.push(item[cat] || 0))
      row.push(item.total, item.remarks || "")
      return row
    })

    const csvContent = [header, ...rowsData]
      .map(row => row.join(','))
      .join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'timesheet_summary.csv'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="p-4 bg-white shadow rounded-lg space-y-8 max-w-6xl mx-auto">
      {/* Daily Entries Form */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Daily Entries</h2>
        <div className="overflow-x-auto">
          <table className="w-full mb-2 table-auto">
            <thead>
              <tr className="text-left bg-gray-100">
                <th className="p-2">Employee</th>
                <th className="p-2">Date</th>
                <th className="p-2">Category</th>
                <th className="p-2">Hours</th>
                <th className="p-2">Remarks</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(row => (
                <tr key={row.id} className="border-b">
                  <td className="p-2">
                    <select
                      className="border p-1 rounded w-full"
                      value={row.employeeId}
                      onChange={e => updateRow(row.id, 'employeeId', e.target.value)}
                    >
                      <option value="">Select Employee</option>
                      {employees.map(emp => (
                        <option key={emp.id} value={emp.id}>{emp.name}</option>
                      ))}
                    </select>
                  </td>
                  <td className="p-2">
                    <input
                      type="date"
                      className="border p-1 rounded w-full"
                      value={row.date}
                      onChange={e => updateRow(row.id, 'date', e.target.value)}
                    />
                  </td>
                  <td className="p-2">
                    <select
                      className="border p-1 rounded w-full"
                      value={row.category}
                      onChange={e => updateRow(row.id, 'category', e.target.value)}
                    >
                      <option value="">Select Category</option>
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </td>
                  <td className="p-2">
                    <input
                      type="number"
                      step="0.25"
                      min="0"
                      className="border p-1 rounded w-20"
                      value={row.hours}
                      onChange={e => updateRow(row.id, 'hours', e.target.value)}
                    />
                  </td>
                  <td className="p-2">
                    <input
                      type="text"
                      className="border p-1 rounded w-full"
                      value={row.remarks}
                      onChange={e => updateRow(row.id, 'remarks', e.target.value)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex gap-2">
          <button 
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={addRow}
          >
            + Add Entry
          </button>
          <button 
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            onClick={submitEntries}
          >
            Submit All
          </button>
        </div>
      </div>

      {/* Weekly Summary Section */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Weekly Summary</h2>
          <button 
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            onClick={exportCSV}
          >
            Export CSV
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full table-auto border-collapse">
            <thead>
              <tr className="text-left bg-gray-100">
                <th className="p-2">Employee</th>
                {categories.map(cat => (
                  <th key={cat} className="p-2">{cat}</th>
                ))}
                <th className="p-2">Total</th>
                <th className="p-2">Remarks</th>
              </tr>
            </thead>
            <tbody>
              {summary.map(item => (
                <tr key={item.employeeName} className="border-b">
                  <td className="p-2 font-medium">{item.employeeName}</td>
                  {categories.map(cat => (
                    <td key={cat} className="p-2">{item[cat] || 0}</td>
                  ))}
                  <td className="p-2 font-semibold">{item.total}</td>
                  <td className="p-2">{item.remarks}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
