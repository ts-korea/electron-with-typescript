import {ipcRenderer, remote} from 'electron';
import {LoginObjectType, MessageObjectType} from '../common/type';

const {dialog} = remote;

export class SimpleChatView {
    private _btnLogin;
    private _btnLogout;
    private _input_email;
    private _input_password;
    private _loginSection;
    private _chatSection;
    private _writeSection;
    private _btnToggle;
    private _navMenu;
    private _btnSendMessage;
    private _messageDom;

    constructor() {
        this._btnLogin = document.querySelector('#btn-login') as HTMLButtonElement;
        this._btnLogout = document.querySelector('#btn-logout') as HTMLButtonElement;
        this._input_email = document.querySelector('#email') as HTMLInputElement;
        this._input_password = document.querySelector('#password') as HTMLInputElement;
        this._loginSection = document.querySelector('#login-section') as HTMLDivElement;
        this._chatSection = document.querySelector('#chat-section') as HTMLDivElement;
        this._writeSection = document.querySelector('#write-section') as HTMLDivElement;
        this._btnToggle = document.querySelector('#btn-toggle') as HTMLSpanElement;
        this._navMenu = document.querySelector(`#nav-menu`) as HTMLDivElement;
        this._btnSendMessage = document.querySelector('#btn-send-message') as HTMLButtonElement;
        this._messageDom = document.querySelector('#message') as HTMLTextAreaElement;

        this._bindEvent();
        this._bindIpc();
    }

    private _bindEvent() {
        this._btnLogin.addEventListener('click', () => {
            console.log('#btn-login click');

            const win = remote.getCurrentWindow();

            if (this._input_email.value.length < 4 || !validateEmail(this._input_email.value)) {
                dialog.showMessageBox(win, {
                    message: 'Login Failed',
                    detail: '메일 주소가 유효하지 않습니다.'
                }, () => {
                    this._input_email.focus();
                });
                return;
            }

            if (this._input_password.value.length < 4) {
                dialog.showMessageBox(win, {
                    message: 'Login Failed',
                    detail: '패스워드가 유효하지 않습니다.'
                }, () => {
                    this._input_password.focus();
                });
                return;
            }
            const loginObj: LoginObjectType = {
                email: this._input_email.value,
                password: this._input_password.value
            };
            ipcRenderer.send('request-login', loginObj);
        });
        this._btnLogout.addEventListener('click', () => {
            console.log('#btn-logout click');
            this._input_email.value = '';
            this._input_password.value = '';
            ipcRenderer.send('request-logout');
        });
        this._btnSendMessage.addEventListener('click', this._writeMessage);
        this._btnToggle.addEventListener('click', () => {
            this._btnToggle.classList.toggle('is-active');
            this._navMenu.classList.toggle('is-active');
        });
        this._messageDom.addEventListener('keypress', event => {
            if (event.keyCode === 13 && !event.shiftKey) {
                event.preventDefault();
                this._writeMessage();
            }
        });
    }

    private _bindIpc() {
        ipcRenderer.on('logout-success', (event, arg) => {
            console.log('receive : logout-success');
            this._loginSection.style.display = 'block';
            this._chatSection.style.display = 'none';
            this._writeSection.style.display = 'none';
            this._btnToggle.style.display = 'none';
            this._btnToggle.classList.toggle('is-active');
            this._navMenu.classList.toggle('is-active');
        });

        ipcRenderer.on('general-message', (event, arg: MessageObjectType[]) => {
            console.log('receive : general-message');
            const messagesHTML = arg.map(messageObject => {
                return `
        <div class="box">
        <article class="media">
            <div class="media-content">
                <div class="content">
                    <p>
                        <strong>${messageObject.name}</strong> <small>${messageObject.email}</small> <small>${messageObject.time}</small>
                        <br>
                        ${messageObject.message}
                    </p>
                </div>
            </div>
        </article>
        </div>
                `;
            }).join('');
            const messageContainer = document.querySelector('#message-container') as HTMLDivElement;
            messageContainer.innerHTML = messagesHTML;
        });

        ipcRenderer.on('login-success', (event, arg) => {
            console.log('receive : login-success');

            this._loginSection.style.display = 'none';
            this._chatSection.style.display = 'block';
            this._writeSection.style.display = 'block';

            this._btnToggle.style.display = 'block';
        });

        ipcRenderer.on('login-error', (event, code: string) => {
            console.log('receive : login-error');
            console.error(code);
            if (code === 'auth/user-not-found') {
                const win = remote.getCurrentWindow();
                dialog.showMessageBox(win, {
                    message: 'Login Failed',
                    detail: '등록되지 않은 이메일 주소입니다.'
                }, () => {
                    this._input_email.focus();
                });
                return;
            } else if (code === 'auth/wrong-password') {
                const win = remote.getCurrentWindow();
                dialog.showMessageBox(win, {
                    message: 'Login Failed',
                    detail: '잘못된 비밀번호 입니다.'
                }, () => {
                    this._input_password.focus();
                });
                return;
            }
        });
    }
    private _writeMessage = () => {
        console.log('#btn-send-message click');
        const message = this._messageDom.value;
        if (message === '') {
            return;
        }
        ipcRenderer.send('send-message', message);
        this._messageDom.value = '';
    }
}

function validateEmail(email) {
    const re = /\S+@\S+\.\S\S+/;
    return re.test(email);
}