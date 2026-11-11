/**
 * Noa waitlist: Google Apps Script bound to the team Google Sheet.
 *
 * Setup (once):
 * 1. Create a Google Sheet called "Noa waitlist". Rename the first tab to "Signups".
 * 2. Extensions > Apps Script. Delete the sample code and paste this whole file.
 * 3. Project Settings (gear icon) > Script properties > Add property:
 *      SHEET_SECRET = the same long random string you put in Vercel.
 * 4. Deploy > New deployment > type "Web app".
 *      Execute as: Me.  Who has access: Anyone.  Deploy, then authorise.
 * 5. Copy the Web app URL (ends in /exec) into Vercel as SHEET_WEBHOOK_URL.
 *
 * If you edit this code later: Deploy > Manage deployments > edit > Version: New version.
 * The URL stays the same.
 */

var TAB = "Signups";
var HEADERS = [
  "timestamp", "email", "role", "consent", "consent_version",
  "utm_source", "utm_medium", "utm_campaign", "ref", "page"
];

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    var data = JSON.parse(e.postData.contents);
    var secret = PropertiesService.getScriptProperties().getProperty("SHEET_SECRET");
    if (!secret || data.secret !== secret) return reply({ ok: false, error: "unauthorised" });

    var email = String(data.email || "").trim().toLowerCase();
    if (!email || email.indexOf("@") < 1) return reply({ ok: false, error: "invalid email" });

    lock.waitLock(10000);
    var sheet = getSheet();

    // Skip duplicates: same email already on the list
    var last = sheet.getLastRow();
    if (last > 1) {
      var emails = sheet.getRange(2, 2, last - 1, 1).getValues();
      for (var i = 0; i < emails.length; i++) {
        if (String(emails[i][0]).toLowerCase() === email) return reply({ ok: true, duplicate: true });
      }
    }

    sheet.appendRow([
      new Date(),
      safe(email),
      safe(data.role),
      safe(data.consent),
      safe(data.consent_version),
      safe(data.utm_source),
      safe(data.utm_medium),
      safe(data.utm_campaign),
      safe(data.ref),
      safe(data.page)
    ]);
    return reply({ ok: true, duplicate: false });
  } catch (err) {
    return reply({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

// Visiting the URL in a browser shows this, which confirms the deployment works
function doGet() {
  return reply({ ok: true, message: "Noa waitlist endpoint is live" });
}

function getSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(TAB) || ss.insertSheet(TAB);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

// Stop text being run as a spreadsheet formula
function safe(value) {
  var s = String(value == null ? "" : value).slice(0, 254);
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}

function reply(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/** Run this once from the editor (select testSignup, click Run) to check the sheet fills in. */
function testSignup() {
  var secret = PropertiesService.getScriptProperties().getProperty("SHEET_SECRET");
  var res = doPost({ postData: { contents: JSON.stringify({
    secret: secret, email: "test@example.com", role: "athlete",
    consent: "yes", consent_version: "test", utm_source: "manual-test"
  }) } });
  Logger.log(res.getContent());
}
