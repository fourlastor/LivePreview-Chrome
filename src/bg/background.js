// if you checked "fancy-settings" in extensionizr.com, uncomment this lines

// var settings = new Store("settings", {
//     "sample_setting": "This is how you use Store.js to remember values"
// });


LivePreview = {

    tabs: new Object(),

    socket: null,
    socketReady: false,

    serverURL: function() {
        var serverProtocol = 'ws';
        var serverHost = '127.0.0.1';
        var serverPort = 9091;
        var serverFile = '/';
        return serverProtocol+'://'+serverHost+':'+serverPort+serverFile;
    },

    attachTab: function(tabId) {
        if(this.tabs[tabId] === undefined) {
            this.tabs[tabId] = {
                isDebugging: false
            };
            chrome.pageAction.show(tabId);
        }
    },

    toggleDebug: function(tabId) {

        if(this.tabs[tabId].isDebugging) {
            this.stopDebug(tabId);
        } else {
            this.startDebug(tabId);
        }

        this.updateIcon(tabId);
    },

    startDebug: function(tabId) {
        this.connect();
        this.tabs[tabId].isDebugging = true;
    },

    stopDebug: function(tabId) {
        this.tabs[tabId].isDebugging = false;
    },

    updateIcon: function(tabId) {
        if(this.tabs[tabId].isDebugging) {
            chrome.pageAction.setIcon({tabId: tabId, path: 'icons/icon19-on.png'});
        } else {
            chrome.pageAction.setIcon({tabId: tabId, path: 'icons/icon19.png'});
        }
    },

    cleanup: function() {
        this.socket = null;
        this.socketReady = false;
    },

    connect: function() {
        if (this.socket === null) {
            var self = this;

            this.socket = new WebSocket(this.serverURL());

            this.socket.onerror = function(e) {
                console.log('Socket error');
                console.log(e);
                self.cleanup();
            }

            this.socket.onclose = function() {
                self.cleanup();
            }

            this.socket.onopen = function() {
                self.socketReady = true;
            }

            this.socket.onmessage = function(e) {
                var message;

                try {
                    message = JSON.parse(e.data);
                } catch(err) {
                    console.log('Message not in JSON format!')
                    console.log(err);
                    console.log(e.data);
                    return;
                }

                self.processMessage(message);
            }
        }
    },

    reloadTab: function(tabId) {
        chrome.tabs.reload(tabId, {bypassCache: true});
    },

    reloadAllTabs: function() {
        for (var tabId in this.tabs) {
            if(this.tabs[tabId].isDebugging) {
                this.reloadTab(tabId);
            }
        }
    },

    processMessage: function(message) {
        var command = message.command;
        if(command === 'reload') {
            this.reloadAllTabs();
        } else {
            console.log('Command not supported!');
        }
    }

};

LivePreview.cleanup();

chrome.tabs.onUpdated.addListener(
    function(tabId, changeInfo, tab) {
        if (tab.url.indexOf('http://localhost') > -1) {
           LivePreview.attachTab(tabId);
        }
    });

chrome.pageAction.onClicked.addListener(
    function(tab) {
        LivePreview.toggleDebug(tab.id)
    });