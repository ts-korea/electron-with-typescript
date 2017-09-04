import {app} from 'electron';
import * as firebase from 'firebase';

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

    auth.signInWithEmailAndPassword('2woongjae@gmail.com', '2woongjae');
});