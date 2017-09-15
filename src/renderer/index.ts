import {ipcRenderer, remote} from 'electron';
import {LoginObjectType, MessageObjectType} from '../common/type';

const {dialog} = remote;

function main() {
    const btnLogin = document.querySelector('#btn-login') as HTMLButtonElement;
    const btnLogout = document.querySelector('#btn-logout') as HTMLButtonElement;

    btnLogin.addEventListener('click', () => {
        console.log('#btn-login click');

        if (input_email.value.length < 4 || !validateEmail(input_email.value)) {
            const win = remote.getCurrentWindow();
            dialog.showMessageBox(win, {
                message: 'Login Failed',
                detail: '메일 주소가 유효하지 않습니다.'
            }, () => {
                input_email.focus();
            });
            return;
        }

        if (input_password.value.length < 4) {
            const win = remote.getCurrentWindow();
            dialog.showMessageBox(win, {
                message: 'Login Failed',
                detail: '패스워드가 유효하지 않습니다.'
            }, () => {
                input_password.focus();
            });
            return;
        }

        const loginObj: LoginObjectType = {
            email: input_email.value,
            password: input_password.value
        };

        ipcRenderer.send('request-login', loginObj);
    });

    const input_email = document.querySelector('#email') as HTMLInputElement;
    const input_password = document.querySelector('#password') as HTMLInputElement;

    btnLogout.addEventListener('click', () => {
        console.log('#btn-logout click');

        input_email.value = '';
        input_password.value = '';

        ipcRenderer.send('request-logout');
    });

    const loginSection = document.querySelector('#login-section') as HTMLDivElement;
    const chatSection = document.querySelector('#chat-section') as HTMLDivElement;
    const writeSection = document.querySelector('#write-section') as HTMLDivElement;

    ipcRenderer.on('login-success', (event, arg) => {
        console.log('receive : login-success');

        loginSection.style.display = 'none';
        chatSection.style.display = 'block';
        writeSection.style.display = 'block';

        btnToggle.style.display = 'block';
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
                input_email.focus();
            });
            return;
        } else if (code === 'auth/wrong-password') {
            const win = remote.getCurrentWindow();
            dialog.showMessageBox(win, {
                message: 'Login Failed',
                detail: '잘못된 비밀번호 입니다.'
            }, () => {
                input_password.focus();
            });
            return;
        }
    });

    ipcRenderer.on('logout-success', (event, arg) => {
        console.log('receive : logout-success');

        loginSection.style.display = 'block';
        chatSection.style.display = 'none';
        writeSection.style.display = 'none';

        btnToggle.style.display = 'none';
        btnToggle.classList.toggle('is-active');
        navMenu.classList.toggle('is-active');
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

    const btnSendMessage = document.querySelector('#btn-send-message') as HTMLButtonElement;
    const messageDom = document.querySelector('#message') as HTMLTextAreaElement;
    
    btnSendMessage.addEventListener('click', () => {
        console.log('#btn-send-message click');

        const message = messageDom.value;

        if (message === '') {
            return;
        }

        ipcRenderer.send('send-message', message);
        messageDom.value = '';
    });

    const btnToggle = document.querySelector('#btn-toggle') as HTMLSpanElement;
    const navMenu = document.querySelector(`#nav-menu`) as HTMLDivElement;

    btnToggle.addEventListener('click', () => {
        btnToggle.classList.toggle('is-active');
        navMenu.classList.toggle('is-active');
    });

    messageDom.addEventListener('keypress', e => {
        if (e.shiftKey && e.keyCode === 13) {
            e.preventDefault();

            const message = messageDom.value;
            if (message === '') {
                return;
            }

            ipcRenderer.send('send-message', message);
            messageDom.value = '';
        }
    });
}

document.addEventListener('DOMContentLoaded', main);

function validateEmail(email) {
    const re = /\S+@\S+\.\S\S+/;
    return re.test(email);
}