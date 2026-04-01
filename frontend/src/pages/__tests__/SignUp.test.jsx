import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import SignUp from '../SignUp'

const registerUserMock = vi.fn()

vi.mock('../../components/Navbar', () => ({
  default: () => <div>Navbar</div>
}))

vi.mock('../../context/AppContext', () => ({
  useApp: () => ({
    registerUser: registerUserMock
  })
}))

describe('SignUp page', () => {
  beforeEach(() => {
    registerUserMock.mockReset()
    vi.spyOn(window, 'alert').mockImplementation(() => {})
  })

  afterEach(() => {
    window.alert.mockRestore()
  })

  it('blocks submission when passwords do not match', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <SignUp />
      </MemoryRouter>
    )

    await user.type(screen.getByPlaceholderText('Enter your name'), 'Pelumi')
    await user.type(screen.getByPlaceholderText('Enter your email'), 'pelumi@slu.edu')
    await user.type(screen.getByPlaceholderText('Create password'), 'secret123')
    await user.type(screen.getByPlaceholderText('Confirm password'), 'different123')

    await user.click(screen.getByRole('button', { name: /create account/i }))

    expect(window.alert).toHaveBeenCalledWith('Passwords do not match.')
    expect(registerUserMock).not.toHaveBeenCalled()
  })
})
