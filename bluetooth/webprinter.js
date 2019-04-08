/*
 ************************************************************************************
 * Copyright (C) 2018-2019 Openbravo S.L.U.
 * Licensed under the Openbravo Commercial License version 1.0
 * You may obtain a copy of the License at http://www.openbravo.com/legal/obcl.html
 * or in the legal folder of this module distribution.
 ************************************************************************************
 */

/*global OB, Promise, Uint8Array, TextEncoder, DOMParser  */

(function () {

  function padStart(txt, length, character) {
    var result = txt.padStart(length, character);
    if (result.length > length) {
      return result.substring(result.length - length);
    } else {
      return result;
    }
  }

  function padEnd(txt, length, character) {
    var result = txt.padEnd(length, character);
    if (result.length > length) {
      return result.substring(0, length);
    } else {
      return result;
    }
  }

  function padCenter(txt, length, character) {
    var midlength = (length + txt.length) / 2;
    return padEnd(padStart(txt, midlength, character), length, character);
  }

  function getImageData(data) {
    return new Promise(function (resolve, reject) {
      var img = new Image();
      img.src = data.image;
      img.onload = function () {
        var canvas = document.createElement('canvas');
        var width = data.width || 256;
        canvas.width = width;
        canvas.height = img.height;
        var ctx = canvas.getContext('2d');
        if (canvas.width > img.width) {
          ctx.drawImage(img, (canvas.width - img.width) / 2, 0, img.width, img.height);
        } else {
          ctx.drawImage(img, 0, 0, canvas.width, img.height);
        }
        img.style.display = 'none';
        data.imagedata = ctx.getImageData(0, 0, canvas.width, canvas.height);
        resolve(data);
      };
      img.onerror = function (ev) {
        reject(ev);
      };
    });
  }

  var encoder = new TextEncoder('utf-8');

  var WEBPrinter = function (printertype) {
      this.webdevice = new printertype.WebDevice(printertype);
      this.escpos = null;
      };

  WEBPrinter.prototype.connected = function () {
    return this.webdevice.connected();
  };

  WEBPrinter.prototype.request = function () {
    return this.webdevice.request().then(function (deviceinfo) {
      this.escpos = deviceinfo.ESCPOS ? new deviceinfo.ESCPOS() : OB.ESCPOS.standardinst;
    }.bind(this));
  };

  WEBPrinter.prototype.print = function (doc) {

    var parser = new DOMParser();
    var dom = parser.parseFromString(doc, "application/xml");

    if (dom.documentElement.nodeName === "parsererror") {
      return Promise.reject("Error while parsing XML template.");
    }

    return this.processDOM(dom);
  };

  WEBPrinter.prototype.processDOM = function (dom) {
    var result = Promise.resolve();
    var printerdocs;

    Array.from(dom.children).forEach(function (el) {
      if (el.nodeName === 'output') {
        result = result.then(function () {
          return this.processOutput(el);
        }.bind(this)).then(function (output) {
          printerdocs = output;
        }.bind(this));
      }
    }.bind(this));

    return result.then(function () {
      if (printerdocs && printerdocs.length) {
        return this.webdevice.print(printerdocs);
      } else {
        return Promise.resolve(); // Nothing printed
      }
    }.bind(this));
  };

  WEBPrinter.prototype.processOutput = function (dom) {
    var result = Promise.resolve();
    var printerdocs = new Uint8Array();
    Array.from(dom.children).forEach(function (el) {
      if (el.nodeName === 'ticket') {
        result = result.then(function () {
          return this.processTicket(el);
        }.bind(this)).then(function (output) {
          printerdocs = OB.ARRAYS.OB.ARRAYS.append(printerdocs, output);
        }.bind(this));
      } else if (el.nodeName === 'opendrawer') {
        result = result.then(function () {
          printerdocs = OB.ARRAYS.OB.ARRAYS.append(printerdocs, this.escpos.DRAWER_OPEN);
        }.bind(this));
      }
    }.bind(this));
    return result.then(function () {
      return printerdocs;
    }.bind(this));
  };

  WEBPrinter.prototype.processTicket = function (dom) {
    var result = Promise.resolve();
    var printerdoc = new Uint8Array();
    Array.from(dom.children).forEach(function (el) {
      if (el.nodeName === 'line') {
        result = result.then(function () {
          return this.processLine(el);
        }.bind(this)).then(function (output) {
          printerdoc = OB.ARRAYS.OB.ARRAYS.append(printerdoc, output);
          printerdoc = OB.ARRAYS.OB.ARRAYS.append(printerdoc, this.escpos.NEW_LINE);
        }.bind(this));
      } else if (el.nodeName === 'barcode') {
        result = result.then(function () {
          return this.processBarcode(el);
        }.bind(this)).then(function (output) {
          printerdoc = OB.ARRAYS.OB.ARRAYS.append(printerdoc, output);
        }.bind(this));
      } else if (el.nodeName === 'image') {
        result = result.then(function () {
          return this.processImage(el);
        }.bind(this)).then(function (output) {
          printerdoc = OB.ARRAYS.append(printerdoc, output);
        }.bind(this));
      }
    }.bind(this));

    return result.then(function () {
      printerdoc = OB.ARRAYS.append(printerdoc, this.escpos.NEW_LINE);
      printerdoc = OB.ARRAYS.append(printerdoc, this.escpos.NEW_LINE);
      printerdoc = OB.ARRAYS.append(printerdoc, this.escpos.NEW_LINE);
      printerdoc = OB.ARRAYS.append(printerdoc, this.escpos.NEW_LINE);
      printerdoc = OB.ARRAYS.append(printerdoc, this.escpos.PARTIAL_CUT_1);
      return printerdoc;
    }.bind(this));
  };

  WEBPrinter.prototype.processLine = function (dom) {
    var line = new Uint8Array();
    var fontsize = dom.getAttribute('size');

    if (fontsize === '1') {
      line = OB.ARRAYS.append(line, this.escpos.CHAR_SIZE_1);
    } else if (fontsize === '2') {
      line = OB.ARRAYS.append(line, this.escpos.CHAR_SIZE_2);
    } else if (fontsize === '3') {
      line = OB.ARRAYS.append(line, this.escpos.CHAR_SIZE_3);
    } else {
      line = OB.ARRAYS.append(line, this.escpos.CHAR_SIZE_0);
    }

    Array.from(dom.children).forEach(function (el) {
      if (el.nodeName === 'text') {
        var txt = el.textContent;
        var len = parseInt(el.getAttribute('length'), 10) || txt.length;
        var align = el.getAttribute('align');
        var bold = el.getAttribute('bold');
        var uderline = el.getAttribute('underline');

        if (align === 'right') {
          txt = padStart(txt, len);
        } else if (align === 'center') {
          txt = padCenter(txt, len);
        } else {
          txt = padEnd(txt, len);
        }

        if (bold === 'true') {
          line = OB.ARRAYS.append(line, this.escpos.BOLD_SET);
        }
        if (uderline === 'true') {
          line = OB.ARRAYS.append(line, this.escpos.UNDERLINE_SET);
        }
        line = OB.ARRAYS.append(line, encoder.encode(txt));
        if (bold === 'true') {
          line = OB.ARRAYS.append(line, this.escpos.BOLD_RESET);
        }
        if (uderline === 'true') {
          line = OB.ARRAYS.append(line, this.escpos.UNDERLINE_RESET);
        }
      }
    }.bind(this));

    return Promise.resolve(line);
  };

  WEBPrinter.prototype.processBarcode = function (el) {
    var line = new Uint8Array();
    var position = el.getAttribute('position');
    var type = el.getAttribute('type');
    var barcode = el.textContent;

    line = OB.ARRAYS.append(line, this.escpos.CENTER_JUSTIFICATION);

    line = OB.ARRAYS.append(line, this.escpos.NEW_LINE);
    line = OB.ARRAYS.append(line, this.escpos.BAR_HEIGHT);
    if (position === 'none') {
      line = OB.ARRAYS.append(line, this.escpos.BAR_POSITIONNONE);
    } else {
      line = OB.ARRAYS.append(line, this.escpos.BAR_POSITIONDOWN);
    }

    if (type === 'EAN13') {
      line = OB.ARRAYS.append(line, this.escpos.BAR_WIDTH3);

      line = OB.ARRAYS.append(line, this.escpos.BAR_HRIFONT1);
      line = OB.ARRAYS.append(line, this.escpos.BAR_CODE02);

      barcode = padStart(barcode, 13, '0');
      barcode = barcode.substring(0, 12);
      line = OB.ARRAYS.append(line, encoder.encode(barcode));
      line = OB.ARRAYS.append(line, new Uint8Array([0x00]));
    } else if (type === 'CODE128') {
      if (barcode.length > 14) {
        line = OB.ARRAYS.append(line, this.escpos.BAR_WIDTH1);
      } else if (barcode.length > 8) {
        line = OB.ARRAYS.append(line, this.escpos.BAR_WIDTH2);
      } else {
        line = OB.ARRAYS.append(line, this.escpos.BAR_WIDTH3);
      }
      line = OB.ARRAYS.append(line, this.escpos.BAR_HRIFONT1);
      line = OB.ARRAYS.append(line, this.escpos.BAR_CODE128);

      var barcode128 = this.escpos.transCode128(barcode);
      line = OB.ARRAYS.append(line, new Uint8Array([barcode128.length + 2]));
      line = OB.ARRAYS.append(line, this.escpos.BAR_CODE128TYPE);
      line = OB.ARRAYS.append(line, barcode128);
      line = OB.ARRAYS.append(line, new Uint8Array([0x00]));
    } else { // Unknown barcode type
      line = OB.ARRAYS.append(line, encoder.encode(type));
      line = OB.ARRAYS.append(line, encoder.encode(': '));
      line = OB.ARRAYS.append(line, encoder.encode(barcode));
    }

    line = OB.ARRAYS.append(line, this.escpos.NEW_LINE);
    line = OB.ARRAYS.append(line, this.escpos.LEFT_JUSTIFICATION);
    return Promise.resolve(line);
  };

  WEBPrinter.prototype.processQR = function (el) {
    var quality = el.getAttribute('quality') || 'L';
    var size = el.getAttribute('size') || 'M';
    var code = encoder.encode(el.textContent);
    return Promise.resolve(this.escpos.transQR(code, quality, size));
  };

  WEBPrinter.prototype.processImage = function (el) {
    return getImageData({
      image: el.textContent,
      width: this.escpos.IMAGE_WIDTH
    }).then(function (result) {
      return this.escpos.transImage(result.imagedata);
    }.bind(this));
  };

  window.OB = window.OB || {};
  OB.WEBPrinter = WEBPrinter;
}());