import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

function Timetable({ schedule, studentInfo, onBack }) {

  const getCategoryBadgeClass = (category) => {
    if (category === 'Theory') {
      return 'bg-blue-500/20 text-blue-300 border-blue-500/50'
    }
    return 'bg-green-500/20 text-green-300 border-green-500/50'
  }

  const getSessionBadgeClass = (session) => {
    if (session === 'FN') {
      return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50'
    }
    return 'bg-orange-500/20 text-orange-300 border-orange-500/50'
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    if (isNaN(date.getTime())) {
      // If date parsing fails, try DD.MM.YYYY format
      const parts = dateString.split('.')
      if (parts.length === 3) {
        const d = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`)
        if (!isNaN(d.getTime())) {
          return d.toLocaleDateString('en-US', { 
            weekday: 'short',
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
          })
        }
      }
      return dateString // Return original if can't parse
    }
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    })
  }

  const formatDateForPDF = (dateString) => {
    if (!dateString) return 'N/A'
    
    try {
      // Try parsing as ISO date first
      let date = new Date(dateString)
      
      // If that fails, try DD.MM.YYYY format
      if (isNaN(date.getTime())) {
        const parts = String(dateString).split('.')
        if (parts.length === 3) {
          const day = parts[0].padStart(2, '0')
          const month = parts[1].padStart(2, '0')
          const year = parts[2]
          date = new Date(`${year}-${month}-${day}`)
        }
      }
      
      // If still invalid, return original string
      if (isNaN(date.getTime())) {
        return String(dateString).substring(0, 20)
      }
      
      // Format the date with weekday
      const weekday = date.toLocaleDateString('en-GB', { weekday: 'short' })
      const datePart = date.toLocaleDateString('en-GB', { 
        day: '2-digit',
        month: 'short', 
        year: 'numeric'
      })
      
      return `${weekday}, ${datePart}`
    } catch (error) {
      // If anything fails, return a safe string
      return String(dateString).substring(0, 20) || 'N/A'
    }
  }

  const downloadPDF = () => {
    try {
      if (!schedule || schedule.length === 0) {
        alert('No schedule data available to export.')
        return
      }

      if (!studentInfo || !studentInfo.name || !studentInfo.registerNumber) {
        alert('Student information is missing.')
        return
      }

      const pdf = new jsPDF('p', 'mm', 'a4')
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      const margin = 25
      let currentY = margin

      // ============================================
      // HEADER SECTION
      // ============================================
      
      // Title: "SEMESTER SCHEDULE" - Centered
      pdf.setFontSize(32)
      pdf.setFont('helvetica', 'normal')
      pdf.text('SEMESTER SCHEDULE', pageWidth / 2, currentY, { align: 'center' })
      currentY += 15

      // Student Information - Left and Right aligned
      pdf.setFontSize(11)
      pdf.setFont('helvetica', 'normal')
      const studentName = String(studentInfo.name || 'N/A')
      const regNumber = String(studentInfo.registerNumber || 'N/A')
      
      // Left aligned: NAME
      pdf.text(`NAME : ${studentName}`, 20, currentY)
      
      // Right aligned: REG.NO
      pdf.text(`REG.NO : ${regNumber}`, pageWidth - 20, currentY, { align: 'right' })
      currentY += 12

      // ============================================
      // TABLE SECTION
      // ============================================
      
      // Prepare table data
      const tableData = schedule.map(entry => {
        const dateText = formatDateForPDF(entry.date) || 'N/A'
        return [
          dateText,
          entry.session || '',
          entry.category || '',
          entry.subjectName || '',
          entry.roomHall || ''
        ]
      })

      // Generate table using autoTable
      autoTable(pdf, {
        head: [['DAY / DATE', 'SESSION', 'MODE', 'SUBJECT', 'HALL']],
        body: tableData,
        startY: currentY,
        tableWidth: 'auto',
        halign: 'center',
        margin: { left: 10, right: 15 },
        //margin: { left: margin, right: margin },
        styles: {
          fontSize: 9,
          cellPadding: 3,
          overflow: 'linebreak',
          cellWidth: 'wrap'
        },
        headStyles: {
          fillColor: [240, 240, 240],
          textColor: [0, 0, 0],
          fontStyle: 'bold',
          fontSize: 10,
          halign: 'left'
        },
        bodyStyles: {
          fillColor: false,
          textColor: [0, 0, 0],
          halign: 'left'
        },
        alternateRowStyles: {
          fillColor: [250, 250, 250]
        },
        columnStyles: {
          0: { cellWidth: 42 }, // DATE
          1: { cellWidth: 28 }, // SESSION
          2: { cellWidth: 25 }, // MODE
          3: { cellWidth: 60 }, // SUBJECT
          4: { cellWidth: 33 }  // HALL
        },
        theme: 'grid',
        showHead: 'everyPage'
      })

      // Get the final Y position after table
      const finalY = pdf.lastAutoTable.finalY || currentY + 50
      currentY = finalY + 15

      // ============================================
      // FOOTER SECTION
      // ============================================
      
      // Check if we need a new page for footer
      if (currentY > pageHeight - 60) {
        pdf.addPage()
        currentY = margin
      }

      // Section title: TIME MANAGEMENT TIPS
      pdf.setFontSize(12)
      pdf.setFont('helvetica', 'bold')
      pdf.text('TIME MANAGEMENT TIPS', margin, currentY)
      currentY += 8

      // Bullet points
      pdf.setFontSize(10)
      pdf.setFont('helvetica', 'normal')
      const tips = [
        'PLAN AHEAD : REVIEW YOUR SCHEDULE THE NIGHT BEFORE.',
        'PRIORITIZE : START WITH THE TOUGHEST SUBJECT FIRST.',
        'STAY FOCUSED : STUDY IN SHORT, DISTRACTION-FREE BLOCKS.',
        'REVIEW OFTEN : DO A QUICK REVISION AFTER EACH SESSION.'
      ]

      tips.forEach((tip, index) => {
        // Check if we need a new page
        if (currentY > pageHeight - 20) {
          pdf.addPage()
          currentY = margin
        }
        pdf.text(`• ${tip}`, margin + 3, currentY)
        currentY += 6
      })

      currentY += 10

      // "ALL THE BEST" - Centered
      pdf.setFontSize(16)
      pdf.setFont('helvetica', 'bold')
      pdf.text('ALL THE BEST', pageWidth / 2, currentY, { align: 'center' })

      // ============================================
      // SAVE PDF
      // ============================================
      const fileName = `${regNumber}_timetable.pdf`
      pdf.save(fileName)
    } catch (error) {
      console.error('Error generating PDF:', error)
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        scheduleLength: schedule?.length,
        studentInfo: studentInfo
      })
      alert(`Failed to generate PDF: ${error.message || 'Unknown error'}. Please check the browser console for details.`)
    }
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="mb-6 text-gray-400 hover:text-white transition-colors flex items-center gap-2"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Search
      </button>
      <h1 className="text-2xl font-bold text-white mb-4">
  Get your personalized Semester Schedule! 
</h1>


      {/* Student Info Card */}
      <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl shadow-2xl border border-gray-700/50 p-6 mb-6">
        <h2 className="text-2xl font-bold text-white mb-4">Student Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-400 mb-1">Name</p>
            <p className="text-lg font-semibold text-white">{studentInfo.name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-400 mb-1">Register Number</p>
            <p className="text-lg font-semibold text-white">{studentInfo.registerNumber}</p>
          </div>
        </div>
      </div>

      {/* Timetable Card */}
      <div 
        className="bg-gray-800/50 backdrop-blur-lg rounded-2xl shadow-2xl border border-gray-700/50 p-6 mb-6"
      >
<div className="flex items-center justify-between mb-6">
  <h2 className="text-2xl font-bold text-white">Semester Timetable</h2>

  <button
    onClick={downloadPDF}
    className="bg-primary hover:bg-blue-600 text-white font-semibold 
             py-2 px-6 rounded-lg transition-all duration-200 
             shadow-lg hover:shadow-xl flex items-center gap-2"
  >
<svg xmlns="http://www.w3.org/2000/svg" 
     className="w-5 h-5" 
     fill="none" 
     viewBox="0 0 24 24" 
     stroke="currentColor" 
     strokeWidth="2">
  <path strokeLinecap="round" strokeLinejoin="round" d="M7 2h7l5 5v13a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z" />
  <path strokeLinecap="round" strokeLinejoin="round" d="M14 2v5h5" />
</svg>

    Download PDF
  </button>
</div>

    {/* Desktop Table */}
    <div className="hidden md:block">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-300">Date</th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-300">Session</th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-300">Category</th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-300">Subject</th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-300">Room / Hall</th>
              </tr>
            </thead>
            <tbody>
              {schedule.map((entry, index) => (
                <tr 
                  key={index}
                  className="border-b border-gray-700/50 hover:bg-gray-700/30 transition-colors"
                >
                  <td className="py-4 px-4 text-white">{formatDate(entry.date)}</td>
                  <td className="py-4 px-4">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${getSessionBadgeClass(entry.session)}`}>
                      {entry.session}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${getCategoryBadgeClass(entry.category)}`}>
                      {entry.category}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-white font-medium">{entry.subjectName}</td>
                  <td className="py-4 px-4 text-gray-300">{entry.roomHall}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
    </div>
        
    {/* Mobile Card View */}
<div className="md:hidden space-y-4">
  {schedule.map((entry, index) => (
    <div
      key={index}
      className="bg-gray-800/50 p-4 rounded-xl border border-gray-700/50 shadow-md"
    >
      <p className="text-gray-300 text-sm"><span className="font-semibold">Date:</span> {formatDate(entry.date)}</p>
      <p className="text-gray-300 text-sm"><span className="font-semibold">Session:</span> {entry.session}</p>
      <p className="text-gray-300 text-sm"><span className="font-semibold">Category:</span> {entry.category}</p>
      <p className="text-gray-300 text-sm"><span className="font-semibold">Subject:</span> {entry.subjectName}</p>
      <p className="text-gray-300 text-sm"><span className="font-semibold">Room:</span> {entry.roomHall}</p>
    </div>
  ))}
</div>

      </div>
      {/* Export Button */}
      
      <p className="text-center text-gray-400 text-sm mt-3">
        Print-ready timetable to track your schedule.
      </p>

    </div>
  )
}

export default Timetable

