/*jslint nomen: true*/  //<- allow _ in the begining and at the end
/*jslint white: true*/ //<- now additional whitespaces in function(){}

/** Updating feeds tables from feed data sources
*/

/*global SpreadsheetTool,InMemorySheet,UrlFetchApp,Logger,DateUtils,FeedParsers*/
function FeedsUpdater(spreadsheet, cache, log, config){
    'use strict';
    // flag to force regeneration of all items that available in feeds
    var overwriteItems = false;
    
    this.update_feeds = function(){
        var stool = new SpreadsheetTool(spreadsheet),
            feedsSheet = stool.getSheet(config.FEEDS_LIST_NAME),
            me = this,
            mFeedsSheet;
        if(!feedsSheet){
            throw new Error('fail to find metasheet: ' + config.FEEDS_LIST_NAME);
        }
        mFeedsSheet = new InMemorySheet();
        mFeedsSheet.load(feedsSheet);
    
        mFeedsSheet.getRows().forEach(function(feedInfo){
            if(feedInfo.disable){
                log.info('feed skipped: ' + feedInfo.name);     
                return;
            }
            try{
                var encoding = feedInfo.encoding || 'UTF-8',
                    feedText = UrlFetchApp.fetch(feedInfo.url).getContentText(encoding),
                    items, feedSheetName, feedSheet, feedTemplate;
                log.info('feed fetched: ' + feedInfo.url);
                items = config.feed_parsers[feedInfo['feed-fetcher']](feedText);
                log.info('feed parsed: ' + feedInfo.url);
                feedSheetName = config.FEED_PREFIX + feedInfo.name;
                feedSheet = stool.getSheet(feedSheetName);
                if(!feedSheet){
                    feedTemplate = stool.getSheet(config.FEED_TEMPLATE_NAME);
                    if(!feedTemplate){
                        throw new Error('feed sheet template is not found');
                    }
                    feedSheet = stool.createSheetFromTemplate(feedSheetName, feedTemplate);
                }
                me._feed_update(feedSheet, items, feedInfo);  
            }catch(e){
                log.error('fail to update feed ' + feedInfo.name + '. Skipped.');
                log.error(Logger.error_to_str(e));
            }
        });
        cache['feeds-info'] = mFeedsSheet; 
    };
  
    /** updates sheet in the spreadsheed for feed with specific item 
    */
    this._feed_update = function(sheet, feedItems, feedInfo){
        var mSheet = new InMemorySheet(),
            rows, idsMap;
        mSheet.load(sheet);
    
        function str_cell_value(txt){ // add format to foce trating string as string
            return "'" + txt;
        }
        
        function create_timestamp_for_item(item){
            var d = new Date();
            item.timestamp = DateUtils.dateToISOFormat(d);
            item.date = DateUtils.dateToISODate(d);
            item.time = DateUtils.dateToISOTime(d);
        }
        rows = mSheet.getRows();
        if(rows.length === 0){ // empty feed sheet
            feedItems.forEach(function(item){
                if(!item.timestamp){ // feed without timestamp -> use current date
                    create_timestamp_for_item(item);
                }
                rows.push({
                    id : item.id,
                    title : item.title,
                    content : item.content,
                    excerpt : item.excerpt,
                    origin : item.url,
                    journal : feedInfo.journal,
                    timestamp : str_cell_value(item.timestamp),
                    date : str_cell_value(item.date),
                    time : str_cell_value(item.time),
                    previewImageUrl : ''
                });
            });
        }else{ // not empty feed sheet
            // updated based on id if matches
            idsMap = {};
            rows.forEach(function(rowItem){
                idsMap[rowItem.id] = rowItem;
            });
            feedItems.forEach(function(item){
                var rowItem = idsMap[item.id];
                if(rowItem){
                    if(overwriteItems){
                        if(!item.timestamp){ // feed without pubDate - use current date
                            create_timestamp_for_item(item);
                        }
                        rowItem.title = item.title;
                        rowItem.content = item.content;
                        rowItem.excerpt = item.excerpt;
                        rowItem.origin = item.url;
                        rowItem.journal = feedInfo.journal;
                        rowItem.timestamp = str_cell_value(item.timestamp);
                        rowItem.date = str_cell_value(item.date);
                        rowItem.time = str_cell_value(item.time);
                    }else{
                        if(!item.timestamp){ // feed without pubDate - nothing to compare -> skip update
                            return;
                        }            
                        if(rowItem.timestamp !== item.timestamp){
                            rowItem.title = item.title;
                            rowItem.content = item.content;
                            rowItem.excerpt = item.excerpt;
                            rowItem.origin = item.url;
                            rowItem.journal = feedInfo.journal;
                            rowItem.timestamp = str_cell_value(item.timestamp);
                            rowItem.date = str_cell_value(item.date);
                            rowItem.time = str_cell_value(item.time);
                        }
                    }
                }else{ // create new item
                    if(!item.timestamp){ // feed without timestamp -> use current date
                        create_timestamp_for_item(item);
                    }
                    item.origin = item.url;
                    item.journal = feedInfo.journal;
                    item.timestamp = str_cell_value(item.timestamp);
                    item.date = str_cell_value(item.date);
                    item.time = str_cell_value(item.time);
                    rows.push(item);
                }
            });
        }
        mSheet.getRows().sort(DateUtils.compareByDate);
        mSheet.save(sheet);
        cache.feeds[feedInfo.name] = mSheet;
    };
}

function test_feedsUpdater(){
    'use strict';
    var config = {
        JOURNALS_FOLDER : 'my-journals',
        JOURNAL : 'ik-feeds-journal',
        FEEDS_LIST_NAME : 'meta-feeds',
        FEED_TEMPLATE_NAME : 'template-feed',
        FEED_PREFIX : 'feed-',
        feed_parsers : FeedParsers
    },
    spreadsheet = SpreadsheetTool.openSpreadsheet(config.JOURNALS_FOLDER, config.JOURNAL),
    log = new Logger(spreadsheet, 'logs'),
    cache = {
        feeds : {}
    },
    updater = new FeedsUpdater(spreadsheet, cache, log, config);
    updater.update_feeds();
}