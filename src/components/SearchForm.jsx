import { useState } from 'react'

function SearchForm({ onSearch }) {
  const [name, setName] = useState('')
  const [registerNumber, setRegisterNumber] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!name.trim() || !registerNumber.trim()) {
      alert('Please enter both name and register number.')
      return
    }

    onSearch(name, registerNumber)
  }

  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <div className="w-full max-w-md">
        <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl shadow-2xl border border-gray-700/50 p-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">
              Semester Schedule Generator
            </h1>
            <p className="text-gray-400">Enter your details to view your schedule</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                Student Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg 
                         text-white placeholder-gray-400 focus:outline-none focus:ring-2 
                         focus:ring-primary focus:border-transparent transition-all"
                placeholder="Enter your name"
                required
              />
            </div>

            <div>
              <label htmlFor="registerNumber" className="block text-sm font-medium text-gray-300 mb-2">
                Register Number
              </label>
              <input
                id="registerNumber"
                type="text"
                value={registerNumber}
                onChange={(e) => setRegisterNumber(e.target.value)}
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg 
                         text-white placeholder-gray-400 focus:outline-none focus:ring-2 
                         focus:ring-primary focus:border-transparent transition-all"
                placeholder="Enter your register number"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-primary hover:bg-blue-600 text-white font-semibold 
                       py-3 px-6 rounded-lg transition-all duration-200 transform 
                       hover:scale-105 shadow-lg hover:shadow-xl"
            >
              Get My Schedule
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default SearchForm

