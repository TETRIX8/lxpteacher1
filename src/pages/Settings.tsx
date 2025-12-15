import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

const Settings = () => {
  return (
    <div className="space-y-4 md:space-y-6 animate-fade-in pb-20 md:pb-0">
      <div className="flex justify-between items-center">
        <h1 className="text-xl md:text-2xl font-bold tracking-tight">Настройки</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="p-4 md:p-6">
            <CardTitle className="text-base md:text-lg">Настройки профиля</CardTitle>
            <CardDescription className="text-xs md:text-sm">Управление данными вашей учетной записи</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 p-4 pt-0 md:p-6 md:pt-0">
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <Label htmlFor="notifications" className="text-sm">Уведомления по email</Label>
                  <p className="text-xs text-muted-foreground mt-0.5">Получать уведомления по email</p>
                </div>
                <Switch id="notifications" className="shrink-0" />
              </div>
              
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <Label htmlFor="digest" className="text-sm">Дневная сводка</Label>
                  <p className="text-xs text-muted-foreground mt-0.5">Получать ежедневную сводку активности</p>
                </div>
                <Switch id="digest" className="shrink-0" />
              </div>
            </div>

            <div className="pt-4">
              <Button className="w-full md:w-auto">Сохранить настройки</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4 md:p-6">
            <CardTitle className="text-base md:text-lg">Безопасность</CardTitle>
            <CardDescription className="text-xs md:text-sm">Управление параметрами безопасности</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 p-4 pt-0 md:p-6 md:pt-0">
            <Button variant="outline" className="w-full">Сменить пароль</Button>
            <Button variant="outline" className="w-full">Проверить историю входов</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
