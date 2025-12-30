import { useState } from "react"
import LoginForm from "./LoginForm"
import SignupForm from "./SignupForm"
import ChangePasswordModal from "./ChangePasswordModal"

const HomePage = () => {
  const [formType, setFormType] = useState<"login" | "signUp">("login")
  const [showPasswordModal, setShowPasswordModal] = useState(false)

  return (
    <section className="flex justify-center items-center min-h-screen bg-black p-4">
      {formType === "login" ? (
        <LoginForm
          onSwitchToSignup={() => setFormType("signUp")}
          onForgotPassword={() => setShowPasswordModal(true)}
        />
      ) : (
        <SignupForm onSwitchToLogin={() => setFormType("login")} />
      )}

      <ChangePasswordModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
      />
    </section>
  )
}

export default HomePage