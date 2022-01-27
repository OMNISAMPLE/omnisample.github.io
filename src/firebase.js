import { initializeApp } from 'firebase/app';
import { getDatabase, push, ref, onValue, set } from "firebase/database";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

import config from "./config";

const firebaseConfig = {
    apiKey: ["AIzaSyDtZ", "_", "GNhsHpgaTFIEAZE9lJV3qsehGbs30"].join(""),
    authDomain: "omnisample-9fef3.firebaseapp.com",
    databaseURL: "https://omnisample-9fef3-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "omnisample-9fef3",
    storageBucket: "omnisample-9fef3.appspot.com",
    messagingSenderId: "717942262098",
    appId: ["1", ":", "717942262098:web:726466cafdae3afde9528b"].join("")
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
let user;
export const login = async () => {
    const auth = getAuth();

    const response = await signInWithEmailAndPassword(auth, config.FIREBASE_USER, config.FIREBASE_PASS)
    user = response.user;
}

export const createNewRecord = async (payload) => {
    const db = getDatabase(app);
    const collection = ref(db, 'records')

    await set(push(collection), payload);

    return true;
}

export const exportRecords = async () => {
    const db = getDatabase(app);
    const collection = ref(db, 'records')

    return new Promise(resolve => {
        onValue(collection, (snapshot) => {
            const values = [];
            snapshot.forEach((childSnapshot) => {
                const childData = childSnapshot.val();

                values.push(childData)
            });

            resolve(values)
        }, {
            onlyOnce: true
        });
    })
}