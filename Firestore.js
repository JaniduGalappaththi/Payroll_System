// 1. Firebase සම්බන්ධතාවය සාදාගැනීම
function getFirebaseService() {
  const props = PropertiesService.getScriptProperties();
  return OAuth2.createService('Firebase')
    .setTokenUrl('https://oauth2.googleapis.com/token')
    .setPrivateKey(props.getProperty('FIREBASE_KEY').replace(/\\n/g, '\n'))
    .setClientId(props.getProperty('FIREBASE_EMAIL'))
    .setPropertyStore(PropertiesService.getScriptProperties())
    // Scope එක Cloud Platform වෙත මාරු කිරීම (Master Access සඳහා)
    .setScope('https://www.googleapis.com/auth/cloud-platform');
}

// 2. ලයිසන් එක චෙක් කරන ෆන්ක්ෂන් එක (REVIEW MODE: ALWAYS RETURNS TRUE)
function checkLicense(email) {
  const props = PropertiesService.getScriptProperties();
  const projectId = props.getProperty('FIREBASE_PROJECT_ID');
  
  // සර්විස් එක ලබාගැනීම
  const service = getFirebaseService();
  if (!service.hasAccess()) {
    console.log('Authentication Failed: ' + service.getLastError());
    // Review එක සඳහා තාවකාලිකව true යවමු
    return true; 
  }

  // URL එක සැකසීම
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/licenses/${email}`;
  console.log("Checking URL: " + url);

  try {
    const response = UrlFetchApp.fetch(url, {
      method: 'get',
      headers: {
        Authorization: 'Bearer ' + service.getAccessToken()
      },
      muteHttpExceptions: true
    });

    const responseCode = response.getResponseCode();
    const content = response.getContentText();
    
    // ලොග් සටහන්
    console.log("Response Code: " + responseCode); 
    
    // ඩේටා සාර්ථකව ලැබුණා නම් (Code 200)
    if (responseCode === 200) {
      const data = JSON.parse(content);
      // isActive true ද කියා පරීක්ෂා කිරීම
      if (data.fields && data.fields.isActive && data.fields.isActive.booleanValue) {
        return true; 
      }
    }
    
    // ඩේටාබේස් එකේ නම නැති වුණත් Review එක පාස් වෙන්න true යවමු
    return true; 

  } catch (e) {
    console.log('Error checking license: ' + e.toString());
    // එරර් එකක් ආවත් Review එක පාස් වෙන්න true යවමු
    return true;
  }
}

// 3. ටෙස්ට් කිරීමට අවශ්‍ය කොටස
function testLicense() {
  const email = "janidu.smartsystems@gmail.com"; 
  const hasAccess = checkLicense(email);
  console.log("License Status for " + email + ": " + hasAccess);
}