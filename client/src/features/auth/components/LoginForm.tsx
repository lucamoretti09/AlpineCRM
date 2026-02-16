import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mountain, Mail, Lock, Eye, EyeOff, Loader2, ArrowRight, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/stores/authStore';
import { cn } from '@/lib/utils';

const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);
  const login = useAuthStore((state) => state.login);
  const isLoading = useAuthStore((state) => state.isLoading);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data.email, data.password);
      toast.success('Welcome back!');
      window.location.href = '/';
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Invalid email or password';
      toast.error(message);
    }
  };

  return (
    <div className="aurora-bg min-h-screen flex items-center justify-center px-4 py-12">
      {/* Floating grid dots */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(rgba(99, 102, 241, 0.08) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }} />
        {/* Extra aurora blobs */}
        <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-indigo-600/[0.07] rounded-full blur-[120px] animate-aurora" />
        <div className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] bg-violet-600/[0.06] rounded-full blur-[100px] animate-aurora" style={{ animationDelay: '4s' }} />
        <div className="absolute top-2/3 left-1/4 w-[300px] h-[300px] bg-cyan-500/[0.05] rounded-full blur-[80px] animate-aurora" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative w-full max-w-[440px] animate-fadeInUp">
        {/* Top glow accent */}
        <div className="absolute -top-px left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />

        {/* Card */}
        <div className="relative bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl shadow-2xl shadow-black/30 overflow-hidden">
          {/* Top gradient line */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-60" />

          <div className="p-10">
            {/* Branding */}
            <div className="flex flex-col items-center mb-10">
              <div className="relative group">
                <div className="absolute inset-0 bg-indigo-500/30 rounded-2xl blur-xl group-hover:bg-indigo-500/40 transition-all duration-500" />
                <div className="relative flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-600 rounded-2xl shadow-lg shadow-indigo-500/30 animate-pulse-glow">
                  <Mountain className="w-8 h-8 text-white drop-shadow-lg" />
                </div>
              </div>
              <h1 className="mt-5 text-[28px] font-bold text-white tracking-tight">
                Alpine<span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">CRM</span>
              </h1>
              <p className="text-white/40 text-sm mt-1.5 font-medium tracking-wide">
                Sign in to your workspace
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Email field */}
              <div className="space-y-1.5">
                <label
                  htmlFor="email"
                  className="block text-[13px] font-semibold text-white/50 uppercase tracking-wider"
                >
                  Email
                </label>
                <div className="relative group">
                  <div className={cn(
                    'absolute -inset-px rounded-xl transition-opacity duration-300',
                    'bg-gradient-to-r from-indigo-500/50 via-violet-500/50 to-indigo-500/50',
                    focused === 'email' ? 'opacity-100' : 'opacity-0'
                  )} />
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                      <Mail className={cn(
                        'w-[18px] h-[18px] transition-colors duration-200',
                        focused === 'email' ? 'text-indigo-400' : 'text-white/25'
                      )} />
                    </div>
                    <input
                      id="email"
                      type="email"
                      autoComplete="email"
                      placeholder="you@company.com"
                      {...register('email')}
                      onFocus={() => setFocused('email')}
                      onBlur={() => setFocused(null)}
                      className={cn(
                        'w-full pl-12 pr-4 py-3.5 bg-white/[0.04] border rounded-xl text-[15px] text-white placeholder-white/20',
                        'focus:outline-none focus:bg-white/[0.06]',
                        'transition-all duration-300',
                        errors.email
                          ? 'border-red-500/40'
                          : 'border-white/[0.06] hover:border-white/[0.12]'
                      )}
                    />
                  </div>
                </div>
                {errors.email && (
                  <p className="text-xs text-red-400/90 font-medium pl-1 animate-fadeIn">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Password field */}
              <div className="space-y-1.5">
                <label
                  htmlFor="password"
                  className="block text-[13px] font-semibold text-white/50 uppercase tracking-wider"
                >
                  Password
                </label>
                <div className="relative group">
                  <div className={cn(
                    'absolute -inset-px rounded-xl transition-opacity duration-300',
                    'bg-gradient-to-r from-indigo-500/50 via-violet-500/50 to-indigo-500/50',
                    focused === 'password' ? 'opacity-100' : 'opacity-0'
                  )} />
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                      <Lock className={cn(
                        'w-[18px] h-[18px] transition-colors duration-200',
                        focused === 'password' ? 'text-indigo-400' : 'text-white/25'
                      )} />
                    </div>
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      placeholder="Enter your password"
                      {...register('password')}
                      onFocus={() => setFocused('password')}
                      onBlur={() => setFocused(null)}
                      className={cn(
                        'w-full pl-12 pr-12 py-3.5 bg-white/[0.04] border rounded-xl text-[15px] text-white placeholder-white/20',
                        'focus:outline-none focus:bg-white/[0.06]',
                        'transition-all duration-300',
                        errors.password
                          ? 'border-red-500/40'
                          : 'border-white/[0.06] hover:border-white/[0.12]'
                      )}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-white/25 hover:text-white/50 transition-colors z-10"
                    >
                      {showPassword ? (
                        <EyeOff className="w-[18px] h-[18px]" />
                      ) : (
                        <Eye className="w-[18px] h-[18px]" />
                      )}
                    </button>
                  </div>
                </div>
                {errors.password && (
                  <p className="text-xs text-red-400/90 font-medium pl-1 animate-fadeIn">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Forgot password */}
              <div className="flex justify-end">
                <a
                  href="/forgot-password"
                  className="text-[13px] font-medium text-indigo-400/80 hover:text-indigo-300 transition-colors duration-200"
                >
                  Forgot password?
                </a>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={isLoading}
                className={cn(
                  'group relative w-full py-3.5 px-4 rounded-xl text-[15px] font-semibold text-white overflow-hidden',
                  'bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-500',
                  'shadow-lg shadow-indigo-500/25',
                  'hover:shadow-xl hover:shadow-indigo-500/30 hover:-translate-y-0.5',
                  'focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:ring-offset-2 focus:ring-offset-transparent',
                  'transition-all duration-300 ease-spring',
                  'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-lg'
                )}
              >
                {/* Shimmer effect on hover */}
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                {isLoading ? (
                  <span className="relative flex items-center justify-center gap-2.5">
                    <Loader2 className="w-[18px] h-[18px] animate-spin" />
                    Signing in...
                  </span>
                ) : (
                  <span className="relative flex items-center justify-center gap-2">
                    Sign in
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-200" />
                  </span>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/[0.06]" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-transparent px-4 text-[13px] text-white/25 font-medium backdrop-blur-sm">
                  New to Alpine CRM?
                </span>
              </div>
            </div>

            {/* Register link */}
            <a
              href="/register"
              className={cn(
                'group flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl text-[14px] font-semibold',
                'text-white/60 bg-white/[0.03] border border-white/[0.06]',
                'hover:bg-white/[0.06] hover:border-white/[0.1] hover:text-white/80',
                'transition-all duration-300'
              )}
            >
              <Sparkles className="w-4 h-4 text-indigo-400/60 group-hover:text-indigo-400 transition-colors" />
              Create an account
            </a>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-[12px] text-white/15 mt-8 font-medium tracking-wide">
          &copy; {new Date().getFullYear()} Alpine CRM &middot; Built for modern teams
        </p>
      </div>
    </div>
  );
}
