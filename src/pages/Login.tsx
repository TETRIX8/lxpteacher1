
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/sonner';
import { GraduationCap, Mail, Lock, Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Заголовок */}
        <div className="text-center space-y-4">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-edu-primary to-edu-secondary rounded-full flex items-center justify-center shadow-lg">
            <GraduationCap className="w-10 h-10 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-edu-primary via-purple-600 to-edu-secondary bg-clip-text text-transparent">
              Кабинет преподавателя
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2 text-lg">
              Вход в систему управления образовательным процессом
            </p>
          </div>
        </div>
        
        {/* Форма входа */}
        <Card className="edu-card-gradient shadow-xl border-0">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center text-gray-900 dark:text-gray-100">
              Вход в систему
            </CardTitle>
            <CardDescription className="text-center text-gray-600 dark:text-gray-400">
              Введите ваши данные для авторизации
            </CardDescription>
          </CardHeader>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <CardContent className="space-y-4">
              {/* Email поле */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email адрес
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input 
                    id="email" 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="example@ithub.ru"
                    className="pl-10 h-12 border-2 border-gray-200 dark:border-gray-700 focus:border-edu-primary focus:ring-2 focus:ring-edu-primary/20 rounded-lg transition-all duration-200"
                    required
                  />
                </div>
              </div>
              
              {/* Пароль поле */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Пароль
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input 
                    id="password" 
                    type={showPassword ? "text" : "password"}
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Введите пароль"
                    className="pl-10 pr-10 h-12 border-2 border-gray-200 dark:border-gray-700 focus:border-edu-primary focus:ring-2 focus:ring-edu-primary/20 rounded-lg transition-all duration-200"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="flex flex-col space-y-4">
              <Button 
                type="submit" 
                className="w-full h-12 bg-gradient-to-r from-edu-primary to-edu-secondary text-white font-semibold rounded-lg transition-all duration-300 hover:shadow-lg hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed" 
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Вход...</span>
                  </div>
                ) : (
                  'Войти в систему'
                )}
              </Button>
              
              {/* Демо данные */}
              <div className="w-full p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-800 dark:text-blue-200 font-medium mb-2">
                  💡 Демо-доступ:
                </p>
                <div className="space-y-1 text-xs text-blue-700 dark:text-blue-300">
                  <p><strong>Email:</strong> evloevam@magas.ithub.ru</p>
                  <p><strong>Пароль:</strong> 1Q2w3a4e$#</p>
                </div>
              </div>
            </CardFooter>
          </form>
        </Card>
        
        {/* Дополнительная информация */}
        <div className="text-center space-y-2">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Система управления образовательным процессом
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            © 2024 ITHub. Все права защищены.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
