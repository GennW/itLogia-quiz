import { Router } from "./router.js"; // Импортируем класс Router из модуля router.js

class App {
    constructor() { // Определяем конструктор класса App
        this.router = new Router(); // Создаем экземпляр класса Router и сохраняем его в свойстве router
        
        // Добавляем слушатель события DOMContentLoaded, который вызовет метод handleRouteChanging при загрузке контента
        window.addEventListener('DOMContentLoaded', this.handleRouteChanging.bind(this)); 
        
        // Добавляем слушатель события popstate, который также вызовет метод handleRouteChanging при изменении истории переходов (например, нажатии кнопки "назад" в браузере)
        window.addEventListener('popstate', this.handleRouteChanging.bind(this)); 
    }


// Определяем метод handleRouteChanging, который будет открывать маршрут с использованием объекта router
    handleRouteChanging() { 
        this.router.openRoute(); // Вызываем метод openRoute объекта router
    }
}

(new App()); // Создаем новый экземпляр класса App и не сохраняем его в переменной, просто вызываем конструктор класса для инициализации




//     // constructor() {
//     //     this.router = new Router();
//     //     window.addEventListener('DOMContentLoaded', () => {
//     //         this.router.openRoute();
//     //     });
//     //     window.addEventListener('popstate', () => {
//     //         this.router.openRoute();
//     //     });
//     // }
