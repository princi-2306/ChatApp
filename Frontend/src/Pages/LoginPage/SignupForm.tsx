// TS DONE

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { LuEyeOff } from "react-icons/lu"
import { MdOutlineRemoveRedEye } from "react-icons/md"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import userPost from "@/components/store/userStore"
import axios from "axios"
import { useNavigate } from "react-router-dom"

type FormDataType = {
  _id: number
  username: string
  email: string
  password: string
  avatar: File | undefined
}

interface FormErrors {
  username?: string
  email?: string
  password?: string
  avatar?: string
}

interface SignupFormProps {
  onSwitchToLogin: () => void
}

const SignupForm = ({ onSwitchToLogin }: SignupFormProps) => {
  const [formData, setFormData] = useState<FormDataType>({
    _id: Math.random() * 1000,
    username: "",
    email: "",
    password: "",
    avatar: undefined,
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()
  const addUser = userPost((state) => state.addUser)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }))
    }
  }

  const handleProfile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB')
        return
      }
      setFormData(prev => ({ ...prev, avatar: file }))
      setErrors(prev => ({ ...prev, avatar: undefined }))
    }
  }

  const validate = () => {
    const myError: FormErrors = {}
    if (!formData.username.trim()) {
      myError.username = 'Username is required'
    } else if (formData.username.length < 3) {
      myError.username = 'Username must be at least 3 characters'
    }
    if (!formData.email.trim()) {
      myError.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      myError.email = 'Enter valid email'
    }
    if (!formData.password) {
      myError.password = 'Password is required'
    } else if (formData.password.length < 8) {
      myError.password = 'Password must be at least 8 characters'
    }
    if (!formData.avatar) {
      myError.avatar = "Avatar is required"
    }
    setErrors(myError)
    return Object.keys(myError).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    try {
      const form = new FormData()
      form.append("username", formData.username)
      form.append("email", formData.email)
      form.append("password", formData.password)
      if (formData.avatar) {
        form.append("avatar", formData.avatar)
      }

      const { data } = await axios.post(
        `${import.meta.env.VITE_URL}/users/register`,
        form,
        { headers: { "Content-Type": "multipart/form-data" } }
      )

      if (data.success && data.data?.accessToken) {
        const { accessToken, user: userData } = data.data
        
        localStorage.setItem('tokens', accessToken)
        addUser({
          _id: userData._id,
          token: accessToken,
          username: userData.username,
          email: userData.email,
          password: "",
          avatar: userData.avatar
        })

        toast.success('Account created successfully!')
        navigate('/')
      } else {
        toast.success('Account created! Please log in.')
        onSwitchToLogin()
      }
    } catch (err: any) {
      console.error("Signup error:", err)
      toast.error(err.response?.data?.message || "Signup failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md shadow-lg">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
        <CardDescription>
          Join us today and start connecting
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              name="username"
              type="text"
              value={formData.username}
              onChange={handleChange}
              placeholder="johndoe"
              className={errors.username ? "border-red-500" : ""}
            />
            {errors.username && (
              <p className="text-sm text-red-500">{errors.username}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="m@example.com"
              className={errors.email ? "border-red-500" : ""}
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleChange}
                className={errors.password ? "border-red-500 pr-10" : "pr-10"}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <MdOutlineRemoveRedEye size={20} /> : <LuEyeOff size={20} />}
              </button>
            </div>
            {errors.password && (
              <p className="text-sm text-red-500">{errors.password}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="avatar">Profile Picture</Label>
            <Input
              id="avatar"
              name="avatar"
              type="file"
              onChange={handleProfile}
              accept="image/*"
              className={errors.avatar ? "border-red-500" : ""}
            />
            {errors.avatar && (
              <p className="text-sm text-red-500">{errors.avatar}</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating account..." : "Sign up"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-gray-600">
          Already have an account?{" "}
          <button
            onClick={onSwitchToLogin}
            className="text-blue-600 hover:text-blue-800 font-semibold hover:underline"
          >
            Login
          </button>
        </p>
      </CardFooter>
    </Card>
  )
}

export default SignupForm