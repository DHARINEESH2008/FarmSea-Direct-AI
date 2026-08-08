'use client';

import { useState } from 'react';
import { useFarmSeaStore, type UserRole } from '@/store/useFarmSeaStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Leaf, Fish, Truck, ShieldCheck, User, Eye, EyeOff } from 'lucide-react';

const roleOptions: { value: UserRole; label: string; icon: React.ReactNode; desc: string }[] = [
  { value: 'CUSTOMER', label: 'Customer', icon: <User className="w-5 h-5" />, desc: 'Buy fresh produce' },
  { value: 'FARMER', label: 'Farmer', icon: <Leaf className="w-5 h-5" />, desc: 'Sell your harvest' },
  { value: 'FISHER', label: 'Fisher', icon: <Fish className="w-5 h-5" />, desc: 'Sell your catch' },
  { value: 'DELIVERY', label: 'Delivery', icon: <Truck className="w-5 h-5" />, desc: 'Deliver orders' },
];

const demoAccounts = [
  { email: 'priya.murugan@email.com', role: 'Customer' },
  { email: 'selvam.kandasamy@email.com', role: 'Farmer' },
  { email: 'thangavel.pattinam@email.com', role: 'Fisher' },
  { email: 'suresh.delivery@email.com', role: 'Delivery' },
  { email: 'admin.farmsea@email.com', role: 'Admin' },
];

export default function LoginScreen() {
  const { login } = useFarmSeaStore();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({
    name: '', email: '', phone: '', password: '', role: 'CUSTOMER' as UserRole,
  });

  const handleLogin = async () => {
    if (!loginForm.email || !loginForm.password) {
      toast({ title: 'Error', description: 'Email and password are required', variant: 'destructive' });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'login', email: loginForm.email, password: loginForm.password === 'demo' ? 'hashed_demo_password' : loginForm.password }),
      });
      const data = await res.json();
      if (data.success) {
        login(data.user);
        toast({ title: 'Welcome back!', description: `Logged in as ${data.user.name}` });
      } else {
        toast({ title: 'Login failed', description: data.error || 'Invalid credentials', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Error', description: 'Something went wrong', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    const { name, email, phone, password, role } = registerForm;
    if (!name || !email || !phone || !password) {
      toast({ title: 'Error', description: 'All fields are required', variant: 'destructive' });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'register', ...registerForm }),
      });
      const data = await res.json();
      if (data.success) {
        login(data.user);
        toast({ title: 'Account created!', description: `Welcome, ${data.user.name}!` });
      } else {
        toast({ title: 'Registration failed', description: data.error || 'Could not create account', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Error', description: 'Something went wrong', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = (email: string) => {
    setLoginForm({ email, password: 'demo' });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-green-50 via-white to-orange-50">
      {/* Logo */}
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center gap-3 mb-3">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center shadow-lg">
            <Leaf className="w-8 h-8 text-white" />
          </div>
          <div className="text-left">
            <h1 className="text-3xl font-bold text-green-800 tracking-tight">FarmSea</h1>
            <p className="text-sm text-orange-600 font-medium -mt-0.5">Direct AI</p>
          </div>
        </div>
        <p className="text-muted-foreground text-sm max-w-sm mx-auto">
          India&apos;s First AI-Powered Farmer &amp; Fisher Circular Marketplace
        </p>
      </div>

      <Card className="w-full max-w-md shadow-xl border-green-100">
        <Tabs defaultValue="login" className="w-full">
          <CardHeader className="pb-2 pt-4 px-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login" className="text-base py-2.5">Login</TabsTrigger>
              <TabsTrigger value="register" className="text-base py-2.5">Register</TabsTrigger>
            </TabsList>
          </CardHeader>

          {/* LOGIN */}
          <TabsContent value="login">
            <CardContent className="px-6 pb-2 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-email" className="text-sm font-medium">Email</Label>
                <Input
                  id="login-email"
                  type="email"
                  placeholder="you@email.com"
                  value={loginForm.email}
                  onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                  className="h-12 text-base"
                />
              </div>
              <div className="space-y-2 relative">
                <Label htmlFor="login-password" className="text-sm font-medium">Password</Label>
                <div className="relative">
                  <Input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter password"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                    className="h-12 text-base pr-12"
                    onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex-col gap-3 px-6 pb-6">
              <Button
                className="w-full h-12 text-base font-semibold bg-green-600 hover:bg-green-700 text-white"
                onClick={handleLogin}
                disabled={loading}
              >
                {loading ? 'Logging in...' : 'Login'}
              </Button>
            </CardFooter>
          </TabsContent>

          {/* REGISTER */}
          <TabsContent value="register">
            <CardContent className="px-6 pb-2 space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">I want to join as</Label>
                <div className="grid grid-cols-2 gap-2">
                  {roleOptions.map((r) => (
                    <button
                      key={r.value}
                      type="button"
                      onClick={() => setRegisterForm({ ...registerForm, role: r.value })}
                      className={`flex items-center gap-2 p-3 rounded-xl border-2 text-left transition-all ${
                        registerForm.role === r.value
                          ? 'border-green-500 bg-green-50 text-green-800'
                          : 'border-gray-200 hover:border-green-300 hover:bg-green-50/50'
                      }`}
                    >
                      <span className={registerForm.role === r.value ? 'text-green-600' : 'text-gray-400'}>{r.icon}</span>
                      <div>
                        <div className="text-sm font-semibold">{r.label}</div>
                        <div className="text-xs text-muted-foreground">{r.desc}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="reg-name" className="text-sm font-medium">Full Name</Label>
                  <Input
                    id="reg-name"
                    placeholder="Your name"
                    value={registerForm.name}
                    onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                    className="h-12 text-base"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-phone" className="text-sm font-medium">Phone</Label>
                  <Input
                    id="reg-phone"
                    placeholder="9876543210"
                    value={registerForm.phone}
                    onChange={(e) => setRegisterForm({ ...registerForm, phone: e.target.value })}
                    className="h-12 text-base"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="reg-email" className="text-sm font-medium">Email</Label>
                <Input
                  id="reg-email"
                  type="email"
                  placeholder="you@email.com"
                  value={registerForm.email}
                  onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                  className="h-12 text-base"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reg-password" className="text-sm font-medium">Password</Label>
                <Input
                  id="reg-password"
                  type="password"
                  placeholder="Create password"
                  value={registerForm.password}
                  onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                  className="h-12 text-base"
                  onKeyDown={(e) => e.key === 'Enter' && handleRegister()}
                />
              </div>
            </CardContent>
            <CardFooter className="px-6 pb-6">
              <Button
                className="w-full h-12 text-base font-semibold bg-green-600 hover:bg-green-700 text-white"
                onClick={handleRegister}
                disabled={loading}
              >
                {loading ? 'Creating account...' : 'Create Account'}
              </Button>
            </CardFooter>
          </TabsContent>
        </Tabs>
      </Card>

      {/* Demo Accounts */}
      <div className="mt-6 w-full max-w-md">
        <Card className="border-orange-200 bg-orange-50/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <ShieldCheck className="w-4 h-4 text-orange-600" />
              <span className="text-sm font-semibold text-orange-700">Demo Accounts (Password: demo)</span>
            </div>
            <div className="grid grid-cols-1 gap-1.5">
              {demoAccounts.map((acc) => (
                <button
                  key={acc.email}
                  type="button"
                  onClick={() => quickLogin(acc.email)}
                  className="flex items-center justify-between w-full px-3 py-2 rounded-lg text-left text-sm hover:bg-orange-100/70 transition-colors"
                >
                  <span className="text-muted-foreground truncate max-w-[220px]">{acc.email}</span>
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-700 whitespace-nowrap">
                    {acc.role}
                  </span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
