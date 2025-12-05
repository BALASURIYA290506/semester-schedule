import React from 'react'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

function Timetable({ schedule, studentInfo, onBack, darkMode, toggleDarkMode }) {

  // Separate upcoming and finished exams based on session end time
  const now = new Date()
  
  const isExamFinished = (dateString, session) => {
    if (!dateString) return false
    const examDate = new Date(dateString)
    const endHour = session === 'FN' ? 12 : 16
    const sessionEnd = new Date(examDate)
    sessionEnd.setHours(endHour, 0, 0, 0)
    return now > sessionEnd
  }
  
  const upcomingExams = schedule.filter(entry => !isExamFinished(entry.date, entry.session))
  const finishedExams = schedule.filter(entry => isExamFinished(entry.date, entry.session))

  const getCategoryBadgeClass = (category) => {
    if (category === 'Theory') {
      return 'bg-blue-100 text-blue-800 border-blue-300'
    }
    if (category === 'Practical') {
      return 'bg-cyan-100 text-cyan-800 border-cyan-300'
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

  const getExamStatus = (dateString) => {
    if (!dateString) return 'upcoming'
    const examDate = new Date(dateString)
    examDate.setHours(0, 0, 0, 0)
    const todayDate = new Date()
    todayDate.setHours(0, 0, 0, 0)
    
    if (examDate.getTime() === todayDate.getTime()) return 'today'
    if (examDate.getTime() < todayDate.getTime()) return 'finished'
    return 'upcoming'
  }

  const getSessionTime = (session) => {
    if (session === 'FN') {
      return '9:00 AM - 12:00 PM'
    }
    if (session === 'AN') {
      return '1:00 PM - 4:00 PM'
    }
    return null
  } 




const getTimeRemaining = (dateString, session) => {
  if (!dateString) return null;

  const examDate = new Date(dateString);
  const now = new Date();

  let startHour = session === "FN" ? 9 : 13;
  let endHour = session === "FN" ? 12 : 16;

  const sessionStart = new Date(examDate);
  sessionStart.setHours(startHour, 0, 0, 0);

  const sessionEnd = new Date(examDate);
  sessionEnd.setHours(endHour, 0, 0, 0);

  // If exam is over
  if (now > sessionEnd) return null;

  // If exam is happening
  if (now >= sessionStart && now <= sessionEnd) {
    const remainingMs = sessionEnd - now;
    const mins = Math.floor(remainingMs / 1000 / 60);
    const hrs = Math.floor(mins / 60);
    const remMins = mins % 60;
    return hrs > 0 ? `${hrs}h ${remMins}m left` : `${remMins}m left`;
  }

  // If exam is in the future
  const diffMs = sessionStart - now;
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);
  const remHours = hours % 24;

  if (days > 0) return `${days}d ${remHours}h left`;
  if (hours > 0) return `${hours}h left`;

  const mins = Math.floor(diffMs / (1000 * 60));
  return `${mins}m left`;
};



  const getStatusBadge = (status) => {
    if (status === 'today') {
      return (
        <span className="inline-flex items-center justify-center min-w-[75px] px-2 lg:px-3 py-1 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 border border-red-300 dark:border-red-700 rounded-full text-xs font-bold animate-pulse whitespace-nowrap">
          TODAY
        </span>
      )
    }
    if (status === 'upcoming') {
      return (
        <span className="inline-flex items-center justify-center min-w-[75px] px-2 lg:px-3 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 border border-yellow-300 dark:border-yellow-700 rounded-full text-xs font-semibold whitespace-nowrap">
          UPCOMING
        </span>
      )
    }
    if (status === 'finished') {
      return (
        <span className="inline-flex items-center justify-center min-w-[75px] px-2 lg:px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 border border-green-300 dark:border-green-700 rounded-full text-xs font-semibold whitespace-nowrap">
          FINISHED
        </span>
      )
    }
    return null
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
    <div className="min-h-screen bg-white dark:bg-black transition-colors duration-300">
      {/* Dark Mode Toggle - Top Right */}
      <button
        onClick={toggleDarkMode}
        className="fixed top-4 right-4 sm:top-6 sm:right-6 p-2.5 sm:p-3 rounded-full bg-gray-200 dark:bg-zinc-800 
                   hover:bg-gray-300 dark:hover:bg-zinc-700 transition-all duration-300 shadow-lg z-50"
        aria-label="Toggle dark mode"
      >
        {darkMode ? (
          <svg className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
          </svg>
        ) : (
          <svg className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
            <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
          </svg>
        )}
      </button>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6">
        {/* Header with Logo */}
        <div className="flex items-center justify-between mb-6 sm:mb-8 gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <img src="/logo.svg" alt="ExamTrack Pro" className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 flex-shrink-0" />
            <div className="min-w-0">
              <h1 className="text-lg sm:text-2xl lg:text-3xl font-bold text-black dark:text-white truncate">ExamTrack Pro</h1>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">Smart Exam Scheduler</p>
            </div>
          </div>
          <button
            onClick={onBack}
            className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors flex items-center gap-1 sm:gap-2 font-medium text-sm sm:text-base flex-shrink-0"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="hidden sm:inline">Back</span>
          </button>
        </div>

        {/* Student Info Card */}
        <div className="bg-white dark:bg-black rounded-lg sm:rounded-xl shadow-md border border-gray-200 dark:border-zinc-700 p-4 sm:p-6 mb-4 sm:mb-6 transition-colors duration-300">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="min-w-0">
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-1">Student Name</p>
              <p className="text-base sm:text-lg font-semibold text-black dark:text-white break-words">{studentInfo.name}</p>
            </div>
            <div className="min-w-0">
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-1">Register Number</p>
              <p className="text-base sm:text-lg font-semibold text-black dark:text-white break-words">{studentInfo.registerNumber}</p>
            </div>
          </div>
        </div>

        {/* Upcoming Exams Section */}
        {upcomingExams.length > 0 && (
          <div className="bg-white dark:bg-black rounded-lg sm:rounded-xl shadow-md border-2 border-gray-200 dark:border-zinc-700 p-4 sm:p-6 mb-4 sm:mb-6 transition-colors duration-300">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-3">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-black dark:text-white flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                <h2 className="text-xl sm:text-2xl font-bold text-black dark:text-white">Upcoming Exams</h2>
              </div>
              <button
                onClick={downloadPDF}
                className="w-full sm:w-auto bg-black dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-200 text-white dark:text-black font-medium py-2 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 text-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export PDF
              </button>
            </div>

            {/* Desktop Table */}
            <div className="hidden lg:block overflow-x-auto -mx-4 sm:-mx-6 px-4 sm:px-6">
              <table className="w-full min-w-full">
                <thead>
                  <tr className="border-b-2 border-black dark:border-white">
                    <th className="text-left py-3 px-2 lg:px-3 text-xs lg:text-sm font-bold text-black dark:text-white whitespace-nowrap">Date</th>
                    <th className="text-left py-3 px-2 lg:px-3 text-xs lg:text-sm font-bold text-black dark:text-white whitespace-nowrap">Session</th>
                    <th className="text-left py-3 px-2 lg:px-3 text-xs lg:text-sm font-bold text-black dark:text-white whitespace-nowrap">Category</th>
                    <th className="text-left py-3 px-2 lg:px-3 text-xs lg:text-sm font-bold text-black dark:text-white whitespace-nowrap">Code</th>
                    <th className="text-left py-3 px-2 lg:px-3 text-xs lg:text-sm font-bold text-black dark:text-white">Subject</th>
                    <th className="text-left py-3 px-2 lg:px-3 text-xs lg:text-sm font-bold text-black dark:text-white">Location</th>
                  </tr>
                </thead>
                <tbody>
                  {upcomingExams.map((entry, index) => {
                    const daysGap = index < upcomingExams.length - 1 
                      ? getDaysBetweenExams(entry.date, upcomingExams[index + 1].date)
                      : null

                    return (
                      <React.Fragment key={index}>
                        <tr className="border-b border-gray-200 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-900 transition-colors">
                          <td className="py-3 px-2 lg:px-3">
                            <div className="flex flex-col gap-1">
                              <span className="text-black dark:text-white font-medium text-xs lg:text-sm whitespace-nowrap">{formatDate(entry.date)}</span>
                              <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-2">
                                  {getStatusBadge(getExamStatus(entry.date))}
                                  {getExamStatus(entry.date) !== 'finished' && getTimeRemaining(entry.date, entry.session, entry.category) && (
                                    <span className="text-[10px] font-semibold text-orange-600 dark:text-orange-400">
                                      {getTimeRemaining(entry.date, entry.session, entry.category)}
                                    </span>
                                  )}
                                </div>

                                {getSessionTime(entry.session) && (
                                  <span className="text-[10px] font-bold text-gray-600 dark:text-gray-300">
                                    {getSessionTime(entry.session)}
                                  </span>
                                )}

                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-2 lg:px-3">
                            <span className={`inline-block px-2 lg:px-3 py-1 rounded-full text-xs font-semibold border whitespace-nowrap ${getSessionBadgeClass(entry.session)}`}>
                              {entry.session}
                            </span>
                          </td>
                          <td className="py-3 px-2 lg:px-3">
                            <span className={`inline-block px-2 lg:px-3 py-1 rounded-full text-xs font-semibold border whitespace-nowrap ${getCategoryBadgeClass(entry.category)}`}>
                              {entry.category}
                            </span>
                          </td>
                          <td className="py-3 px-2 lg:px-3 text-gray-600 dark:text-gray-400 text-xs lg:text-sm font-mono whitespace-nowrap">{entry.subjectCode}</td>
                          <td className="py-3 px-2 lg:px-3 text-black dark:text-white font-medium text-xs lg:text-sm break-words min-w-[150px] max-w-[300px]">{entry.subjectName}</td>
                          <td className="py-3 px-2 lg:px-3 text-gray-600 dark:text-gray-400 text-xs lg:text-sm break-words">{entry.roomHall}</td>
                        </tr>
                        {daysGap && (
                          <tr className="border-b border-gray-200 dark:border-zinc-800">
                            <td colSpan="6" className="py-2 px-2 lg:px-3">
                              <div className="flex items-center justify-center">
                                <div className="bg-gray-100 dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 rounded-full px-3 lg:px-4 py-1 text-xs font-medium text-gray-600 dark:text-white whitespace-nowrap">
                                  {daysGap} {daysGap === 1 ? 'day' : 'days'} gap
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden space-y-3">
              {upcomingExams.map((entry, index) => {
                const daysGap = index < upcomingExams.length - 1 
                  ? getDaysBetweenExams(entry.date, upcomingExams[index + 1].date)
                  : null

                return (
                  <React.Fragment key={index}>
                    <div className="bg-white dark:bg-black border border-gray-200 dark:border-zinc-700 rounded-lg p-3 sm:p-4 shadow-sm transition-colors duration-300">
                      <div className="space-y-2">
                        {/* Status Badge and Time Remaining */}
                        <div className="flex justify-between items-start">
                          <div className="flex flex-col gap-1">
                            {getStatusBadge(getExamStatus(entry.date))}
                                {getSessionTime(entry.session) && (
                                  <span className="text-[10px] font-bold text-gray-600 dark:text-gray-300">
                                    {getSessionTime(entry.session)}
                                  </span>
                                )}

                          </div>
                          {getExamStatus(entry.date) !== 'finished' && getTimeRemaining(entry.date, entry.session, entry.category) && (
                            <div className="text-xs font-semibold text-orange-600 dark:text-orange-400">
                              {getTimeRemaining(entry.date, entry.session, entry.category)}
                            </div>
                          )}
                        </div>
                        
                        {/* Date and Session Row */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Date</p>
                            <p className="text-sm font-semibold text-black dark:text-white break-words">{formatDate(entry.date)}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Session</p>
                            <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold border whitespace-nowrap ${getSessionBadgeClass(entry.session)}`}>
                              {entry.session}
                            </span>
                          </div>
                        </div>
                        
                        {/* Category and Code Row */}
                        <div className="flex items-start justify-between gap-2 pt-2 border-t border-gray-100 dark:border-zinc-800">
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Category</p>
                            <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold border whitespace-nowrap ${getCategoryBadgeClass(entry.category)}`}>
                              {entry.category}
                            </span>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Code</p>
                            <p className="text-xs font-mono text-gray-600 dark:text-gray-400">{entry.subjectCode}</p>
                          </div>
                        </div>
                        
                        {/* Subject Row */}
                        <div className="pt-2 border-t border-gray-100 dark:border-zinc-800">
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Subject</p>
                          <p className="text-sm font-medium text-black dark:text-white break-words leading-relaxed">{entry.subjectName}</p>
                        </div>
                        
                        {/* Location Row */}
                        <div className="pt-2 border-t border-gray-100 dark:border-zinc-800">
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Location</p>
                          <p className="text-sm text-gray-600 dark:text-gray-300 break-words">{entry.roomHall}</p>
                        </div>
                      </div>
                    </div>
                    {daysGap && (
                      <div className="flex items-center justify-center py-1.5">
                        <div className="bg-gray-100 dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 rounded-full px-3 sm:px-4 py-1 text-xs font-medium text-gray-600 dark:text-white whitespace-nowrap">
                          {daysGap} {daysGap === 1 ? 'day' : 'days'} gap
                        </div>
                      </div>
                    )}
                  </React.Fragment>
                )
              })}
            </div>
          </div>
        )}

        {/* Finished Exams Section */}
        {finishedExams.length > 0 && (
          <div className="bg-white dark:bg-black rounded-lg sm:rounded-xl shadow-md border-2 border-gray-200 dark:border-zinc-700 p-4 sm:p-6 transition-colors duration-300">
            <div className="flex items-center gap-2 mb-4 sm:mb-6">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600 dark:text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-600 dark:text-gray-400">Finished Exams</h2>
            </div>

            {/* Desktop Table */}
            <div className="hidden lg:block overflow-x-auto -mx-4 sm:-mx-6 px-4 sm:px-6">
              <table className="w-full min-w-full">
                <thead>
                  <tr className="border-b-2 border-black dark:border-white">
                    <th className="text-left py-3 px-2 lg:px-3 text-xs lg:text-sm font-bold text-black dark:text-white whitespace-nowrap">Date</th>
                    <th className="text-left py-3 px-2 lg:px-3 text-xs lg:text-sm font-bold text-black dark:text-white whitespace-nowrap">Category</th>
                    <th className="text-left py-3 px-2 lg:px-3 text-xs lg:text-sm font-bold text-black dark:text-white whitespace-nowrap">Code</th>
                    <th className="text-left py-3 px-2 lg:px-3 text-xs lg:text-sm font-bold text-black dark:text-white">Subject</th>
                  </tr>
                </thead>
                <tbody>
                  {finishedExams.map((entry, index) => (
                    <tr key={index} className="border-b border-gray-200 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-900 transition-colors">
                      <td className="py-3 px-2 lg:px-3">
                        <div className="flex items-center gap-2">
                          <span className="text-black dark:text-white font-medium text-xs lg:text-sm whitespace-nowrap">{formatDate(entry.date)}</span>
                          <span className="inline-flex items-center justify-center px-2 py-0.5 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 border border-green-300 dark:border-green-700 rounded-full text-[10px] font-semibold whitespace-nowrap">
                            FINISHED
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-2 lg:px-3">
                        <span className={`inline-block px-2 lg:px-3 py-1 rounded-full text-xs font-semibold border whitespace-nowrap ${getCategoryBadgeClass(entry.category)}`}>
                          {entry.category}
                        </span>
                      </td>
                      <td className="py-3 px-2 lg:px-3 text-gray-600 dark:text-gray-400 text-xs lg:text-sm font-mono whitespace-nowrap">{entry.subjectCode}</td>
                      <td className="py-3 px-2 lg:px-3 text-black dark:text-white font-medium text-xs lg:text-sm break-words min-w-[150px] max-w-[300px]">{entry.subjectName}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden space-y-3">
              {finishedExams.map((entry, index) => (
                <div key={index} className="bg-white dark:bg-black border border-gray-200 dark:border-zinc-700 rounded-lg p-3 sm:p-4 shadow-sm transition-colors duration-300">
                  <div className="space-y-2">
                    {/* Status Badge */}
                    <div className="flex justify-end">
                      {getStatusBadge('finished')}
                    </div>
                    
                    {/* Date Row */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Date</p>
                        <p className="text-sm font-semibold text-black dark:text-white break-words">{formatDate(entry.date)}</p>
                      </div>
                    </div>
                    
                    {/* Category and Code Row */}
                    <div className="flex items-start justify-between gap-2 pt-2 border-t border-gray-100 dark:border-zinc-800">
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Category</p>
                        <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold border whitespace-nowrap ${getCategoryBadgeClass(entry.category)}`}>
                          {entry.category}
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Code</p>
                        <p className="text-xs font-mono text-gray-600 dark:text-gray-400">{entry.subjectCode}</p>
                      </div>
                    </div>
                    
                    {/* Subject Row */}
                    <div className="pt-2 border-t border-gray-100 dark:border-zinc-800">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Subject</p>
                      <p className="text-sm font-medium text-black dark:text-white break-words leading-relaxed">{entry.subjectName}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Timetable

