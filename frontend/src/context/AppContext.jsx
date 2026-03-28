import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import {
  initialTutors,
  initialSessions,
  initialTutorApplications
} from '../data/mockData'

const AppContext = createContext()

function safeRead(key, fallback) {
  try {
    const saved = localStorage.getItem(key)
    return saved ? JSON.parse(saved) : fallback
  } catch (error) {
    return fallback
  }
}

const defaultAdminUser = {
  name: 'Admin',
  email: 'admin@tutorpro.com',
  password: 'Admin123!',
  role: 'admin'
}

function getStoredUsers() {
  const savedUsers = safeRead('tutorProUsers', [])
  const hasAdmin = savedUsers.some(
    (user) => user.email.toLowerCase() === defaultAdminUser.email.toLowerCase()
  )

  if (!hasAdmin) {
    const updatedUsers = [defaultAdminUser, ...savedUsers]
    localStorage.setItem('tutorProUsers', JSON.stringify(updatedUsers))
    return updatedUsers
  }

  return savedUsers
}

export function AppProvider({ children }) {
  const [tutors, setTutors] = useState(() =>
    safeRead('tutorProTutors', initialTutors)
  )

  const [sessions, setSessions] = useState(() =>
    safeRead('tutorProSessions', initialSessions)
  )

  const [applications, setApplications] = useState(() =>
    safeRead('tutorProApplications', initialTutorApplications)
  )

  const [users, setUsers] = useState(() => getStoredUsers())

  const [currentUser, setCurrentUser] = useState(() =>
    safeRead('loggedInUser', null)
  )

  useEffect(() => {
    localStorage.setItem('tutorProTutors', JSON.stringify(tutors))
  }, [tutors])

  useEffect(() => {
    localStorage.setItem('tutorProSessions', JSON.stringify(sessions))
  }, [sessions])

  useEffect(() => {
    localStorage.setItem('tutorProApplications', JSON.stringify(applications))
  }, [applications])

  useEffect(() => {
    localStorage.setItem('tutorProUsers', JSON.stringify(users))
  }, [users])

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('loggedInUser', JSON.stringify(currentUser))
    } else {
      localStorage.removeItem('loggedInUser')
    }
  }, [currentUser])

  const currentUserRole = currentUser?.role || ''
  const currentUserEmail = currentUser?.email || ''
  const currentUserName = currentUser?.name || ''

  const approvedTutors = useMemo(
    () => tutors.filter((tutor) => tutor.status === 'approved'),
    [tutors]
  )

  const pendingApplications = useMemo(
    () => applications.filter((app) => app.status === 'pending'),
    [applications]
  )

  const registerUser = ({ name, email, password, role }) => {
    const cleanEmail = email.trim().toLowerCase()

    if (role === 'admin') {
      return {
        ok: false,
        message: 'Admin account cannot be created from sign up.'
      }
    }

    const alreadyExists = users.some(
      (user) => user.email.trim().toLowerCase() === cleanEmail
    )

    if (alreadyExists) {
      return {
        ok: false,
        message: 'An account with this email already exists.'
      }
    }

    const newUser = {
      id: Date.now(),
      name: name.trim(),
      email: cleanEmail,
      password,
      role
    }

    setUsers((prev) => [newUser, ...prev])

    return {
      ok: true,
      message: 'Account created successfully.'
    }
  }

  const loginUser = ({ email, password }) => {
    const cleanEmail = email.trim().toLowerCase()

    const foundUser = users.find(
      (user) =>
        user.email.trim().toLowerCase() === cleanEmail &&
        user.password === password
    )

    if (!foundUser) {
      return {
        ok: false,
        message: 'Invalid email or password.'
      }
    }

    const loggedUser = {
      name: foundUser.name,
      email: foundUser.email,
      role: foundUser.role
    }

    setCurrentUser(loggedUser)

    return {
      ok: true,
      user: loggedUser
    }
  }

  const logoutUser = () => {
    setCurrentUser(null)
  }

  const submitTutorApplication = (applicationData) => {
    const cleanEmail = applicationData.email.trim().toLowerCase()

    const alreadyApproved = tutors.some(
      (tutor) => tutor.email.trim().toLowerCase() === cleanEmail
    )

    if (alreadyApproved) {
      return {
        ok: false,
        message: 'You are already approved as a tutor.'
      }
    }

    const alreadyPending = applications.some(
      (application) =>
        application.email.trim().toLowerCase() === cleanEmail &&
        application.status === 'pending'
    )

    if (alreadyPending) {
      return {
        ok: false,
        message: 'Your tutor application is already pending admin approval.'
      }
    }

    const newApplication = {
      id: Date.now(),
      ...applicationData,
      email: cleanEmail,
      availability: [...new Set(applicationData.availability.map((slot) => slot.trim()))],
      status: 'pending'
    }

    setApplications((prev) => [newApplication, ...prev])

    return {
      ok: true,
      message: 'Tutor application submitted successfully.'
    }
  }

  const approveTutor = (applicationId) => {
    const application = applications.find((item) => item.id === applicationId)
    if (!application) return

    const alreadyExists = tutors.some(
      (tutor) =>
        tutor.email.trim().toLowerCase() === application.email.trim().toLowerCase()
    )

    if (!alreadyExists) {
      const newTutor = {
        id: Date.now(),
        name: application.name,
        email: application.email.trim().toLowerCase(),
        course: application.course,
        rating: 5.0,
        availability: [...new Set(application.availability)],
        bio: application.bio,
        status: 'approved'
      }

      setTutors((prev) => [newTutor, ...prev])
    }

    setApplications((prev) =>
      prev.map((item) =>
        item.id === applicationId ? { ...item, status: 'approved' } : item
      )
    )
  }

  const rejectTutor = (applicationId) => {
    setApplications((prev) =>
      prev.map((item) =>
        item.id === applicationId ? { ...item, status: 'rejected' } : item
      )
    )
  }

  const bookSession = ({
    course,
    tutorName,
    studentName,
    studentEmail,
    slot,
    note
  }) => {
    const tutor = tutors.find((item) => item.name === tutorName)

    if (!tutor) {
      return {
        ok: false,
        message: 'Selected tutor was not found.'
      }
    }

    const slotStillAvailable = tutor.availability.includes(slot)

    if (!slotStillAvailable) {
      return {
        ok: false,
        message: 'This slot is no longer available. Please choose another slot.'
      }
    }

    const duplicateBooking = sessions.some(
      (session) =>
        session.tutor === tutorName &&
        session.studentEmail === studentEmail &&
        session.time === slot
    )

    if (duplicateBooking) {
      return {
        ok: false,
        message: 'You already booked this slot.'
      }
    }

    const newSession = {
      id: Date.now(),
      course,
      tutor: tutorName,
      student: studentName,
      studentEmail,
      time: slot,
      note: note?.trim() || '',
      status: 'Booked'
    }

    setSessions((prev) => [newSession, ...prev])

    setTutors((prev) =>
      prev.map((item) =>
        item.name === tutorName
          ? {
              ...item,
              availability: item.availability.filter((available) => available !== slot)
            }
          : item
      )
    )

    return {
      ok: true,
      message: 'Session booked successfully.'
    }
  }

  const updateTutorAvailability = (email, slotsText) => {
    const cleanEmail = email.trim().toLowerCase()

    const slots = [...new Set(
      slotsText
        .split('\n')
        .map((slot) => slot.trim())
        .filter(Boolean)
    )]

    setTutors((prev) =>
      prev.map((tutor) =>
        tutor.email.trim().toLowerCase() === cleanEmail
          ? {
              ...tutor,
              availability: slots
            }
          : tutor
      )
    )
  }

  const value = {
    tutors,
    sessions,
    applications,
    users,
    currentUser,
    currentUserRole,
    currentUserEmail,
    currentUserName,
    approvedTutors,
    pendingApplications,
    registerUser,
    loginUser,
    logoutUser,
    submitTutorApplication,
    approveTutor,
    rejectTutor,
    bookSession,
    updateTutorAvailability
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  return useContext(AppContext)
}