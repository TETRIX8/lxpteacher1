
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

const Settings = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Настройки</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Настройки профиля</CardTitle>
            <CardDescription>Управление данными вашей учетной записи</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="notifications">Уведомления по email</Label>
                  <p className="text-sm text-muted-foreground">Получать уведомления по email</p>
                </div>
                <Switch id="notifications" />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="digest">Дневная сводка</Label>
                  <p className="text-sm text-muted-foreground">Получать ежедневную сводку активности</p>
                </div>
                <Switch id="digest" />
              </div>
            </div>

            <div className="pt-4">
              <Button>Сохранить настройки</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Безопасность</CardTitle>
            <CardDescription>Управление параметрами безопасности</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" className="w-full">Сменить пароль</Button>
            <Button variant="outline" className="w-full">Проверить историю входов</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
