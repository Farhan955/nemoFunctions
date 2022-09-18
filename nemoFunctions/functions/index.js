const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp(functions.config().firebase);
const db = admin.database();
let count = -1;
exports.pushDta = functions.pubsub.schedule("every 1 minutes").onRun((context) => {
  const ref = db.ref("fcmToken");
  const refAff = db.ref("affirmation");
  const aff = [];
  let n = 0;
  console.log("0:recurring is called");
  console.log("1:count = " + count);
  refAff.orderByValue().on("value", (snapshot) => {
    console.log("2:affirmation is called");
    snapshot.forEach((data) => {
      aff.push(data.val().name);
      n++;
    });
    count++;
    if (count >= n) {
      count = 0;
    }
    const affirmation = aff[count];
    console.log("3:count = " + count);
    console.log("count= " + count + " aff size is = " + n + " aff of 0 = " + aff[0]);
    ref.orderByValue().on("value", (snapshot) => {
      snapshot.forEach((data) => {
        console.log("The key= " + data.key + " tkn is " + data.val().fcmToken);
        const payload = {
          notification: {
            title: "Affirmations",
            body: affirmation,
          },
        };
        admin.messaging().sendToDevice(data.val().fcmToken, payload);
      });
    });
  });
  return null;
});
