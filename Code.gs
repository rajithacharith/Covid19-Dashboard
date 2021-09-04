var API_URL = 'https://api.covid19api.com/live/country/Sri-lanka';
var SHEET_NAME = 'DataSheet';
var HEADER_RANGE = "A1:F1";
var HEADERS = ["ID", "Confirmed", "Deaths", "Recovered", "Active", "Date"]
var DATA_START_COL_ID = 1;
var FILEDATA_RANGE = "A2:A";

/**
 * This is a helper function to filter out empty values in an array.
 */
function filterEmpty(value){
  return value[0] != "";
}

function pullData() {
  Logger.log("Sending GET request to : "+API_URL)
  var response = UrlFetchApp.fetch(API_URL);
  if(response.getResponseCode() == 200){
    if(response.length != 0){
      var jsonContent = JSON.parse(response.getContentText());
      
      // Iterate response and add all data IDs to a Array
      var idList = []

      jsonContent.forEach(function(record){
        idList.push(record.ID);
      });

      Logger.log(idList);

      // Reading Worksheet by Name in variable SHEET_NAME
      var sheetData = [];
      var spreadSheet = SpreadsheetApp.getActiveSpreadsheet();
      var dataSheet = spreadSheet.getSheetByName(SHEET_NAME);
      if(dataSheet == null){
        // Creating Worksheet If Not Exists
        dataSheet = spreadSheet.insertSheet(SHEET_NAME);
        dataSheet.getRange(HEADER_RANGE).setValues([HEADERS]);
      }else{
        // Reading existing data from the WorkSheet If Exists.
        var sheetData = dataSheet.getRange(FILEDATA_RANGE).getValues();
        sheetData = sheetData.filter(filterEmpty);
      }

      // Filter existing IDs in the sheet if existing.
      if(sheetData.length != 0){
        var ignoreIDList = [];
        sheetData.forEach(function(row){
          ignoreIDList.push(row[0]);
        });

        idList = idList.filter(function(id){
          return ignoreIDList.indexOf(id) < 0;
        });
      }

      var processedData = [];

      jsonContent.forEach(function(record){
        if(idList.indexOf(record.ID) >= 0){
          processedData.push([record.ID,record.Confirmed, record.Deaths, record.Recovered, record.Active, record.Date]);
        }
      });

      Logger.log(processedData);

      if(processedData.length != 0){
        dataSheet.getRange(
          sheetData.length+2,
          DATA_START_COL_ID,
          processedData.length,
          processedData[0].length
        ).setValues(processedData);
      }
    }
  }

}
