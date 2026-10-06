/*
  إعدادات حساب Google والمزامنة. املأ القيم الأربع من Firebase ثم ارفع هذا الملف.
  اتركها فارغة وسيعمل التطبيق بدون تسجيل دخول.
  لا ترفع هذا الملف مرة ثانية بعد ملئه حتى لا تمسح قيمك. عند التحديثات ارفع الملفات الأخرى فقط.

  قواعد Firestore (الصقها في Firestore Database > Rules ثم Publish):

  rules_version = '2';
  service cloud.firestore {
    match /databases/{database}/documents {
      match /users/{uid}/words/{wid} {
        allow read, write: if request.auth != null && request.auth.uid == uid;
      }
    }
  }
*/
window.WORDS_FIREBASE = {
  apiKey: "",
  authDomain: "",
  projectId: "",
  appId: ""
};
