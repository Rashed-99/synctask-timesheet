import { useState, useEffect, useMemo } from 'react'
import {
  makeStyles,
  shorthands,
  tokens,
  Button,
  Table,
  TableHeader,
  TableRow,
  TableHeaderCell,
  TableBody,
  TableCell,
  Input,
  Select,
  Option,
  TabList,
  Tab,
  TabValue,
  Label,
  DataGrid,
  DataGridHeader,
  DataGridRow,
  DataGridHeaderCell,
  DataGridBody,
  DataGridCell
} from '@fluentui/react-components'
import {
  Add24Filled,
  Save24Filled,
  ArrowDownload24Filled,
  People24Filled,
  Calendar24Filled,
  Time24Filled,
  TextDescription24Filled,
  DocumentTable24Filled
} from '@fluentui/react-icons'

const useStyles = makeStyles({
  root: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    backgroundColor: tokens.colorNeutralBackground2,
    color: tokens.colorNeutralForeground1,
    fontFamily: tokens.fontFamilyBase,
    ...shorthands.padding('24px'),
    ...shorthands.gap('24px')
  },
  card: {
    backgroundColor: tokens.colorNeutralBackground1,
    ...shorthands.borderRadius(tokens.borderRadiusMedium),
    ...shorthands.padding('24px'),
    boxShadow: tokens.shadow16,
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.gap('16px')
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  title: {
    fontSize: tokens.fontSizeBase600,
    fontWeight: tokens.fontWeightSemibold,
    color: tokens.colorNeutralForeground1
  },
  tableContainer: {
    overflowX: 'auto',
    ...shorthands.borderRadius(tokens.borderRadiusMedium),
    backgroundColor: tokens.colorNeutralBackground1
  },
  input: {
    width: '100%'
  },
  select: {
    minWidth: '160px'
  },
  buttonGroup: {
    display: 'flex',
    ...shorthands.gap('8px')
  },
  tabPanel: {
    ...shorthands.padding('16px', 0)
  }
})

export default function TimesheetWidget() {
  const styles = useStyles()
  const API_BASE = import.meta.env.VITE_API_BASE || 'https://synctask-api.onrender.com'
  const API_TOKEN = import.meta.env.VITE_API_TOKEN || 'abc123'
  const [selectedTab, setSelectedTab] = useState<TabValue>('entries')

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
    <div className={styles.root}>
      <TabList selectedValue={selectedTab} onTabSelect={(_, { value }) => setSelectedTab(value)}>
        <Tab icon={<DocumentTable24Filled />} value="entries">Daily Entries</Tab>
        <Tab icon={<Time24Filled />} value="summary">Weekly Summary</Tab>
      </TabList>

      {selectedTab === 'entries' && (
        <div className={styles.card}>
          <div className={styles.header}>
            <h2 className={styles.title}>Daily Time Entries</h2>
            <div className={styles.buttonGroup}>
              <Button 
                appearance="primary" 
                icon={<Add24Filled />}
                onClick={addRow}
              >
                Add Entry
              </Button>
              <Button 
                appearance="primary" 
                icon={<Save24Filled />}
                onClick={submitEntries}
              >
                Submit All
              </Button>
            </div>
          </div>

          <div className={styles.tableContainer}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHeaderCell>
                    <Label htmlFor="employee" icon={<People24Filled />}>Employee</Label>
                  </TableHeaderCell>
                  <TableHeaderCell>
                    <Label htmlFor="date" icon={<Calendar24Filled />}>Date</Label>
                  </TableHeaderCell>
                  <TableHeaderCell>Category</TableHeaderCell>
                  <TableHeaderCell>Hours</TableHeaderCell>
                  <TableHeaderCell>
                    <Label htmlFor="remarks" icon={<TextDescription24Filled />}>Remarks</Label>
                  </TableHeaderCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map(row => (
                  <TableRow key={row.id}>
                    <TableCell>
                      <Select
                        id="employee"
                        className={styles.select}
                        value={row.employeeId}
                        onChange={(_, data) => updateRow(row.id, 'employeeId', data.value)}
                      >
                        <Option value="">Select Employee</Option>
                        {employees.map(emp => (
                          <Option key={emp.id} value={emp.id}>{emp.name}</Option>
                        ))}
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Input
                        id="date"
                        type="date"
                        className={styles.input}
                        value={row.date}
                        onChange={(_, data) => updateRow(row.id, 'date', data.value)}
                      />
                    </TableCell>
                    <TableCell>
                      <Select
                        className={styles.select}
                        value={row.category}
                        onChange={(_, data) => updateRow(row.id, 'category', data.value)}
                      >
                        <Option value="">Select Category</Option>
                        {categories.map(cat => (
                          <Option key={cat} value={cat}>{cat}</Option>
                        ))}
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        step="0.25"
                        min="0"
                        className={styles.input}
                        value={row.hours}
                        onChange={(_, data) => updateRow(row.id, 'hours', data.value)}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        id="remarks"
                        type="text"
                        className={styles.input}
                        value={row.remarks}
                        onChange={(_, data) => updateRow(row.id, 'remarks', data.value)}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {selectedTab === 'summary' && (
        <div className={styles.card}>
          <div className={styles.header}>
            <h2 className={styles.title}>Weekly Summary</h2>
            <Button 
              appearance="primary" 
              icon={<ArrowDownload24Filled />}
              onClick={exportCSV}
            >
              Export CSV
            </Button>
          </div>

          <div className={styles.tableContainer}>
            <DataGrid items={summary}>
              <DataGridHeader>
                <DataGridRow>
                  <DataGridHeaderCell>Employee</DataGridHeaderCell>
                  {categories.map(cat => (
                    <DataGridHeaderCell key={cat}>{cat}</DataGridHeaderCell>
                  ))}
                  <DataGridHeaderCell>Total</DataGridHeaderCell>
                  <DataGridHeaderCell>Remarks</DataGridHeaderCell>
                </DataGridRow>
              </DataGridHeader>
              <DataGridBody>
                {item => (
                  <DataGridRow key={item.employeeName}>
                    <DataGridCell>{item.employeeName}</DataGridCell>
                    {categories.map(cat => (
                      <DataGridCell key={cat}>{item[cat] || 0}</DataGridCell>
                    ))}
                    <DataGridCell>{item.total}</DataGridCell>
                    <DataGridCell>{item.remarks}</DataGridCell>
                  </DataGridRow>
                )}
              </DataGridBody>
            </DataGrid>
          </div>
        </div>
      )}
    </div>
  )
}
