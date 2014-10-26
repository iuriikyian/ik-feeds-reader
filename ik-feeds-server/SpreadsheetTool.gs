/*jslint nomen: true*/  //<- allow _ in the begining and at the end
/*jslint white: true*/ //<- now additional whitespaces in function(){}
/*global DocsList,SpreadsheetApp,Logger*/

/** Utilities for handling google spreadsheets
*
*   spreadsheet - spreadsheet object to work with
*/
var SpreadsheetTool = function(spreadsheet){
    'use strict';
    
    function getSheet(sheetName){
        return spreadsheet.getSheetByName(sheetName);
    }
  
    function isSheetExist(sheetName){
        return getSheet(sheetName) !== null;
    }
  
    /** Creates sheet with the given name
    *    If columnNames provided - inserts them as the first row of the table
    */
    function createSheet(sheetName, columnNames){
        if( isSheetExist(sheetName) ){
            throw new Error('The sheet with name "' + sheetName + '" already exists');
        }
        var sheet = spreadsheet.insertSheet(sheetName);
        if(columnNames){
            sheet.appendRow(columnNames);
        }
        return sheet;
    }
  
    /** Create sheet from template sheet
    */
    function createSheetFromTemplate(sheetName, templateSheet){
        if( isSheetExist(sheetName) ){
            throw new Error('The sheet with name "' + sheetName + '" already exists');
        }
        if( ! templateSheet ){
            throw new Error('Template sheet parameter is not provided');
        }
        return spreadsheet.insertSheet(sheetName, {template: templateSheet});
    }
  
    function deleteSheet(sheetName){
        var sheet = getSheet(sheetName);
        if( sheet === null ){
            throw new Error('Can not delete not existent sheet with name "' + sheetName + '"');
        }
        spreadsheet.deleteSheet(sheet);
    }
  
    return {
        spreadsheet : spreadsheet,
        getSheet : getSheet,
        isSheetExist : isSheetExist,
        createSheet : createSheet,
        createSheetFromTemplate : createSheetFromTemplate,
        deleteSheet : deleteSheet
    };
};

/** fetches spreadsheet by file name from the pointed Google Drive folder
*/
SpreadsheetTool.openSpreadsheet = function(folderName, spreadsheetName){
    'use strict';
    var dir = DocsList.getFolder(folderName), file, files, idx, f;
    if(dir){
        files = dir.getFilesByType(DocsList.FileType.SPREADSHEET);
        for(idx in files){
            if(files.hasOwnProperty(idx)){
                f = files[idx];
                if(f.getName() === spreadsheetName){
                    file = f;
                    break;
                }
            }
        }
        if(file){
            return SpreadsheetApp.open(file);
        }
    }
    return null;
};

function testSpreadsheetTool() {
    'use strict';
    var TEST_TABLE = 'test-table',
        JOURNALS_FOLDER = 'my-journals',
        JOURNALS = ['ik-feeds-journal'],
        spreadsheet = SpreadsheetTool.openSpreadsheet(JOURNALS_FOLDER, JOURNALS[0]),
        tool, sh, sh2,
        log = new Logger(spreadsheet, 'log');

    log.info('SpreadsheetTool test preparation');
    tool = new SpreadsheetTool(spreadsheet);
        

    if(tool.isSheetExist(TEST_TABLE)){
        log.info('sheet exists: ' + TEST_TABLE + '. will be deleted');
        tool.deleteSheet(TEST_TABLE);
    }
  
    function assert(condition, testName){
        if(!condition){
            log.error('FAILED: ' + testName);
        }
    }
  
    log.info('tests start');
    assert(tool.isSheetExist(TEST_TABLE) === false, 'table should not exist');
    assert(tool.getSheet(TEST_TABLE) === null, 'getting not existent table should return null');

    sh = tool.createSheet(TEST_TABLE, ['a', 'b', 'c']);
    assert(sh !== null, 'creating new sheet');
    try{
        sh2 = tool.createSheet(TEST_TABLE, ['d', 'e', 'f']);
        assert(false, 'should not allow to call create for existing table'); 
    }catch(e1){
    }
    assert(tool.isSheetExist(TEST_TABLE), 'created table should exist');
    assert(tool.getSheet(TEST_TABLE) !== null, 'getting of existent table should return not null');

    tool.deleteSheet(TEST_TABLE);
    assert(tool.isSheetExist(TEST_TABLE) === false, 'deleted table should not exist');
    assert(tool.getSheet(TEST_TABLE) === null, 'getting deleted table should return null');

    try{
        tool.deleteSheet(TEST_TABLE);
        assert(false, 'deletion of deleted table should throw error');
    }catch(e2){}
    log.info('tests finished');
}
