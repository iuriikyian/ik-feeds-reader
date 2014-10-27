define(["underscore", "zepto", "string"], function(_, $, S){

	var VERSIONS_KEY = 'versions',
		CHANNEL_KEY_PREFFIX = 'channel-',
		storage = window.localStorage;

	/**
	*	Channensl information manager
	*/
	return function(options){
		/** Checks if there are updates available for download */
		this.hasUpdates = function(){
			var dfd = new _.Deferred(),
				versionsData = this._getVersions(),
				channelIds = _.map(versionsData, function(version, channelId){ return channelId; });
			if(channelIds.length === 0){ // no local data - required update
				dfd.resolve(true, []); // update all channels
				return dfd.promise();
			}
			$.ajax({
				url : options.server + '?cmd=status&ids=' + channelIds.join(','),
				dataType : 'jsonp',
				context : this,
				success : function(data, status, xhr){
					console.log(data);
					var channels2Update = [];
					_.each(data.data, function(info){
						var localVersionData = versionsData["" + info.id];
						if(_.isUndefined(localVersionData)){ // no local data for the channel
							//console.debug('local version is undefined for: ' + info.id);
							channels2Update.push(info.id);
						}
						if(localVersionData !== info.version){
							//console.debug('local versions are different: ' + info.version + ' : ' + localVersionData);
							channels2Update.push(info.id);
						}
					});
					dfd.resolve(channels2Update.length > 0, channels2Update);
				},
				error : function(xhr, errorType, error){
					console.error(error);
					dfd.reject({error : error});
				}
			});
			return dfd.promise();
		};

		/** Fetch from the server info about all available channels
		*/
		this.fetchAllChannels = function(){
			var dfd = new _.Deferred();
			$.ajax({
				url : options.server + '?cmd=list',
				dataType : 'jsonp',
				context : this,
				success : function(data, status, xhr){
					console.log(data);
					dfd.resolve(data.data);
				},
				error : function(xhr, errorType, error){
					console.error(error);
					dfd.reject({error : error});
				}
			});

			return dfd.promise();
		};

		/** loading channel updates 
		*/
		this.fetchUpdates = function(channels2update){
			var dfd = new _.Deferred();
			$.ajax({
				url : options.server + '?cmd=data&ids=' + channels2update.join(','),
				dataType : 'jsonp',
				context : this,
				success : function(data, status, xhr){
					console.log(data);
					_.each(data.data, function(channel){
						this._saveChannelData(channel.id, channel);
					}, this);
					var versionsData = this._getVersions();
					versionsData = _.extend(versionsData, data.versions); // update versions
					this._saveVersions(versionsData);
					dfd.resolve();
				},
				error : function(xhr, errorType, error){
					console.error(error);
					dfd.reject({error : error});
				}
			});
			return dfd.promise();
		};

		this.getChannels = function(){
			var versionsData = this._getVersions(),
				channels = [];
			_.each(versionsData, function(version, channelId){
				var channel = this._getChannelData(channelId);
				if(!_.isEmpty(channel)){
					channels.push(channel);
				}
			}, this);
			return channels;
		};

		this._getChannelData = function(channelId){
			var channelData = storage.getItem(CHANNEL_KEY_PREFFIX + channelId);
			try{
				return JSON.parse(channelData);
			}catch(e){
				return {};
			}
		};

		this._saveChannelData = function(channelId, channelData){
			storage.setItem(CHANNEL_KEY_PREFFIX + channelId, JSON.stringify(channelData));
		};

		this._getVersions = function(){
			var data = storage.getItem(VERSIONS_KEY);
			if(!data || !_.isString(data)){
				return {};
			}
			try{
				return JSON.parse(data);

			}catch(e){
				return {};
			}
		};

		this._saveVersions = function(versionsData){
			storage.setItem(VERSIONS_KEY, JSON.stringify(versionsData));
		};
	};
});