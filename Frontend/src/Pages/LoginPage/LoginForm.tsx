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

interface FormErrors {
  email?: string
  password?: string
}

interface LoginFormProps {
  onSwitchToSignup: () => void
  onForgotPassword: () => void
}

const LoginForm = ({ onSwitchToSignup, onForgotPassword }: LoginFormProps) => {
  const [formData, setFormData] = useState({ email: "", password: "" })
  const [errors, setErrors] = useState<FormErrors>({})
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()
  const login = userPost((state) => state.login)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }))
    }
  }

  const validate = () => {
    const myError: FormErrors = {}
    if (!formData.email.trim()) {
      myError.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      myError.email = 'Enter valid email'
    }
    if (!formData.password) {
      myError.password = 'Password is required'
    }
    setErrors(myError)
    return Object.keys(myError).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_URL}/users/login`,
        { email: formData.email, password: formData.password }
      )

      if (data.success && data.data?.accessToken) {
        const { accessToken, user: userData } = data.data
        
        localStorage.setItem('tokens', accessToken)
        login({
          _id: userData._id,
          token: accessToken,
          username: userData.username,
          email: userData.email,
          password: "",
          avatar: userData.avatar
        })

        toast.success('Successfully logged in!')
        navigate('/main')
      } else {
        toast.error('Login unsuccessful')
      }
    } catch (err: any) {
      console.error("Login error:", err)
      toast.error(err.response?.data?.message || "Login failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md shadow-lg">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
        <CardDescription>
          Enter your credentials to access your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
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
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <button
                type="button"
                onClick={onForgotPassword}
                className="text-sm text-blue-600 hover:text-blue-800 underline-offset-4 hover:underline"
              >
                Forgot password?
              </button>
            </div>
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

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-gray-600">
          Don't have an account?{" "}
          <button
            onClick={onSwitchToSignup}
            className="text-blue-600 hover:text-blue-800 font-semibold hover:underline"
          >
            Sign up
          </button>
        </p>
      </CardFooter>
    </Card>
  )
}

export default LoginForm