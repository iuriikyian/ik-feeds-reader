/*jslint nomen: true*/  //<- allw _ in the begining and at the end
/*jslint white: true*/ //<- now additional whitespaces in function(){}
/*global DateUtils*/

// Logging tool that logs messages in a spreadsheet sheet

var Logger = function(spreadsheet, logSheetName){
    'use strict';
    // initialization
    this._logSheet = spreadsheet.getSheetByName(logSheetName); 
    if(this._logSheet === null){
        this._logSheet = spreadsheet.insertSheet(logSheetName);
        this._logSheet.appendRow(['timestamp', 'level', 'message']);
        this._logSheet.getRange('A1:C1').setFontWeights([['bold', 'bold', 'bold']]);
        this._logSheet.getRange('A1:C1').setBackgrounds([['#EEEEEE', '#EEEEEE', '#EEEEEE']]);
    }
  
    var colors = {
        'debug': '#000000',
        'info' : '#579C4A',
        'warn' : '#F49309',
        'error': '#E8210C'
    };
  
    this._log = function(level, msg){
        this._logSheet.appendRow([DateUtils.dateToISOFormat(new Date()), level, msg]);
        var range = this._logSheet.getRange(this._logSheet.getLastRow(), 2, 1, 2);
        range.setFontColors([[colors[level], colors[level]]]);
    };
  
    this.debug = function(msg){
        this._log('debug', msg);
    };
    this.info = function(msg){
        this._log('info', msg);
    };
    this.warn = function(msg){
        this._log('warn', msg);
    };
    this.error = function(msg){
        this._log('error', msg);
    };
};

// converts google exception error into string
Logger.error_to_str = function (e){
    'use strict';
    return [e.name, e.fileName, e.lineNumber, e.message].join(' : ') + '\n' + e.stack;
};