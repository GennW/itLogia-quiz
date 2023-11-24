import { Auth } from "../servises/auth.js";
import { UrlManager } from "../utils/url-manager.js";

export class Result {

    constructor() {
        this.routeParams = UrlManager.getQueryParams();

        this.init();


        // выводим правильное сообщение о выполнении теста
        const resultText = document.getElementById('result-title');
        if (parseInt(this.routeParams.score) <= 3) {
            resultText.innerText = 'Упс! Ты не прошёл тест!'
        }


    }

    async init() {
        const userInfo = Auth.getUserInfo();
        if (!userInfo) {
            location.href = '/#';
        }

        if (this.routeParams.id) {

            try {
                const result = await CustomHttp.request(config.host + '/tests/' + this.routeParams.id
                    + '/result?userId=' + userInfo.userId)
                if (result) {
                    if (result.error) {
                        throw new Error(result.error);
                    }

                    document.getElementById('result-score').innerText = result.score + '/' + result.total;
                    return;
                }
            } catch (error) {
                console.log(error)
            }
        }
        location.href = '/#';
    }
}

