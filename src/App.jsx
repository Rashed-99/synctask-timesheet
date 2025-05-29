import TimesheetWidget from './components/TimesheetWidget'

function App() {
  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">SyncTask Timesheet</h1>
        <TimesheetWidget />
      </div>
    </div>
  )
}

export default App
