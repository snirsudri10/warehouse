var barcodes = [];

function mode(array)
{
    if(array.length == 0)
        return null;
    var modeMap = {};
    var maxEl = array[0], maxCount = 1;
    for(var i = 0; i < array.length; i++)
    {
        var el = array[i];
        if(modeMap[el] == null)
            modeMap[el] = 1;
        else
            modeMap[el]++;  
        if(modeMap[el] > maxCount)
        {
            maxEl = el;
            maxCount = modeMap[el];
        }
    }
    return maxEl;
}

function init() {
    console.log("started init");
    document.querySelector('#barcode').value = "";
    if(document.getElementById("camera") === null){
        var div = document.createElement("div");
        div.id = "camera"
        div.className = "camera"
        document.body.appendChild(div);
    }
    Quagga.init({
        inputStream : {
          name : "Live", 
          type : "LiveStream",
          target: document.querySelector('#camera')
        },
        decoder : {
          readers : ["code_128_reader",
                    "ean_reader",]
        }
      }, function(err) {
          if (err) {
              console.log(err);
              return
          }
          console.log("Initialization finished. Ready to start");
          Quagga.start();
          barcodes = [];

    });
    Quagga.onDetected(function(data){
        barcodes.push(data.codeResult.code);
        console.log(mode(barcodes));
        console.log(barcodes);
        document.querySelector('#barcode').value = mode(barcodes);
     });
}

function stopScan() {
    if(document.querySelector("#camera")){
        document.querySelector("#camera").remove();
        barcodes = [];
        Quagga.stop();
    }
}
