
function onSenseChange() {
  //pass on value to other javascript code

  var sensitivity = document.getElementById("sensitivity").value;

  //alert("New sensitivity: " + sensitivity);
}

function onFreqChange() {
  //pass on value to other javascript code

  var frequency = document.getElementById("frequency").value;

  //alert("New frequency: " + frequency);
}

function SendMsgToContentScript() {
  chrome.tabs.query({currentWindow: true, active: true}, function(tabs) {
    console.log("Sending message to content script");
    var activeTab = tabs[0];
    chrome.tabs.sendMessage(activeTab.id, "change");
  })
}

document.addEventListener('DOMContentLoaded', function() {

    //Check here if enabled, if not then disable all other inputs

    enableOps = {
      checked: true,
      labels_placement: "both",
      on_label: "Yes",
      off_label: "No",
      width: 25,                 // Width of the button in pixels
      height: 11    ,            // Height of the button in pixels
      button_width: 12          // Width of the sliding part in pixels
    };
    perChannelOps = {
      checked: true,
      labels_placement: "both",
      on_label: "On",
      off_label: "Off",
      width: 25,                 // Width of the button in pixels
      height: 11    ,            // Height of the button in pixels
      button_width: 12          // Width of the sliding part in pixels
    };
    $("input#enable").switchButton(enableOps);
    $("input#enable").change(function() {
      var enabled = this.checked;
      chrome.storage.sync.set({enabled: enabled});
      
      SendMsgToContentScript();
    })
    $("input#perChannel").switchButton(perChannelOps);
    $("input#perChannel").change(function() {
      var enabled = this.checked;
      chrome.storage.sync.set({enabled: enabled});

      SendMsgToContentScript();
    })

    $(function() {
       $( "#frequency-slider" ).slider({
          range: true,
          animate: "fast",
          min: 5,
          max: 40,
          values: [ 15, 20 ],
          slide: function( event, ui ) {
             $("#frequency").val(ui.values[ 0 ] + "Hz - " + ui.values[ 1 ] + "Hz");

             SendMsgToContentScript();
          }
       });
       $( "#frequency" ).val($( "#frequency-slider" ).slider( "values", 0 ) +
         "Hz - " + $( "#frequency-slider" ).slider( "values", 1 ) + "Hz");
    });

    $(function() {
       $( "#sensitivity-slider" ).slider({
          animate: "fast",
          value: 50,
          slide: function( event, ui ) {
             $("#sensitivity").val(ui.value + "%");

             SendMsgToContentScript();
          }
       });
       $( "#sensitivity" ).val($( "#sensitivity-slider" ).slider( "value") + "%");
    });
})
