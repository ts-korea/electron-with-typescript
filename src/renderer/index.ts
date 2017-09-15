import {ipcRenderer} from 'electron';
import {LoginObjectType, MessageObjectType} from '../common/type';

function main() {
    const btnLogin = document.querySelector('#btn-login') as HTMLButtonElement;
    const btnLogout = document.querySelector('#btn-logout') as HTMLButtonElement;

    btnLogin.addEventListener('click', () => {
        console.log('#btn-login click');

        const input_email = document.querySelector('#email') as HTMLInputElement;
        const input_password = document.querySelector('#password') as HTMLInputElement;

        const loginObj: LoginObjectType = {
            email: input_email.value,
            password: input_password.value
        };

        ipcRenderer.send('request-login', loginObj);
    });

    btnLogout.addEventListener('click', () => {
        console.log('#btn-logout click');

        const input_email = document.querySelector('#email') as HTMLInputElement;
        const input_password = document.querySelector('#password') as HTMLInputElement;

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
    });

    ipcRenderer.on('login-error', (event, arg: string) => {
        console.log('receive : login-error');

        // arg 를 메세지로 dialog 띄우기
        console.error(arg);
    });

    ipcRenderer.on('logout-success', (event, arg) => {
        console.log('receive : logout-success');

        loginSection.style.display = 'block';
        chatSection.style.display = 'none';
        writeSection.style.display = 'none';
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

    btnSendMessage.addEventListener('click', () => {
        console.log('#btn-send-message click');

        ipcRenderer.send('send-message');
    });
}

document.addEventListener('DOMContentLoaded', main);