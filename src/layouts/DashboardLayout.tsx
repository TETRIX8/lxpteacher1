import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from '@/contexts/AuthContext';
import { 
  Home, 
  Book, 
  Users, 
  Settings,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  const MobileNav = () => (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-border/10">
        <h2 className="text-lg font-semibold text-foreground">Меню</h2>
      </div>
      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink 
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) => 
                  `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    isActive 
                      ? 'bg-edu-primary text-white shadow-lg' 
                      : 'text-foreground/80 hover:bg-muted active:scale-95'
                  }`
                }
              >
                {item.icon}
                <span className="font-medium">{item.name}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <div className="p-4 border-t border-border/10">
        <div className="flex items-center gap-3 mb-4 p-3 bg-muted rounded-xl">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user?.avatar} />
            <AvatarFallback className="bg-edu-primary text-white text-sm">{getInitials()}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate">{user?.lastName} {user?.firstName}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
          </div>
        </div>
        <Button 
          variant="outline" 
          className="w-full justify-start gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={() => {
            setMobileMenuOpen(false);
            logout();
          }}
        >
          <LogOut className="h-4 w-4" />
          Выйти
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex flex-col w-64 bg-edu-primary text-white border-r border-edu-border shrink-0">
        <div className="p-6 border-b border-white/10">
          <h2 className="text-xl font-semibold">Кабинет</h2>
          <p className="text-sm text-white/80">Преподавателя</p>
        </div>
        
        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.path}>
                <NavLink 
                  to={item.path}
                  className={({ isActive }) => 
                    `flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 ${
                      isActive 
                        ? 'bg-white/20 text-white shadow-sm' 
                        : 'text-white/80 hover:bg-white/10 hover:text-white'
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
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top header */}
        <header className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border py-3 px-4 md:px-6 flex justify-between items-center">
          {/* Mobile menu button */}
          <div className="md:hidden">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-10 w-10">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[280px] p-0">
                <MobileNav />
              </SheetContent>
            </Sheet>
          </div>
          
          <div className="flex-1 md:flex-none">
            <h1 className="text-lg md:text-xl font-semibold text-foreground md:hidden text-center">
              Кабинет преподавателя
            </h1>
          </div>
          
          <div className="flex items-center gap-2 md:gap-4">
            <div className="text-right hidden md:block">
              <p className="font-medium text-sm">{user?.lastName} {user?.firstName}</p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
            <Avatar className="h-9 w-9 md:h-10 md:w-10">
              <AvatarImage src={user?.avatar} />
              <AvatarFallback className="bg-edu-primary text-white text-sm">{getInitials()}</AvatarFallback>
            </Avatar>
          </div>
        </header>
        
        {/* Page content */}
        <main className="flex-1 overflow-x-hidden p-3 md:p-6 bg-muted/30">
          <Outlet />
        </main>
        
        {/* Mobile bottom navigation */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t border-border safe-area-bottom">
          <div className="flex justify-around items-center py-2">
            {navItems.map((item) => (
              <NavLink 
                key={item.path}
                to={item.path}
                className={({ isActive }) => 
                  `flex flex-col items-center p-2 min-w-[64px] rounded-lg transition-all duration-200 ${
                    isActive 
                      ? 'text-edu-primary' 
                      : 'text-muted-foreground active:scale-95'
                  }`
                }
              >
                {item.icon}
                <span className="text-[10px] mt-1 font-medium">{item.name}</span>
              </NavLink>
            ))}
          </div>
        </nav>
      </div>
    </div>
  );
};

export default DashboardLayout;
