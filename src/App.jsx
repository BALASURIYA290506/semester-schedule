import { useState } from 'react'
import SearchForm from './components/SearchForm'
import Timetable from './components/Timetable'
import studentsData from './data/students.json'

function App() {
  const [studentSchedule, setStudentSchedule] = useState(null)
  const [studentInfo, setStudentInfo] = useState(null)

  const handleSearch = (name, registerNumber) => {
    // Normalize name: trim, lowercase, remove extra spaces
    const normalizeName = (str) => str.trim().toLowerCase().replace(/\s+/g, ' ')
    
    const normalizedSearchName = normalizeName(name)
    
    // Convert date from DD.MM.YYYY to YYYY-MM-DD
    const convertDate = (dateStr) => {
      if (!dateStr) return null
      // Handle DD.MM.YYYY format
      const parts = dateStr.split('.')
      if (parts.length === 3) {
        return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`
      }
      return dateStr
    }

    // Normalize session: "F.N." -> "FN", "A.N." -> "AN"
    const normalizeSession = (slot) => {
      if (!slot) return ''
      const upper = slot.toUpperCase().replace(/\./g, '').trim()
      if (upper === 'FN' || upper === 'F N') return 'FN'
      if (upper === 'AN' || upper === 'A N') return 'AN'
      return upper
    }
    
    // Filter students matching both name and register number
    const filtered = studentsData.filter(student => {
      const studentName = student['Student Name'] || student.studentName || ''
      const regNumber = student['Register Number'] || student.registerNumber || ''
      
      const normalizedStudentName = normalizeName(studentName)
      const searchRegNumber = registerNumber.trim().toString()
      const studentRegNumber = regNumber.toString().trim()
      
      return (
        normalizedStudentName === normalizedSearchName &&
        studentRegNumber === searchRegNumber
      )
    })

    if (filtered.length === 0) {
      alert('Student not found! Please check your name and register number.')
      return
    }

    // Map to standardized format and sort
    const mapped = filtered.map(student => {
      const slot = student['Slot'] || student.session || ''
      const dateStr = student['Date'] || student.date || ''
      
      return {
        studentName: student['Student Name'] || student.studentName,
        registerNumber: (student['Register Number'] || student.registerNumber).toString(),
        date: convertDate(dateStr),
        originalDate: dateStr,
        session: normalizeSession(slot),
        category: student['Category'] || student.category || '',
        subjectName: student['Subject Name'] || student.subjectName || '',
        roomHall: student['Location'] || student.roomHall || student['Room / Hall'] || ''
      }
    })

    // Sort by date, then by session (FN before AN)
    const sorted = mapped.sort((a, b) => {
      const dateA = a.date ? new Date(a.date) : new Date(0)
      const dateB = b.date ? new Date(b.date) : new Date(0)
      
      if (dateA.getTime() !== dateB.getTime()) {
        return dateA - dateB
      }
      
      // Same date: FN comes before AN
      if (a.session === 'FN' && b.session === 'AN') return -1
      if (a.session === 'AN' && b.session === 'FN') return 1
      return 0
    })

    setStudentSchedule(sorted)
    setStudentInfo({
      name: sorted[0].studentName,
      registerNumber: sorted[0].registerNumber
    })
  }

  const handleBack = () => {
    setStudentSchedule(null)
    setStudentInfo(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {!studentSchedule ? (
          <SearchForm onSearch={handleSearch} />
        ) : (
          <Timetable 
            schedule={studentSchedule} 
            studentInfo={studentInfo}
            onBack={handleBack}
          />
        )}
      </div>
    </div>
  )
}

export default App

