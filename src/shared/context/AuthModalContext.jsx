import { createContext, useContext } from 'react'

/**
 * AuthModalContext
 *
 * Value shape:
 *   openAuthModal(mode?: string, redirectPath?: string) — opens the modal
 *   closeAuthModal()                                    — closes the modal
 *   redirectAfterLogin: string | null                   — path to navigate after successful login
 */
const AuthModalContext = createContext(null)

export const useAuthModal = () => {
    const context = useContext(AuthModalContext)
    if (!context) {
        return {
            openAuthModal: () => {},
            closeAuthModal: () => {},
            redirectAfterLogin: null,
        }
    }
    return context
}

export default AuthModalContext
