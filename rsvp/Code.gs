// Google Apps Script for Wedding RSVP

const SHEET_NAME = 'Responses';

function doPost(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME) || 
                  SpreadsheetApp.getActiveSpreadsheet().insertSheet(SHEET_NAME);
    
    // Parse the incoming JSON payload string
    const data = JSON.parse(e.postData.contents);
    
    // Check if headers exist, if not create them
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(['Timestamp', 'Name', 'Private Code', 'Invite Tier', 'Haldi & Mehndi', 'Wedding Ceremony', 'Reception']);
      sheet.getRange("A1:G1").setFontWeight("bold");
    }
    
    // Create the row to insert based on the available events
    const row = [
      data.timestamp || new Date(),
      data.name || '',
      data.code || '',
      data.tier || '',
      data.haldi || 'N/A',
      data.wedding || 'N/A',
      data.reception || 'N/A'
    ];
    
    sheet.appendRow(row);
    
    // Return success
    return ContentService.createTextOutput(JSON.stringify({ 'result': 'success' }))
                         .setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ 'result': 'error', 'error': error.toString() }))
                         .setMimeType(ContentService.MimeType.JSON);
  }
}
