//Can just access document var directly from here

//alert("Extension is working")
class Gif_Frame
{
	constructor(avgInten, delay){
		this.avgInten = avgInten;
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
	
	
	
	
	
	
	var printOut = true;
	for(var i = 0; i < gifFrames.length; ++i)
	{
		if(printOut)
			console.log("Frame Delay: " + gifFrames[i].delay + " Frame int: " + gifFrames[i].avgInten);
	}
	
		return false;

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
