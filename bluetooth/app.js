var bltprinter = new OB.BluetoothPrinter();
bltprinter.registerImage('ticket-image.png');

document.getElementById('usbrequest').addEventListener('click', event => {
    navigator.usb.requestDevice({ filters: [{ vendorId: 0x04B8 }] })
    .then(device => {
      console.log(device.productName);      // EPSON
      console.log(device.manufacturerName); // TMT88V
      console.dir(device);
    })
    .catch(error => { console.log(error); });
});

document.getElementById('request').addEventListener('click', event => {
    bltprinter.request()
    .catch(error => {
        alert(error);
    });
});

document.getElementById('printreceipt').addEventListener('click', event => {
    bltprinter.print(document.getElementById('datareceipt').value)
    .then(_ => {
        console.log("success");
    })
    .catch(error => { 
        alert(error);
    });
});

document.getElementById('imagemanipulation').addEventListener('click', event => {

/*     var img = new Image();

    img.src = 'ticket-image.png';
    img.onload = _ => {
      var canvas =  document.createElement('canvas');
      var ctx = canvas.getContext('2d');        
      ctx.drawImage(img, 0, 0);
      img.style.display = 'none';
      var imgdata = ctx.getImageData(0, 0, canvas.width, canvas.height);
      console.dir(imgdata);

      
    }; */

    Promise.resolve({image: 'ticket-image.png'})
    .then(getImageData)
    .then(function (result) {
        console.dir(result.imagedata);
    })
    .catch(function(ex) {
        console.dir(ex);
    });
});

function getImageData(data) {
    return new Promise(function (resolve, reject) {
        var img = new Image();
        img.src = data.image;
        img.onload = function () {
            var canvas =  document.createElement('canvas');
            var ctx = canvas.getContext('2d');        
            ctx.drawImage(img, 0, 0);
            img.style.display = 'none';
            data.imagedata = ctx.getImageData(0, 0, canvas.width, canvas.height);
            resolve(data);
        };
        img.onerror = function (ev) {
            reject(ev);
        }
    });
}
