//Can just access document var directly from here

//alert("Extension is working")

$('img').each(function (idx, img_tag)
{
if (/^.+\.gif$/.test($(img_tag).prop("src")))
{
	var gifFile = new SuperGif({ gif: img_tag, progressbar_height: 0 } );

	gifFile.load(function()
	{
		for (var i = 0; i < gifFile.get_length(); i++)
		{
		   gifFile.move_to(i);

		   var c = gifFile.get_canvas();
		   var ctx=c.getContext("2d");
		   var pixels=ctx.getImageData(0,0,c.width,c.height);

		   console.log("AVG FOR FRAME " + i);
		   test(pixels);
		}
  });
}
});



function test(imgData)
{

	var greySum = 0;
	for (var i=0;i<imgData.data.length;i+=4)
	{
	  var r = imgData.data[i];
	  var g = imgData.data[i+1];
	  var b = imgData.data[i+2];

	  greySum += (r+g+b)/3;
	}

	console.log(greySum/(imgData.data.length / 4));



}
