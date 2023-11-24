// Импорт классов из соответствующих файлов
import { Choice } from "./components/choice.js";
import { Form } from "./components/form.js";
import { Result } from "./components/result.js";
import { Test } from "./components/test.js";
import { Auth } from "./servises/auth.js";

// Объявление класса Router
export class Router {
    constructor() { // Определение конструктора класса

      this.contentElement = document.getElementById('content');
      this.stylesElement = document.getElementById('styles'); 
      this.titleElement = document.getElementById('page-title');
      this.profileElement = document.getElementById('profile');
      this.profilefullNameElement = document.getElementById('profile-full-name');

        this.routes = [ // Инициализация свойства "routes" массивом маршрутов
            {
                route: '#/', // Путь маршрута для главной страницы
                title: 'Главная', // Заголовок страницы
                template: 'templates/index.html', // Шаблон страницы
                styles: 'styles/index.css', // Стили страницы
                load: () => { // Функция загрузки страницы
                } // Пустая функция загрузки для главной страницы
            },
            {
                route: '#/signup', // Путь маршрута для страницы регистрации
                title: 'Регистрация', // Заголовок страницы
                template: 'templates/signup.html', // Шаблон страницы
                styles: 'styles/form.css', // Стили страницы
                load: () => { // Функция загрузки страницы
                    new Form('signup'); // Создание экземпляра класса "Form" при загрузке маршрута /form
                }
            },
            {
                route: '#/login', // Путь маршрута для страницы регистрации
                title: 'Вход в систему', // Заголовок страницы
                template: 'templates/login.html', // Шаблон страницы
                styles: 'styles/form.css', // Стили страницы
                load: () => { // Функция загрузки страницы
                    new Form('login'); // Создание экземпляра класса "Form" при загрузке маршрута /form
                }
            },
            {
                route: '#/choice', // Путь маршрута для страницы выбора теста
                title: 'Выбор теста', // Заголовок страницы
                template: 'templates/choice.html', // Шаблон страницы
                styles: 'styles/choice.css', // Стили страницы
                load: () => { // Функция загрузки страницы
                    new Choice(); // Создание экземпляра класса "Choice" при загрузке маршрута /choice
                }
            },
            {
                route: '#/test', // Путь маршрута для страницы прохождения теста
                title: 'Прохождение теста', // Заголовок страницы
                template: 'templates/test.html', // Шаблон страницы
                styles: 'styles/test.css', // Стили страницы
                load: () => { // Функция загрузки страницы
                    new Test(); // Создание экземпляра класса "Test" при загрузке маршрута /test
                }
            },
            {
                route: '#/result', // Путь маршрута для страницы результатов
                title: 'Результаты', // Заголовок страницы
                template: 'templates/result.html', // Шаблон страницы
                styles: 'styles/result.css', // Стили страницы
                load: () => { // Функция загрузки страницы
                    new Result(); // Создание экземпляра класса "Result" при загрузке маршрута /result
                }
            },
        ];
    }

    async openRoute() { // Определение асинхронной функции openRoute
    const urlRoute = window.location.hash.split('?')[0];
        if (urlRoute === '#/logout') {
            await Auth.logout();
            window.location.href = '#/';
            return;
        }
        const newRoute = this.routes.find(item => { // Находим объект маршрута по хэшу URL
            return item.route === urlRoute; // Сравнение пути с текущим хэшем URL
            // добавляем split('?')[0] так как newRoute=indefined из-за попадания параметров имени и емейл
            // window.location.hash попадает #/choice?name=Имя&lastName=Фамилия&email=kind-vlad@list.ru"
            // split('?') разбивает полученную строку хэша URL на массив подстрок, используя символ "?" в качестве разделителя.
            //[0] возвращает первый элемент массива, то есть часть строки до символа "?" а именно "#/choice".
        });

        if (!newRoute) { // Если маршрут не найден
            window.location.href = '#/'; // Перенаправляем на главную страницу
            return; // Прерываем выполнение функции
        }

        // Загружаем HTML-шаблон нового маршрута

        this.contentElement.innerHTML = await fetch(newRoute.template).then(response => response.text());
        this.stylesElement.setAttribute('href', newRoute.styles); // Устанавливаем стили нового маршрута
        this.titleElement.innerText = newRoute.title; // Устанавливаем заголовок страницы

        // ПРОВЕРКА есть ли токен и имя и фамилия
        const userInfo = Auth.getUserInfo();
        const accessToken = localStorage.getItem(Auth.accessTokenKey);
        if (userInfo && accessToken) {
            this.profileElement.style.display = 'flex';
            this.profilefullNameElement.innerText = userInfo.fullName;
        } else {
            this.profileElement.style.display = 'none';
        }


        newRoute.load(); // Вызываем функцию загрузки нового маршрута
    }
}











// import { Choice } from "./components/choice.js";
// import { Form } from "./components/form.js"
// import { Result } from "./components/result.js";
// import { Test } from "./components/test.js";

// export class Router {
//     constructor() {
//         this.routes = [
//             {
//                 route: '#/',
//                 title: 'Главная',
//                 template: 'templates/index.html',
//                 styles: 'styles/index.css',
//                 laod: () => {
//                 }
//             },
//             {
//                 route: '#/form',
//                 title: 'Регистрация',
//                 template: 'templates/form.html',
//                 styles: 'styles/form.css',
//                 load: () => {
//                     new Form();
//                 }
//             },
//             {
//                 route: '#/choice',
//                 title: 'Выбор теста',
//                 template: 'templates/choice.html',
//                 styles: 'styles/choice.css',
//                 load: () => {
//                     new Choice();
//                 }
//             },
//             {
//                 route: '#/test',
//                 title: 'Прохождение теста',
//                 template: 'templates/test.html',
//                 styles: 'styles/test.css',
//                 load: () => {
//                     new Test();
//                 }
//             },
//             {
//                 route: '#/result',
//                 title: 'Результаты',
//                 template: 'templates/result.html',
//                 styles: 'styles/result.css',
//                 load: () => {
//                     new Result();
//                 }
//             },
//         ]
//     }

//     async openRoute() {
//         const newRoute = this.routes.find(item => {
            
//             // console.log('что в  window.location.hash', window.location.hash)
//             // console.log('результат split("?")', window.location.hash.split('?'))
//             // console.log('результат [0]', window.location.hash.split('?')[0])
//             // console.log('результат [1]', window.location.hash.split('?')[1])
//             return item.route === window.location.hash.split('?')[0];
//         });

//         if (!newRoute) {
//             window.location.href = '#/';
//             return;
//         }

//         document.getElementById('content').innerHTML =
//             await fetch(newRoute.template).then(response => response.text());
//         document.getElementById('styles').setAttribute('href', newRoute.styles);
//         document.getElementById('page-title').innerText = newRoute.title;
//         newRoute.load();
        
//     }

// }

// //27:30 видео