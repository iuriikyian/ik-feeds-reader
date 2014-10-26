/*jslint nomen: true*/  //<- allow _ in the begining and at the end
/*jslint white: true*/ //<- now additional whitespaces in function(){}

/*global SpreadsheetTool,FeedParsers,FeedsUpdater,ChannelsUpdater,JournalPublisher,Logger*/

function updateAll(){
    'use strict';
    var config = {
        JOURNALS_FOLDER : 'my-journals',
        JOURNAL : 'ik-feeds-journal',
        FEEDS_LIST_NAME : 'meta-feeds',
        FEED_TEMPLATE_NAME : 'template-feed',
        FEED_PREFIX : 'feed-',
        CHANNELS_LIST_NAME : 'meta-channels',
        CHANNEL_PREFIX : 'channel-',
        feed_parsers : FeedParsers,
        PUBLISHED_CHANNELS_SHEET_NAME : 'meta-published-channels'
    },
    spreadsheet = SpreadsheetTool.openSpreadsheet(config.JOURNALS_FOLDER, config.JOURNAL),
    log = new Logger(spreadsheet, 'logs'),
    cache = {
        feeds : {},
        channels : {}
    },
    updater = new FeedsUpdater(spreadsheet, cache, log, config),
    chUpdater, publisher;
    log.info('--- update-all started ---');
    updater.update_feeds();
    log.info('--- feeds updated ---');
    
    chUpdater = new ChannelsUpdater(spreadsheet, cache, log, config);
    chUpdater.update_channels();
    log.info('--- channels updated ---');
    
    publisher = new JournalPublisher(spreadsheet, cache, log, config);
    publisher.publish();
    log.info('--- channels published ---');
    
    log.info('--- update-all finished ---');
}