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

    writePrinter(data) {
        if (!this.device) {
            return Promise.reject('Device is not connected.');
        }
        return this.device.gatt.connect()
        .then(server => {
            alert('connected');
            this.server = server;
            return server.getPrimaryService('e7810a71-73ae-499d-8c15-faa9aef0c3f2');
        })
        .then(service => {
            return service.getCharacteristic('bef8d6c9-9c21-4c9e-b632-bd58c1009f9f');
        })
        .then(characteristic => {
            alert ('got characteristic');
            characteristic.writeValue(data);
        })
        .then(_ => {
            return this.server.disconnect();
        })        
        .catch(error => {
            alert(error);
        });        
    }

    writePrinterEncoded(data) {
        if (!this.device) {
            return Promise.reject('Device is not connected.');
        }
        return this.device.gatt.connect()
        .then(server => {
            alert('connected');
            this.server = server;
            return server.getPrimaryService('e7810a71-73ae-499d-8c15-faa9aef0c3f2');
        })
        .then(service => {
            return service.getCharacteristic('bef8d6c9-9c21-4c9e-b632-bd58c1009f9f');
        })
        .then(characteristic => {
            alert ('got characteristic');
            let encoder = new TextEncoder('utf-8');         
            characteristic.writeValue(encoder.encode(data));
        })
        .then(_ => {
            return this.server.disconnect();
        })
        .catch(error => {
            alert(error);
        });
    }

    disconnect() {
        if (!this.server) {
            return Promise.reject('Device is not connected.');
        }
        return server.disconnect();
    }

    onDisconnected() {
        alert('Device is disconnected.');
    }
}