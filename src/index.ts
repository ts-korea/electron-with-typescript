import {app} from 'electron';
import * as firebase from 'firebase';

const firebaseApp = firebase.initializeApp({
    apiKey: 'AIzaSyDCkophSrnmYtoANl583iyMbS_TM4oHBOM',
    authDomain: 'electron-with-typescript.firebaseapp.com',
    databaseURL: 'https://electron-with-typescript.firebaseio.com',
    projectId: 'electron-with-typescript',
    storageBucket: 'electron-with-typescript.appspot.com',
    messagingSenderId: '231390164302'
});

const auth = firebase.auth();
auth.onAuthStateChanged((user: { email: string; }) => {
    console.log(user);
});

app.on('ready', () => {
    console.log('app ready');

    auth.signInWithEmailAndPassword('2woongjae@gmail.com', '2woongjae');
});