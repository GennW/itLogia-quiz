import config from "../../config/config.js";
import { Auth } from "../servises/auth.js";
import { CustomHttp } from "../servises/custom-http.js";

export class Form {

    constructor(page) {
        this.agreeElement = null;
        this.processElement = null;
        this.page = page;

        // если уже залогинились то при нажатии на главную и начать тест сохранит пользователя 
        const accessToken = localStorage.getItem(Auth.accessTokenKey);
        if (accessToken) {
            location.href = '#/choice';
            return;
        }

        this.fields = [
            {
                name: 'email',
                id: 'email',
                element: null,
                regex: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
                valid: false,
            },
            {
                name: 'password',
                id: 'password',
                element: null,
                regex: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/,
                valid: false,
            },
        ];

        if (this.page === 'signup') {
            this.fields.unshift(
                {
                    name: 'name',
                    id: 'name',
                    element: null,
                    regex: /^[А-Я][а-я]+\s*$/,
                    valid: false,
                },
                {
                    name: 'lastName',
                    id: 'last-name',
                    element: null,
                    regex: /^[А-Я][а-я]+\s*$/,
                    valid: false,
                });
        }

        const that = this;

        this.fields.forEach(item => {
            item.element = document.getElementById(item.id);
            item.element.onchange = function () {
                that.validateField.call(that, item, this);
            }
        });

        this.processElement = document.getElementById('process');
        this.processElement.onclick = function () {
            that.processForm();
        }

        if (this.page === 'signup') {
            this.agreeElement = document.getElementById('agree');
            this.agreeElement.onchange = function () {
                that.validateForm();
            }
        }
    }

    validateField(filed, element) {
        if (!element.value || !element.value.match(filed.regex)) {
            element.parentNode.style.borderColor = 'red';
            filed.valid = false;
        } else {
            element.parentNode.removeAttribute('style');
            filed.valid = true;
        }
        this.validateForm();
    }

    validateForm() {
        const validForm = this.fields.every(item => item.valid);
        const isValid = this.agreeElement ? this.agreeElement.checked && validForm : validForm;
        if (isValid) {
            this.processElement.removeAttribute('disabled');
        } else {
            this.processElement.setAttribute('disabled', 'disabled');
        }
        return isValid;
    }

    async processForm() {
        if (this.validateForm()) {
            const email = this.fields.find(item => item.name === 'email').element.value;
            const password = this.fields.find(item => item.name === 'password').element.value;


            if (this.page === 'signup') {//запрос происходит в только при регистрации
                try {

                    const result = await CustomHttp.request(config.host + '/signup', "POST", {
                        name: this.fields.find(item => item.name === 'name').element.value,
                        lastName: this.fields.find(item => item.name === 'lastName').element.value,
                        email: email,
                        password: password,
                    })
                    if (result) {
                        if (result.error || !result.user) {
                            throw new Error(result.error);
                        }
                    }
                } catch (error) {
                    return console.log(error);
                }

            }
            try { //запрос происходит в любом случае

                const result = await CustomHttp.request(config.host + '/login', "POST", {
                    // name: this.fields.find(item => item.name === 'name').element.value,
                    // lastName: this.fields.find(item => item.name === 'lastName').element.value,
                    email: email,
                    password: password,
                })
                if (result) {
                    if (result.error || !result.accessToken || !result.refreshToken
                        || !result.fullName || !result.userId) {
                        throw new Error(result.message);
                    }

                    //сохраняем токены и инфо о пользователе
                    Auth.setTokens(result.accessToken, result.refreshToken);
                    Auth.setUserInfo({
                        fullName: result.fullName,
                        userId: result.userId
                    })
                    location.href = '#/choice';
                }
            } catch (error) {
                console.log(error);
            }

        }
    }
};

