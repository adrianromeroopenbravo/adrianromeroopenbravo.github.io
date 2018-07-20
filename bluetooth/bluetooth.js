class BluetoothPrinter {

    constructor() {
        this.device = null;
        this.onDisconnected = this.onDisconnected.bind(this);
    }

    request() {
        let options = {
            // "filters": [{
            // }],
            optionalServices: ['e7810a71-73ae-499d-8c15-faa9aef0c3f2'],
            acceptAllDevices: true,
        };
        return navigator.bluetooth.requestDevice(options)
            .then(device => {
                this.device = device;
                this.device.addEventListener('gattserverdisconnected', this.onDisconnected);
            });
    }

    print(data) {
        if (!this.device) {
            return Promise.reject('Device is not connected.');
        }
        return this.device.gatt.connect()
        .then(server => {
            this.server = server;
            return server.getPrimaryService('e7810a71-73ae-499d-8c15-faa9aef0c3f2');
        })
        .then(service => {
            return service.getCharacteristic('bef8d6c9-9c21-4c9e-b632-bd58c1009f9f');
        })
        .then(characteristic => {      
            characteristic.writeValue(data);
        })
        .then(_ => {
            return this.server.disconnect();
        });
    }

    printText(text) {
        let encoder = new TextEncoder('utf-8');         
        return this.writePrinter(encoder.encode(data));        
    }

    printArray(list) {     
        return this.writePrinter(new Uint8Array(list));;        
    }

    onDisconnected() {
        console.log('Device is disconnected.');
    }
}