import React, { useState } from 'react'

function CalendarView({ schedule, studentInfo, onBack, darkMode, toggleDarkMode }) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [view, setView] = useState('calendar') // 'calendar' or 'timeline'

  // Get all exam dates
  const examDates = schedule.reduce((acc, exam) => {
    // Parse date and create a local date string to avoid timezone issues
    const examDate = new Date(exam.date)
    const dateKey = `${examDate.getFullYear()}-${String(examDate.getMonth() + 1).padStart(2, '0')}-${String(examDate.getDate()).padStart(2, '0')}`
    if (!acc[dateKey]) {
      acc[dateKey] = []
    }
    acc[dateKey].push(exam)
    return acc
  }, {})

  // Calendar generation
  const getDaysInMonth = (date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startDayOfWeek = firstDay.getDay()
    
    return { daysInMonth, startDayOfWeek, year, month }
  }

  const { daysInMonth, startDayOfWeek, year, month } = getDaysInMonth(currentMonth)
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                      'July', 'August', 'September', 'October', 'November', 'December']

  const previousMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1))
  }

  const nextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1))
  }

  const isToday = (day) => {
    const today = new Date()
    return day === today.getDate() && 
           month === today.getMonth() && 
           year === today.getFullYear()
  }

  const hasExam = (day) => {
    // Create date string in local timezone format to match exam dates
    const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return examDates[dateKey]
  }

  const exportToICS = () => {
    let icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//ExamTrack Pro//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:${studentInfo.name} - Exam Schedule
X-WR-TIMEZONE:Asia/Kolkata
`

    schedule.forEach((exam, index) => {
      const examDate = new Date(exam.date)
      const startHour = exam.session === 'FN' ? 9 : 13
      const endHour = exam.session === 'FN' ? 12 : 16
      
      const startDateTime = new Date(examDate)
      startDateTime.setHours(startHour, 0, 0, 0)
      
      const endDateTime = new Date(examDate)
      endDateTime.setHours(endHour, 0, 0, 0)

      const formatICSDate = (date) => {
        return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
      }

      icsContent += `BEGIN:VEVENT
UID:exam-${index}-${Date.now()}@examtrackpro.com
DTSTAMP:${formatICSDate(new Date())}
DTSTART:${formatICSDate(startDateTime)}
DTEND:${formatICSDate(endDateTime)}
SUMMARY:${exam.subjectName} (${exam.category})
DESCRIPTION:Subject Code: ${exam.subjectCode}\\nSession: ${exam.session}\\nCategory: ${exam.category}
LOCATION:${exam.roomHall}
STATUS:CONFIRMED
SEQUENCE:0
BEGIN:VALARM
TRIGGER:-PT1H
ACTION:DISPLAY
DESCRIPTION:Exam in 1 hour
END:VALARM
END:VEVENT
`
    })

    icsContent += 'END:VCALENDAR'

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `${studentInfo.registerNumber}_exam_calendar.ics`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const exportToGoogleCalendar = () => {
    // Open Google Calendar with first exam
    if (schedule.length > 0) {
      const firstExam = schedule[0]
      const examDate = new Date(firstExam.date)
      const startHour = firstExam.session === 'FN' ? 9 : 13
      const endHour = firstExam.session === 'FN' ? 12 : 16
      
      const startDateTime = new Date(examDate)
      startDateTime.setHours(startHour, 0, 0, 0)
      
      const endDateTime = new Date(examDate)
      endDateTime.setHours(endHour, 0, 0, 0)

      const formatGoogleDate = (date) => {
        return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
      }

      const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(firstExam.subjectName + ' (' + firstExam.category + ')')}&dates=${formatGoogleDate(startDateTime)}/${formatGoogleDate(endDateTime)}&details=${encodeURIComponent('Subject Code: ' + firstExam.subjectCode + '\nSession: ' + firstExam.session)}&location=${encodeURIComponent(firstExam.roomHall)}`
      
      window.open(url, '_blank')
      
      alert('Opening Google Calendar for the first exam. For all exams, please download the .ics file and import it to Google Calendar.')
    }
  }

  const getCategoryColor = (category) => {
    if (category === 'Theory') return 'bg-blue-500'
    if (category === 'Practical') return 'bg-cyan-500'
    if (category === 'Project') return 'bg-purple-500'
    return 'bg-gray-500'
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black transition-colors duration-300">
      {/* Dark Mode Toggle */}
      <button
        onClick={toggleDarkMode}
        className="fixed bottom-4 right-4 sm:top-6 sm:right-6 sm:bottom-auto p-2.5 sm:p-3 rounded-full bg-gray-200 dark:bg-zinc-800 
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
        {/* Header */}
        <div className="flex items-center justify-between mb-6 sm:mb-8 gap-2">
          <button
            onClick={onBack}
            className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors flex items-center gap-1 sm:gap-2 font-medium text-sm sm:text-base flex-shrink-0"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="hidden sm:inline">Back</span>
          </button>
          
          <div className="flex items-center gap-2 sm:gap-3">
            <img src="/logo.svg" alt="ExamTrack Pro" className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 flex-shrink-0" />
            <div className="min-w-0">
              <h1 className="text-lg sm:text-2xl lg:text-3xl font-bold text-black dark:text-white truncate">Calendar View</h1>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">{studentInfo.name} • {studentInfo.registerNumber}</p>
            </div>
          </div>
          
          <div className="w-10 sm:w-0"></div>
        </div>

        {/* View Toggle & Export Buttons */}
        <div className="bg-white dark:bg-black rounded-xl shadow-md border border-gray-200 dark:border-zinc-700 p-4 mb-6 transition-colors duration-300">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* View Toggle */}
            <div className="flex gap-2">
              <button
                onClick={() => setView('calendar')}
                className={`flex-1 sm:flex-none px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                  view === 'calendar'
                    ? 'bg-black dark:bg-white text-white dark:text-black'
                    : 'bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-zinc-700'
                }`}
              >
                <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Calendar
              </button>
              <button
                onClick={() => setView('timeline')}
                className={`flex-1 sm:flex-none px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                  view === 'timeline'
                    ? 'bg-black dark:bg-white text-white dark:text-black'
                    : 'bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-zinc-700'
                }`}
              >
                <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                Timeline
              </button>
            </div>

            {/* Export Buttons */}
            <div className="flex gap-2">
              <button
                onClick={exportToGoogleCalendar}
                className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-3 sm:px-4 rounded-lg transition-all text-sm flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 9.75h-2.437V7.313h2.437V9.75zm-3.563 0H11.56V7.313h2.438V9.75zm-3.562 0H8V7.313h2.437V9.75z"/>
                </svg>
                <span className="hidden sm:inline">Google</span>
              </button>
              <button
                onClick={exportToICS}
                className="flex-1 sm:flex-none bg-gray-800 dark:bg-gray-200 hover:bg-gray-900 dark:hover:bg-gray-300 text-white dark:text-black font-medium py-2 px-3 sm:px-4 rounded-lg transition-all text-sm flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="hidden sm:inline">Download .ics</span>
              </button>
            </div>
          </div>
        </div>

        {/* Calendar View */}
        {view === 'calendar' && (
          <div className="bg-white dark:bg-black rounded-xl shadow-md border border-gray-200 dark:border-zinc-700 p-4 sm:p-6 transition-colors duration-300">
            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={previousMonth}
                className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 text-black dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h2 className="text-xl sm:text-2xl font-bold text-black dark:text-white">
                {monthNames[month]} {year}
              </h2>
              <button
                onClick={nextMonth}
                className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 text-black dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1 sm:gap-2">
              {/* Day Headers */}
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="text-center font-bold text-xs sm:text-sm text-gray-600 dark:text-gray-400 py-2">
                  {day}
                </div>
              ))}

              {/* Empty cells for days before month starts */}
              {Array.from({ length: startDayOfWeek }).map((_, index) => (
                <div key={`empty-${index}`} className="aspect-square"></div>
              ))}

              {/* Calendar days */}
              {Array.from({ length: daysInMonth }).map((_, index) => {
                const day = index + 1
                const exams = hasExam(day)
                const today = isToday(day)

                return (
                  <div
                    key={day}
                    className={`aspect-square border border-gray-200 dark:border-zinc-700 rounded-lg p-1 sm:p-2 relative transition-all hover:shadow-md ${
                      today ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500 dark:border-blue-500' : 
                      exams ? 'bg-gray-50 dark:bg-zinc-900' : ''
                    }`}
                  >
                    <div className={`text-xs sm:text-sm font-semibold ${
                      today ? 'text-blue-600 dark:text-blue-400' : 'text-black dark:text-white'
                    }`}>
                      {day}
                    </div>
                    {exams && (
                      <div className="mt-1 space-y-0.5">
                        {exams.map((exam, idx) => (
                          <div
                            key={idx}
                            className={`${getCategoryColor(exam.category)} h-1 sm:h-1.5 rounded-full`}
                            title={`${exam.subjectName} (${exam.session})`}
                          ></div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Legend */}
            <div className="mt-6 flex flex-wrap gap-4 justify-center text-xs sm:text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span className="text-gray-600 dark:text-gray-400">Theory</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-cyan-500"></div>
                <span className="text-gray-600 dark:text-gray-400">Practical</span>
              </div>
            </div>
          </div>
        )}

        {/* Timeline View */}
        {view === 'timeline' && (
          <div className="bg-white dark:bg-black rounded-xl shadow-md border border-gray-200 dark:border-zinc-700 p-4 sm:p-6 transition-colors duration-300">
            <h2 className="text-lg sm:text-xl font-bold text-black dark:text-white mb-4">Exam Timeline</h2>
            
            <div className="relative">
              <div className="space-y-3">
                {schedule.map((exam, index) => {
                  const examDate = new Date(exam.date)
                  const now = new Date()
                  const endHour = exam.session === 'FN' ? 12 : 16
                  const sessionEnd = new Date(examDate)
                  sessionEnd.setHours(endHour, 0, 0, 0)
                  const isFinished = now > sessionEnd
                  
                  // Check if exam is on December 3, 2025
                  // Use local date components to avoid timezone issues
                  const isPostponed = examDate.getFullYear() === 2025 && 
                                     examDate.getMonth() === 11 && 
                                     examDate.getDate() === 3
                  
                  return (
                    <div key={index} className="relative pl-5">
                      {/* Vertical line - only show if not the last item */}
                      {index < schedule.length - 1 && (
                        <div className="absolute left-[5px] top-0 bottom-0 w-[1px] bg-gray-200 dark:bg-zinc-800"></div>
                      )}
                      
                      {/* Timeline dot */}
                      <div className={`absolute left-0 w-2.5 h-2.5 rounded-full border ${
                        isFinished 
                          ? 'bg-white dark:bg-black border-gray-400 dark:border-gray-600' 
                          : 'bg-black dark:bg-white border-black dark:border-white'
                      }`}></div>

                      {/* Event card */}
                      <div className={`${isFinished ? 'opacity-50' : ''}`}>
                        <div className="bg-white dark:bg-black border border-gray-200 dark:border-zinc-700 rounded-lg p-2.5">
                          {/* Header */}
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-black dark:text-white text-xs leading-tight break-words">
                                {exam.subjectName}
                              </h3>
                            </div>
                            <div className="flex gap-1 items-center flex-shrink-0">
                              <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-semibold ${
                                exam.category === 'Theory' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
                                exam.category === 'Practical' ? 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300' :
                                'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
                              }`}>
                                {exam.category}
                              </span>
                              {isPostponed ? (
                                <span className="inline-block px-1.5 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 rounded text-[9px] font-semibold">
                                  Postponed
                                </span>
                              ) : isFinished && (
                                <span className="inline-block px-1.5 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded text-[9px] font-semibold">
                                  ✓
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Details */}
                          <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-gray-500 dark:text-gray-400">
                            <span className="flex items-center gap-1">
                              <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              {examDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </span>
                            <span className="flex items-center gap-1">
                              <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {exam.session}
                            </span>
                            <span className="flex items-center gap-1 font-mono">
                              <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                              </svg>
                              {exam.subjectCode}
                            </span>
                            <span className="flex items-center gap-1 truncate">
                              <svg className="w-2.5 h-2.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              {exam.roomHall}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default CalendarView
