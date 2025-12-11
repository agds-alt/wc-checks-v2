'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { trpc } from '@/lib/trpc/client';
import { toast } from 'sonner';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const registerSchema = z.object({
  full_name: z.string().min(2, 'Nama lengkap minimal 2 karakter'),
  email: z.string().email('Email tidak valid'),
  phone: z.string().optional(),
  password: z.string().min(6, 'Kata sandi minimal 6 karakter'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Kata sandi tidak cocok",
  path: ["confirmPassword"],
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  // Use tRPC register mutation
  const registerMutation = trpc.auth.register.useMutation({
    onSuccess: (data) => {
      // Save token to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('sb-auth-token', data.token);
      }

      toast.success('Registrasi berhasil! Mengalihkan ke dashboard...');
      setTimeout(() => {
        router.push('/dashboard');
      }, 1000);
    },
    onError: (err: any) => {
      console.error('Registration error:', err);

      let userMessage = err.message || 'Gagal mendaftar';

      if (err.message.includes('already exists')) {
        userMessage = 'Email sudah terdaftar. Silakan gunakan email lain atau login.';
      }

      toast.error(userMessage);
      setIsLoading(false);
    },
  });

  const onSubmit = async (data: RegisterForm) => {
    setIsLoading(true);

    try {
      // Call tRPC register mutation
      await registerMutation.mutateAsync({
        email: data.email.trim(),
        password: data.password,
        full_name: data.full_name.trim(),
        phone: data.phone?.trim(),
      });
    } catch (err: any) {
      // Error handled by onError callback
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4 safe-area">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-4">
            <span className="text-white text-2xl font-bold">🚽</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Create Account</h2>
          <p className="mt-2 text-gray-600">Sign up to start inspections</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
          {/* Full Name */}
          <div>
            <label htmlFor="full_name" className="block text-sm font-medium text-gray-700">
              Full Name
            </label>
            <input
              {...register('full_name')}
              type="text"
              className="mt-1 block w-full px-4 py-3 bg-white border border-gray-300 rounded-2xl shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your full name"
            />
            {errors.full_name && (
              <p className="mt-1 text-sm text-red-600">{errors.full_name.message}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              {...register('email')}
              type="email"
              className="mt-1 block w-full px-4 py-3 bg-white border border-gray-300 rounded-2xl shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your email"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          {/* Phone Number */}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
              Phone Number (Optional)
            </label>
            <input
              {...register('phone')}
              type="tel"
              className="mt-1 block w-full px-4 py-3 bg-white border border-gray-300 rounded-2xl shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="Example: 081234567890"
            />
            {errors.phone && (
              <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              {...register('password')}
              type="password"
              className="mt-1 block w-full px-4 py-3 bg-white border border-gray-300 rounded-2xl shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your password"
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
              Confirm Password
            </label>
            <input
              {...register('confirmPassword')}
              type="password"
              className="mt-1 block w-full px-4 py-3 bg-white border border-gray-300 rounded-2xl shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="Confirm your password"
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-2xl shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="text-center">
          <p className="text-gray-600">
            Already have an account?{' '}
            <Link href="/login" className="text-blue-600 hover:text-blue-700 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
