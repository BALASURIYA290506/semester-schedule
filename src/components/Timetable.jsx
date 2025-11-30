import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

function Timetable({ schedule, studentInfo, onBack }) {

  // Separate upcoming and finished exams
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const upcomingExams = schedule.filter(entry => {
    const examDate = new Date(entry.date)
    examDate.setHours(0, 0, 0, 0)
    return examDate >= today
  })
  
  const finishedExams = schedule.filter(entry => {
    const examDate = new Date(entry.date)
    examDate.setHours(0, 0, 0, 0)
    return examDate < today
  })

  const getCategoryBadgeClass = (category) => {
    if (category === 'Theory') {
      return 'bg-blue-100 text-blue-800 border-blue-300'
    }
    if (category === 'Practical') {
      return 'bg-green-100 text-green-800 border-green-300'
    }
    if (category === 'Project') {
      return 'bg-purple-100 text-purple-800 border-purple-300'
    }
    return 'bg-gray-100 text-gray-700 border-gray-300'
  }

  const getSessionBadgeClass = (session) => {
    if (session === 'FN') {
      return 'bg-orange-100 text-orange-800 border-orange-300'
    }
    return 'bg-indigo-100 text-indigo-800 border-indigo-300'
  }

  const isToday = (dateString) => {
    if (!dateString) return false
    const examDate = new Date(dateString)
    examDate.setHours(0, 0, 0, 0)
    const todayDate = new Date()
    todayDate.setHours(0, 0, 0, 0)
    return examDate.getTime() === todayDate.getTime()
  }

  const getDaysBetweenExams = (currentDate, nextDate) => {
    if (!currentDate || !nextDate) return null
    const current = new Date(currentDate)
    const next = new Date(nextDate)
    current.setHours(0, 0, 0, 0)
    next.setHours(0, 0, 0, 0)
    
    // If same date, return null (multiple sessions on same day)
    if (current.getTime() === next.getTime()) return null
    
    const diffTime = next.getTime() - current.getTime()
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    // Subtract 1 to get the gap days (days between the exams, not including the exam days)
    const gapDays = diffDays - 1
    return gapDays > 0 ? gapDays : null
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
          entry.subjectCode || '',
          entry.subjectName || '',
          entry.roomHall || ''
        ]
      })

      // Generate table using autoTable
      autoTable(pdf, {
        head: [['DAY / DATE', 'SESSION', 'MODE', 'CODE', 'SUBJECT', 'HALL']],
        body: tableData,
        startY: currentY,
        tableWidth: 'auto',
        halign: 'center',
        margin: { left: 10, right: 15 },
        //margin: { left: margin, right: margin },
        styles: {
          fontSize: 8,
          cellPadding: 2.5,
          overflow: 'linebreak',
          cellWidth: 'wrap'
        },
        headStyles: {
          fillColor: [240, 240, 240],
          textColor: [0, 0, 0],
          fontStyle: 'bold',
          fontSize: 9,
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
          0: { cellWidth: 38 }, // DATE
          1: { cellWidth: 22 }, // SESSION
          2: { cellWidth: 20 }, // MODE
          3: { cellWidth: 24 }, // CODE
          4: { cellWidth: 52 }, // SUBJECT
          5: { cellWidth: 32 }  // HALL
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
    <div className="min-h-screen bg-white py-8">
    <div className="max-w-7xl mx-auto px-4">
      {/* Header with Branding */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <img src="/logo.svg" alt="ExamTrack Pro Logo" className="w-10 h-10 sm:w-12 sm:h-12" />
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-black">ExamTrack Pro</h1>
            <p className="text-xs text-gray-500">Smart Exam Scheduler</p>
          </div>
        </div>
        <button
          onClick={onBack}
          className="text-gray-600 hover:text-black transition-all duration-200 flex items-center gap-2 group"
        >
          <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="font-medium hidden sm:inline">Back to Search</span>
        </button>
      </div>


      {/* Student Info Card */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 sm:p-8 mb-6">
        <div className="flex items-center gap-3 sm:gap-4 mb-6">
          <div className="w-12 h-12 sm:w-14 sm:h-14 bg-black rounded-xl flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6 sm:w-7 sm:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-black">Student Information</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <div className="space-y-1 sm:space-y-2">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Name</p>
            <p className="text-lg sm:text-xl font-bold text-black break-words">{studentInfo.name}</p>
          </div>
          <div className="space-y-1 sm:space-y-2">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Register Number</p>
            <p className="text-lg sm:text-xl font-bold text-black">{studentInfo.registerNumber}</p>
          </div>
        </div>
      </div>

      {/* Upcoming Exams Section */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 sm:p-8 pb-6 border-b border-gray-200">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-black rounded-xl flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 sm:w-7 sm:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-black">Upcoming Exams</h2>
              <p className="text-sm text-gray-500">{upcomingExams.length} exam{upcomingExams.length !== 1 ? 's' : ''} scheduled</p>
            </div>
          </div>

          <button
            onClick={downloadPDF}
            className="bg-black hover:bg-gray-800 w-full sm:w-auto
                     text-white font-bold py-2.5 sm:py-3 px-5 sm:px-6 rounded-xl transition-all duration-200 
                     shadow-lg hover:shadow-xl 
                     flex items-center justify-center gap-2 hover:-translate-y-1 active:translate-y-0 text-sm sm:text-base"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Download PDF</span>
          </button>
        </div>

        <div className="p-4 sm:p-6 lg:p-8 pt-6">

          {upcomingExams.length > 0 ? (
            <>
              {/* Desktop Table */}
              <div className="hidden lg:block">
                <div className="overflow-x-auto rounded-xl border border-gray-200">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="text-left py-3 px-4 text-xs font-bold text-gray-600 uppercase tracking-wider">Date</th>
                        <th className="text-left py-3 px-4 text-xs font-bold text-gray-600 uppercase tracking-wider">Session</th>
                        <th className="text-left py-3 px-4 text-xs font-bold text-gray-600 uppercase tracking-wider">Mode</th>
                        <th className="text-left py-3 px-4 text-xs font-bold text-gray-600 uppercase tracking-wider">Code</th>
                        <th className="text-left py-3 px-4 text-xs font-bold text-gray-600 uppercase tracking-wider">Subject</th>
                        <th className="text-left py-3 px-4 text-xs font-bold text-gray-600 uppercase tracking-wider">Location</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {upcomingExams.map((entry, index) => {
                        const nextExam = upcomingExams[index + 1]
                        const daysGap = nextExam ? getDaysBetweenExams(entry.date, nextExam.date) : null
                        
                        return (
                          <>
                            <tr 
                              key={index}
                              className="hover:bg-gray-50 transition-colors"
                            >
                              <td className="py-3 px-4 text-black font-medium whitespace-nowrap text-sm">
                                <div className="flex items-center gap-2">
                                  {formatDate(entry.date)}
                                  {isToday(entry.date) && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-300 animate-pulse">
                                      TODAY
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold border ${getSessionBadgeClass(entry.session)}`}>
                                  {entry.session}
                                </span>
                              </td>
                              <td className="py-3 px-4">
                                <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold border ${getCategoryBadgeClass(entry.category)}`}>
                                  {entry.category}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-gray-700 font-mono text-sm font-semibold">{entry.subjectCode}</td>
                              <td className="py-3 px-4 text-black font-medium text-sm">{entry.subjectName}</td>
                              <td className="py-3 px-4 text-gray-600 text-sm">{entry.roomHall}</td>
                            </tr>
                            {daysGap && daysGap >= 1 && (
                              <tr key={`gap-${index}`}>
                                <td colSpan="6" className="py-2 px-4 bg-gray-50">
                                  <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                                    </svg>
                                    <span className="font-medium">{daysGap} {daysGap === 1 ? 'day' : 'days'} gap</span>
                                    <svg className="w-3 h-3 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                                    </svg>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
        
              {/* Mobile/Tablet Card View */}
              <div className="lg:hidden space-y-3">
                {upcomingExams.map((entry, index) => {
                  const nextExam = upcomingExams[index + 1]
                  const daysGap = nextExam ? getDaysBetweenExams(entry.date, nextExam.date) : null
                  
                  return (
                    <>
                      <div
                        key={index}
                        className="bg-white p-4 sm:p-5 rounded-xl border-2 border-gray-200 shadow-sm hover:border-black transition-all"
                      >
                        <div className="flex items-center justify-between mb-3 gap-2">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold border ${getSessionBadgeClass(entry.session)}`}>
                            {entry.session}
                          </span>
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold border ${getCategoryBadgeClass(entry.category)}`}>
                            {entry.category}
                          </span>
                        </div>
                        <div className="space-y-2.5">
                          <div>
                            <p className="text-gray-600 font-mono text-xs mb-1 font-semibold">{entry.subjectCode}</p>
                            <p className="text-black font-semibold text-base leading-snug">{entry.subjectName}</p>
                          </div>
                          <p className="text-gray-500 text-sm flex items-center gap-2">
                            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span className="break-words">{formatDate(entry.date)}</span>
                            {isToday(entry.date) && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-300 animate-pulse">
                                TODAY
                              </span>
                            )}
                          </p>
                          <p className="text-gray-500 text-sm flex items-center gap-2">
                            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span className="break-words">{entry.roomHall}</span>
                          </p>
                        </div>
                      </div>
                      {daysGap && daysGap >= 1 && (
                        <div key={`gap-${index}`} className="flex items-center justify-center py-2">
                          <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-full border border-gray-200">
                            <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                            </svg>
                            <span className="text-xs font-medium text-gray-500">{daysGap} {daysGap === 1 ? 'day' : 'days'} gap</span>
                            <svg className="w-3 h-3 text-gray-400 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                            </svg>
                          </div>
                        </div>
                      )}
                    </>
                  )
                })}
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">No upcoming exams</p>
            </div>
          )}
        </div>
      </div>

      {/* Finished Exams Section */}
      {finishedExams.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="flex items-start sm:items-center justify-between gap-4 p-6 sm:p-8 pb-6 border-b border-gray-200">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gray-300 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 sm:w-7 sm:h-7 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-700">Finished Exams</h2>
                <p className="text-sm text-gray-500">{finishedExams.length} exam{finishedExams.length !== 1 ? 's' : ''} completed</p>
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-6 lg:p-8 pt-6">
            {/* Desktop Table */}
            <div className="hidden lg:block">
              <div className="overflow-x-auto rounded-xl border border-gray-200">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-xs font-bold text-gray-600 uppercase tracking-wider">Date</th>
                      <th className="text-left py-3 px-4 text-xs font-bold text-gray-600 uppercase tracking-wider">Session</th>
                      <th className="text-left py-3 px-4 text-xs font-bold text-gray-600 uppercase tracking-wider">Mode</th>
                      <th className="text-left py-3 px-4 text-xs font-bold text-gray-600 uppercase tracking-wider">Code</th>
                      <th className="text-left py-3 px-4 text-xs font-bold text-gray-600 uppercase tracking-wider">Subject</th>
                      <th className="text-left py-3 px-4 text-xs font-bold text-gray-600 uppercase tracking-wider">Location</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {finishedExams.map((entry, index) => (
                      <tr 
                        key={index}
                        className="opacity-60"
                      >
                        <td className="py-3 px-4 text-gray-600 font-medium whitespace-nowrap text-sm">{formatDate(entry.date)}</td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold border ${getSessionBadgeClass(entry.session)}`}>
                            {entry.session}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold border ${getCategoryBadgeClass(entry.category)}`}>
                            {entry.category}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-500 font-mono text-sm font-semibold">{entry.subjectCode}</td>
                        <td className="py-3 px-4 text-gray-600 font-medium text-sm">{entry.subjectName}</td>
                        <td className="py-3 px-4 text-gray-500 text-sm">{entry.roomHall}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile/Tablet Card View */}
            <div className="lg:hidden space-y-3">
              {finishedExams.map((entry, index) => (
                <div
                  key={index}
                  className="bg-gray-50 p-4 sm:p-5 rounded-xl border-2 border-gray-200 opacity-70"
                >
                  <div className="flex items-center justify-between mb-3 gap-2">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold border ${getSessionBadgeClass(entry.session)}`}>
                      {entry.session}
                    </span>
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold border ${getCategoryBadgeClass(entry.category)}`}>
                      {entry.category}
                    </span>
                  </div>
                  <div className="space-y-2.5">
                    <div>
                      <p className="text-gray-500 font-mono text-xs mb-1 font-semibold">{entry.subjectCode}</p>
                      <p className="text-gray-700 font-semibold text-base leading-snug">{entry.subjectName}</p>
                    </div>
                    <p className="text-gray-500 text-sm flex items-center gap-2">
                      <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="break-words">{formatDate(entry.date)}</span>
                    </p>
                    <p className="text-gray-500 text-sm flex items-center gap-2">
                      <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="break-words">{entry.roomHall}</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* Footer Note */}
      <div className="text-center mt-8">
        <p className="text-gray-500 text-sm">
          📄 Download your PDF schedule for offline access
        </p>
      </div>
    </div>
    </div>
  )
}

export default Timetable

