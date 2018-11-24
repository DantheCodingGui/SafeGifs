//Can just access document var directly from here

//alert("Extension is working")

var shouldBlock;

$('img').each(function (idx, img_tag)
{
if (/^.+\.(?:G|g)(?:I|i)(?:F|f)$/.test($(img_tag).prop("src")))
{
	loadGIF($(img_tag).attr("src"))



	shouldBlock = false;

  if (shouldBlock)
    $(img_tag)[0].remove()
}
});








class Gif_Frame
{
	constructor(avgInten, delay){
		this.avgInten = avgInten;
		this.delay = delay;
	}

}



// user canvas
// gif patch canvas
var tempCanvas = document.createElement('canvas');
var tempCtx = tempCanvas.getContext('2d');
// full gif canvas
var gifCanvas = document.createElement('canvas');
var gifCtx = gifCanvas.getContext('2d');

loadGIF();
var gif;
var counter = 0;
// load a gif with the current input url value
function loadGIF(url)
{

	console.log(counter);
	counter++;

	var oReq = new XMLHttpRequest();
	oReq.open("GET", url, true);
	oReq.responseType = "arraybuffer";

	oReq.onload = function (oEvent) {
	    var arrayBuffer = oReq.response; // Note: not oReq.responseText
	    if (arrayBuffer) {
	        gif = new GIF(arrayBuffer);
	        var frames = gif.decompressFrames(true);

			processGif(frames);
	    }
	};
	oReq.send(null);
}





function processGif(frames)
{
	//Loop through all frames, for each frame calculate the avg intensity and delay

	var gifFrames = new Array();

	for (var i = 0; i < frames.length; ++i)
	{

		var frame = frames[i];


		//Get avg intensity
		var avgInten = calcAvgInten(getImgData(frame));
		//Add this frame to our frames array
		//var gf = new Gif_Frame(avgInten, frame.delay);
	//	console.log("Frame Delay: " + gf.delay + " Frame int: " + gf.avgInten);
		gifFrames[i] = new Gif_Frame(avgInten, frame.delay);


	}

	var printOut = false;

	for(var i = 0; i < gifFrames.length; ++i)
	{
		if(printOut)
			console.log("Frame Delay: " + gifFrames[i].delay + " Frame int: " + gifFrames[i].avgInten);
	}

}

function getImgData(frame)
{
	var frameImageData;
	var dims = frame.dims;


	tempCanvas.width = dims.width;
	tempCanvas.height = dims.height;
	frameImageData = tempCtx.createImageData(dims.width, dims.height);

	// set the patch data as an override
	frameImageData.data.set(frame.patch);

	// draw the patch back over the canvas
	tempCtx.putImageData(frameImageData, 0, 0);

	gifCtx.drawImage(tempCanvas, dims.left, dims.top);


	return frameImageData;
}

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
