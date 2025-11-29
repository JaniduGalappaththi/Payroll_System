// Firebase එකට සම්බන්ධ වීමට අවශ්‍ය Token එක සාදාගැනීම
function getFirebaseService() {
  const props = PropertiesService.getScriptProperties();
  return OAuth2.createService('Firebase')
    .setTokenUrl('https://oauth2.googleapis.com/token')
    .setPrivateKey(props.getProperty('FIREBASE_KEY').replace(/\\n/g, '\n'))
    .setClientId(props.getProperty('FIREBASE_EMAIL'))
    .setPropertyStore(PropertiesService.getScriptProperties())
    .setScope('https://www.googleapis.com/auth/datastore');
}

[cite_start]// යූසර්ට ලයිසන් තියෙනවද කියලා බලන ෆන්ක්ෂන් එක [cite: 116-121]
function checkLicense(email) {
  const props = PropertiesService.getScriptProperties();
  const projectId = props.getProperty('FIREBASE_PROJECT_ID');
  
  // සර්විස් එකෙන් ටෝකන් එක ගන්න
  const service = getFirebaseService();
  if (!service.hasAccess()) {
    console.log('Authentication Failed: ' + service.getLastError());
    return false;
  }

  // Firestore එකෙන් ඩේටා ඉල්ලන URL එක
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/licenses/${email}`;

  try {
    const response = UrlFetchApp.fetch(url, {
      method: 'get',
      headers: {
        Authorization: 'Bearer ' + service.getAccessToken()
      },
      muteHttpExceptions: true
    });

    const responseCode = response.getResponseCode();
    
    // ඩේටා හම්බුණා නම් (200 OK)
    if (responseCode === 200) {
      const data = JSON.parse(response.getContentText());
      // isActive කියන ස්විචය true ද කියලා බලන්න
      if (data.fields && data.fields.isActive && data.fields.isActive.booleanValue) {
        return true; // ලයිසන් ඇත
      }
    }
    
    return false; // ලයිසන් නැත හෝ ඩේටා නැත

  } catch (e) {
    console.log('Error checking license: ' + e.toString());
    return false;
  }
}

// ටෙස්ට් කරලා බලන්න
function testLicense() {
  const email = "janidugalappaththi@gmail.com"; // මෙතන ඔබේ ඊමේල් එක
  const hasAccess = checkLicense(email);
  console.log("License Status for " + email + ": " + hasAccess);
}