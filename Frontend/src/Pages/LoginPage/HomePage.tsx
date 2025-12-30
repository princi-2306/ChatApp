import { useState } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { LuEyeOff } from "react-icons/lu";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import userPost from "@/components/store/userStore";
import axios from "axios"
import { useNavigate } from "react-router-dom";

type FormDataType = {
  _id: number,
  token?: string,
  username: string;
  email: string;
  password: string;
  avatar: File | undefined;
};

interface formErrors {
  username?: string,
  email?: string,
  password?: string,
  avatar?: string
}

const HomePage = () => {
  const [formType, setFormType] = useState<"login" | "signUp">("login");
  // REMOVED: const [tokens, setTokens] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<formErrors>({});
  const [watch, setWatch] = useState<boolean>(false);
  const navigate = useNavigate();

  const [formData, setFormData] = useState<FormDataType>({
    _id: Math.random() * 1000,
    token: "",
    username: "",
    email: "",
    password: "",
    avatar: undefined,
  });

  const addUser = userPost((state) => state.addUser);
  const login = userPost((state) => state.login);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formValidate()) {
      Object.values(errors).forEach((error) => {
        if (error) toast.error(error);
      });
      return;
    }

    setLoading(true);
    try {
      let data;
      if (formType === "signUp") {
        const form = new FormData();
        form.append("username", formData.username);
        form.append("email", formData.email);
        form.append("password", formData.password);
        if (formData.avatar) {
          form.append("avatar", formData.avatar);
        }

        data = await axios.post(
          "http://localhost:8000/api/v1/users/register",
          form,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        if (data.data.success && data.data.data && data.data.data.accessToken) {
          const accessToken = data.data.data.accessToken;
          const userData = data.data.data.user;
          
          // 1. Store in LocalStorage (Persistence)
          localStorage.setItem('tokens', accessToken);
          
          // 2. Update Global Store (State Management)
          addUser({
            _id: userData._id,
            token: accessToken,
            username: userData.username,
            email: userData.email,
            password: "",
            avatar: userData.avatar
          });

          // REMOVED: setTokens(accessToken); 

          toast.success('Account created successfully! You are now signed in.');
          navigate('/');
        } else {
          toast.success('Account created successfully! Please log in.');
          setFormType("login");
        }
      } else {
        // LOGIN LOGIC
        data = await axios.post(
          "http://localhost:8000/api/v1/users/login",
          {
            email: formData.email,
            password: formData.password
          }
        );

        if (data.data.success && data.data.data && data.data.data.accessToken) {
          const accessToken = data.data.data.accessToken;
          const userData = data.data.data.user;
          
          if (accessToken) {
            // 1. Store in LocalStorage
            localStorage.setItem('tokens', accessToken);
            
            // 2. Update Global Store
            login({
              _id: userData._id,
              token: accessToken,
              username: userData.username,
              email: userData.email,
              password: "",
              avatar: userData.avatar
            })

            // REMOVED: setTokens(accessToken);

            toast.success('Sucessfully Logged in!');
            navigate('/main');
          } else {
            toast.error('login succeeded but no token recieved');
          }
        } else {
          toast.error('login unsuccessful')
        }
      }
    } catch (err) {
      console.log("Auth error : ", err)
      toast.error("something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const formValidate = () => {
    const myError: formErrors = {};
    if (formType === "signUp") {
      if (!formData.username.trim()) {
        myError.username = 'username is required';
      } else if (formData.username.length < 3) {
        myError.username = 'username is too short!';
      }
      if (!formData.email.trim()) {
        myError.email = 'Email is required'
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        myError.email = 'Enter valid email';
      }
      if (!formData.password) {
        myError.password = 'Password is required'
      } else if (formData.password.length < 8) {
        myError.password = 'Password should be atleast 8 charcters long';
      }
      if (!formData.avatar) {
        myError.avatar = "Avatar is required ";
      }
    } else {
      if (!formData.email.trim()) {
        myError.email = 'Email is required';
        toast.error(myError.email)
      }
      if (!formData.password) {
        myError.password = 'Password is required';
        toast.error(myError.password)
      }
    }

    setErrors(myError);
    return Object.keys(myError).length === 0;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProfile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('Image size should be less than 5MB');
        return;
      }
      setFormData(prev => ({
        ...prev,
        avatar: file
      }));
    } else {
      toast.error("Avatar is required");
    }
  };

  return (
    <section className="flex justify-center items-center h-screen">
      {formType == "login" && (
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle>Login to your account</CardTitle>
            <CardDescription>
              Enter your email below to login to your account
            </CardDescription>
            <CardAction>
              <Button onClick={() => setFormType("signUp")} variant="link">
                Sign Up
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent>
            <form>
              <div className="flex flex-col gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="m@example.com"
                    required
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500">{errors.email}</p>
                  )}
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center">
                    <Label htmlFor="password">Password</Label>
                    <a
                      href="#"
                      className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                    >
                      Forgot your password?
                    </a>
                  </div>
                  <Input
                    onChange={handleChange}
                    value={formData.password}
                    name="password"
                    id="password"
                    type="password" // Note: This was incorrectly not using 'watch' state in your original login form
                    required
                  />
                  {errors.password && (
                    <p className="text-sm text-red-500">{errors.password}</p>
                  )}
                </div>
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex-col gap-2">
            <Button onClick={handleSubmit} className="w-full">
              Login
            </Button>
          </CardFooter>
        </Card>
      )}
      {formType == "signUp" && (
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle>Create new account </CardTitle>
            <CardDescription>
              Create your account to use ChatApp
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <div className="flex flex-col gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    name="username"
                    value={formData.username}
                    type="text"
                    placeholder="Enter your username"
                    onChange={handleChange}
                    required
                  />
                  {errors.username && (
                    <p className="text-sm text-red-500">{errors.username}</p>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="m@example.com"
                    required
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500">{errors.email}</p>
                  )}
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <div onClick={() => setWatch((prev) => !prev)}>
                      {watch ? <MdOutlineRemoveRedEye /> : <LuEyeOff />}
                    </div>
                  </div>
                  <Input
                    id="password"
                    type={watch ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                  {errors.password && (
                    <p className="text-sm text-red-500">{errors.password}</p>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label>Avatar</Label>
                  <Input
                    onChange={handleProfile}
                    id="avatar"
                    type="file"
                    name="avatar"
                    accept="image/*"
                  />
                  {errors.avatar && (
                    <p className="text-sm text-red-500">{errors.avatar}</p>
                  )}
                </div>
              </div>
              <div className="mt-5">
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Signing up..." : "Sign Up"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </section>
  );
}

export default HomePage