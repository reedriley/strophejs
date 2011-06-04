/*
	We need a a server that supports Socket-io :)
*/

Strophe.SocketIO = function(host, port)
{
	// Connection
	this.connection = null;
	this.service	= host;
	this.port       = port;
	// Requests stack.
	this._requests = [];    
	this.connected = false
};

Strophe.SocketIO.prototype = {
	
	/** Function connect 
	 *  Connects to the server using SocketIOs.
	 *  It also assigns the connection to this proto
	 */
	connect: function(connection) {
		if(!this.socket) {
			this.connection 		= connection;
	        this.socket 			= new io.Socket(this.host, {port:this.port}); 
	        this.socket.on('connect', function(){ 
	            this._onConnect();
            }.bind(this));
            this.socket.on('message', function(message){
	            this._onMessage(message);
            }.bind(this));
            this.socket.on('disconnect', function(){
                this._onDisconnect();
            }.bind(this)); 
            this.socket.connect();
		}
	},
	
	/** Function disconnect 
	 *  Disconnects from the server
	 */
	disconnect: function() {
		console.log("disconnected");
	},

	/** Function finish 
	 *  Finishes the connection
	 */
	finish: function() {
		console.log("finish");
	},
	
	/** Function send 
	 *  Sends messages
	 */
	send: function(stanza) {
		console.log("send");
	},
	
	/** Function: restart
     *  Send an xmpp:restart stanza.
     */
	restart: function() {
		console.log("restart");
	},
	
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
			this.connection.receiveData(elem);
		}
	},
	
	/** PrivateFunction: _onConnect
     *  _Private_ function to handle SocketIOs connections.
     *
     */
	_onConnect: function() {
		Strophe.log("SocketIO open")
		this.connection.xmlOutput(this._startStream());
        this.connection.rawOutput(this._startStream());
		this.socket.send(this._startStream());
	},
	
	/** PrivateFunction: _onDisconnect
     *  _Private_ function to handle SocketIOs closing.
     *
	 */
	_onDisconnect: function(event) {
		Strophe.log("SocketIO disconnected")
		this.connection._doDisconnect()
	},
	
	_startStream: function() {
		return "<stream:stream to='" + this.connection.domain + "' xmlns='jabber:client' xmlns:stream='http://etherx.jabber.org/streams' version='1.0' />";
	},
	
	_endStream:function() {
		return "</stream:stream>";
	}
	
	
}
	
