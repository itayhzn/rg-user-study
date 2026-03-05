/**
 * Google Apps Script for receiving pairwise study responses and writing to a Google Sheet.
 *
 * Setup:
 * 1. Create a new Google Sheet
 * 2. Open Extensions > Apps Script
 * 3. Paste this code
 * 4. Deploy > New deployment > Web app
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 5. Copy the web app URL into config.json's googleAppsScriptUrl field
 *
 * Row format: one row per metric per question answered.
 * 20 questions x 2 metrics = 40 rows per completed session.
 */

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

    var HEADERS = [
      'timestep', 'session_id', 'user', 'start_time', 'end_time',
      'prompt', 'metric', 'model_left', 'model_right', 'model_winner'
    ];

    var rows = (data.rows || []).map(function(r) {
      return HEADERS.map(function(h) { return r[h] || ''; });
    });

    var lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      if (sheet.getLastRow() === 0) {
        sheet.appendRow(HEADERS);
      }
      if (rows.length > 0) {
        sheet.getRange(sheet.getLastRow() + 1, 1, rows.length, HEADERS.length)
             .setValues(rows);
      }
    } finally {
      lock.releaseLock();
    }

    return ContentService
      .createTextOutput(JSON.stringify({ status: 'success', rows_written: rows.length }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'ok', message: 'Pairwise study endpoint is active.' }))
    .setMimeType(ContentService.MimeType.JSON);
}
