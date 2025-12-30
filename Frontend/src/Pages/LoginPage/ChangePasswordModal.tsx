import { useState } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { LuEyeOff } from "react-icons/lu"
import { MdOutlineRemoveRedEye } from "react-icons/md"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import axios from "axios"

interface ChangePasswordModalProps {
  isOpen: boolean
  onClose: () => void
}

interface PasswordErrors {
  oldPassword?: string
  newPassword?: string
  confirmPassword?: string
}

const ChangePasswordModal = ({ isOpen, onClose }: ChangePasswordModalProps) => {
  const [passwords, setPasswords] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: ""
  })
  const [errors, setErrors] = useState<PasswordErrors>({})
  const [loading, setLoading] = useState(false)
  const [showPasswords, setShowPasswords] = useState({
    old: false,
    new: false,
    confirm: false
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPasswords(prev => ({ ...prev, [name]: value }))
    if (errors[name as keyof PasswordErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }))
    }
  }

  const validate = () => {
    const myError: PasswordErrors = {}
    if (!passwords.oldPassword) {
      myError.oldPassword = 'Current password is required'
    }
    if (!passwords.newPassword) {
      myError.newPassword = 'New password is required'
    } else if (passwords.newPassword.length < 8) {
      myError.newPassword = 'Password must be at least 8 characters'
    }
    if (passwords.newPassword !== passwords.confirmPassword) {
      myError.confirmPassword = 'Passwords do not match'
    }
    if (passwords.oldPassword === passwords.newPassword) {
      myError.newPassword = 'New password must be different from old password'
    }
    setErrors(myError)
    return Object.keys(myError).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    try {
      const token = localStorage.getItem('tokens')
      const { data } = await axios.post(
        "http://localhost:8000/api/v1/users/change-password",
        {
          oldPassword: passwords.oldPassword,
          newPassword: passwords.newPassword
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      if (data.success) {
        toast.success('Password changed successfully!')
        setPasswords({ oldPassword: "", newPassword: "", confirmPassword: "" })
        setErrors({})
        onClose()
      }
    } catch (err: any) {
      console.error("Change password error:", err)
      toast.error(err.response?.data?.message || "Failed to change password")
    } finally {
      setLoading(false)
    }
  }

  const togglePassword = (field: 'old' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }))
  }

  const handleClose = () => {
    setPasswords({ oldPassword: "", newPassword: "", confirmPassword: "" })
    setErrors({})
    setShowPasswords({ old: false, new: false, confirm: false })
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Change Password</DialogTitle>
          <DialogDescription>
            Enter your current password and choose a new one
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="oldPassword">Current Password</Label>
            <div className="relative">
              <Input
                id="oldPassword"
                name="oldPassword"
                type={showPasswords.old ? "text" : "password"}
                value={passwords.oldPassword}
                onChange={handleChange}
                className={errors.oldPassword ? "border-red-500 pr-10" : "pr-10"}
              />
              <button
                type="button"
                onClick={() => togglePassword('old')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPasswords.old ? <MdOutlineRemoveRedEye size={20} /> : <LuEyeOff size={20} />}
              </button>
            </div>
            {errors.oldPassword && (
              <p className="text-sm text-red-500">{errors.oldPassword}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password</Label>
            <div className="relative">
              <Input
                id="newPassword"
                name="newPassword"
                type={showPasswords.new ? "text" : "password"}
                value={passwords.newPassword}
                onChange={handleChange}
                className={errors.newPassword ? "border-red-500 pr-10" : "pr-10"}
              />
              <button
                type="button"
                onClick={() => togglePassword('new')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPasswords.new ? <MdOutlineRemoveRedEye size={20} /> : <LuEyeOff size={20} />}
              </button>
            </div>
            {errors.newPassword && (
              <p className="text-sm text-red-500">{errors.newPassword}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showPasswords.confirm ? "text" : "password"}
                value={passwords.confirmPassword}
                onChange={handleChange}
                className={errors.confirmPassword ? "border-red-500 pr-10" : "pr-10"}
              />
              <button
                type="button"
                onClick={() => togglePassword('confirm')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPasswords.confirm ? <MdOutlineRemoveRedEye size={20} /> : <LuEyeOff size={20} />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-sm text-red-500">{errors.confirmPassword}</p>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Updating..." : "Update Password"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default ChangePasswordModal