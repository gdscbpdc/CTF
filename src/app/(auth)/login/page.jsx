'use client';

import { useState } from 'react';
import { Card, CardBody, Input, Button } from '@nextui-org/react';

export default function LoginPage() {
  const [credentials, setCredentials] = useState({
    username: '',
    password: '',
  });

  const handleLogin = () => {
    // Implement login logic
  };
  return (
    <div className='flex justify-center items-center min-h-[calc(100vh-4rem)]'>
      <Card className='w-full max-w-md'>
        <CardBody className='space-y-4'>
          <h2 className='text-2xl font-bold text-center'>Login</h2>
          <Input
            label='Username'
            value={credentials.username}
            onChange={(e) =>
              setCredentials({
                ...credentials,
                username: e.target.value,
              })
            }
          />
          <Input
            label='Password'
            type='password'
            value={credentials.password}
            onChange={(e) =>
              setCredentials({
                ...credentials,
                password: e.target.value,
              })
            }
          />
          <Button color='primary' fullWidth onClick={handleLogin}>
            Login
          </Button>
        </CardBody>
      </Card>
    </div>
  );
}
