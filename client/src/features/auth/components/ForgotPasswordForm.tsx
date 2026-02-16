import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mountain, Mail, Loader2, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { cn } from '@/lib/utils';

const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    try {
      await api.post('/auth/forgot-password', { email: data.email });
      setIsSubmitted(true);
      toast.success('Reset link sent! Check your email.');
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Something went wrong. Please try again.';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 px-4 py-12">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-violet-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Back to login */}
        <a
          href="/login"
          onClick={(e) => {
            e.preventDefault();
            window.location.href = '/login';
          }}
          className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white mb-6 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to sign in
        </a>

        {/* Glassmorphism card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl shadow-black/20 p-8">
          {/* Branding */}
          <div className="flex flex-col items-center mb-8">
            <div className="flex items-center justify-center w-14 h-14 bg-gradient-to-br from-indigo-500 to-cyan-400 rounded-xl shadow-lg shadow-indigo-500/25 mb-4">
              <Mountain className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Reset Password
            </h1>
            <p className="text-slate-400 text-sm mt-1 text-center">
              {isSubmitted
                ? 'Check your email for a reset link'
                : "Enter your email and we'll send you a reset link"}
            </p>
          </div>

          {isSubmitted ? (
            /* Success state */
            <div className="space-y-5">
              <div className="flex flex-col items-center py-4">
                <div className="w-16 h-16 bg-green-500/10 border border-green-500/20 rounded-full flex items-center justify-center mb-4">
                  <Mail className="w-7 h-7 text-green-400" />
                </div>
                <p className="text-sm text-slate-300 text-center leading-relaxed">
                  We sent a password reset link to{' '}
                  <span className="font-medium text-white">
                    {getValues('email')}
                  </span>
                  . Please check your inbox and follow the instructions to reset
                  your password.
                </p>
              </div>

              {/* Didn't receive email */}
              <div className="text-center">
                <p className="text-xs text-slate-500 mb-3">
                  Didn't receive the email? Check your spam folder or try again.
                </p>
                <button
                  type="button"
                  onClick={() => setIsSubmitted(false)}
                  className={cn(
                    'text-sm text-indigo-400 hover:text-indigo-300 font-medium',
                    'transition-colors'
                  )}
                >
                  Try a different email
                </button>
              </div>

              {/* Back to login button */}
              <a
                href="/login"
                onClick={(e) => {
                  e.preventDefault();
                  window.location.href = '/login';
                }}
                className={cn(
                  'flex items-center justify-center w-full py-2.5 px-4 rounded-xl text-sm font-semibold text-white',
                  'bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400',
                  'shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40',
                  'transition-all duration-200'
                )}
              >
                Return to sign in
              </a>
            </div>
          ) : (
            /* Form state */
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Email field */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-slate-300 mb-1.5"
                >
                  Email address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Mail className="w-4.5 h-4.5 text-slate-500" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@company.com"
                    className={cn(
                      'w-full pl-11 pr-4 py-2.5 bg-white/5 border rounded-xl text-white placeholder-slate-500 text-sm',
                      'focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50',
                      'transition-all duration-200',
                      errors.email
                        ? 'border-red-500/50 focus:ring-red-500/50 focus:border-red-500/50'
                        : 'border-white/10 hover:border-white/20'
                    )}
                    {...register('email')}
                  />
                </div>
                {errors.email && (
                  <p className="mt-1.5 text-xs text-red-400">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={isLoading}
                className={cn(
                  'w-full py-2.5 px-4 rounded-xl text-sm font-semibold text-white',
                  'bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400',
                  'shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40',
                  'focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:ring-offset-2 focus:ring-offset-slate-900',
                  'transition-all duration-200',
                  'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-indigo-500/25'
                )}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Sending reset link...
                  </span>
                ) : (
                  'Send reset link'
                )}
              </button>
            </form>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-600 mt-6">
          &copy; {new Date().getFullYear()} Alpine CRM. All rights reserved.
        </p>
      </div>
    </div>
  );
}
