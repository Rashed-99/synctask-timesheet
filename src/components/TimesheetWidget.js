import React, { useState, useEffect, useMemo } from 'react';

export default function TimesheetWidget() {
  const API_BASE = 'https://synctask-api.onrender.com';
  const API_TOKEN = 'abc123';
  const headers = { Authorization: `Bearer ${API_TOKEN}`, 'Content-Type': 'application/json' };

  const categories = [
    'Normal Time', 'Public Holiday', 'Annual Leave', 'Sick Leave',
    'Tafe', 'OT × 1.5', 'OT × 2', 'RDO'
  ];

  const [employees, setEmployees] = useState([]);
  const [rows, setRows] = useState([]);

  useEffect(() => {
    fetch(`${API_BASE}/employees`, { headers })
      .then(res => res.json())
      .then(data => setEmployees(data))
      .catch(console.error);
    addRow();  // start with one blank entry row
  }, []);

  function addRow() {
    setRows(prev => [...prev, {
      id: Date.now(),
      employeeId: '',
      date: '',
      category: '',
      hours: '',
      remarks: ''
    }]);
  }

  function updateRow(id, field, value) {
    setRows(prev =>
      prev.map(r => r.id === id ? { ...r, [field]: value } : r)
    );
  }

  const summary = useMemo(() => {
    const grouped = {};
    // Initialize summary object for each employee
    employees.forEach(emp => {
      grouped[emp.id] = {
        employeeName: emp.name,
        ...categories.reduce((acc, cat) => ({ ...acc, [cat]: 0 }), {}),
        total: 0,
        remarks: []
      };
    });
    // Aggregate hours and remarks from each row
    rows.forEach(r => {
      if (!r.employeeId || !r.category || !r.hours) return;  // skip incomplete rows
      const hrs = parseFloat(r.hours) || 0;
      const rec = grouped[r.employeeId];
      rec[r.category] += hrs;
      rec.total += hrs;
      if (r.remarks) rec.remarks.push(r.remarks);
    });
    // Prepare final summary array
    return Object.values(grouped).map(item => ({
      ...item,
      remarks: [...new Set(item.remarks)].join('; ')
    }));
  }, [rows, employees]);

  async function submitEntries() {
    const payload = rows
      .filter(r => r.employeeId && r.date && r.category && r.hours)
      .map(r => ({
        employeeId: r.employeeId,
        date: r.date,
        category: r.category,
        hours: parseFloat(r.hours),
        remarks: r.remarks
      }));
    try {
      const res = await fetch(`${API_BASE}/timeEntries`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ entries: payload })
      });
      if (!res.ok) throw new Error('Save failed');
      alert('Entries saved successfully!');
    } catch (err) {
      alert('Error saving entries');
    }
  }

  return (
    <div className="p-4 bg-white shadow rounded-lg space-y-8">
      {/* Daily Entries Form */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Daily Entries</h2>
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
              <tr key={row.id}>
                <td className="p-2">
                  <select 
                    className="border p-1"
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
                    className="border p-1"
                    value={row.date}
                    onChange={e => updateRow(row.id, 'date', e.target.value)}
                  />
                </td>
                <td className="p-2">
                  <select 
                    className="border p-1"
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
                    className="border p-1 w-20"
                    value={row.hours}
                    onChange={e => updateRow(row.id, 'hours', e.target.value)}
                  />
                </td>
                <td className="p-2">
                  <input 
                    type="text" 
                    className="border p-1"
                    value={row.remarks}
                    onChange={e => updateRow(row.id, 'remarks', e.target.value)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <button className="p-2 bg-blue-500 text-white rounded mr-2" onClick={addRow}>
          + Add Entry
        </button>
        <button className="p-2 bg-green-600 text-white rounded" onClick={submitEntries}>
          Submit All
        </button>
      </div>

      {/* Weekly Summary Section */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Weekly Summary</h2>
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
              <tr key={item.employeeName}>
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
        {/* Export CSV button will be added here in a later step */}
      </div>
    </div>
  );
}
