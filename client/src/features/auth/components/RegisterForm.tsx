import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mountain, Mail, Lock, User, Eye, EyeOff, Loader2, ArrowLeft, ArrowRight, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/stores/authStore';
import { cn } from '@/lib/utils';

const registerSchema = z
  .object({
    firstName: z
      .string()
      .min(1, 'First name is required')
      .min(2, 'First name must be at least 2 characters')
      .max(50, 'First name must be less than 50 characters'),
    lastName: z
      .string()
      .min(1, 'Last name is required')
      .min(2, 'Last name must be at least 2 characters')
      .max(50, 'Last name must be less than 50 characters'),
    email: z
      .string()
      .min(1, 'Email is required')
      .email('Please enter a valid email address'),
    password: z
      .string()
      .min(1, 'Password is required')
      .min(8, 'Password must be at least 8 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Password must contain at least one uppercase letter, one lowercase letter, and one number'
      ),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const registerUser = useAuthStore((state) => state.register);
  const isLoading = useAuthStore((state) => state.isLoading);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const password = watch('password');
  const hasLower = /[a-z]/.test(password || '');
  const hasUpper = /[A-Z]/.test(password || '');
  const hasNumber = /\d/.test(password || '');
  const hasLength = (password || '').length >= 8;

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await registerUser({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
      });
      toast.success('Account created successfully!');
      window.location.href = '/';
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Registration failed. Please try again.';
      toast.error(message);
    }
  };

  return (
    <div className="aurora-bg min-h-screen flex items-center justify-center px-4 py-12">
      {/* Grid dot pattern */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />

      {/* Animated aurora blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-indigo-600/15 rounded-full blur-[120px] animate-aurora" />
        <div className="absolute top-1/3 -right-20 w-[400px] h-[400px] bg-violet-500/10 rounded-full blur-[100px] animate-aurora" style={{ animationDelay: '-4s' }} />
        <div className="absolute -bottom-32 left-1/3 w-[450px] h-[450px] bg-cyan-500/8 rounded-full blur-[110px] animate-aurora" style={{ animationDelay: '-8s' }} />
      </div>

      <div className="relative w-full max-w-lg animate-fadeInUp">
        {/* Back to login */}
        <a
          href="/login"
          onClick={(e) => {
            e.preventDefault();
            window.location.href = '/login';
          }}
          className="inline-flex items-center gap-1.5 text-[13px] text-white/40 hover:text-white/80 mb-6 transition-all duration-300 group"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform duration-300" />
          Back to sign in
        </a>

        {/* Card */}
        <div className="relative bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl shadow-2xl shadow-black/30 p-8 overflow-hidden">
          {/* Top accent gradient line */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-60" />

          {/* Branding */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative flex items-center justify-center w-14 h-14 bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-600 rounded-2xl shadow-xl shadow-indigo-500/30 mb-4 animate-pulse-glow">
              <Mountain className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-[24px] font-bold text-white tracking-tight">
              Create Account
            </h1>
            <p className="text-white/40 text-[13px] mt-1">
              Get started with Alpine<span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent font-semibold">CRM</span>
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Name fields - side by side */}
            <div className="grid grid-cols-2 gap-3">
              {/* First name */}
              <div>
                <label htmlFor="firstName" className="block text-[13px] font-semibold text-white/50 uppercase tracking-wider mb-1.5">
                  First name
                </label>
                <div className="relative group">
                  {focusedField === 'firstName' && (
                    <div className="absolute -inset-[1px] bg-gradient-to-r from-indigo-500/50 via-violet-500/50 to-indigo-500/50 rounded-xl blur-[1px] opacity-80 transition-opacity duration-300" />
                  )}
                  <div className="relative flex items-center">
                    <div className="absolute left-3.5 pointer-events-none">
                      <User className="w-4 h-4 text-white/30" />
                    </div>
                    <input
                      id="firstName"
                      type="text"
                      autoComplete="given-name"
                      placeholder="John"
                      {...register('firstName')}
                      onFocus={() => setFocusedField('firstName')}
                      onBlur={() => setFocusedField(null)}
                      className={cn(
                        'w-full pl-10 pr-3 py-2.5 bg-white/[0.04] border rounded-xl text-[14px] text-white placeholder-white/20',
                        'focus:outline-none transition-all duration-300',
                        errors.firstName
                          ? 'border-red-500/50'
                          : 'border-white/[0.08] hover:border-white/[0.15]'
                      )}
                    />
                  </div>
                </div>
                {errors.firstName && (
                  <p className="mt-1 text-[11px] text-red-400/90">{errors.firstName.message}</p>
                )}
              </div>

              {/* Last name */}
              <div>
                <label htmlFor="lastName" className="block text-[13px] font-semibold text-white/50 uppercase tracking-wider mb-1.5">
                  Last name
                </label>
                <div className="relative group">
                  {focusedField === 'lastName' && (
                    <div className="absolute -inset-[1px] bg-gradient-to-r from-indigo-500/50 via-violet-500/50 to-indigo-500/50 rounded-xl blur-[1px] opacity-80 transition-opacity duration-300" />
                  )}
                  <div className="relative flex items-center">
                    <div className="absolute left-3.5 pointer-events-none">
                      <User className="w-4 h-4 text-white/30" />
                    </div>
                    <input
                      id="lastName"
                      type="text"
                      autoComplete="family-name"
                      placeholder="Doe"
                      {...register('lastName')}
                      onFocus={() => setFocusedField('lastName')}
                      onBlur={() => setFocusedField(null)}
                      className={cn(
                        'w-full pl-10 pr-3 py-2.5 bg-white/[0.04] border rounded-xl text-[14px] text-white placeholder-white/20',
                        'focus:outline-none transition-all duration-300',
                        errors.lastName
                          ? 'border-red-500/50'
                          : 'border-white/[0.08] hover:border-white/[0.15]'
                      )}
                    />
                  </div>
                </div>
                {errors.lastName && (
                  <p className="mt-1 text-[11px] text-red-400/90">{errors.lastName.message}</p>
                )}
              </div>
            </div>

            {/* Email field */}
            <div>
              <label htmlFor="email" className="block text-[13px] font-semibold text-white/50 uppercase tracking-wider mb-1.5">
                Email address
              </label>
              <div className="relative group">
                {focusedField === 'email' && (
                  <div className="absolute -inset-[1px] bg-gradient-to-r from-indigo-500/50 via-violet-500/50 to-indigo-500/50 rounded-xl blur-[1px] opacity-80 transition-opacity duration-300" />
                )}
                <div className="relative flex items-center">
                  <div className="absolute left-3.5 pointer-events-none">
                    <Mail className="w-4 h-4 text-white/30" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@company.com"
                    {...register('email')}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    className={cn(
                      'w-full pl-10 pr-4 py-2.5 bg-white/[0.04] border rounded-xl text-[14px] text-white placeholder-white/20',
                      'focus:outline-none transition-all duration-300',
                      errors.email
                        ? 'border-red-500/50'
                        : 'border-white/[0.08] hover:border-white/[0.15]'
                    )}
                  />
                </div>
              </div>
              {errors.email && (
                <p className="mt-1.5 text-[11px] text-red-400/90">{errors.email.message}</p>
              )}
            </div>

            {/* Password field */}
            <div>
              <label htmlFor="password" className="block text-[13px] font-semibold text-white/50 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative group">
                {focusedField === 'password' && (
                  <div className="absolute -inset-[1px] bg-gradient-to-r from-indigo-500/50 via-violet-500/50 to-indigo-500/50 rounded-xl blur-[1px] opacity-80 transition-opacity duration-300" />
                )}
                <div className="relative flex items-center">
                  <div className="absolute left-3.5 pointer-events-none">
                    <Lock className="w-4 h-4 text-white/30" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder="Create a strong password"
                    {...register('password')}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    className={cn(
                      'w-full pl-10 pr-11 py-2.5 bg-white/[0.04] border rounded-xl text-[14px] text-white placeholder-white/20',
                      'focus:outline-none transition-all duration-300',
                      errors.password
                        ? 'border-red-500/50'
                        : 'border-white/[0.08] hover:border-white/[0.15]'
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 text-white/30 hover:text-white/60 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              {errors.password && (
                <p className="mt-1.5 text-[11px] text-red-400/90">{errors.password.message}</p>
              )}
            </div>

            {/* Password strength indicators */}
            {password && (
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 animate-fadeIn">
                {[
                  { met: hasLength, label: '8+ characters' },
                  { met: hasUpper, label: 'Uppercase letter' },
                  { met: hasLower, label: 'Lowercase letter' },
                  { met: hasNumber, label: 'Number' },
                ].map((req) => (
                  <div key={req.label} className="flex items-center gap-1.5">
                    <div className={cn(
                      'w-3.5 h-3.5 rounded-full flex items-center justify-center transition-all duration-300',
                      req.met ? 'bg-emerald-500/20' : 'bg-white/5'
                    )}>
                      <Check className={cn('w-2.5 h-2.5 transition-all duration-300', req.met ? 'text-emerald-400' : 'text-white/15')} />
                    </div>
                    <span className={cn('text-[11px] transition-colors duration-300', req.met ? 'text-emerald-400/80' : 'text-white/25')}>
                      {req.label}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Confirm password field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-[13px] font-semibold text-white/50 uppercase tracking-wider mb-1.5">
                Confirm password
              </label>
              <div className="relative group">
                {focusedField === 'confirmPassword' && (
                  <div className="absolute -inset-[1px] bg-gradient-to-r from-indigo-500/50 via-violet-500/50 to-indigo-500/50 rounded-xl blur-[1px] opacity-80 transition-opacity duration-300" />
                )}
                <div className="relative flex items-center">
                  <div className="absolute left-3.5 pointer-events-none">
                    <Lock className="w-4 h-4 text-white/30" />
                  </div>
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder="Confirm your password"
                    {...register('confirmPassword')}
                    onFocus={() => setFocusedField('confirmPassword')}
                    onBlur={() => setFocusedField(null)}
                    className={cn(
                      'w-full pl-10 pr-11 py-2.5 bg-white/[0.04] border rounded-xl text-[14px] text-white placeholder-white/20',
                      'focus:outline-none transition-all duration-300',
                      errors.confirmPassword
                        ? 'border-red-500/50'
                        : 'border-white/[0.08] hover:border-white/[0.15]'
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 text-white/30 hover:text-white/60 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1.5 text-[11px] text-red-400/90">{errors.confirmPassword.message}</p>
              )}
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={isLoading}
              className="relative w-full py-3 px-4 rounded-xl text-[14px] font-semibold text-white bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 shadow-xl shadow-indigo-500/25 hover:shadow-indigo-500/40 focus:outline-none transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group overflow-hidden mt-2"
            >
              {/* Shimmer effect */}
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              {isLoading ? (
                <span className="relative flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating account...
                </span>
              ) : (
                <span className="relative flex items-center justify-center gap-2">
                  Create account
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-300" />
                </span>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/[0.06]" />
            </div>
            <div className="relative flex justify-center text-[11px]">
              <span className="px-3 text-white/30 bg-transparent backdrop-blur-sm">
                Already have an account?
              </span>
            </div>
          </div>

          {/* Login link */}
          <a
            href="/login"
            onClick={(e) => {
              e.preventDefault();
              window.location.href = '/login';
            }}
            className="flex items-center justify-center w-full py-2.5 px-4 rounded-xl text-[13px] font-medium text-white/60 bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] hover:border-white/[0.12] hover:text-white/90 transition-all duration-300"
          >
            Sign in instead
          </a>
        </div>

        {/* Footer */}
        <p className="text-center text-[11px] text-white/20 mt-6">
          &copy; {new Date().getFullYear()} Alpine CRM. All rights reserved.
        </p>
      </div>
    </div>
  );
}
