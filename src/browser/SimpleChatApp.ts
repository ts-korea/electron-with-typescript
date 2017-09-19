import {app, BrowserWindow, ipcMain} from 'electron';
import * as firebase from 'firebase';
import * as url from 'url';
import * as path from 'path';
import {LoginObjectType, MessageObjectType} from '../common/type';

const TAG = '[main] SimpleChatApp';
const HTML = url.format({
    protocol: 'file',
    pathname: path.join(__dirname, '../../static/index.html')
});

export class SimpleChatApp {
    private _app;
    private _auth;
    private _database;

    constructor() {
        firebase.initializeApp({
            apiKey: 'AIzaSyDCkophSrnmYtoANl583iyMbS_TM4oHBOM',
            databaseURL: 'https://electron-with-typescript.firebaseio.com',
            projectId: 'electron-with-typescript',
        });

        this._auth = firebase.auth();
        this._database = firebase.database();

        this._app = app;

        this._app.on('ready', this._ready);
    }

    private _ready = () => {
        console.log(TAG, 'app ready');
        const win = new BrowserWindow({
            width: 500,
            minWidth: 500,
            maxWidth: 500,
            height: 700,
            minHeight: 700,
            maxHeight: 700,
            maximizable: false
        });
        win.loadURL(HTML);

        ipcMain.on('request-login', async (event, arg: LoginObjectType) => {
            let user = null;
            try {
                user = await this._auth.signInWithEmailAndPassword(arg.email, arg.password);
            } catch (error) {
                if (isFirebaseError(error)) {
                    console.log(error);
                    event.sender.send('login-error', error.code);
                    return;
                } else {
                    throw error;
                }
            }
            if (user) {
                event.sender.send('login-success');
                const ref = this._database.ref();
                ref.child('general').on('value', snapshot => {
                    if (snapshot) {
                        const data = snapshot.val();
                        const messageObjects: MessageObjectType[] = Object.keys(data).map(id => {
                            const messageObject: MessageObjectType = {
                                id,
                                email: data[id].email,
                                name: data[id].name,
                                message: data[id].message,
                                time: data[id].time
                            };
                            return messageObject;
                        });
                        event.sender.send('general-message', messageObjects);
                    }
                });
            }
        });

        ipcMain.on('request-logout', async event => {
            if (this._auth.currentUser) {
                try {
                    await this._auth.signOut();
                } catch (error) {
                    console.log(error);
                    return;
                }
                event.sender.send('logout-success');
            }
        });

        ipcMain.on('send-message', async (event, message: string) => {
            if (this._auth.currentUser) {
                const ref = this._database.ref();
                ref.child('general').push().set({
                    email: this._auth.currentUser.email,
                    name: 'Mark Lee',
                    message: message,
                    time: new Date().toISOString()
                });
            }
        });
    }
}

function isFirebaseError(arg: any): arg is firebase.auth.Error {
    return arg.code !== undefined && arg.message !== undefined;
}