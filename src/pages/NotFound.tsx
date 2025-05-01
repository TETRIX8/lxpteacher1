
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-edu-muted p-4">
      <div className="text-center max-w-md">
        <h1 className="text-6xl font-bold text-edu-primary mb-6">404</h1>
        <h2 className="text-2xl font-bold mb-4">Страница не найдена</h2>
        <p className="text-gray-600 mb-8">
          Запрашиваемая страница не существует или была удалена.
        </p>
        <Link to="/">
          <Button className="bg-edu-primary hover:bg-edu-primary/90">
            Вернуться на главную
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
