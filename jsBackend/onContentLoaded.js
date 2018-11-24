//Can just access document var directly from here

importExternalJs("https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js")
importExternalJs("https://cdn.rawgit.com/buzzfeed/libgif-js/master/libgif.js")

//alert("Extension is working")

var images = document.images

for (image in images) {
  // if (typeOf(image.src) != "undefined" && image.src.matches("^.*\.(gif)$"))
  //   placeholder(image, onGifAnalysed)
  placeholder(document, onGifAnalysed)
}


//Potentially scan through all images, check if an instance of gif and pass
//to another file for analysis

function onGifAnalysed(gif, shouldBlockGif) {
  //images.item(gifNum).
  alert("gif analysed and is " + (shouldBlockGif ? "blocked" : "good to go"))
  console.log("gif analysed and is " + (shouldBlockGif ? "blocked" : "good to go"))
}


function importExternalJs(src) {
  var imported = document.createElement("script")
  imported.src = src
  document.head.appendChild(imported)
}

function placeholder(doc, callback) {
  //callback(gif, true)
}
