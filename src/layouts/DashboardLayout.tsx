
import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from '@/contexts/AuthContext';
import { 
  Home, 
  Book, 
  Users, 
  Settings,
  LogOut
} from 'lucide-react';

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const getInitials = () => {
    if (!user) return 'U';
    
    const firstName = user.firstName || '';
    const lastName = user.lastName || '';
    
    return `${firstName.charAt(0)}${lastName.charAt(0)}`;
  };

  const navItems = [
    { name: 'Главная', path: '/dashboard', icon: <Home className="h-5 w-5" /> },
    { name: 'Дисциплины', path: '/dashboard/disciplines', icon: <Book className="h-5 w-5" /> },
    { name: 'Группы', path: '/dashboard/groups', icon: <Users className="h-5 w-5" /> },
    { name: 'Настройки', path: '/dashboard/settings', icon: <Settings className="h-5 w-5" /> },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Sidebar for desktop */}
      <div className="hidden md:flex flex-col w-64 bg-edu-primary text-white border-r border-edu-border">
        <div className="p-6 border-b border-white/10">
          <h2 className="text-xl font-semibold">Кабинет</h2>
          <p className="text-sm text-white/80">Преподавателя</p>
        </div>
        
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.path}>
                <NavLink 
                  to={item.path}
                  className={({ isActive }) => 
                    `flex items-center gap-3 px-4 py-2 rounded-md transition-colors ${
                      isActive 
                        ? 'bg-white/10 text-white' 
                        : 'text-white/80 hover:bg-white/5 hover:text-white'
                    }`
                  }
                >
                  {item.icon}
                  <span>{item.name}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        
        <div className="p-4 border-t border-white/10">
          <Button 
            variant="ghost" 
            className="w-full justify-start text-white/80 hover:text-white hover:bg-white/10"
            onClick={logout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Выйти
          </Button>
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Top header */}
        <header className="bg-white border-b border-edu-border py-3 px-4 md:px-6 flex justify-between items-center">
          {/* Mobile menu button */}
          <div className="md:hidden">
            {/* Mobile menu goes here */}
          </div>
          
          <div>
            <h1 className="text-xl font-semibold text-edu-primary md:hidden">Кабинет преподавателя</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right hidden md:block">
              <p className="font-medium">{user?.lastName} {user?.firstName}</p>
              <p className="text-sm text-gray-500">{user?.email}</p>
            </div>
            <Avatar>
              <AvatarImage src={user?.avatar} />
              <AvatarFallback className="bg-edu-primary text-white">{getInitials()}</AvatarFallback>
            </Avatar>
          </div>
        </header>
        
        {/* Mobile navigation bar */}
        <div className="md:hidden bg-white border-b border-edu-border flex justify-between p-2">
          {navItems.map((item) => (
            <NavLink 
              key={item.path}
              to={item.path}
              className={({ isActive }) => 
                `flex flex-col items-center p-2 rounded-md ${
                  isActive 
                    ? 'text-edu-primary' 
                    : 'text-gray-500 hover:text-edu-primary'
                }`
              }
            >
              {item.icon}
              <span className="text-xs mt-1">{item.name}</span>
            </NavLink>
          ))}
        </div>
        
        {/* Page content */}
        <main className="flex-1 overflow-auto p-4 md:p-6 bg-edu-muted">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
