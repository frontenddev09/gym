import { loginSchema } from "@/lib/validition";
import { useAuthState } from "@/stores/auth-store";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Separator } from "../ui/separator";
import Social from "./social";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { auth } from "@/firebase";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { AlertCircle } from "lucide-react";
import FillLoading from "../shared/fill-loading";
import { useUserState } from "@/stores/user-store";

const Login = () => {
  const { setAuth } = useAuthState();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const { setUser } = useUserState();

  const navigate = useNavigate();

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof loginSchema>) => {
    const { email, password } = values;
    setIsLoading(true);
    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);
      setUser(res.user);
      navigate("/");
      console.log(res, "Created Succesfully");
    } catch (error) {
      const err = error as Error;
      setError(err.message);
      console.log(err.message);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="flex flex-col">
      {isLoading && <FillLoading />}
      <h2 className="text-xl font-bold">Login</h2>
      <p className="text-muted-foreground">
        Don't have you an account?{" "}
        <span
          onClick={() => setAuth("register")}
          className="text-blue-500 cursor-pointer hover:underline"
        >
          Sign up
        </span>
      </p>
      <Separator className="my-3" />
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email address</FormLabel>
                <FormControl>
                  <Input
                    disabled={isLoading}
                    placeholder="example@gmail.com"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm password</FormLabel>
                <FormControl>
                  <Input
                    disabled={isLoading}
                    placeholder="*****"
                    type={"password"}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div>
            <Button
              disabled={isLoading}
              type="submit"
              className="h-12 w-full mt-2"
            >
              Login{" "}
            </Button>
          </div>
        </form>
      </Form>
      <Social />
    </div>
  );
};

export default Login;
