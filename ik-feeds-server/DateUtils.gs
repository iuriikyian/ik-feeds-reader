/*jslint nomen: true*/  //<- allow _ in the begining and at the end
/*jslint white: true*/ //<- now additional whitespaces in function(){}

var DateUtils = (function(){
    'use strict';
    function padWith0(str){
        return str[1] ? str : "0" + str[0]; // padding
    }

    function dateToISODate(date){
      if(date){
        var mm = padWith0((date.getMonth() + 1).toString()), // getMonth() is zero-based
            dd = padWith0(date.getDate().toString());
        return [date.getFullYear().toString(), mm, dd].join('-');
      }
      return '';
    }

    function dateToISOTime(date){
      if(date){
        var hh = padWith0(date.getHours().toString()),
            mins = padWith0(date.getMinutes().toString()),
            ss = padWith0(date.getSeconds().toString());
        return [hh, mins, ss].join(':');
      }
      return '';
    }
    
    function dateToISOFormat(date){
      if(date){
        var mm = padWith0((date.getMonth() + 1).toString()), // getMonth() is zero-based
            dd = padWith0(date.getDate().toString()),
            hh = padWith0(date.getHours().toString()),
            mins = padWith0(date.getMinutes().toString()),
            ss = padWith0(date.getSeconds().toString());
        return [dateToISODate(date), dateToISOTime(date)].join('T');
      }
      return '';
    }

    function compareByDate(a, b){
      if(a.date < b.date){
        return 1;
      }
      if(a.date > b.date){
        return -1;
      }
      return 0;
    }    
    
    return {
        dateToISOFormat : dateToISOFormat,
        dateToISODate : dateToISODate,
        dateToISOTime : dateToISOTime,
        compareByDate : compareByDate
    };
}());