/*jslint nomen: true*/  //<- allow _ in the begining and at the end
/*jslint white: true*/ //<- now additional whitespaces in function(){}

/** spreadsheet in memory wrapper
*   To allow manipulation of table data in memory as a chunk
*
*    Expects: first row of a table to be the set of keys for rows cells
*
*   The conting of rows starts from second rows (it is the row with index 0)
*   Rows are available as java-script objects with keys from first row of the table
*/
function InMemorySheet(){
    'use strict';
    // fields thst should have single quote to prevent spreadsheet special parsing
    var enforcedStringFields = {'date' : true, 'time' : true, 'timestamp' : true};
    this._keys = [];
    this._objRows = [];
    /** load all data from spreadsheet in memory
    *
    *  if columnsCount provided - points aount of columns to load
    */
    this.load = function(sheet, columnsCount){
        if(!sheet){
            throw new Error('sheet parameter is not provided');
        }
        var range = sheet.getDataRange(), rows, objRows = [], i, columns2Fetch;
        //_log.info('columnsCount: ' + columnsCount);
        if(typeof columnsCount !== 'undefined'){
            columns2Fetch = range.getLastColumn();
            if(columnsCount < columns2Fetch){
              columns2Fetch = columnsCount;
            }
            //_log.info(['range',range.getRow(), range.getColumn(), range.getLastRow(), columns2Fetch].join(':'));
            range = sheet.getRange(range.getRow(), range.getColumn(), range.getLastRow(), columns2Fetch);
        }
        rows = range.getValues();
        if(! rows.length){
            throw new Error('table is empty (has now column keys). the table should contain at least a row with keys');
        }
        this._keys = rows[0]; //TODO: add check for uniqness

        for(i = 1; i < rows.length; i += 1){
            objRows.push(this._row2obj(rows[i]));
        }
        this._objRows = objRows;
    };

    this.clear = function(){
        this._objRows = [];
    };

    /** saves data state in the sheet by replacing it's content
    */
    this.save = function(sheet){
        if(!sheet){
            throw new Error('sheet parameter is not provided');
        }
        var data = [], range, i;
        data.push(this._keys);
        for(i = 0; i < this._objRows.length; i += 1){
            data.push(this._obj2row(this._objRows[i]));
        }
        //TODO: don't remove formatting and content from sheet on it recreation
        sheet.clearContents();
        range = sheet.getRange(1, 1, data.length, this._keys.length);
        //    log.info('this._objRows: ' + Utilities.jsonStringify(this._objRows));
        //    log.info('data to save: ' + Utilities.jsonStringify(data));
        range.setValues(data);
    };

    /** access to objectified rows of the sheet
    */
    this.getRows = function(){
        return this._objRows;
    };

    /** access to the sheet keys for reading/modification
    *   return: array of keys
    */
    this.getKeys = function(){
        return this._keys;
    };

    this._obj2row = function(obj){
        var keys = this._keys,
            row = [], key, val, i;
        for(i = 0; i < keys.length; i += 1){
            key = keys[i];
            val = obj[keys[i]];
            if(val && val.length > 0){
                if(enforcedStringFields[key] && val[0] !== "'"){
                    val = "'" + val; // force everything to be string
                }
            }
            row.push(val || '');
        }   
        return row;
    };

    this._row2obj = function(row){
        var keys = this._keys,
            obj = {}, i, val, key;
        for(i = 0; i < row.length; i += 1){
            val = row[i];
            key = keys[i];
            if(val && val.length > 0){
                if(enforcedStringFields[key] && val[0] === "'"){
                    val = val.slice(1);
                }
            }
            obj[key] = val || '';
        }
        return obj;
    };
}
//var _log;
/*global SpreadsheetTool,Logger*/
function testInMemorySheet(){
    'use strict';
    var TEST_TABLE = 'test-mtable',
        JOURNALS_FOLDER = 'my-journals',
        JOURNALS = ['ik-feeds-journal'],
        keys = ['c1', 'c2', 'c3'],
        spreadsheet = SpreadsheetTool.openSpreadsheet(JOURNALS_FOLDER, JOURNALS[0]),
        log = new Logger(spreadsheet, 'log'),
        stool, sheet, msheet, rows, msheet2, msheet3;
        
      //_log = log;
    log.info('testInMemorySheet preparation');
    stool = new SpreadsheetTool(spreadsheet);
    if(stool.isSheetExist(TEST_TABLE)){
        stool.deleteSheet(TEST_TABLE);
    }

    sheet = stool.createSheet(TEST_TABLE, keys);

    function assert(condition, testName){
        if(!condition){
            log.error('FAILED: ' + testName);
        }
    }

    log.info('tests start');
    msheet = new InMemorySheet();
    assert(msheet.getKeys().length === 0, 'by default is emty table without keys');
    assert(msheet.getRows().length === 0, 'by default is emty table');

    try{
        msheet.load();
        assert(false, 'load() should throw exception if sheet is not provided');
    }
    catch(e){}

    msheet.load(sheet);
    assert(msheet.getKeys().length === 3, 'expected keys from a table with keys only row');
    assert(msheet.getRows().length === 0, 'table with only keys is treatyed as empty');

    rows = msheet.getRows();
    rows.push({
        c1: 'qwe',
        c2: 333,
        c3: 12.5
    });
    rows.push({
        c1: 'q-we',
        c3: 45
    });
    try{
        msheet.save();
        assert(false, 'save() should throw exception if sheet is not provided');
    }
    catch(e2){}
    msheet.save(sheet);

    msheet2 = new InMemorySheet();
    msheet2.load(sheet);
    assert(msheet2.getKeys().length === 3, 'expected keys from the saved table');
    rows = msheet2.getRows();
    log.info('loaded obj rows: ' + JSON.stringify(rows));
    assert(rows.length === 2, 'expects 2 rows from the saved table');
    //using null values?

    assert(rows[0].c1 === 'qwe', '1 expects value');
    assert(rows[0].c2 === 333, '2 expects value');
    assert(rows[0].c3 === 12.5, '3 expects value');
    assert(rows[1].c1 === 'q-we', '4 expects value');
    log.info(rows[1].c2);
    assert(rows[1].c2 === '', '5 expects value');
    assert(rows[1].c3 === 45, '6 expects value');

    log.info('partial table loading test');
    msheet3 = new InMemorySheet();
    msheet3.load(sheet, 2);
    log.info(JSON.stringify(msheet3.getKeys()));
    assert(msheet3.getKeys().length === 2, 'expected to load just 2 columns');
    rows = msheet3.getRows();
    log.info('loaded obj rows: ' + JSON.stringify(rows));
    
    log.info('tests finished');
}