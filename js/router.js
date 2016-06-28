// ~ router.js ~
define([
  'jquery',
  'underscore',
  'backbone',
  'views/details/main',
  'views/search/main',
  'views/search/do',
  'views/about/main',
  'views/help/main',
  'jssha'
], function($, _, Backbone, mainDetailsView, mainSearchView, doSearchView, aboutView, helpView, jsSHA){
  var AppRouter = Backbone.Router.extend({
    routes: {
       // Define the routes for the actions in Atlas
    	'details/:fingerprint': 'mainDetails',
    	'search/:query': 'doSearch',
	'top10': 'showTop10',
    	'about': 'showAbout',
	'help': 'showHelp',
    	// Default
    	'*actions': 'defaultAction'
    },

    hashFingerprints: function(fp){
        if (fp.match(/^[a-f0-9]{40}/i) != null)
            return new jsSHA(fp, "HEX").getHash("SHA-1", "HEX").toUpperCase();
        else
            return fp
    },

    // Show the details page of a node
    mainDetails: function(fingerprint){

        $("#home").removeClass("active");
        $("#about").removeClass("active");

        $("#loading").show();
        $("#content").hide();

        mainDetailsView.model.fingerprint = this.hashFingerprints(fingerprint);
        mainDetailsView.model.lookup({
            success: function(relay) {
                $("#content").show();
    	        mainDetailsView.render();
                $("#loading").hide();

            },
            error: function() {
                $("#content").show();
                mainDetailsView.error();
                $("#loading").hide();
            }
        });
    },

    // Perform a search on Atlas
    doSearch: function(query){
        $("#home").removeClass("active");
        $("#about").removeClass("active");

        $("#loading").show();
        $("#content").hide();

        $("#nav-search").val(query);
        if (query == "") {
            $("#content").show();
	    doSearchView.error = 5;
            doSearchView.renderError();
            $("#loading").hide();
        } else {
            doSearchView.collection.url =
                doSearchView.collection.baseurl + this.hashFingerprints(query);
            doSearchView.collection.lookup({
                success: function(err){
                    $("#content").show();
                    doSearchView.relays = doSearchView.collection.models;
		    doSearchView.error = err;
                    doSearchView.render(query);
		    if ( query == "flag:Authority" ) {
                       $("#search-title").text("Directory Authorities");
                       $("#search-explanation").text("This search shows the directory authorities in the Tor network. A directory authority is a special-purpose relay that maintains a list of currently-running relays and periodically publishes a consensus together with the other directory authorities. The consensus is a single document compiled and voted on by the directory authorities once per hour, ensuring that all clients have the same information about the relays that make up the Tor network.");
		       $("#search-explanation").show();
		    } else {
		       $("#search-title").text(query);
		       $("#search-explanation").hide();
		    }
                    $("#loading").hide();
                },

                error: function(err){
                    $("#content").show();
		    doSearchView.error = err;
		    doSearchView.renderError();
                    $("#loading").hide();
                }
            });
        }
    },
    showTop10: function(){
        $("#home").removeClass("active");
        $("#about").removeClass("active");

        $("#loading").show();
        $("#content").hide();

        doSearchView.collection.url = "https://onionoo.torproject.org/summary?type=relay&order=-consensus_weight&limit=10&running=true";
            doSearchView.collection.lookup({
                success: function(relays){
                    $("#content").show();
                    doSearchView.relays = doSearchView.collection.models;
                    doSearchView.render("");
		    $("#search-title").text("Top 10 Relays by Consensus Weight");
		    $("#search-explanation").text("This search shows the top 10 relays in the Tor network sorted by consensus weight. This is not a value of the advertised bandwidth but instead a value assigned to a relay that is based on bandwidth observed by the relay and bandwidth measured by the directory authorities, included in the hourly published consensus, and used by clients to select relays for their circuits.");
		    $("#search-explanation").show();
                    $("#loading").hide();
                },

                error: function(erno){
                    $("#content").show();
                    doSearchView.error(erno);
                    $("#loading").hide();
                }
            });
    },
    // Display the Atlas about page
    showAbout: function(){
        $("#home").removeClass("active");
        $("#about").addClass("active");

        $("#loading").show();
        //$("#content").hide();

    	aboutView.render();

        $("#loading").hide();
        //$("#content").show();
    },
    // Display the Atlas help page
    showHelp: function(){
        $("#home").removeClass("active");
        $("#about").addClass("active");

        $("#loading").show();
        //$("#content").hide();

    	helpView.render();

        $("#loading").hide();
        //$("#content").show();
    },

    // No matched rules go to the default home page
    defaultAction: function(actions){
        $("#home").addClass("active");
        $("#about").removeClass("active");

        $("#loading").show();
        //$("#content").hide();

        mainSearchView.render();

        //$("#content").show();
        $("#loading").hide();
    }

  });

  var initialize = function(){
    var app_router = new AppRouter;
    Backbone.history.start();

    // This is probably a dirty trick and there should be a better
    // way of doing so.

    $("#nav-search").submit(function(e){
        var query = _.escape($(this).children("input.search-query").val());
        query = query.trim();
        console.log(query);
        $("#suggestion").hide();
        document.location = "#search/"+query;
        return false;
    });
  };
  return {
    initialize: initialize
  };
});
