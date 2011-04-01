/*
	Fucntion to make sure we can ue a DomParser... even in IE
*/
if(typeof(DOMParser) == 'undefined') {
 DOMParser = function() {}
 DOMParser.prototype.parseFromString = function(str, contentType) {
  if(typeof(ActiveXObject) != 'undefined') {
   var xmldata = new ActiveXObject('MSXML.DomDocument');
   xmldata.async = false;
   xmldata.loadXML(str);
   return xmldata;
  } else if(typeof(XMLHttpRequest) != 'undefined') {
   var xmldata = new XMLHttpRequest;
   if(!contentType) {
    contentType = 'application/xml';
   }
   xmldata.open('GET', 'data:' + contentType + ';charset=utf-8,' + encodeURIComponent(str), false);
   if(xmldata.overrideMimeType) {
    xmldata.overrideMimeType(contentType);
   }
   xmldata.send(null);
   return xmldata.responseXML;
  }
 }
}

Strophe.Websocket = function(service)
{
	// Connection
	this.connection = null;
	this.service	= service;

	// Requests stack.
	this._requests = [];    
	this.connected = false
};

Strophe.Websocket.prototype = {
	
	/** Function connect 
	 *  Connects to the server using websockets.
	 *  It also assigns the connection to this proto
	 */
	connect: function(connection) {
		this.connection 		= connection;
        this.socket 			= new WebSocket(this.service);
	    this.socket.onopen      = this._onOpen.bind(this);
		this.socket.onerror 	= this._onError.bind(this);
	    this.socket.onclose 	= this._onClose.bind(this);
	    this.socket.onmessage 	= this._onMessage.bind(this);
    
	},
	
	/** Function disconnect 
	 *  Disconnects from the server
	 */
	disconnect: function() {
		
	},

	/** Function finish 
	 *  Finishes the connection
	 */
	finish: function() {
		
	},
	
	/** Function send 
	 *  Sends messages
	 */
	send: function(msg) {
		this.connection.xmlOutput(msg);
        this.connection.rawOutput(Strophe.serialize(msg));
		this.socket.send(Strophe.serialize(msg))
	},
	
	/** Function: restart
     *  Send an xmpp:restart stanza.
     */
	restart: function() {
		
	},
	
	/** PrivateFunction: _onError
     *  _Private_ function to handle websockets errors.
     *
     *  Parameters:
     *    () error - The websocket error.
     */
	_onError: function(error) {
		console.log("ERROR : " + error)
	},

	/** PrivateFunction: _onOpen
     *  _Private_ function to handle websockets connections.
     *
     */
	_onOpen: function() {
		this.connection.start();
	},
	
	/** PrivateFunction: _onClose
     *  _Private_ function to handle websockets closing.
     *
	 */
	_onClose: function(event) {
		console.log("CLOSED")
	},
	
	/** PrivateFunction: _onError
     *  _Private_ function to handle websockets messages.
     *
     *  Parameters:
     *    (string) message - The websocket message.
     */
	_onMessage: function(message) {
		string = message.data.replace("<stream:features>", "<stream:features xmlns:stream='http://etherx.jabber.org/streams'>") // Ugly hack todeal with the problem of stream ns undefined.
		
		parser = new DOMParser();
		elem = parser.parseFromString(string, "text/xml").documentElement;
		
		this.connection.xmlInput(elem);
		this.connection.rawInput(Strophe.serialize(elem));

		if(elem.nodeName == "stream:stream") {
			// Let's just skip this.
		}
		else {
			this.connection._dataRecv(elem);
		}
	}
	

}
	
	