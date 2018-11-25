
var ENABLED;
//This controls how sensitive to changes in intensity the system is.
// A percentage change greater than this between successive frames counts as a change
var PERCENTAGE_CHANGE_CUTTOFF = 0.5;
//Range of change frequencies that are considered to be dangerous
var THRESHOLD_LOW_FREQ = 5;
var THRESHOLD_HIGH_FREQ = 40;
//Size of the sliding window (in secs) to use for examining gifs with duration > 1 second
var WINDOW_SIZE = 0.5;
//The number of windows in which a dangerous change frequency is detected, required to consider the entire image dangerous
var WINDOW_VIOLATION_THRESHOLD = 1;
//Should flashes be looked for in each colour channel separately or just in overall intensity
var PER_CHANNEL_MODE = true;

var DEBUG = false;

//alert("Extension is working")
class Gif_Frame
{
	constructor(avgI, delay)
	{
		this.avgI = avgI;
		this.delay = delay;
	}
}

class GIF_CUSTOM
{
	constructor(v1, v2){
		this.v1 = v1;
		this.v2 = v2;
	}
}




chrome.runtime.onMessage.addListener(
      function(request, sender, sendResponse) {
		loadSettings();
      }
    );




var gifs = new Array();
loadSettings()


var settingRead_enabled = false;
var settingRead_lowerFreq = false;
var settingRead_upperFreq = false;
var settingRead_sensitivity = false;

function settingsLoaded()
{
	return settingRead_enabled && settingRead_lowerFreq && settingRead_upperFreq && settingRead_sensitivity ;
}

function loadSettings()
{
	settingRead_enabled = settingRead_lowerFreq = settingRead_upperFreq = settingRead_sensitivity = false;

	var key = "enabled";
	key = 'a'.key;
	chrome.storage.sync.get(key, function(data) {
		ENABLED = data.key;
		settingRead_enabled = true;



		if(settingsLoaded())
			startAnalysis();
	});


	var key1 = "frequency_lower";
	key1 = 'a'.key1;

	chrome.storage.sync.get(key1, function(data) {
		THRESHOLD_LOW_FREQ = data.key2;
		settingRead_lowerFreq = true;


		if(settingsLoaded())
			startAnalysis();
	});

	var key2 = "frequency_upper";
		key2 = 'a'.key2;

	chrome.storage.sync.get(key2, function(data) {
		THRESHOLD_HIGH_FREQ = data.key3;
		settingRead_upperFreq = true;



		if(settingsLoaded())
			startAnalysis();
	});

		var key3 = "sensitivity";
			key3 = 'a'.key3;

	chrome.storage.sync.get(key3, function(data) {
		PERCENTAGE_CHANGE_CUTTOFF = data.key4 / 100;
		settingRead_sensitivity = true;



		if(settingsLoaded())
			startAnalysis();
	});

		var key4=  "perChannel";
		key4= 'a'.key4;


	chrome.storage.sync.get(key4, function(data) {
		var tmp = data.key1;

	});
}

function startAnalysis()
{

	if(!ENABLED)
	{
		if(gifs.length > 0)
		{
			console.log("show them");
			for(var i = 0; i <gifs.length; ++i)
				$(gifs[i].v2).eq(0).show()
		}
		
		return;
	}

	gifs = [];
	var k = 0;
	$('img').each(function (idx, img_tag)
	{

		if (/^.+\.(?:G|g)(?:I|i)(?:F|f)$/.test($(img_tag).prop("src")))
		{
			$(img_tag).hide()
			gifs[k++]=  new GIF_CUSTOM($(img_tag).attr("src"), img_tag);
			processGif($(img_tag).attr("src"), img_tag, onAnalysisComplete)
		}
	});
}


//Callback when gif has been processed
function onAnalysisComplete(tag, shouldBlock)
{
	if (!shouldBlock)
		$(tag).eq(0).show()
}


//Grab frames from the gif and pass them on to be tested
function processGif(url, imageTag, callback)
{
	var gif;
	var oReq = new XMLHttpRequest();
	oReq.open("GET", url, true);
	oReq.responseType = "arraybuffer";

	oReq.onload = function (oEvent)
	{
	    var arrayBuffer = oReq.response;
	    if (arrayBuffer)
		{
	        gif = new GIF(arrayBuffer);
	        var frames = gif.decompressFrames(true);

			//Once frames have been received, it is time to examine them
			callback(imageTag, examineFrames(frames));
	    }
	};
	oReq.send(null);
}



function examineFrames(frames)
{
	//Loop through all frames in the gif and create a Gif_Frame for each consisting of the frames avg intensity and delay time
	var spectrumR = new Array();
	var spectrumG = new Array();
	var spectrumB = new Array();
	var spectrumGrey = new Array();


	for (var i = 0; i < frames.length; ++i)
	{
		var frame = frames[i];

		if(PER_CHANNEL_MODE)
		{
			var imgData = getImgData(frame);

			//Get avg intensity specrta and delay times
			var avgR = calcAvgInten(imgData, CHANNEL.RED);
			spectrumR[i] = new Gif_Frame(avgR, frame.delay);

			var avgG = calcAvgInten(imgData, CHANNEL.GREEN);
			spectrumG[i] = new Gif_Frame(avgG, frame.delay);

			var avgB = calcAvgInten(imgData, CHANNEL.BLUE);
			spectrumB[i] = new Gif_Frame(avgB, frame.delay);
		}
		else
		{
			//Get avg intensity
			var avgI = calcAvgGreyInten(getImgData(frame));
			//Add this frame to our frames array
			spectrumGrey[i] = new Gif_Frame(avgI, frame.delay);


		}


	}

	//In per channel mode, a violation in any channel will result in the gif being flagged as dangerous
	if(PER_CHANNEL_MODE)
	{
		return examineChanges(findChanges(spectrumR), spectrumR) ||
		examineChanges(findChanges(spectrumG), spectrumG) ||
		examineChanges(findChanges(spectrumB), spectrumB);
	}
	//In non channel mode all we care about is violations in average overall instensity
	else
		return examineChanges(findChanges(spectrumGrey), spectrumGrey);
}



function examineChanges(changes, spectrum)
{
	var runtime = calcRuntime(spectrum);
	var numChanges = countChanges(changes);

	//If total runtime is less than one second, then just divide num of changes by runtime to see if above threshold
	if(runtime <= 1)
	{
		var changeFreq = numChanges / runtime;

		//Is the frequency of changes in intensity within the danger zone
		if(changeFreq >= THRESHOLD_LOW_FREQ && changeFreq <= THRESHOLD_HIGH_FREQ)
		{
			if(DEBUG)
				console.log("Freq: " + changeFreq);

			return true;
		}
		else
			console.log("Freq: " + changeFreq);

	}
	else
	{
		var dangerFlags = 0;
		for(var i = 0; i < changes.length; ++i)
		{
			var curWindowSize = 0;

			//Figure out how long a window we can take is in seconds and how big it is in number of data points
			var j = 0;
			while((curWindowSize < WINDOW_SIZE) && (i + j < changes.length))
			{
				curWindowSize += (spectrum[i + j].delay / 1000);
				++j;
			}

			//If we are already far enough along the spectrum that we cant take full windows, then there there is no more information to be attained so break out
			if(j == 0)
				break;

			//Count the number of changes in the window
			var nChangesInWind = 0;
			for(var k = i; k < i + j; ++k)
				nChangesInWind += changes[k];

			//Get frequency of changes
			var changeFreq = nChangesInWind / curWindowSize;

			//Is the frequency of changes in intensity within the danger zone
			if(changeFreq >= THRESHOLD_LOW_FREQ && changeFreq <= THRESHOLD_HIGH_FREQ)
				++dangerFlags;
			else if(DEBUG)
				console.log("Widnow Freq: " + changeFreq);

			if(dangerFlags >= WINDOW_VIOLATION_THRESHOLD)
			{
				if(DEBUG)
					console.log("Danger flags: " + dangerFlags);

				return true;
			}
		}
	}
	return false;
}


//Count the number of changes present in a spectrum
function countChanges(changes)
{
	var nChanges = 0;

	for(var i = 0; i < changes.length; ++i)
		nChanges+=changes[i];

	return nChanges;
}


//Get gif runtime in seconds
function calcRuntime(spectrum)
{
	//Get total runtime in 1/100ths of a second
	var runtime = 0;
	for(var i = 0; i < spectrum.length; ++i)
	{
		runtime += spectrum[i].delay;
	}

	return (runtime / 1000);
}

//Walk through the intensity spectrum detecting changes in avg intensity between successive frames above a set threshold
function findChanges(spectrum)
{
	var changes = new Array();
	changes[0] = 0;

	for(var i = 1; i < spectrum.length; ++i)
	{
		//Get abs percentage change in intensity per frame
		var diff = Math.abs(spectrum[i].avgI - spectrum[i - 1].avgI);
		var percDiff = diff / spectrum[i - 1].avgI;

		//If above cuttoff, mark this as a change event
		if(percDiff >= PERCENTAGE_CHANGE_CUTTOFF)
			changes[i] = 1;
		else
			changes[i] = 0;

	}

	return changes;
}


//Convert frame data into html canvas image data
function getImgData(frame)
{
	var tempCanvas = document.createElement('canvas');
	var tempCtx = tempCanvas.getContext('2d');
	var frameImageData;
	var dims = frame.dims;

	tempCanvas.width = dims.width;
	tempCanvas.height = dims.height;
	frameImageData = tempCtx.createImageData(dims.width, dims.height);
	frameImageData.data.set(frame.patch);

	return frameImageData;
}



var CHANNEL = Object.freeze({"RED":1, "GREEN":2, "BLUE":3, "GREY":4});
//Calculate the average intensity value over an image defined by an imageData array in a given colour channel
function calcAvgInten(imgData, mode)
{
	var colIndex;
	switch(mode)
	{
		case CHANNEL.RED:
			colIndex = 0;
			break;
		case CHANNEL.GREEN:
			colIndex = 1;
			break;
		case CHANNEL.BLUE:
			colIndex = 2;
			break;
		default:
			return calcAvgGreyInten(imgData);
			break;
	}


	var sum = 0;
	for (var i=0;i<imgData.data.length;i+=4)
	{
		sum += imgData.data[i + colIndex];
	}

	//Divide by 4 as each pixel takes up 4 values in the imgData array [rgba]
	return sum/(imgData.data.length / 4);
}


//Calculate the average intensity value over an image defined by an imageData array averaged over RGB channels
function calcAvgGreyInten(imgData)
{
	var greySum = 0;
	for (var i=0;i<imgData.data.length;i+=4)
	{
	  var r = imgData.data[i];
	  var g = imgData.data[i+1];
	  var b = imgData.data[i+2];

	  greySum += (r+g+b)/3;
	}

	//Divide by 4 as each pixel takes up 4 values in the imgData array [rgba]
	return greySum/(imgData.data.length / 4);
}
