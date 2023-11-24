import config from "../../config/config.js";
import { Auth } from "../servises/auth.js";
import { CustomHttp } from "../servises/custom-http.js";
import { UrlManager } from "../utils/url-manager.js";

export class Choice {

    constructor() {
        this.quizzes = [];
        this.testResult = null;
        // устанавливаем значения url из choice
        this.routeParams = UrlManager.getQueryParams();


        this.init();
    }

    async init() {
        try {
            const result = await CustomHttp.request(config.host + '/tests');
            if (result) {
                if (result.error) {
                    throw new Error(result.error);
                }
                this.quizzes = result;
            }

        } catch (error) {
            return console.log(error);
        }
        const userInfo = Auth.getUserInfo();
        if (userInfo) {

            try {
                this.testResult = await CustomHttp.request(config.host + '/tests/results?userId=' + userInfo.userId);
                if (result) {
                    if (result.error) {
                        throw new Error(result.error);
                    }
                    this.testResult = result;
                }

            } catch (error) {
                return console.log(error);
            }
        }
        this.processQuizzes();
    }

    processQuizzes() { // строим сруктуру html из данных с бекенда
        const choiceOptionsElement = document.getElementById('choice-options');
        console.log(this.quizzes);

        if (this.quizzes && this.quizzes.length > 0) {
            // создаем сруктуру html 
            this.quizzes.forEach(quiz => {
                const that = this;
                const choiceOptionElement = document.createElement('div');
                choiceOptionElement.className = 'choice-option';
                choiceOptionElement.setAttribute('data-id', quiz.id);
                choiceOptionElement.onclick = function () {
                    that.chooseQuiz(this);
                }

                const choiceOptionTextElement = document.createElement('div');
                choiceOptionTextElement.className = 'choice-option-text';
                choiceOptionTextElement.innerText = quiz.name;

                const choiceOptionArrowElement = document.createElement('div');
                choiceOptionArrowElement.className = 'choice-option-arrow';

                // добавляем плашку
                const result = this.testResult.find(item => item.testId === quiz.id);
                if (result) {
                    const choiceOptionResultElement = document.createElement('div');
                    choiceOptionResultElement.className = 'choice-option-result';
                    choiceOptionResultElement.innerHTML = '<div>Результат</div><div>'
                        + result.score + '/' + result.total + '</div>';
                    choiceOptionElement.appendChild(choiceOptionResultElement);
                }

                const choiceOptionImgElement = document.createElement('img');
                choiceOptionImgElement.setAttribute('src', 'img/arrow.svg');
                choiceOptionImgElement.setAttribute('alt', 'arrow');

                // вложение элементов
                choiceOptionArrowElement.appendChild(choiceOptionImgElement);
                choiceOptionElement.appendChild(choiceOptionTextElement);
                choiceOptionElement.appendChild(choiceOptionArrowElement);

                choiceOptionsElement.appendChild(choiceOptionElement);

            });
        }
    }
    chooseQuiz(element) {
        const dataId = element.getAttribute('data-id');

        if (dataId) {
            // переписываем правильные параметры следующей страницы url
            location.href = '#/test?id=' + dataId;
        }
    }
}



