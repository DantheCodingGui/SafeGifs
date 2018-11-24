//Can just access document var directly from here

var PERCENTAGE_CHANGE_CUTTOFF = 0.5;
var THRESHOLD_FREQ = 20; 
var WINDOW_SIZE = 0.5;
var WINDOW_VIOLATION_THRESHOLD = 1;

//alert("Extension is working")
class Gif_Frame
{
	constructor(avgI, delay){
		this.avgI = avgI;
		this.delay = delay;
	}
}


$('img').each(function (idx, img_tag)
{
if (/^.+\.(?:G|g)(?:I|i)(?:F|f)$/.test($(img_tag).prop("src")))
{
	processGif($(img_tag).attr("src"), img_tag, onAnalysisComplete)
}
});

function onAnalysisComplete(tag, shouldBlock) {
	if (shouldBlock)
		$(tag)[0].remove()
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
	var gifFrames = new Array();
	for (var i = 0; i < frames.length; ++i)
	{
		var frame = frames[i];

		//Get avg intensity
		var avgI = calcAvgInten(getImgData(frame));
		//Add this frame to our frames array
		gifFrames[i] = new Gif_Frame(avgI, frame.delay);
	}
	
	//Get change spectrum
	return examineChanges(findChanges(gifFrames), gifFrames);
	
	var printOut = true;
	for(var i = 0; i < gifFrames.length; ++i)
	{
		if(printOut)
			console.log("Frame Delay: " + gifFrames[i].delay + " Frame var: " + gifFrames[i].avgI);
	}
	
	return false;
}



function examineChanges(changes, spectrum)
{
	var runtime = calcRuntime(spectrum);
	var numChanges = countChanges(changes);
	
	//If total runtime is less than one second, then just divide num of changes by runtime to see if above threshold
	if(runtime <= 1)
	{
		var changeFreq = numChanges / runtime;
		
		if(changeFreq >= THRESHOLD_FREQ)
		{
			console.log("UNSAFE");
			return true;
		}		
	}
	else
	{
		var dangerFlags = 0;
	
		for(var i = 0; i < changes.length; ++i)
		{
			var curWindowSize = 0;
			
			var j = 0;
			while(curWindowSize < WINDOW_SIZE && i + j < changes.length)
			{
				curWindowSize += spectrum[i + j].delay / 100;
				++j;
			}
			
			var nChangesInWind = 0;
			
			for(var k = i; k < i + j; ++k)
				nChangesInWind += changes[k];
			
			var changeFreq = nChangesInWind / curWindowSize;
			
			if(changeFreq >= THRESHOLD_FREQ)
				++dangerFlags;
			
			if(dangerFlags >= WINDOW_VIOLATION_THRESHOLD)
			{
				console.log("UNSAFE (WINDOW)");
				return true;
			}
			
		}
	}
	
	return false;
}


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
	
	return runtime /= 100;
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

//Calculate the average intensity value over an image defined by an imageData array
function calcAvgInten(imgData)
{
	var greySum = 0;
	for (var i=0;i<imgData.data.length;i+=4)
	{
	  var r = imgData.data[i];
	  var g = imgData.data[i+1];
	  var b = imgData.data[i+2];

	  greySum += (r+g+b)/3;
	}

	return greySum/(imgData.data.length / 4);
}
