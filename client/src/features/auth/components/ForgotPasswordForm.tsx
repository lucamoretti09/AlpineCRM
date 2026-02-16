import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mountain, Mail, Loader2, ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';
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
  const [focusedField, setFocusedField] = useState<string | null>(null);

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

      <div className="relative w-full max-w-md animate-fadeInUp">
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
              Reset Password
            </h1>
            <p className="text-white/40 text-[13px] mt-1 text-center">
              {isSubmitted
                ? 'Check your email for a reset link'
                : "Enter your email and we'll send you a reset link"}
            </p>
          </div>

          {isSubmitted ? (
            /* Success state */
            <div className="space-y-5 animate-fadeInUp">
              <div className="flex flex-col items-center py-4">
                <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                </div>
                <p className="text-[13px] text-white/60 text-center leading-relaxed">
                  We sent a password reset link to{' '}
                  <span className="font-semibold text-white/90">
                    {getValues('email')}
                  </span>
                  . Please check your inbox and follow the instructions to reset
                  your password.
                </p>
              </div>

              {/* Didn't receive email */}
              <div className="text-center">
                <p className="text-[11px] text-white/25 mb-3">
                  Didn't receive the email? Check your spam folder or try again.
                </p>
                <button
                  type="button"
                  onClick={() => setIsSubmitted(false)}
                  className="text-[13px] text-indigo-400 hover:text-indigo-300 font-medium transition-colors duration-300"
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
                className="relative flex items-center justify-center w-full py-3 px-4 rounded-xl text-[14px] font-semibold text-white bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 shadow-xl shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all duration-300 group overflow-hidden"
              >
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                <span className="relative">Return to sign in</span>
              </a>
            </div>
          ) : (
            /* Form state */
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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

              {/* Submit button */}
              <button
                type="submit"
                disabled={isLoading}
                className="relative w-full py-3 px-4 rounded-xl text-[14px] font-semibold text-white bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 shadow-xl shadow-indigo-500/25 hover:shadow-indigo-500/40 focus:outline-none transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group overflow-hidden"
              >
                {/* Shimmer effect */}
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                {isLoading ? (
                  <span className="relative flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Sending reset link...
                  </span>
                ) : (
                  <span className="relative flex items-center justify-center gap-2">
                    Send reset link
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-300" />
                  </span>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-[11px] text-white/20 mt-6">
          &copy; {new Date().getFullYear()} Alpine CRM. All rights reserved.
        </p>
      </div>
    </div>
  );
}
