import {app, BrowserWindow, ipcMain} from 'electron';
import * as firebase from 'firebase';
import * as url from 'url';
import * as path from 'path';
import {LoginObj} from '../common/type';

// 둘 중 하나가 참이면 => protocol 뒤에 // 가 붙는다.
// protocol begins with http, https, ftp, gopher, or file
// slashes is true
const html = url.format({
    protocol: 'file',
    pathname: path.join(__dirname, '../../static/index.html')
});

firebase.initializeApp({
    apiKey: 'AIzaSyDCkophSrnmYtoANl583iyMbS_TM4oHBOM',
    databaseURL: 'https://electron-with-typescript.firebaseio.com',
    projectId: 'electron-with-typescript',
});

const auth = firebase.auth();
const database = firebase.database();

app.on('ready', () => {
    console.log('app ready');

    const win = new BrowserWindow({
        width: 500,
        minWidth: 500,
        maxWidth: 900,
        height: 700,
        minHeight: 700,
        maxHeight: 700,
        maximizable: false
    });
    win.loadURL(html);

    ipcMain.on('request-login', async (event, arg: LoginObj) => {
        let user = null;
        try {
            user = await auth.signInWithEmailAndPassword(arg.email, arg.password);
        } catch (error) {
            if (isFirebaseError(error)) {
                console.log(error);
                event.sender.send('login-error', error.message);
                return;
            } else {
                throw error;
            }
        }
        if (user) {
            event.sender.send('login-success');
        }
    });

    ipcMain.on('request-logout', async event => {
        if (auth.currentUser) {
            try {
                await auth.signOut();
            } catch (error) {
                console.log(error);
                return;
            }
            event.sender.send('logout-success');
        }
    });
});

function isFirebaseError(arg: any): arg is firebase.auth.Error {
    return arg.code !== undefined && arg.message !== undefined;
}