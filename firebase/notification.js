import AsyncStorage from '@react-native-community/async-storage';
import messaging from '@react-native-firebase/messaging';
import firestore from '@react-native-firebase/firestore';
import moment from 'moment';

const getToken = async () => {
  let fcmToken = await AsyncStorage.getItem('firebaseToken');
  console.log('IS TOKEN STORED: ', fcmToken)
  if (!fcmToken) {
    fcmToken = await messaging().getToken();
    console.log('NEW TOKEN: ', fcmToken)
    if (fcmToken) {
      await AsyncStorage.setItem('firebaseToken', fcmToken);
    }
  }
};

const requestPermission = async () => messaging()
  .requestPermission()
  .then(() => {
    getToken();
  })
  .catch((error) => {
    console.warn(`${error} permission rejected`);
  });

export const checkPermission = async () => {
  const enabled = await messaging().hasPermission();
  if (enabled) {
    getToken();
  } else {
    requestPermission();
  }
};

export const firestoreNotificationData = async (userId) => {
  // Firestore Logic
  const enabled = await messaging().hasPermission();
  if (enabled) {
    const fcmToken = await messaging().getToken();
    let token = await AsyncStorage.getItem('firebaseToken');
    if (fcmToken !== token) {
      await AsyncStorage.setItem('firebaseToken', fcmToken);
      token = fcmToken;
    }
    if (token) {
      const ref = await firestore().collection('users').doc(token);
      firestore()
        .runTransaction(async (transaction) => {
          const doc = await transaction.get(ref);
          // if it does not exist set the population to one
          if (!doc.exists) {
            transaction.set(ref, {
              uuid: userId,
              lastUpdate: moment().unix()
            });
            return userId;
          }
          // I know this is repetitive however if I do this only when the tokenId is
          // not equal then you will need to abort the transaction, for this you reject the promise
          // and this will cause an error creating an unexpected behaviour.
          transaction.update(ref, {
            uuid: userId,
            lastUpdate: moment().unix()
          });
          return userId;
        })
        .catch((error) => {
          console.log('Transaction failed: ', error);
        });
      return 'ok';
    }
  }
  return 'ok';
};
