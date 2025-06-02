import { useState, useEffect, useMemo } from 'react';
import { FiPlus, FiSave, FiDownload, FiTrash2, FiEdit2, FiCheck } from 'react-icons/fi';

export default function TimesheetWidget() {
  const API_BASE = import.meta.env.VITE_API_BASE || 'https://synctask-api.onrender.com';
  const API_TOKEN = import.meta.env.VITE_API_TOKEN || 'abc123';

  const categories = [
    'Normal Time', 'Public Holiday', 'Annual Leave', 'Sick Leave',
    'Tafe', 'OT x 1.5', 'OT x 2', 'RDO'
  ];

  const [employees, setEmployees] = useState([]);
  const [rows, setRows] = useState([]);
  const [activeTab, setActiveTab] = useState('entries');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE}/employees`, { 
      headers: { Authorization: `Bearer ${API_TOKEN}` }
    })
      .then(res => res.json())
      .then(data => setEmployees(data))
      .catch(console.error);
    
    addRow(); // Initial empty row
  }, []);

  function addRow() {
    setRows(prev => [...prev, {
      id: Date.now(),
      employeeId: '',
      date: new Date().toISOString().split('T')[0], // Default to today
      category: '',
      hours: '',
      remarks: '',
    }]);
  }

  function removeRow(id) {
    setRows(prev => prev.filter(r => r.id !== id));
  }

  function updateRow(id, field, value) {
    setRows(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r));
  }

  const summary = useMemo(() => {
    const grouped = {};
    
    employees.forEach(emp => {
      grouped[emp.id] = {
        employeeName: emp.name,
        ...categories.reduce((acc, cat) => ({ ...acc, [cat]: 0 }), {}),
        total: 0,
        remarks: []
      };
    });

    rows.forEach(r => {
      if (!r.employeeId || !r.category || !r.hours) return;
      const hrs = parseFloat(r.hours) || 0;
      const rec = grouped[r.employeeId];
      if (rec) {
        rec[r.category] += hrs;
        rec.total += hrs;
        if (r.remarks) rec.remarks.push(r.remarks);
      }
    });

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

    if (payload.length === 0) {
      alert('No valid entries to submit');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/timeEntries`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ entries: payload })
      });
      
      if (!res.ok) throw new Error('Save failed');
      
      // Clear successfully submitted rows
      setRows(prev => prev.filter(r => 
        !r.employeeId || !r.date || !r.category || !r.hours
      ));
      
      // Add a new empty row
      addRow();
      
      alert('Entries saved successfully!');
    } catch (err) {
      alert('Error saving entries');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  }

  function exportCSV() {
    const header = ["Employee", ...categories, "Total", "Remarks"];
    const rowsData = summary.map(item => {
      const row = [item.employeeName];
      categories.forEach(cat => row.push(item[cat] || 0));
      row.push(item.total, item.remarks || "");
      return row;
    });

    const csvContent = [header, ...rowsData]
      .map(row => row.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'timesheet_summary.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  return (
    <div className="p-6 bg-gray-50 rounded-xl shadow-sm max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Timesheet Management</h1>
        <div className="flex space-x-2">
          <button
            className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-all ${
              activeTab === 'entries' 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
            onClick={() => setActiveTab('entries')}
          >
            <FiEdit2 size={16} />
            <span>Daily Entries</span>
          </button>
          <button
            className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-all ${
              activeTab === 'summary' 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
            onClick={() => setActiveTab('summary')}
          >
            <FiCheck size={16} />
            <span>Weekly Summary</span>
          </button>
        </div>
      </div>

      {activeTab === 'entries' && (
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800">Daily Entries</h2>
            <div className="flex space-x-3">
              <button 
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 shadow-sm"
                onClick={addRow}
              >
                <FiPlus size={18} />
                <span>Add Entry</span>
              </button>
              <button 
                className={`px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 shadow-sm ${
                  isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
                }`}
                onClick={submitEntries}
                disabled={isSubmitting}
              >
                <FiSave size={18} />
                <span>{isSubmitting ? 'Submitting...' : 'Submit All'}</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr className="text-left text-gray-700">
                  <th className="p-3 font-medium">Employee</th>
                  <th className="p-3 font-medium">Date</th>
                  <th className="p-3 font-medium">Category</th>
                  <th className="p-3 font-medium">Hours</th>
                  <th className="p-3 font-medium">Remarks</th>
                  <th className="p-3 font-medium w-10">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {rows.map(row => (
                  <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-3">
                      <select
                        className="border border-gray-300 p-2 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        value={row.employeeId}
                        onChange={e => updateRow(row.id, 'employeeId', e.target.value)}
                      >
                        <option value="">Select Employee</option>
                        {employees.map(emp => (
                          <option key={emp.id} value={emp.id}>{emp.name}</option>
                        ))}
                      </select>
                    </td>
                    <td className="p-3">
                      <input
                        type="date"
                        className="border border-gray-300 p-2 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        value={row.date}
                        onChange={e => updateRow(row.id, 'date', e.target.value)}
                      />
                    </td>
                    <td className="p-3">
                      <select
                        className="border border-gray-300 p-2 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        value={row.category}
                        onChange={e => updateRow(row.id, 'category', e.target.value)}
                      >
                        <option value="">Select Category</option>
                        {categories.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </td>
                    <td className="p-3">
                      <input
                        type="number"
                        step="0.25"
                        min="0"
                        className="border border-gray-300 p-2 rounded-lg w-20 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        value={row.hours}
                        onChange={e => updateRow(row.id, 'hours', e.target.value)}
                        placeholder="0.0"
                      />
                    </td>
                    <td className="p-3">
                      <input
                        type="text"
                        className="border border-gray-300 p-2 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        value={row.remarks}
                        onChange={e => updateRow(row.id, 'remarks', e.target.value)}
                        placeholder="Optional notes"
                      />
                    </td>
                    <td className="p-3">
                      <button 
                        onClick={() => removeRow(row.id)}
                        className="text-red-500 hover:text-red-700 transition-colors p-1 rounded-full hover:bg-red-50"
                        title="Remove row"
                      >
                        <FiTrash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {rows.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No entries added yet. Click "Add Entry" to get started.
            </div>
          )}
        </div>
      )}

      {activeTab === 'summary' && (
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800">Weekly Summary</h2>
            <button 
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2 shadow-sm"
              onClick={exportCSV}
            >
              <FiDownload size={18} />
              <span>Export CSV</span>
            </button>
          </div>

          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr className="text-left text-gray-700">
                  <th className="p-3 font-medium sticky left-0 bg-gray-100 z-10">Employee</th>
                  {categories.map(cat => (
                    <th key={cat} className="p-3 font-medium min-w-[120px]">{cat}</th>
                  ))}
                  <th className="p-3 font-medium min-w-[80px]">Total</th>
                  <th className="p-3 font-medium">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {summary.length > 0 ? (
                  summary.map(item => (
                    <tr key={item.employeeName} className="hover:bg-gray-50 transition-colors">
                      <td className="p-3 font-medium sticky left-0 bg-white z-10">{item.employeeName}</td>
                      {categories.map(cat => (
                        <td key={cat} className="p-3 text-center">
                          <span className={`inline-block px-2 py-1 rounded-full ${
                            item[cat] > 0 ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-500'
                          }`}>
                            {item[cat] || 0}
                          </span>
                        </td>
                      ))}
                      <td className="p-3 font-semibold text-center">
                        <span className="inline-block px-2 py-1 rounded-full bg-green-100 text-green-800">
                          {item.total}
                        </span>
                      </td>
                      <td className="p-3 text-gray-600 max-w-xs truncate" title={item.remarks}>
                        {item.remarks}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={categories.length + 3} className="p-4 text-center text-gray-500">
                      No summary data available. Add some entries first.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
