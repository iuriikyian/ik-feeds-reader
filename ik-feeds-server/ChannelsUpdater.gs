/*jslint nomen: true*/  //<- allow _ in the begining and at the end
/*jslint white: true*/ //<- now additional whitespaces in function(){}

/*global SpreadsheetTool,InMemorySheet,DateUtils,Logger*/

function ChannelsUpdater(spreadsheet, cache, log, config){
    'use strict';
    
    function _getInMemorySheet(stool, sheetName, cacheValue){
        log.info('load sheet: ' + sheetName);
        if(typeof cacheValue !== 'undefined'){
          return cacheValue;
        }
        var sheet = stool.getSheet(sheetName),
            mSheet = new InMemorySheet();
            mSheet.load(sheet);
        return mSheet; 
    }
    
    this.update_channels = function() {
        // collect feed names by channels
        var stool = new SpreadsheetTool(spreadsheet),
            mFeedsSheet = _getInMemorySheet(stool, config.FEEDS_LIST_NAME, cache['feeds-info']),
            channelFeedsDict = {},
            channelFeedNames, channelsSheet, mChannelsSheet;
        //log.info(JSON.stringify(mFeedsSheet));
        mFeedsSheet.getRows().forEach(function(feedInfo){
            if(feedInfo.disable){
                log.info('skip disabled feed: ' + feedInfo.name);
                return;
            }
            channelFeedNames = channelFeedsDict[feedInfo['output-channel']];
            if(typeof channelFeedNames === 'undefined'){
                channelFeedNames = [feedInfo.name];
                channelFeedsDict[feedInfo['output-channel']] = channelFeedNames;
            }else{
                channelFeedNames.push(feedInfo.name);
            }
        });
        
        channelsSheet = stool.getSheet(config.CHANNELS_LIST_NAME);
        if(!channelsSheet){
            throw new Error('channels meta sheet is not found');
        }
        mChannelsSheet = new InMemorySheet();
        mChannelsSheet.load(channelsSheet);
    
        mChannelsSheet.getRows().forEach(function(channelInfo){
            var channelFeedNames = channelFeedsDict[channelInfo.name],
                mSheet, sheetName, sheet, templateSheet;
            if(channelFeedNames){
                sheetName = config.CHANNEL_PREFIX + channelInfo.name;
                sheet = stool.getSheet(sheetName);
                if(!sheet){
                    templateSheet = stool.getSheet(config.FEED_TEMPLATE_NAME);
                    if(!templateSheet){
                        throw new Error('channel sheet template is not found');
                    }
                    sheet = stool.createSheetFromTemplate(sheetName, templateSheet);
                }
                mSheet = new InMemorySheet();
                mSheet.load(sheet);
                mSheet.clear();

                log.debug(channelFeedNames);
                channelFeedNames.forEach(function(feedName){
                    var mFeedSheet = _getInMemorySheet(stool, config.FEED_PREFIX + feedName, cache.feeds[feedName]),
                        // expects items of feed to be sorted by timestamp
                        sourceRows = mFeedSheet.getRows(),
                        feedItemsCount = sourceRows.length,
                        feedsToCopyCount, rows, i, r;
                    if(!feedItemsCount){
                        return;
                    }
                    feedsToCopyCount = feedItemsCount < channelInfo.maxposts ? feedItemsCount : channelInfo.maxposts;
                    rows = mSheet.getRows();
                    for(i = 0; i < feedsToCopyCount; i += 1){
                        r = sourceRows[i];
                        r.date = r.date || '';
                        r.time = r.time || '';
                        r.timestamp = r.timestamp || '';
                        rows.push(r);
                    }
                });
                mSheet.getRows().sort(DateUtils.compareByDate);        
                mSheet.save(sheet);
                cache.channels[channelInfo.name] = mSheet;
            }
        });
        cache['channels-info'] = mChannelsSheet;
        return 'DONE: channels update';  
    };
}

function test_channelsUpdater(){
    'use strict';
    var config = {
        JOURNALS_FOLDER : 'my-journals',
        JOURNAL : 'ik-feeds-journal',
        FEEDS_LIST_NAME : 'meta-feeds',
        CHANNELS_LIST_NAME : 'meta-channels',
        FEED_TEMPLATE_NAME : 'template-feed',
        FEED_PREFIX : 'feed-',
        CHANNEL_PREFIX : 'channel-'
    },
    spreadsheet = SpreadsheetTool.openSpreadsheet(config.JOURNALS_FOLDER, config.JOURNAL),
    log = new Logger(spreadsheet, 'logs'),
    cache = {
        feeds : {},
        channels : {},
        'channels-info' : {}
    },
    updater = new ChannelsUpdater(spreadsheet, cache, log, config);
    updater.update_channels();
}