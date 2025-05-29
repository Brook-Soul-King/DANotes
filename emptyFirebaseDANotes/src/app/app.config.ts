import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes), 
    importProvidersFrom(provideFirebaseApp(() => initializeApp({"projectId":"danotes-60565","appId":"1:628730629038:web:a938ab98802f6b55f7163f","storageBucket":"danotes-60565.firebasestorage.app","apiKey":"AIzaSyD2P2_xWgyttNbo-3I9apo60DCikkiWDzs","authDomain":"danotes-60565.firebaseapp.com","messagingSenderId":"628730629038"}))), 
    importProvidersFrom(provideFirestore(() => getFirestore()))]
};