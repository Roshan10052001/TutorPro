export const initialTutors = [
  {
    id: 1,
    name: 'Prince Karikari',
    email: 'prince@slu.edu',
    course: 'CSCI 5030 - Software Engineering',
    rating: 4.9,
    availability: ['Monday - 5:00 PM', 'Wednesday - 5:00 PM'],
    bio: 'Helps students with software engineering concepts, agile workflow, and project planning.',
    status: 'approved'
  },
  {
    id: 2,
    name: 'Pelumi Oluwategbe',
    email: 'pelumi@slu.edu',
    course: 'CSCI 4710 - Database Systems',
    rating: 4.8,
    availability: ['Tuesday - 6:00 PM', 'Thursday - 6:00 PM'],
    bio: 'Supports students in ER diagrams, SQL, normalization, and relational design.',
    status: 'approved'
  },
  {
    id: 3,
    name: 'Guddu Yadav',
    email: 'guddu@slu.edu',
    course: 'CSCI 5300 - Data Structures',
    rating: 4.7,
    availability: ['Friday - 4:00 PM', 'Saturday - 2:00 PM'],
    bio: 'Focuses on trees, graphs, recursion, and problem-solving sessions.',
    status: 'approved'
  }
]

export const initialTutorApplications = [
  {
    id: 101,
    name: 'Roshan Sharma',
    email: 'roshan@slu.edu',
    course: 'CSCI 5420 - Computer Networks',
    availability: ['Monday - 3:00 PM', 'Thursday - 4:30 PM'],
    bio: 'Can help students with routing, TCP/IP, and network basics.',
    status: 'pending'
  }
]

export const initialSessions = [
  {
    id: 201,
    course: 'CSCI 5030 - Software Engineering',
    tutor: 'Prince Karikari',
    student: 'Bijay Kumar Chaudhary',
    studentEmail: 'bchaudhary3@slu.edu',
    time: 'Monday - 5:00 PM',
    note: 'Need help with sprint planning and Jira tasks.',
    status: 'Booked'
  },
  {
    id: 202,
    course: 'CSCI 4710 - Database Systems',
    tutor: 'Pelumi Oluwategbe',
    student: 'Guddu Yadav',
    studentEmail: 'guddu@slu.edu',
    time: 'Thursday - 6:00 PM',
    note: 'Need help with ER diagram conversion.',
    status: 'Confirmed'
  }
]