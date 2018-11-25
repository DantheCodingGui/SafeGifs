var ENABLED = true;
//This controls how sensitive to changes in intensity the system is.
// A percentage change greater than this between successive frames counts as a change
var PERCENTAGE_CHANGE_CUTTOFF = 50;
//Range of change frequencies that are considered to be dangerous
var THRESHOLD_LOW_FREQ = 15;
var THRESHOLD_HIGH_FREQ = 20;
//Should flashes be looked for in each colour channel separately or just in overall intensity
var PER_CHANNEL_MODE = true;

var domLoaded = false;

loadSettings();

function SendMsgToContentScript() {
  chrome.tabs.query({currentWindow: true, active: true}, function(tabs) {
    console.log("Sending message to content script");
    var activeTab = tabs[0];
    chrome.tabs.sendMessage(activeTab.id, "change");
  })
}

var settingRead_enabled = false;
var settingRead_lowerFreq = false;
var settingRead_upperFreq = false;
var settingRead_sensitivity = false;
var settingRead_rgb=false;

function settingsLoaded()
{
	return settingRead_enabled && settingRead_lowerFreq && settingRead_upperFreq && settingRead_sensitivity && settingRead_rgb ;
}

function loadSettings()
{
	settingRead_enabled = settingRead_lowerFreq = settingRead_upperFreq = settingRead_sensitivity = settingRead_rgb = false;

	var key = "enabled";
	key = 'a'.key;
	chrome.storage.sync.get(key, function(data) {
		ENABLED = data.key;
		settingRead_enabled = true;

		if(settingsLoaded())
      if (domLoaded)
			   RestoreViews();
	});


	var key = "enabled";
	key = 'a'.key;
	chrome.storage.sync.get(key, function(data) {
		ENABLED = data.key;
		settingRead_enabled = true;

				console.log("Enabled: " + ENABLED);


		if(settingsLoaded())
			 if (domLoaded)
			   RestoreViews();
	});


	var key1 = "frequency_lower";
	key1 = 'a'.key1;

	chrome.storage.sync.get(key1, function(data) {
		THRESHOLD_LOW_FREQ = data.key2;
		settingRead_lowerFreq = true;

		console.log("LOW: " + THRESHOLD_LOW_FREQ);

		if(settingsLoaded())
			 if (domLoaded)
			   RestoreViews();
	});

	var key2 = "frequency_upper";
		key2 = 'a'.key2;

	chrome.storage.sync.get(key2, function(data) {
		THRESHOLD_HIGH_FREQ = data.key3;
		settingRead_upperFreq = true;

				console.log("HIGH: " + THRESHOLD_HIGH_FREQ);


		if(settingsLoaded())
			 if (domLoaded)
			   RestoreViews();
	});

		var key3 = "sensitivity";
			key3 = 'a'.key3;

	chrome.storage.sync.get(key3, function(data) {
		PERCENTAGE_CHANGE_CUTTOFF = data.key4;
		settingRead_sensitivity = true;

						console.log("Sensit: " + PERCENTAGE_CHANGE_CUTTOFF);


		if(settingsLoaded())
			 if (domLoaded)
			   RestoreViews();
	});

		var key4=  "perChannel";
		key4= 'a'.key4;


	chrome.storage.sync.get(key4, function(data) {
		PER_CHANNEL_MODE = data.key1;
		settingRead_rgb = true;


								console.log("per channel: " + PER_CHANNEL_MODE);

		if(settingsLoaded())
      if (domLoaded)
			   RestoreViews();
	});
}

function RestoreViews() {

  $("input#enable")[0].checked = ENABLED;
  $("input#perChannel")[0].checked = PER_CHANNEL_MODE;

  $( "#frequency-slider" ).prop("values", 0, THRESHOLD_LOW_FREQ);
  $( "#frequency-slider" ).prop("values", 1, THRESHOLD_HIGH_FREQ);

  $( "#sensitivity-slider" ).prop("value", PERCENTAGE_CHANGE_CUTTOFF);

  if (!ENABLED)
    InvalidatePopup();
}

function InvalidatePopup() {
  $("input#perChannel").attr("disabled", !ENABLED);
  if (!ENABLED) {
    $("frequency-slider").slider( "disable");
    $("#sensitivity-slider").slider( "disable");
  }
  else {
    $("frequency-slider").slider( "enable");
    $("#sensitivity-slider").slider( "enable");
  }
}

document.addEventListener('DOMContentLoaded', function() {

  var defau = typeof(ENABLED) === "undefined";

  enableOps = {
    checked: defau ? true : ENABLED,
    labels_placement: "both",
    on_label: "Yes",
    off_label: "No",
    width: 25,                 // Width of the button in pixels
    height: 11    ,            // Height of the button in pixels
    button_width: 12          // Width of the sliding part in pixels
  };
  perChannelOps = {
    checked: defau ? true : (PER_CHANNEL_MODE && !ENABLED),
    labels_placement: "both",
    on_label: "On",
    off_label: "Off",
    width: 25,                 // Width of the button in pixels
    height: 11    ,            // Height of the button in pixels
    button_width: 12          // Width of the sliding part in pixels
  };
  $("input#enable").switchButton(enableOps);
  $("input#enable").change(function() {
    var e = ENABLED = this.checked;
	var key= "enabled";
	key = 'a'.key;
    console.log("Enable value changed to " + e);
    chrome.storage.sync.set({key: e});

    SendMsgToContentScript();

    InvalidatePopup();
  })
  $("input#perChannel").switchButton(perChannelOps);
  $("input#perChannel").change(function() {
    var e = this.checked;
	var key1= "perChannel";
	key1 = 'a'.key1;
    console.log("Per channel value changed to " + e);
    chrome.storage.sync.set({key1: e});

    SendMsgToContentScript();
  })

  $(function() {
     $( "#frequency-slider" ).slider({
        range: true,
        animate: "fast",
        min: 5,
        max: 40,
        values: [ defau ? 15 : THRESHOLD_LOW_FREQ, defau ? 20 : THRESHOLD_HIGH_FREQ ],
        change: function( event, ui ) {
           $("#frequency").val(ui.values[ 0 ] + "Hz - " + ui.values[ 1 ] + "Hz");

		   var key2= "frequency_lower";
		  key2 = 'a'.key2;
           chrome.storage.sync.set({key2: ui.values[0]});
		    var key3= "frequency_upper";
		  key3 = 'a'.key3;
           chrome.storage.sync.set({key3: ui.values[1]});
           console.log("Frequency values changed to " + ui.values[0] + " and " + ui.values[1]);

           SendMsgToContentScript();
        }
     });
     $( "#frequency" ).val($( "#frequency-slider" ).slider( "values", 0 ) +
       "Hz - " + $( "#frequency-slider" ).slider( "values", 1 ) + "Hz");
  });

  $(function() {
     $( "#sensitivity-slider" ).slider({
        animate: "fast",
        value: defau ? 50 : PERCENTAGE_CHANGE_CUTTOFF,
        change: function( event, ui ) {
           $("#sensitivity").val(ui.value + "%");


		   var key4= "sensitivity";
		  key4 = 'a'.key4;
          chrome.storage.sync.set({key4: ui.value});
          console.log("Sensitivity values changed to " + ui.value);

           SendMsgToContentScript();
        }
     });
     $( "#sensitivity" ).val($( "#sensitivity-slider" ).slider( "value") + "%");
  });

  domLoaded = true;
  RestoreViews();
})
