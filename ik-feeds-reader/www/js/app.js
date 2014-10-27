define(['zepto', 'views/UpdatesLoadingView', 'views/HomeView', 'data/ChannelsManager'], 
    function($, UpdatesLoadingView, HomeView, ChannelsManager){
    var app = {
        // Application Constructor
        initialize: function(config) {
            this.config = config;
            this._initData(config);
            this.bindEvents();
        },

        _initData: function(config){
            this._channelsManager = new ChannelsManager(config);
        },
        // Bind Event Listeners
        //
        // Bind any events that are required on startup. Common events are:
        // 'load', 'deviceready', 'offline', and 'online'.
        bindEvents: function() {
            document.addEventListener('deviceready', this.onDeviceReady, false);
            if(document.location && document.location.protocol !== 'file:'){
                $(_.bind(function(){ // browser hack for development
                    this.onDeviceReady();
                }, this));
            }
        },
        // deviceready Event Handler
        //
        // The scope of 'this' is the event. In order to call the 'receivedEvent'
        // function, we must explicitly call 'app.receivedEvent(...);'
        onDeviceReady: function() {
            //app.receivedEvent('deviceready');
            var view = new HomeView({
                channelsManager : this._channelsManager
            });
            $('body').empty();
            $('body').append(view.render().el);
            var updatesView = new UpdatesLoadingView({
                message : 'Checking for updates...'
            });
            $('body').append(updatesView.render().el);
            var checking = this._checkFoUpdates();
            checking.done(_.bind(function(hasUpdates, channels2update){
                if(hasUpdates){
                    console.debug('updates presence detected');
                    updatesView.setMessage('Loading updates...');
                    var fetching = this._fetchUpdates(channels2update);
                    fetching.done(function(){
                        updatesView.remove();
                    });
                    fetching.fail(function(error){
                        console.error(error);
                        view.render();
                        updatesView.remove();
                    });
                }else{
                    console.debug('no data updates available');
                    updatesView.remove();
                }

            }, this));
            checking.fail(function(error){
                console.error(error);
                updatesView.remove();
            });
        },

        _checkFoUpdates : function(){
            var dfd = new _.Deferred();
            var updatesChecking = this._channelsManager.hasUpdates();
            updatesChecking.done(function(hasUpdates, channels2update){
                dfd.resolve(hasUpdates, channels2update);
            });
            updatesChecking.fail(function(error){
                dfd.reject(error);
            });
            return dfd.promise();
        },

        _fetchUpdates: function(channels2update){
            var dfd = new _.Deferred();
            var _loadUpdates = _.bind(function(channelIds){
                var fetching = this._channelsManager.fetchUpdates(channelIds);
                fetching.done(function(){
                    dfd.resolve();
                });
                fetching.fail(function(error){
                    dfd.reject(error);
                });
            }, this);

            if(channels2update.length === 0){
                var gettingChannels = this._channelsManager.fetchAllChannels();
                gettingChannels.done(function(channels){
                    var channelIds = _.map(channels, function(channel){ return channel.id; });
                    _loadUpdates(channelIds);
                });
                gettingChannels.fail(function(error){
                    dfd.reject(error);
                });
            }else{
                //channels2update=[12];
                _loadUpdates(channels2update);
            }
            return dfd.promise();
        }
    };
    return app;
});
