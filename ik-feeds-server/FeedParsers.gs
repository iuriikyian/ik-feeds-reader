/*jslint nomen: true*/  //<- allow _ in the begining and at the end
/*jslint white: true*/ //<- now additional whitespaces in function(){}
/*jslint regexp: true*/

/*global XmlService,DateUtils*/

/** Feed parser implementations
*/

var FeedParsers = (function(){
    'use strict';
    function _extractText(parent, elementName, namespace){
        var elm;
        if(namespace){
            elm = parent.getChild(elementName, namespace);
        }else{
            elm = parent.getChild(elementName);
        }
        if(elm){
            return elm.getText();
        }
        return '';
    }
  
    function _extractAudiofiles(parent, namespace){
        var audios = parent.getChildren('audio', namespace),
            res = [], i;
        for(i in audios){
            if(audios.hasOwnProperty(i)){
                res.push({
                    url : _extractText(audios[i], 'avMediaURL' ,namespace),
                    ext : _extractText(audios[i], 'avMediaExt' ,namespace),
                    title : _extractText(audios[i], 'avTitle' ,namespace),
                    duration : _extractText(audios[i], 'avDuration' ,namespace),
                    fileSize : _extractText(audios[i], 'avMediaLength' ,namespace)
                });
            }
        }
        return res;
    }
  
    function _extract_timestamp(dateSpec){
        if(dateSpec){
            return dateSpec.substr(0, 19);
        }
        return '';  
    }
  
    function _extract_date(dateSpec){
        if(dateSpec){
            return dateSpec.substr(0, 10);
        }
        return '';  
    }
  
    function _extract_time(dateSpec){
        if(dateSpec){
            return dateSpec.substr(11, 5);
        }
        return '';  
    }
  
    var stripTagsRe = /(<([^>]+)>)/ig,
        MAX_EXCERPT_LENGTH = 250;
  
    function _create_excerpt_from_text(content){
        if(content){
            if(content.length > MAX_EXCERPT_LENGTH){
                return content.substr(0, MAX_EXCERPT_LENGTH) + '...';
            }
            return content;
        }
        return '';
    }
  
    function _create_excerpt_from_html(content){
        if(content){
            var stripped = content.replace(stripTagsRe, ' ');
            return _create_excerpt_from_text(stripped);
        }
        return '';
    }
    
    /**  DW lessons feeds parser */
    function _parse_dw_learn(feedText) {
        var doc = XmlService.parse(feedText),
            root = doc.getRootElement(),
            namespace = root.getNamespace(''),
            dcNamespace = root.getNamespace('dc'),
            dwsynNamespace = root.getNamespace('dwsyn'),

            items = root.getChildren('item', namespace),
      //  Logger.log(items);
            res = [], i, item, dateSpec, content;
        for(i in items){
            if(items.hasOwnProperty(i)){
                item = items[i];
                dateSpec = _extractText(item, 'date', dcNamespace);
                content = _extractText(item, 'description', namespace);
                res.push({
                    title : _extractText(item, 'title', namespace),
                    language : _extractText(item, 'language', dcNamespace),
                    url : _extractText(item, 'link', namespace),
                    content : content,
                    excerpt : _create_excerpt_from_html(content),
                    timestamp : _extract_timestamp(dateSpec),
                    date : _extract_date(dateSpec),
                    time : _extract_time(dateSpec),
                    subject : _extractText(item, 'subject', dcNamespace),
                    id : _extractText(item, 'contentID', dwsynNamespace),
                    image : {
                        url : item.getChild('image', dwsynNamespace).getChild('imageURL', dwsynNamespace).getText(),
                        width: item.getChild('image', dwsynNamespace).getChild('imageWidth', dwsynNamespace).getText(),
                        height: item.getChild('image', dwsynNamespace).getChild('imageHeight', dwsynNamespace).getText()
                    },
                    audio : _extractAudiofiles(item, dwsynNamespace)
                });
            }
        }
        return res;
    }
  
    function _parse_phonegap_rss(feedText) {
        var doc = XmlService.parse(feedText),
            root = doc.getRootElement(),
            namespace = root.getNamespace(''),
    
            items = root.getChildren('entry', namespace),
  //  Logger.log(items);
            res = [], i, item, dateSpec, content, itemId;
        for(i in items){
            if(items.hasOwnProperty(i)){
                item = items[i];
                dateSpec = _extractText(item, 'updated', namespace);
                content = _extractText(item, 'content', namespace);
                itemId = _extractText(item, 'id', namespace);
                res.push({
                    title : _extractText(item, 'title', namespace),
                    url : itemId, //item.getChild('link', namespace).getAttribute('href').getValue(),
                    content : content,
                    excerpt : _create_excerpt_from_html(content),
                    timestamp : _extract_timestamp(dateSpec),
                    date : _extract_date(dateSpec),
                    time : _extract_time(dateSpec),
                    id : itemId
                });
            }
        }
        return res;
    }
  
    function _parse_nodejs_rss(feedText) {
        var doc = XmlService.parse(feedText),
            root = doc.getRootElement(),
            channel = root.getChild('channel'),
            namespace = root.getNamespace(''),
            dcNamespace = root.getNamespace('dc'),
            dwsynNamespace = root.getNamespace('dwsyn'),
    
            items = channel.getChildren('item'),
  //  log.debug(items);
  //  Logger.log(items);
            res = [], i, item, dateStr, date, content, data;
        for(i in items){
            if(items.hasOwnProperty(i)){
                item = items[i];
  //    log.debug(item);
                dateStr = _extractText(item, 'pubDate');
  //    log.debug(dateStr);
                date = new Date(Date.parse(dateStr));
  //    log.debug(date);
                content = _extractText(item, 'description');
      
                data = {
                    title : _extractText(item, 'title'), //OK
                    url : _extractText(item, 'link'), //OK
                    content : content, //OK
                    excerpt : _create_excerpt_from_html(content), //OK
                    timestamp : DateUtils.dateToISOFormat(date),//ok
                    date : DateUtils.dateToISODate(date),//ok
                    time : DateUtils.dateToISOTime(date),//ok
                    id : _extractText(item, 'guid') //OK
                };
  //    log.debug(Utilities.jsonStringify(data));
                res.push(data);
            }
        }
  //  log.debug('parsed');
  //  log.debug(Utilities.jsonStringify(res));
        return res;
    }

    function _parse_nopubdate_rss(feedText) {
        var doc = XmlService.parse(feedText),
            root = doc.getRootElement(),
            channel = root.getChild('channel'),
    
            items = channel.getChildren('item'),
  //  log.debug(items);
  //  Logger.log(items);
            res = [], i, item, content, data;
        for(i in items){
            if(items.hasOwnProperty(i)){
                item = items[i];
      //    log.debug(item);
                content = _extractText(item, 'description');

                data = {
                    title : _extractText(item, 'title'), //OK
                    url : _extractText(item, 'link'), //OK
                    content : content, //OK
                    excerpt : _create_excerpt_from_html(content), //OK
                    id : _extractText(item, 'guid') //OK
                };
      //    log.debug(Utilities.jsonStringify(data));
                res.push(data);
            }
        }
  //  log.debug('parsed');
  //  log.debug(Utilities.jsonStringify(res));
        return res;
    }
  
    function _parse_bbc_english(feedText) {
        var doc = XmlService.parse(feedText),
            root = doc.getRootElement(),
            namespace = root.getNamespace(''),
    
            items = root.getChildren('entry', namespace),
  //  Logger.log(items);
            res = [], i, item, dateSpec, content, link;
        for(i in items){
            if(items.hasOwnProperty(i)){
                item = items[i];
                dateSpec = _extractText(item, 'published', namespace);
                content = _extractText(item, 'summary', namespace);
                link = item.getChild('link', namespace).getAttribute('href').getValue();
                res.push({
                    title : _extractText(item, 'title', namespace),
                    url : link,
                    content : content,
                    excerpt : _create_excerpt_from_text(content),
                    timestamp : _extract_timestamp(dateSpec),
                    date : _extract_date(dateSpec),
                    time : _extract_time(dateSpec),
                    id : _extractText(item, 'id', namespace)
                });
            }
        }
        return res;
    }

    return {
        dw_learn : _parse_dw_learn,
        phonegap : _parse_phonegap_rss,
        nodejs : _parse_nodejs_rss,
        nopubdate : _parse_nopubdate_rss,
        bbc_learn : _parse_bbc_english
    };
}());

