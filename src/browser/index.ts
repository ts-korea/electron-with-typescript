import {app, BrowserWindow} from 'electron';
import * as firebase from 'firebase';
import * as url from 'url';
import * as path from 'path';

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

auth.onAuthStateChanged((user: { email: string; }) => {
    console.log(user);
});

app.on('ready', () => {
    console.log('app ready');

    const win = new BrowserWindow();
    win.loadURL(html);

    auth.signInWithEmailAndPassword('2woongjae@gmail.com', '2woongjae');
});