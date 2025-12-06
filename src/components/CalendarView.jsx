import React, { useState } from 'react'

function CalendarView({ schedule, studentInfo, onBack, darkMode, toggleDarkMode }) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [view, setView] = useState('calendar') // 'calendar' or 'timeline'
  const [showExportModal, setShowExportModal] = useState(false)

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
    exportToICS()
    setShowExportModal(true)
  }

  const getCategoryColor = (category) => {
    if (category === 'Theory') return 'bg-blue-500'
    if (category === 'Practical') return 'bg-cyan-500'
    if (category === 'Project') return 'bg-purple-500'
    return 'bg-gray-500'
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black transition-colors duration-300">
      <style>{`
        @keyframes scan {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }
      `}</style>
      {/* Export Success Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] p-4" onClick={() => setShowExportModal(false)}>
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8 animate-[fadeIn_0.2s_ease-in-out]" onClick={(e) => e.stopPropagation()}>
            {/* Success Icon */}
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>

            {/* Title */}
            <h3 className="text-2xl font-bold text-center text-black dark:text-white mb-2">
              Calendar Downloaded!
            </h3>
            <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
              All {schedule.length} exams are ready to import
            </p>

            {/* Instructions */}
            <div className="bg-gray-50 dark:bg-zinc-800 rounded-xl p-4 mb-6">
              <h4 className="font-bold text-black dark:text-white mb-3 flex items-center gap-2">
                <span className="text-blue-600 dark:text-blue-400">📋</span>
                Import to Google Calendar:
              </h4>
              <ol className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <li className="flex gap-2">
                  <span className="font-bold text-blue-600 dark:text-blue-400 flex-shrink-0">1.</span>
                  <span>Open <a href="https://calendar.google.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">calendar.google.com</a></span>
                </li>
                <li className="flex gap-2">
                  <span className="font-bold text-blue-600 dark:text-blue-400 flex-shrink-0">2.</span>
                  <span>Click Settings ⚙️ → <strong>Import & Export</strong></span>
                </li>
                <li className="flex gap-2">
                  <span className="font-bold text-blue-600 dark:text-blue-400 flex-shrink-0">3.</span>
                  <span>Select the downloaded <strong>.ics</strong> file</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-bold text-blue-600 dark:text-blue-400 flex-shrink-0">4.</span>
                  <span>Choose your calendar and click <strong>Import</strong></span>
                </li>
              </ol>
            </div>

            {/* Close Button */}
            <button
              onClick={() => setShowExportModal(false)}
              className="w-full bg-black dark:bg-white text-white dark:text-black font-semibold py-3 px-4 rounded-xl hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
            >
              Got it!
            </button>
          </div>
        </div>
      )}

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

            {/* Export Button */}
            <button
              onClick={exportToGoogleCalendar}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 sm:px-6 rounded-lg transition-all text-sm flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 9.75h-2.437V7.313h2.437V9.75zm-3.563 0H11.56V7.313h2.438V9.75zm-3.562 0H8V7.313h2.437V9.75z"/>
              </svg>
              <span>Export to Google Calendar</span>
            </button>
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
            
            <div className="relative pl-8">
              {/* Continuous Minimal Line with Animated Beam */}
              <div className="absolute left-3 top-0 bottom-0 w-[3px] bg-gray-200 dark:bg-zinc-800 overflow-hidden rounded-full">
                {/* Beam 1 */}
                <div 
                  className="absolute inset-0 w-full h-full bg-[linear-gradient(to_bottom,transparent_0%,transparent_40%,#3b82f6_50%,transparent_60%,transparent_100%)] dark:bg-[linear-gradient(to_bottom,transparent_0%,transparent_40%,#60a5fa_50%,transparent_60%,transparent_100%)]"
                  style={{ animation: 'scan 8s linear infinite' }}
                ></div>
                <div 
                  className="absolute inset-0 w-full h-full bg-[linear-gradient(to_bottom,transparent_0%,transparent_48%,#a5f3fc_50%,transparent_52%,transparent_100%)] opacity-80"
                  style={{ animation: 'scan 8s linear infinite' }}
                ></div>

                {/* Beam 2 (Delayed for continuous loop) */}
                <div 
                  className="absolute inset-0 w-full h-full bg-[linear-gradient(to_bottom,transparent_0%,transparent_40%,#3b82f6_50%,transparent_60%,transparent_100%)] dark:bg-[linear-gradient(to_bottom,transparent_0%,transparent_40%,#60a5fa_50%,transparent_60%,transparent_100%)]"
                  style={{ animation: 'scan 8s linear infinite', animationDelay: '4s' }}
                ></div>
                <div 
                  className="absolute inset-0 w-full h-full bg-[linear-gradient(to_bottom,transparent_0%,transparent_48%,#a5f3fc_50%,transparent_52%,transparent_100%)] opacity-80"
                  style={{ animation: 'scan 8s linear infinite', animationDelay: '4s' }}
                ></div>
              </div>

              <div className="">
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
                    <div key={index} className="relative pb-6 last:pb-0">
                      
                      {/* Masking for First Item (Top) */}
                      {index === 0 && (
                        <div className="absolute -left-[26px] top-0 h-6 w-8 bg-white dark:bg-black z-10"></div>
                      )}
                      
                      {/* Masking for Last Item (Bottom) */}
                      {index === schedule.length - 1 && (
                        <div className="absolute -left-[26px] top-6 bottom-0 w-8 bg-white dark:bg-black z-10"></div>
                      )}

                      {/* Timeline dot */}
                      <div className={`absolute -left-[26px] top-6 -translate-y-1/2 w-4 h-4 rounded-full border-[3px] border-white dark:border-black z-20 transition-all duration-300 ${
                        isFinished 
                          ? 'bg-gray-300 dark:bg-zinc-600' 
                          : 'bg-blue-500 dark:bg-blue-400 ring-2 ring-blue-100 dark:ring-blue-900/30'
                      }`}></div>

                      {/* Event card */}
                      <div>
                        <div className={`bg-white dark:bg-black border border-gray-200 dark:border-zinc-700 rounded-lg p-3 sm:p-4 transition-all duration-300 hover:shadow-md`}>
                          <div className="flex items-center justify-between gap-3">
                            {/* Left: Date Icon + Subject Name */}
                            <div className="flex items-center gap-2.5 flex-1 min-w-0">
                              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400 dark:text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <div className="min-w-0">
                                <h3 className={`font-semibold text-sm sm:text-base leading-tight break-words ${isFinished ? 'text-gray-700 dark:text-gray-300' : 'text-black dark:text-white'}`}>
                                  {exam.subjectName}
                                </h3>
                                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-500 mt-0.5">
                                  {examDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </p>
                              </div>
                            </div>

                            {/* Right: Category Badge or Finished Checkmark */}
                            <div className="flex-shrink-0 relative z-10">
                              {isFinished && !isPostponed ? (
                                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 flex items-center justify-center border border-green-400 dark:border-green-500 shadow-[0_0_20px_rgba(74,222,128,0.9)] dark:shadow-[0_0_20px_rgba(74,222,128,0.6)] ring-1 ring-green-400/50">
                                  <svg className="w-4 h-4 sm:w-5 sm:h-5 drop-shadow-[0_0_8px_rgba(74,222,128,0.8)]" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                  </svg>
                                </div>
                              ) : (
                                <span className={`inline-block px-2.5 py-1 rounded text-xs sm:text-sm font-medium border ${
                                  exam.category === 'Theory' ? 'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800/30' :
                                  exam.category === 'Practical' ? 'bg-cyan-50 text-cyan-700 border-cyan-100 dark:bg-cyan-900/20 dark:text-cyan-300 dark:border-cyan-800/30' :
                                  'bg-purple-50 text-purple-700 border-purple-100 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800/30'
                                }`}>
                                  {exam.category}
                                </span>
                              )}
                            </div>
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
