import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyAKkeWOnIF3FKDsvQV4OSC-wlKUSKa6dC4",
    authDomain: "fb-ads-analyzer.firebaseapp.com",
    projectId: "fb-ads-analyzer",
    storageBucket: "fb-ads-analyzer.firebasestorage.app",
    messagingSenderId: "987730250160",
    appId: "1:987730250160:web:47d3b99a8b97612c18ae75",
    measurementId: "G-ZWJKVW0W5X"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
