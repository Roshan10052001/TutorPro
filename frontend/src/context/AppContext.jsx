import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { axiosInstance } from '../axiosInstance'
import {
  initialTutors,
  initialSessions,
  initialTutorApplications
} from '../data/mockData'
import { getStoredUser, removeStoredUser, setStoredUser } from '../storage'

const AppContext = createContext()

function safeRead(key, fallback) {
  try {
    const saved = localStorage.getItem(key)
    return saved ? JSON.parse(saved) : fallback
  } catch (error) {
    return fallback
  }
}

function getErrorMessage(error, fallback) {
  return error?.response?.data?.message || error?.response?.data?.error || fallback
}

function buildStoredAuth(data) {
  if (!data?.user) return null

  return {
    ...data.user,
    token: data.token || ''
  }
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

  const [currentUser, setCurrentUser] = useState(() =>
    getStoredUser()
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
    if (currentUser) {
      setStoredUser(currentUser)
    } else {
      removeStoredUser()
    }
  }, [currentUser])

  useEffect(() => {
    async function hydrateAuthenticatedUser() {
      if (!currentUser?.token) return

      try {
        const { data } = await axiosInstance({
          url: '/auth/me',
          method: 'GET',
          headers: {
            Authorization: `Bearer ${currentUser.token}`
          }
        })

        if (data?.user) {
          setCurrentUser((prev) => ({
            ...data.user,
            token: prev?.token || currentUser.token
          }))
        }
      } catch (error) {
        removeStoredUser()
        setCurrentUser(null)
      }
    }

    hydrateAuthenticatedUser()
  }, [currentUser?.token])

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

  const registerUser = async ({ name, email, password, role }) => {
    try {
      const { data } = await axiosInstance({
        url: '/auth/signup',
        method: 'POST',
        data: {
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
          role
        },
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const storedAuth = buildStoredAuth(data)

      if (storedAuth) {
        setCurrentUser(storedAuth)
      }

      return {
        ok: true,
        user: storedAuth,
        message: 'Account created successfully.'
      }
    } catch (error) {
      return {
        ok: false,
        message: getErrorMessage(error, 'Unable to create account.')
      }
    }
  }

  const loginUser = async ({ email, password }) => {
    try {
      const { data } = await axiosInstance({
        url: '/auth/login',
        method: 'POST',
        data: {
          email: email.trim().toLowerCase(),
          password
        },
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const storedAuth = buildStoredAuth(data)

      if (storedAuth) {
        setCurrentUser(storedAuth)
      }

      return {
        ok: true,
        user: storedAuth
      }
    } catch (error) {
      return {
        ok: false,
        message: getErrorMessage(error, 'Invalid email or password.')
      }
    }
  }

  const logoutUser = async () => {
    try {
      await axiosInstance({
        url: '/auth/logout',
        method: 'POST'
      })
    } catch (error) {
      // Clear local auth state even if the backend request fails.
    } finally {
      setCurrentUser(null)
    }
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
