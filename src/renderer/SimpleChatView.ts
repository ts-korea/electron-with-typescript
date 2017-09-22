import {ipcRenderer, remote} from 'electron';
import {LoginObjectType, MessageObjectType} from '../common/type';

const {dialog} = remote;

const TAG = '[SimpleChatView]';

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

        this._bindDomEvent();
        this._bindIpc();
    }

    private _bindDomEvent(): void {
        this._btnLogin.addEventListener('click', this._btnLoginClicked);
        this._btnLogout.addEventListener('click', this._btnLogoutClicked);
        this._btnSendMessage.addEventListener('click', this._btnSendMessageClicked);
        this._btnToggle.addEventListener('click', this._btnToggleClicked);
        this._messageDom.addEventListener('keypress', this._messageDomKeypressed);
        this._input_email.addEventListener('keypress', this._inputEmailKeypressed);
        this._input_password.addEventListener('keypress', this._inputPasswordKeypressed);
    }
    private _bindIpc(): void {
        ipcRenderer.on('login-success', this._ipcLoginSuccess);
        ipcRenderer.on('login-error', this._ipcLoginError);
        ipcRenderer.on('logout-success', this._ipcLogoutSuccess);
        ipcRenderer.on('general-message', this._ipcGeneralMessage);
    }

    /*
    * DOM 에 바인딩 된 이벤트의 함수
    */
    private _btnLoginClicked = (): void => {
        console.log(TAG, '_btnLoginClicked');
        this._requestLogin();
    }
    private _btnLogoutClicked = (): void => {
        console.log(TAG, '_btnLogoutClicked');
        this._input_email.value = '';
        this._input_password.value = '';
        ipcRenderer.send('request-logout');
    }
    private _btnSendMessageClicked = (): void => {
        console.log(TAG, '_btnSendMessageClicked');
        this._writeMessage();
    }
    private _btnToggleClicked = (): void => {
        console.log(TAG, '_btnToggleClicked');
        this._btnToggle.classList.toggle('is-active');
        this._navMenu.classList.toggle('is-active');
    }
    private _messageDomKeypressed = (event): void => {
        console.log(TAG, '_messageDomKeypressed');
        if (event.keyCode === 13 && !event.shiftKey) {
            event.preventDefault();
            this._writeMessage();
        }
    }
    private _inputEmailKeypressed = (event): void => {
        console.log(TAG, '_inputEmailKeypressed');
        if (event.keyCode === 13) {
            this._input_password.focus();
        }
    }
    private _inputPasswordKeypressed = (event): void => {
        console.log(TAG, '_inputPasswordKeypressed');
        if (event.keyCode === 13) {
            this._requestLogin();
        }
    }

    /*
    * ipcRenderer 에 바인딩된 이벤트의 함수
    */
    private _ipcLoginSuccess = (): void => {
        console.log(TAG, '_ipcLoginSuccess');
        this._loginSection.style.display = 'none';
        this._chatSection.style.display = 'block';
        this._writeSection.style.display = 'block';
        this._btnToggle.style.display = 'block';
    }
    private _ipcLoginError = (event, arg: string): void => {
        console.log(TAG, '_ipcLoginError');
        if (arg === 'auth/user-not-found') {
            const win = remote.getCurrentWindow();
            dialog.showMessageBox(win, {
                message: 'Login Failed',
                detail: '등록되지 않은 이메일 주소입니다.'
            }, () => {
                this._input_email.focus();
            });
            return;
        } else if (arg === 'auth/wrong-password') {
            const win = remote.getCurrentWindow();
            dialog.showMessageBox(win, {
                message: 'Login Failed',
                detail: '잘못된 비밀번호 입니다.'
            }, () => {
                this._input_password.focus();
            });
            return;
        }
    }
    private _ipcLogoutSuccess = (event, arg): void => {
        console.log(TAG, '_ipcLogoutSuccess');
        this._loginSection.style.display = 'block';
        this._chatSection.style.display = 'none';
        this._writeSection.style.display = 'none';
        this._btnToggle.style.display = 'none';
        this._btnToggle.classList.toggle('is-active');
        this._navMenu.classList.toggle('is-active');
    }
    private _ipcGeneralMessage = (event, arg: MessageObjectType[]): void => {
        console.log(TAG, '_ipcGeneralMessage');
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
    }
    private _writeMessage = (): void => {
        const message = this._messageDom.value;
        if (message === '') {
            return;
        }
        ipcRenderer.send('send-message', message);
        this._messageDom.value = '';
    }
    private _requestLogin = (): void => {
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
    }
}

function validateEmail(email: string): boolean {
    const re = /\S+@\S+\.\S\S+/;
    return re.test(email);
}