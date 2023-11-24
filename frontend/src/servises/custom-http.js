import { Auth } from "./auth.js";

export class CustomHttp {
    static async request(url, method = "GET", body = null) {

        const params = {
            method: method,
            headers: {
                'Content-type': 'application/json',
                'Accept': 'application/json',
            }
        };
        let token = localStorage.getItem(Auth.accessTokenKey);
        if (token) {
            params.headers['x-access-token'] = token;
        }
        
        if (body) {
            params.body = JSON.stringify(body);
        }

        // отправляем запрос на регистрацию
        const response = await fetch(url, params);

        if (response.status < 200 || response.status >= 300) {
            if (response.status === 401) {
                const result = await Auth.processUnautorizedResponse();
                if (result) {
                    return await this.request(url, method, body); // 1:20 рекурсия
                } else {
                    return null;
                }
            }

            throw new Error(response.message);
        }

        return await response.json();

    }
}


// // Импортируем класс Auth из файла "auth.js"
// import { Auth } from "./auth.js";

// // Экспортируем класс CustomHttp
// export class CustomHttp {
//     // Создаем статический асинхронный метод request с параметрами url, method и body по умолчанию равным null
//     static async request(url, method = "GET", body = null) {

//         // Создаем объект params с методом и заголовками
//         const params = {
//             method: method,
//             headers: {
//                 'Content-type': 'application/json',
//                 'Accept': 'application/json',
//             }
//         };

//         // Получаем токен из локального хранилища, используя ключ AccessTokenKey из класса Auth
//         let token = localStorage.getItem(Auth.accessTokenKey);
//         // Если токен есть, добавляем его в заголовки
//         if (token) {
//             params.headers['x-access-token'] = token;
//         }
        
//         // Если есть тело запроса, преобразуем его в JSON и добавляем в параметры
//         if (body) {
//             params.body = JSON.stringify(body);
//         }

//         // Отправляем запрос по указанному url с параметрами
//         const response = await fetch(url, params);

//         // Если статус ответа не в диапазоне 200-299, обрабатываем ответ
//         if (response.status < 200 || response.status >= 300) {
//             // Если статус 401, обрабатываем неавторизированный ответ
//             if (response.status === 401) {
//                 // Обрабатываем неавторизированный ответ с помощью метода processUnautorizedResponse() из класса Auth
//                 const result = await Auth.processUnautorizedResponse();
//                 // Если результат есть, выполняем запрос заново
//                 if (result) {
//                     return await this.request(url, method, body); // Рекурсия
//                 } else {
//                     return null;
//                 }
//             }

//             // Если другие ошибки, выбрасываем ошибку с сообщением из ответа
//             throw new Error(response.message);
//         }

//         // Возвращаем JSON из ответа
//         return await response.json();

//     }
// }
