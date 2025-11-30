# Personalized Semester Timetable Generator

A beautiful, modern web application built with React and Tailwind CSS that allows students to view and export their personalized semester timetables.

## ✨ Features

- 🔍 **Smart Search**: Find your timetable by entering your name and register number
- 📅 **Organized Schedule**: View your timetable sorted by date and session
- 🎨 **Beautiful UI**: Modern dark-themed interface with glassmorphism effects
- 📥 **Export Options**: Download your timetable as PNG or PDF
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile devices

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone or download this repository
2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## 📦 Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## 📂 Project Structure

```
/project
  /src
    /components
      SearchForm.jsx      # Search form component
      Timetable.jsx       # Timetable display and export
    /data
      students.json       # Student data (replace with your data)
    App.jsx               # Main app component with routing logic
    main.jsx              # React entry point
    index.css             # Global styles with Tailwind
  index.html
  tailwind.config.js
  postcss.config.js
  vite.config.js
  package.json
  README.md
```

## 📊 Data Format

Replace `src/data/students.json` with your actual data. The JSON should follow this structure:

```json
[
  {
    "studentName": "Student Name",
    "registerNumber": "REG001",
    "date": "2024-01-15",
    "session": "FN",
    "category": "Theory",
    "subjectName": "Mathematics",
    "roomHall": "Room 101"
  }
]
```

### Required Fields:
- `studentName`: Student's full name
- `registerNumber`: Unique registration number
- `date`: Date in YYYY-MM-DD format
- `session`: "FN" (Forenoon) or "AN" (Afternoon)
- `category`: "Theory" or "Practical"
- `subjectName`: Name of the subject
- `roomHall`: Room or hall number

## 🎨 Customization

### Colors
Edit `tailwind.config.js` to customize the primary color and other theme settings.

### Styling
All styles use Tailwind CSS utility classes. Modify components in `src/components/` to change the appearance.

## 🔧 Technologies Used

- **React 18**: UI library
- **Vite**: Build tool and dev server
- **Tailwind CSS**: Utility-first CSS framework
- **html2canvas**: Convert HTML to PNG
- **jsPDF**: Generate PDF files

## 📝 Notes

- Name matching is case-insensitive and space-insensitive
- Timetable is automatically sorted by date (ascending) and session (FN before AN)
- Export filenames follow the pattern: `<registerNumber>_timetable.png/pdf`

## 🤝 Contributing

Feel free to submit issues or pull requests!

## 📄 License

This project is open source and available for personal and educational use.

---

Built with ❤️ using React and Tailwind CSS

