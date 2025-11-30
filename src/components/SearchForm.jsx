import { useState } from 'react'

function SearchForm({ onSearch }) {
  const [registerNumber, setRegisterNumber] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!registerNumber.trim()) {
      alert('Please enter your register number.')
      return
    }

    onSearch(registerNumber)
  }

  return (
    <div className="flex items-center justify-center min-h-screen py-8 sm:py-12 px-4 bg-white">
      <div className="w-full max-w-lg">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 sm:p-10">
          <div className="text-center mb-8 sm:mb-10">
            <div className="inline-flex items-center justify-center mb-4 sm:mb-6">
              <img src="/logo.svg" alt="ExamTrack Pro Logo" className="w-20 h-20 sm:w-24 sm:h-24" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-black mb-2 sm:mb-3">
              ExamTrack Pro
            </h1>
            <p className="text-gray-500 text-sm sm:text-base font-medium">Smart Exam Scheduler</p>
            <p className="text-gray-400 text-xs sm:text-sm mt-2">Enter your register number to view your schedule</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
            <div>
              <label htmlFor="registerNumber" className="block text-sm font-semibold text-gray-700 mb-2 sm:mb-3">
                Register Number
              </label>
              <input
                id="registerNumber"
                type="text"
                value={registerNumber}
                onChange={(e) => setRegisterNumber(e.target.value)}
                className="w-full px-4 py-3 sm:px-5 sm:py-4 bg-white border-2 border-gray-300 rounded-xl 
                         text-black placeholder-gray-400 focus:outline-none focus:ring-2 
                         focus:ring-black focus:border-black transition-all duration-200 text-base"
                placeholder="e.g., 212222020001"
                required
                autoFocus
              />
            </div>

            <button
              type="submit"
              className="w-full bg-black hover:bg-gray-800 
                       text-white font-bold py-3 sm:py-4 px-6 rounded-xl transition-all duration-200 
                       shadow-lg hover:shadow-xl 
                       hover:-translate-y-1 active:translate-y-0 text-base"
            >
              View Schedule
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default SearchForm

