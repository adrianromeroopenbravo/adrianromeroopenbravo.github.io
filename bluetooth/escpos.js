(function () {

    window.OB = window.OB || {};
  
    OB.ESCPOS = {
      NEW_LINE: new Uint8Array([0x0D, 0x0A]),
  
      CHAR_SIZE_0: new Uint8Array([0x1D, 0x21, 0x00]),
      CHAR_SIZE_1: new Uint8Array([0x1D, 0x21, 0x01]),
      CHAR_SIZE_2: new Uint8Array([0x1D, 0x21, 0x30]),
      CHAR_SIZE_3: new Uint8Array([0x1D, 0x21, 0x31]),
  
      BOLD_SET: new Uint8Array([0x1B, 0x45, 0x01]),
      BOLD_RESET: new Uint8Array([0x1B, 0x45, 0x00]),
      UNDERLINE_SET: new Uint8Array([0x1B, 0x2D, 0x01]),
      UNDERLINE_RESET: new Uint8Array([0x1B, 0x2D, 0x00]),

      CENTER_JUSTIFICATION: new Uint8Array([0x1B, 0x61, 0x01]),
      LEFT_JUSTIFICATION: new Uint8Array([0x1B, 0x61, 0x00]),
      RIGHT_JUSTIFICATION: new Uint8Array([0x1B, 0x61, 0x02]),

      BAR_HEIGHT: new Uint8Array([0x1D, 0x68, 0x40]),
      BAR_POSITIONDOWN: new Uint8Array([0x1D, 0x48, 0x02]),
      BAR_POSITIONNONE: new Uint8Array([0x1D, 0x48, 0x00]),
      BAR_HRIFONT1: new Uint8Array([0x1D, 0x66, 0x01]),
      BAR_CODE02: new Uint8Array([0x1D, 0x6B, 0x02]),
      BAR_CODE128: new Uint8Array([0x1D, 0x6B, 0x49]),
    };
  }());