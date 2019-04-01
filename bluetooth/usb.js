/*
 ************************************************************************************
 * Copyright (C) 2018 Openbravo S.L.U.
 * Licensed under the Openbravo Commercial License version 1.0
 * You may obtain a copy of the License at http://www.openbravo.com/legal/obcl.html
 * or in the legal folder of this module distribution.
 ************************************************************************************
 */

/*global OB, Promise, console */

(function () {

    var USB = function () {
      this.device = null;
      this.onDisconnected = this.onDisconnected.bind(this);
      if (!navigator.usb && navigator.usb.addEventListener) {
        navigator.usb.addEventListener('disconnect', function(event) {
          if (event.device === this.device) {
            this.onDisconnected();
          }
        }.bind(this));
      }
    };

    USB.prototype.connected = function () {
      return this.device !== null;
    };

    USB.prototype.request = function () {
  
      if (!navigator.usb || !navigator.usb.requestDevice) {
        return Promise.reject('USB not supported.');
      }

      return navigator.usb.requestDevice({ filters: [
          { vendorId: 0x04B8, productId: 0x0202 } // Epson TM-T88V
      ] })
      .then(function (device)  {
          this.device = device;
          console.log(device.productName);      // EPSON
          console.log(device.manufacturerName); // TMT88V
          return ;
      }.bind(this));

    };  
    
    USB.prototype.print = function (data) {

      if (!this.device) {
        return Promise.reject('Device is not connected.');
      }

      return this.device.open()
      .then(function () {
        console.log('Configuring');
        return this.device.selectConfiguration(1); // Select configuration #1 for the device.
      }.bind(this))      
      .then(function() {
        console.log('claiming');
        return this.device.claimInterface(0); // Request exclusive control over interface #1.
      }.bind(this))
      .then(function() {
        return OB.ESCPOS.printArray(this.printChunk.bind(this), 64, data);
      }.bind(this))
      .then(function () {
        return this.device.close();
      }.bind(this))
      ['catch'](function(error) {
        this.onDisconnected();
        throw error;
      }.bind(this));
    };

    USB.prototype.printChunk = function (chunk) {
      return function() {
        console.log('tranfering');
        return device.transferOut(1, chunk.buffer) // Waiting for 64 bytes of data from endpoint #5.
      }.bind(this);
    }

    OB.Bluetooth.prototype.onDisconnected = function () {
      this.device = null;
    };

    window.OB = window.OB || {};
    OB.USB = USB;
}());    