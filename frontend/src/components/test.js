// Импортируем класс UrlManager из файла url-manager.js
import config from "../../config/config.js";
import { Auth } from "../servises/auth.js";
import { CustomHttp } from "../servises/custom-http.js";
import { UrlManager } from "../utils/url-manager.js";

// Экспортируем класс Test
export class Test {

    // Конструктор класса
    constructor() {
        // Инициализация переменных экземпляра класса
        this.progressBarElement = null;
        this.passButtonElement = null;
        this.prevButtonElement = null;
        this.nextButtonElement = null;
        this.questionTitleElement = null;
        this.optionsElement = null;
        this.quiz = null;
        this.currentQuestionIndex = 1;
        this.userResult = [];
        // Получаем параметры из URL choice
        this.routeParams = UrlManager.getQueryParams();

        this.init();
    }


    async init() {
        if (this.routeParams.id) {
            console.log('Пришел ID');
            try {
                const result = await CustomHttp.request(config.host + '/tests/' + this.routeParams.id);
                if (result) {
                    if (result.error) {
                        throw new Error(result.error);
                    }

                    this.quiz = result;
                    this.startQuiz();
                }
            } catch (error) {
                console.log(error);
            }
        }
    }

    // Метод для начала выполнения теста
    startQuiz() {
        // добавляем прогресс=бар
        this.progressBarElement = document.getElementById('progress-bar');
        // добавляем с сервера название теста
        document.getElementById('pre-title').innerText = this.quiz.name;
        console.log(this.quiz);
        // заголовок вопроса
        this.questionTitleElement = document.getElementById('title');
        this.optionsElement = document.getElementById('options');

        // обработчики на кнопик Дальше и Пропустить
        this.nextButtonElement = document.getElementById('next');
        // обработчик после нажатия с потерей конекста
        this.nextButtonElement.onclick = this.move.bind(this, 'next');

        this.passButtonElement = document.getElementById('pass');
        // обработчик после нажатия с потерей конекста
        this.passButtonElement.onclick = this.move.bind(this, 'pass');


        this.prevButtonElement = document.getElementById('prev');
        this.prevButtonElement.onclick = this.move.bind(this, 'prev');

        // Подготавливаем прогресс-бар
        this.prepareProgressBar();
        // Отображаем первый вопрос
        this.showQuestion();

        // timer
        // Получаем элемент с id "timer" и сохраняем его в переменной timerElement
        const timerElement = document.getElementById('timer');
        // Устанавливаем начальное значение счетчика
        let seconds = 59;
        // Объявляем переменную для хранения интервала
        let interval;

        // Функция для остановки таймера при возвращении на предыдущую страницу во время прохождения теста
        function stopTimer() {
            clearInterval(interval); // Останавливаем интервал
        }

        // Устанавливаем интервал для обновления счетчика и обновления отображаемого времени
        interval = setInterval(function () {
            seconds--; // Уменьшаем значение счетчика
            timerElement.innerText = seconds; // Обновляем значение отображаемого времени
            if (seconds === 0) {
                clearInterval(interval); // Останавливаем интервал при достижении нуля
                this.complete();
            }
        }.bind(this), 1000); // Интервал обновления каждую секунду, явно привязать контекст метода complete с помощью bind

        // Добавляем обработчик события beforeunload (или unload) 
        window.onbeforeunload = function () {
            stopTimer(); // Вызываем функцию остановки таймера при событии beforeunload
        };


    }

    // Метод для создания прогресс-бара
    prepareProgressBar() {
        for (let i = 0; i < this.quiz.questions.length; i++) {

            // рисуем элементы на странице
            const itemElement = document.createElement('div');
            // добавляем класс и если это первый то еще класс active
            itemElement.className = 'test-progress-bar-item' + (i === 0 ? ' active' : '');

            const itemCircleElement = document.createElement('div');
            itemCircleElement.className = 'test-progress-bar-item-circle';

            const itemTextElement = document.createElement('div');
            itemTextElement.className = 'test-progress-bar-item-text';
            itemTextElement.innerText = 'Вопрос' + (i + 1);

            // иерархия
            itemElement.appendChild(itemCircleElement);
            itemElement.appendChild(itemTextElement);

            this.progressBarElement.appendChild(itemElement);
        }
    }

    showQuestion() {
        // выводим активный вопрос по индексу так как первый индекс 0 значит -1
        const activeQuestion = this.quiz.questions[this.currentQuestionIndex - 1];
        this.questionTitleElement.innerHTML = '<span>Вопрос ' + this.currentQuestionIndex
            + ':</span> ' + activeQuestion.question;

        // очищаем каждый раз при смене вопроса
        this.optionsElement.innerHTML = '';
        const that = this;

        // проверяем есть ли сохраненный ответ в массиве данных userResult и сравниваем Id с еще раз выбранным ответом
        const chosenOption = this.userResult.find(item => item.questionId === activeQuestion.id);

        // создаем структуру ответов
        activeQuestion.answers.forEach(answer => {
            const optionElement = document.createElement('div');
            optionElement.className = 'test-question-option';

            // создаем input изменяя id на те которые приходят из бекенда
            const inputId = 'answer-' + answer.id;
            const inputElement = document.createElement('input');

            // назначаем класс для обработки всех значений для дальнейшего сохранения  в move()
            inputElement.className = 'option-answer';

            inputElement.setAttribute('id', inputId);
            inputElement.setAttribute('type', 'radio');
            inputElement.setAttribute('name', 'answer');
            inputElement.setAttribute('value', answer.id);

            // если в совпадения найдены и в результатах сохраненных chosenOption.chosenAnswerId  
            // и в текущих answer.id если хотим ответить заново то делаем его отмеченным
            if (chosenOption && chosenOption.chosenAnswerId === answer.id) {
                inputElement.setAttribute('checked', 'checked');
            }

            // при выборе ответа разблокируем кнопку дальше
            inputElement.onchange = function () {
                that.choseAnswer();
            }

            const labelElement = document.createElement('label');
            labelElement.setAttribute('for', inputId);
            labelElement.innerText = answer.answer;


            // создаем вложенность
            optionElement.appendChild(inputElement);
            optionElement.appendChild(labelElement);

            this.optionsElement.appendChild(optionElement);
        });

        // если нажать на Пропустить вопрос, чтобы не работала кнопка Дальше если ответа еще не было
        if (chosenOption && chosenOption.chosenAnswerId) {
            this.nextButtonElement.removeAttribute('disabled');
        } else {
            this.nextButtonElement.setAttribute('disabled', 'disabled');
        }


        // после поседнего вопроса меняем кнопку на Завершить
        if (this.currentQuestionIndex === this.quiz.questions.length) {
            this.nextButtonElement.innerText = 'Завершить';
        } else {
            this.nextButtonElement.innerText = 'Далее';
        }
        // кнопка Назад активна если вопрос не первый
        if (this.currentQuestionIndex > 1) {
            this.prevButtonElement.removeAttribute('disabled');
        } else {
            this.prevButtonElement.setAttribute('disabled', 'disabled');
        }
    }
    choseAnswer() {
        // при выборе ответа делаем кнопку активной
        this.nextButtonElement.removeAttribute('disabled')
    }
    // функция для перехода на предыдущий или следущий вопрос
    move(action) {
        // Проверяем наличие вопросов и допустимость индекса текущего вопроса
        if (this.quiz.questions &&
            this.currentQuestionIndex > 0 &&
            this.currentQuestionIndex <= this.quiz.questions.length) {

            const activeQuestion = this.quiz.questions[this.currentQuestionIndex - 1];

            // сохраняем введенные данные по ответам пользователя
            // сначала ищем выбранный ответ chosenAnswer
            // find не работает с коллекциями по этому array.from
            const chosenAnswer = Array.from(document.getElementsByClassName('option-answer')).find(element => element.checked);

            let chosenAnswerId = null; // если вопрос пропущен
            // если ответ был выбран то сохраняем  в виде цифры id в chosenAnswerId
            if (chosenAnswer && chosenAnswer.value) {
                chosenAnswerId = Number(chosenAnswer.value);
            }

            // проверяем есть ли уже ответ
            const existingResult = this.userResult.find(item => {
                return item.questionId === activeQuestion.id;
            });

            if (existingResult) {
                existingResult.chosenAnswerId = chosenAnswerId;
            } else {
                // сохраняем  в объект на каждый вопрос ответы по id
                this.userResult.push({
                    // id вопроса на котором находится пользователь
                    questionId: activeQuestion.id,
                    chosenAnswerId: chosenAnswerId
                });
            };

            console.log(this.userResult);

            if (action === 'next' || action === 'pass') { // если не 
                this.currentQuestionIndex++; // переходим вперед
            } else { // если предыдущий prev
                this.currentQuestionIndex--; // то назад к предыдущему вопросу
            }
            // проверка на последний вопрос, если индекс > чем количество вопросов
            if (this.currentQuestionIndex > this.quiz.questions.length) {
                this.complete();
                return;
            }

            Array.from(this.progressBarElement.children).forEach((item, index) => {
                const currentItemIndex = index + 1;

                item.classList.remove('complete');
                item.classList.remove('active');

                if (currentItemIndex === this.currentQuestionIndex) {
                    item.classList.add('active');
                } else if (currentItemIndex < this.currentQuestionIndex) {
                    item.classList.add('complete');
                }
            });


            // после перехода отображаем следущий или предыдущий вопрос
            this.showQuestion();
        }
    }
    // завершение теста 1:54:30
    async complete() {
        const userInfo = Auth.getUserInfo();
        if (!userInfo) {
            location.href = '#/';
        }

        try {
            const result = await CustomHttp.request(config.host + '/tests/' + this.routeParams.id + '/pass', 'POST',
                {
                    userId: userInfo.userId,
                    results: this.userResult
                })
            if (result) {
                if (result.error) {
                    throw new Error(result.error);
                }
                location.href = '#/result?id=' + result.routeParams.id;
            }
        } catch (error) {
            console.log(error)
        }

    }
}

// 50 m videoru