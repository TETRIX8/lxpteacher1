
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/sonner';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await login(email, password);
      toast.success('Вход выполнен успешно!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Ошибка входа. Проверьте ваши данные и попробуйте снова.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-edu-muted p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-edu-primary mb-2">Кабинет преподавателя</h1>
          <p className="text-gray-600">Вход в систему</p>
        </div>
        
        <Card className="border-edu-border">
          <CardHeader>
            <CardTitle>Вход</CardTitle>
            <CardDescription>Введите ваши данные для авторизации</CardDescription>
          </CardHeader>
          
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@ithub.ru"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Пароль</Label>
                <Input 
                  id="password" 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </CardContent>
            
            <CardFooter>
              <Button 
                type="submit" 
                className="w-full bg-edu-primary hover:bg-edu-primary/90" 
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Вход...' : 'Войти'}
              </Button>
            </CardFooter>
          </form>
        </Card>
        
        <p className="mt-6 text-center text-sm text-gray-500">
          * Для демо-входа используйте: evloevam@magas.ithub.ru / 1Q2w3a4e$#
        </p>
      </div>
    </div>
  );
};

export default Login;
