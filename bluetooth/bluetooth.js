class BluetoothPrinter {

    constructor() {
      this.device = null;
      this.onDisconnected = this.onDisconnected.bind(this);
    }
    
    request() {
      let options = {
        "filters": [{
            "services": [0xe7810a7173ae499d8c15faa9aef0c3f2],
        }],
        //"optionalServices": [0xe7810a7173ae499d8c15faa9aef0c3f2],
      };
      return navigator.bluetooth.requestDevice(options)
      .then(device => {
        this.device = device;
        this.device.addEventListener('gattserverdisconnected', this.onDisconnected);
      });
    }
    
    connect() {
      if (!this.device) {
        return Promise.reject('Device is not connected.');
      }
      return this.device.gatt.connect();
    }
    
    writePrinter(data) {
      return this.device.gatt.getPrimaryService(0xe7810a7173ae499d8c15faa9aef0c3f2)
      .then(service => service.getCharacteristic(0xbef8d6c99c214c9eb632bd58c1009f9f))
      .then(characteristic => characteristic.writeValue(data));
    }
  
    disconnect() {
      if (!this.device) {
        return Promise.reject('Device is not connected.');
      }
      return this.device.gatt.disconnect();
    }
  
    onDisconnected() {
      console.log('Device is disconnected.');
    }
  }