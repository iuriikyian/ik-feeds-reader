/*jslint nomen: true*/  //<- allow _ in the begining and at the end
/*jslint white: true*/ //<- now additional whitespaces in function(){}
/*global SpreadsheetTool,InMemorySheet,DateUtils,Logger*/

function JournalPublisher(spreadsheet, cache, log, config){
    'use strict';
    
    //TODO: remove method code duplication
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
    
    var stool = new SpreadsheetTool(spreadsheet);

    this.publish = function(){
        var journalData = this._extract_journal_data();
        this._update_channels_data(journalData);
    };
  
    this._extract_journal_data = function(){
        var mChannelsSheet = _getInMemorySheet(stool, config.CHANNELS_LIST_NAME ,cache['channels-info']),
            channels = [];
        function _toRowPost(sheetPost, keys){
            var res = {}, val;
            keys.forEach(function(key){
                val = sheetPost[key];
                if(val && val.length > 0 && val[0] === "'"){
                    res[key] = val.slice(1);
                }else{
                    res[key] = val;
                }
            });
            return res;
        }

        function _toRowPosts(sheetPosts, keys, channelName){
            var res = [];
            sheetPosts.forEach(function(post){
                var rowPost = _toRowPost(post, keys);
                rowPost.channel = channelName;
                res.push(rowPost);
            });
            return res;
        }

        mChannelsSheet.getRows().forEach(function(channelInfo){
            if(channelInfo.disable){
                return;
            }
            var mChannelSheet = cache.channels[channelInfo.name],
                sheetName, channelSheet, postsCount, channel;
            if(typeof mChannelSheet === 'undefined'){// not in cache
                sheetName = config.CHANNEL_PREFIX + channelInfo.name;
                channelSheet = stool.getSheet(sheetName);
                if(typeof channelSheet === 'undefined'){
                    log.info('Fail to find channel sheet ' + sheetName + '. SKIPPED');
                    return;
                }
                mChannelSheet = new InMemorySheet();
                mChannelSheet.load(channelSheet);
            }
            postsCount = mChannelSheet.getRows().length;
            if(postsCount > channelInfo.maxposts){
                postsCount = channelInfo.maxposts;
            }
            channel = {
                id : channelInfo.name,
                title : channelInfo.title,
                image : channelInfo.image,
                origin : channelInfo.origin,
                sort : channelInfo.sort,
                media : channelInfo.media,
                maxposts : channelInfo.maxposts,
                posts : _toRowPosts(mChannelSheet.getRows().slice(0, postsCount), mChannelSheet.getKeys(), channelInfo.name)
            };
            channels.push(channel);
        });
        return channels;
    };
  
    this._update_channels_data = function(channels){
        var timestamp = DateUtils.dateToISOFormat(new Date()),
            //1. load existing published channels
            publishedChannelsSheet = stool.getSheet(config.PUBLISHED_CHANNELS_SHEET_NAME),
            mPublishedChannelsSheet,
            channelsMap = {}, channelId, rows, channel, jsonData;
        if(!publishedChannelsSheet){
            publishedChannelsSheet = stool.createSheet(config.PUBLISHED_CHANNELS_SHEET_NAME, ['id', 'title', 'version', 'data-length', 'data']);
        }
        mPublishedChannelsSheet = new InMemorySheet();
        mPublishedChannelsSheet.load(publishedChannelsSheet);
        
        channels.forEach(function(channel){
          channelsMap[channel.id] = channel;
        });
        //2. update channels if there is an update
        rows = mPublishedChannelsSheet.getRows();
        rows.forEach(function(row){
          var channel = channelsMap[row.id],
              jsonData;
          if(channel){
              jsonData = JSON.stringify(channel);
              if(jsonData.length !== row['data-length']){
                  row.title = channel.title;
                  row.version = timestamp;
                  row['data-length'] = jsonData.length;
                  row.data = jsonData;
              }
              delete channelsMap[row.id];
          }
        });
        for(channelId in channelsMap){
          if(channelsMap.hasOwnProperty(channelId)){
            channel = channelsMap[channelId];
            jsonData = JSON.stringify(channel);
            rows.push({
              id : channel.id,
              title : channel.title,
              version : timestamp,
              'data-length' : jsonData.length,
              data : jsonData
            });
          }
        }
        mPublishedChannelsSheet.save(publishedChannelsSheet);
    };
}

function test_journalPublisher(){
    'use strict';
    var config = {
        JOURNALS_FOLDER : 'my-journals',
        JOURNAL : 'ik-feeds-journal',
        FEEDS_LIST_NAME : 'meta-feeds',
        CHANNELS_LIST_NAME : 'meta-channels',
        FEED_TEMPLATE_NAME : 'template-feed',
        FEED_PREFIX : 'feed-',
        CHANNEL_PREFIX : 'channel-',
        PUBLISHED_CHANNELS_SHEET_NAME : 'meta-published-channels'
    },
    spreadsheet = SpreadsheetTool.openSpreadsheet(config.JOURNALS_FOLDER, config.JOURNAL),
    log = new Logger(spreadsheet, 'logs'),
    cache = {
        feeds : {},
        channels : {}
    },
    updater = new JournalPublisher(spreadsheet, cache, log, config);
    updater.publish();
}