/*jslint nomen: true*/  //<- allow _ in the begining and at the end
/*jslint white: true*/ //<- now additional whitespaces in function(){}
/*global ContentService,SpreadsheetTool,InMemorySheet,Logger*/

var webTools = {
    make_text_result : function(txt){
        'use strict';
        return ContentService.createTextOutput(txt);
    },
    make_json_result : function(txt){
        'use strict';
        var res = ContentService.createTextOutput(txt);
        res.setMimeType(ContentService.MimeType.JSON);
        return res;
    },
    make_jsonp_result : function(txt, callback){
        'use strict';
        var res = ContentService.createTextOutput([callback, '(', txt, ');'].join(''));
        res.setMimeType(ContentService.MimeType.JAVASCRIPT);
        return res;
    }
};

var handlers = {
    list : function(params, log, config){
        'use strict';
        var spreadsheet = SpreadsheetTool.openSpreadsheet(config.JOURNALS_FOLDER, config.JOURNAL),
            stool = new SpreadsheetTool(spreadsheet),
            sheet = stool.getSheet(config.PUBLISHED_CHANNELS_SHEET_NAME),
            mSheet;
        if(typeof sheet === 'undefined'){
            return webTools.make_text_result('ERROR:404 published channels is not found');
        }
        mSheet = new InMemorySheet();
        mSheet.load(sheet, 3);
        return webTools.make_json_result(JSON.stringify(mSheet.getRows()));
    },
    status : function(params, log, config){
        'use strict';
        var spreadsheet = SpreadsheetTool.openSpreadsheet(config.JOURNALS_FOLDER, config.JOURNAL),
            stool = new SpreadsheetTool(spreadsheet),
            sheet = stool.getSheet(config.PUBLISHED_CHANNELS_SHEET_NAME),
            mSheet, idValues,
            channelsMap = {},
            filteredRows = [];
        if(typeof sheet === 'undefined'){
            return webTools.make_text_result('ERROR:404 published channels is not found');
        }
        if(!params.ids){
            return webTools.make_text_result('ERROR:400 Bad request: parameter ids is not provided');
        }
        mSheet = new InMemorySheet();
        mSheet.load(sheet, 3);
        // filter requested channels
        
        idValues = params.ids.split(',');
        idValues.forEach(function(idValue){
          channelsMap[idValue] = true;
        });
        mSheet.getRows().forEach(function(row){
          if(channelsMap[row.id]){
            filteredRows.push(row);
          }
        });
        return webTools.make_json_result(JSON.stringify(filteredRows));
    },
    data : function(params, log, config){
        'use strict';
        var spreadsheet = SpreadsheetTool.openSpreadsheet(config.JOURNALS_FOLDER, config.JOURNAL),
            stool = new SpreadsheetTool(spreadsheet),
            sheet = stool.getSheet(config.PUBLISHED_CHANNELS_SHEET_NAME),
            mSheet, resParts = [], channelsMap = {}, idValues;
        if(typeof sheet === 'undefined'){
            return webTools.make_text_result('ERROR:404 published channels is not found');
        }
        if(!params.ids){
            return webTools.make_text_result('ERROR:400 Bad request: parameter ids is not provided');
        }
        mSheet = new InMemorySheet();
        mSheet.load(sheet);
        // filter requested channels
        idValues = params.ids.split(',');
        idValues.forEach(function(idValue){
          channelsMap[idValue] = true;
        });
        mSheet.getRows().forEach(function(row){
          if(channelsMap[row.id]){
            resParts.push(row.data);
          }
        });
        return webTools.make_json_result('[' + resParts.join(',') + ']');
    }
};


var config1 = {
  JOURNALS_FOLDER : 'my-journals',
  JOURNAL : 'ik-feeds-journal',
  PUBLISHED_CHANNELS_SHEET_NAME : 'meta-published-channels'
};

// URL : https://script.google.com/macros/s/AKfycbwVyHBkZo_GRWewueRQkJlx2KRCnpKOZCa8PrJpgpyJNvTE02t4/exec

function doGet(evt){
    'use strict';
    var config = config1,
        spreadsheet = SpreadsheetTool.openSpreadsheet(config.JOURNALS_FOLDER, config.JOURNAL),
        log = new Logger(spreadsheet, 'logs'),
        handler;
    log.info('-----');
    log.info(JSON.stringify(evt));
    try{

        handler = handlers[evt.parameter.cmd];
        if(typeof handler === 'undefined'){
            return webTools.make_text_result('ERROR: 400 Bad Request');
        }
        return handler(evt.parameter, log, config);
    }catch(e){
        log.error(Logger.error_to_str(e));
    }
}

