import * as yup from 'yup';
import { useFormik } from 'formik';
import { useEffect } from 'react';
import { useRouter } from 'next/router';

import { Button, InputWithLabel, Alert } from '../components'
import { useRequestManager } from '../hooks/useResponseChecker';

const validationSchema = yup.object({
  email: yup
    .string('Enter your email')
    .email('Enter a valid email')
    .required('Email is required'),
  password: yup
    .string('Enter your password')
    .min(8, 'Password should be of minimum 8 characters length')
    .required('Password is required'),
});

export default function Login() {
  const router = useRouter();
  const { data, error, onCheckResponse, setError } = useRequestManager();

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema: validationSchema,
    onSubmit: ({ email, password }) => {
      fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        mode: 'cors',
        body: JSON.stringify({
          email,
          password
        })
      })
        .then((response) => response.json())
        .then((response) => {
          onCheckResponse(response)
        })
        .catch(() => {
          // TODO: need to implement
        })
    },
  });

  useEffect(() => {
    if (data) {
      router.push('/');
    }
  }, [router, data])

  return (
    <main className='flex flex-col max-w-sm mx-auto px-4 sm:px-6 lg:px-8 min-h-screen'>
      <h1 className='text-5xl text-center font-extrabold tracking-tight mt-4'>
        Infocoin
      </h1>
      <h3 className='text-md mb-4 font-extrabold text-center text-slate-500 mt-0.5'>
        Login
      </h3>
      <div className='py-4 px-4 bg-white rounded-md shadow-sm border relative'>
        {
          error ? (
            <Alert 
              intent="danger"
              text={error.data.message}
              onClearError={() => setError(null)}
              title="Error"
            />
          ) : null
        }

        <form onSubmit={formik.handleSubmit}>
          <div className='mb-4'>
            <InputWithLabel
              id="email"
              name="email"
              label="Email"
              value={formik.values.email}
              onChange={formik.handleChange}
              error={formik.touched.email && Boolean(formik.errors.email)}
              helperText={formik.touched.email && formik.errors.email}
            />
          </div>

          <div className='mb-4'>
            <InputWithLabel
              id="password"
              name="password"
              label="Password"
              type="password"
              value={formik.values.password}
              onChange={formik.handleChange}
              error={formik.touched.password && Boolean(formik.errors.password)}
              helperText={formik.touched.password && formik.errors.password}
            />
          </div>

          <Button type="submit" intent="primary" className="w-full" >Log in</Button>
        </form>
      </div>
    </main>
  )
}