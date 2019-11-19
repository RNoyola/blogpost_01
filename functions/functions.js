const ONE_DAY = 86400;
const TWO_MINUTES = 120;

exports.scheduleNotification = functions.pubsub.schedule('0 17 * * *')
.timeZone('America/New_York')
.onRun(async context => {
  try {
    var db = admin.firestore();
    const snapshot = await db.collection("users").get();
    const currentUnixTime = moment().unix();
    console.log("currentUnixTime", currentUnixTime);
    const payload = {
      notification: {
          title: 'Annoying Notification',
          body: 'You just send this automatically good for you!'
      }
    };

    snapshot.forEach(doc => {
      if(doc.data().uuid && ( doc.data().lastUpdate + ONE_DAY ) <= currentUnixTime) {
        console.log(`Sending to: ${doc.data().uuid}`, doc.id);
        admin.messaging().sendToDevice(doc.id, payload).then((response) => {
          // Response is a message ID string.
            console.log(`Successfully sent message to id ${doc.id}:`, response );
            console.log(`Error: ${doc.id}:`, response.results[0] );
            db.collection("users").doc(doc.id).update({
              lastUpdate: currentUnixTime
            });
            return response;
          }).catch((error) => {
            console.log('Error sending message:', error);
            return error;
          });
        }
    });
    return 'Success!';
  } catch (error) {
    console.log(error);
    return error;
  }
});

exports.sendNotification = functions.https.onCall(async (input, context) => {
  try {
    var db = admin.firestore();
    const snapshot = await db.collection("users").get();
    const currentUnixTime = moment().unix();
    console.log("currentUnixTime", currentUnixTime);
    const payload = {
      notification: {
          title: 'Annoying Notification',
          body: 'You just send this automatically good for you!'
      }
    };

    snapshot.forEach(doc => {
      if(doc.data().uuid && ( doc.data().lastUpdate + TWO_MINUTES ) <= currentUnixTime) {
        console.log(`Sending to: ${doc.data().uuid}`, doc.id);
        admin.messaging().sendToDevice(doc.id, payload).then((response) => {
          // Response is a message ID string.
            console.log(`Successfully sent message to id ${doc.id}:`, response );
            console.log(`Error: ${doc.id}:`, response.results[0] );
            db.collection("users").doc(doc.id).update({
              lastUpdate: currentUnixTime
            });
            return response;
          }).catch((error) => {
            console.log('Error sending message:', error);
            return error;
          });
        }
    });
    return 'Success!';
  } catch (error) {
    console.log(error);
    return error;
  }
});
