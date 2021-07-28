/**
 * @file Density Cif Parser
 * @author David Sehnal dsehnal <alexander.rose@weirdbyte.de>
 * Modified by Jiyao Wang / https://github.com/ncbi/icn3d
 */

import {UtilsCls} from '../../utils/utilsCls.js';

import {ParserUtils} from '../parsers/parserUtils.js';
import {SetOption} from '../display/setOption.js';

class DensityCifParser {
    constructor(icn3d) {
        this.icn3d = icn3d;
    }

    densityCifParser(pdbid, type, sigma, emd) { let  ic = this.icn3d, me = ic.icn3dui;
       let  thisClass = this;

       let  url;
       let  detail = (me.utilsCls.isMobile() || ic.icn3dui.cfg.notebook) ? 0 : 4; //4;

       //https://www.ebi.ac.uk/pdbe/densities/doc.html
       if(type == '2fofc' || type == 'fofc') {
           url = "https://www.ebi.ac.uk/pdbe/densities/x-ray/" + pdbid.toLowerCase() + "/cell?detail=" + detail;
       }
       else if(type == 'em') {
           url = "https://www.ebi.ac.uk/pdbe/densities/emd/" + emd.toLowerCase() + "/cell?detail=" + detail;
       }

       //var bCid = undefined;

        //https://stackoverflow.com/questions/33902299/using-jquery-ajax-to-download-a-binary-file
        if(type == '2fofc' && ic.bAjax2fofc) {
            ic.mapData.sigma2 = sigma;
            ic.setOptionCls.setOption('map', type);
        }
        else if(type == 'fofc' && ic.bAjaxfofc) {
            ic.mapData.sigma = sigma;
            ic.setOptionCls.setOption('map', type);
        }
        else if(type == 'em' && ic.bAjaxEm) {
            ic.mapData.sigmaEm = sigma;
            ic.setOptionCls.setOption('emmap', type);
        }
        else {
            let  oReq = new XMLHttpRequest();
            oReq.open("GET", url, true);
            oReq.responseType = "arraybuffer";

            oReq.onreadystatechange = function() {
                if (this.readyState == 4) {
                   //ic.hideLoading();

                   if(this.status == 200) {
                       let  arrayBuffer = oReq.response;

                       thisClass.parseChannels(arrayBuffer, type, sigma);

                       if(type == '2fofc' || type == 'fofc') {
                           ic.bAjax2fofc = true;
                           ic.bAjaxfofc = true;

                           ic.setOptionCls.setOption('map', type);
                       }
                       else if(type == 'em') {
                           ic.bAjaxEm = true;

                           ic.setOptionCls.setOption('emmap', type);
                       }
                    }
                    else {
                       if(type == '2fofc' || type == 'fofc') {
                           alert("Density server at EBI has no corresponding electron density map for this structure.");
                       }
                       else if(type == 'em') {
                           alert("Density server at EBI has no corresponding EM density map for this structure.");
                       }
                    }

                    if(ic.deferredEmmap !== undefined) ic.deferredEmmap.resolve();
                }
                else {
                    ic.ParserUtilsCls.showLoading();
                }
            };

            oReq.send();
        }
    }

    parseChannels(densitydata, type, sigma) { let  ic = this.icn3d, me = ic.icn3dui;
        let  cif = this.BinaryParse(densitydata);

        if(type == '2fofc' || type == 'fofc') {
            let  twoDensity = this.getChannel(cif, '2FO-FC');
            let  oneDensity = this.getChannel(cif, 'FO-FC');

            // '2fofc'
            let  density = twoDensity;
            let  sampleCount = density.box.sampleCount;
            let  header = {xExtent: sampleCount[0], yExtent: sampleCount[1], zExtent: sampleCount[2], mean: density.valuesInfo.mean, sigma: density.valuesInfo.sigma};
            ic.mapData.header2 = header;

            ic.mapData.data2 = density.data;

            let  origin = density.box.origin;
            let  dimensions = density.box.dimensions;
            let  basis = density.spacegroup.basis;
            let  scale = new THREE.Matrix4().makeScale(
                dimensions[0] / (sampleCount[0] ),
                dimensions[1] / (sampleCount[1] ),
                dimensions[2] / (sampleCount[2] ));
            let  translate = new THREE.Matrix4().makeTranslation(origin[0], origin[1], origin[2]);
            let  fromFrac = new THREE.Matrix4().set(
                basis.x[0], basis.y[0], basis.z[0], 0.0,
                0.0, basis.y[1], basis.z[1], 0.0,
                0.0, 0.0, basis.z[2], 0.0,
                0.0, 0.0, 0.0, 1.0);

            //var toFrac = new LiteMol.Visualization.THREE.Matrix4().getInverse(fromFrac);
            let  matrix = fromFrac.multiply(translate).multiply(scale);

            ic.mapData.matrix2 = matrix;

            ic.mapData.type2 = type;
            ic.mapData.sigma2 = sigma;

            // 'fofc'
            density = oneDensity;
            sampleCount = density.box.sampleCount;
            header = {xExtent: sampleCount[0], yExtent: sampleCount[1], zExtent: sampleCount[2], mean: density.valuesInfo.mean, sigma: density.valuesInfo.sigma};
            ic.mapData.header = header;

            ic.mapData.data = density.data;

            origin = density.box.origin;
            dimensions = density.box.dimensions;
            basis = density.spacegroup.basis;
            scale = new THREE.Matrix4().makeScale(
                dimensions[0] / (sampleCount[0] ),
                dimensions[1] / (sampleCount[1] ),
                dimensions[2] / (sampleCount[2] ));
            translate = new THREE.Matrix4().makeTranslation(origin[0], origin[1], origin[2]);
            fromFrac = new THREE.Matrix4().set(
                basis.x[0], basis.y[0], basis.z[0], 0.0,
                0.0, basis.y[1], basis.z[1], 0.0,
                0.0, 0.0, basis.z[2], 0.0,
                0.0, 0.0, 0.0, 1.0);
            //var toFrac = new LiteMol.Visualization.THREE.Matrix4().getInverse(fromFrac);
            matrix = fromFrac.multiply(translate).multiply(scale);
            ic.mapData.matrix = matrix;

            ic.mapData.type = type;
            ic.mapData.sigma = sigma;
        }
        else if(type == 'em') {
            let  density = this.getChannel(cif, 'EM');

            let  sampleCount = density.box.sampleCount;
            let  header = {xExtent: sampleCount[0], yExtent: sampleCount[1], zExtent: sampleCount[2], max: density.valuesInfo.max, min: density.valuesInfo.min};
            ic.mapData.headerEm = header;

            ic.mapData.dataEm = density.data;

            let  origin = density.box.origin;
            let  dimensions = density.box.dimensions;
            let  basis = density.spacegroup.basis;
            let  scale = new THREE.Matrix4().makeScale(
                dimensions[0] / (sampleCount[0] ),
                dimensions[1] / (sampleCount[1] ),
                dimensions[2] / (sampleCount[2] ));
            let  translate = new THREE.Matrix4().makeTranslation(origin[0], origin[1], origin[2]);
            let  fromFrac = new THREE.Matrix4().set(
                basis.x[0], basis.y[0], basis.z[0], 0.0,
                0.0, basis.y[1], basis.z[1], 0.0,
                0.0, 0.0, basis.z[2], 0.0,
                0.0, 0.0, 0.0, 1.0);
            //var toFrac = new LiteMol.Visualization.THREE.Matrix4().getInverse(fromFrac);
            let  matrix = fromFrac.multiply(translate).multiply(scale);
            ic.mapData.matrixEm = matrix;

            ic.mapData.typeEm = type;
            ic.mapData.sigmaEm = sigma;
        }
    }

    getChannel(data, name) { let  ic = this.icn3d, me = ic.icn3dui;
        //var block = data.dataBlocks.filter(b => b.header === name)[0];
        //var block = data.dataBlocks.filter(b => b.id === name)[0];

        let  jsonData = data.toJSON();

        let  block;
        for(let i = 0, il = jsonData.length; i < il; ++i) {
            if(jsonData[i].id == name) block = data.dataBlocks[i];
        }

        let  density = this.CIFParse(block);

        return density;
    }

    CIFParse(block) { let  ic = this.icn3d, me = ic.icn3dui;
        let  info = block.getCategory('_volume_data_3d_info');

        if (!info) {
            conole.log('_volume_data_3d_info category is missing.');
            return undefined;
        }
        if (!block.getCategory('_volume_data_3d')) {
            conole.log('_volume_data_3d category is missing.');
            return undefined;
        }

        function getVector3(name) {
            let  ret = [0, 0, 0];
            for (let i = 0; i < 3; i++) {
                ret[i] = info.getColumn(name + '[' + i + ']').getFloat(0);
            }
            return ret;
        }

        function getNum(name) { return info.getColumn(name).getFloat(0); }

        let  header = {
            name: info.getColumn('name').getString(0),
            axisOrder: getVector3('axis_order'),

            origin: getVector3('origin'),
            dimensions: getVector3('dimensions'),

            sampleCount: getVector3('sample_count'),

            spacegroupNumber: getNum('spacegroup_number') | 0,
            cellSize: getVector3('spacegroup_cell_size'),
            cellAngles: getVector3('spacegroup_cell_angles'),

            mean: getNum('mean_sampled'),
            sigma: getNum('sigma_sampled')
        };

        let  indices = [0, 0, 0];
        indices[header.axisOrder[0]] = 0;
        indices[header.axisOrder[1]] = 1;
        indices[header.axisOrder[2]] = 2;

        function normalizeOrder(xs) {
            return [xs[indices[0]], xs[indices[1]], xs[indices[2]]];
        }

        function readValues(col, xyzSampleCount, sampleCount, axisIndices) {
            let  data = new Float32Array(xyzSampleCount[0] * xyzSampleCount[1] * xyzSampleCount[2]);
            let  coord = [0, 0, 0];
            let  iX = axisIndices[0], iY = axisIndices[1], iZ = axisIndices[2];
            let  mX = sampleCount[0], mY = sampleCount[1], mZ = sampleCount[2];


            let  xSize = xyzSampleCount[0];
            let  xySize = xyzSampleCount[0] * xyzSampleCount[1];

            let  zSize = xyzSampleCount[2];
            let  yzSize = xyzSampleCount[1] * xyzSampleCount[2];

            let  offset = 0;
            let  min = col.getFloat(0), max = min;

            for (let cZ = 0; cZ < mZ; cZ++) {
                coord[2] = cZ;
                for (let cY = 0; cY < mY; cY++) {
                    coord[1] = cY;
                    for (let cX = 0; cX < mX; cX++) {
                        coord[0] = cX;
                        let  v = col.getFloat(offset);
                        offset += 1;
                        //data[coord[iX] + coord[iY] * xSize + coord[iZ] * xySize] = v;
                        data[coord[iZ] + coord[iY] * zSize + coord[iX] * yzSize] = v;
                        if (v < min) min = v;
                        else if (v > max) max = v;
                    }
                }
            }

            return { data: data, min: min, max: max };
        }

        function createSpacegroup(number, size, angles) {
            let  alpha = (Math.PI / 180.0) * angles[0], beta = (Math.PI / 180.0) * angles[1], gamma = (Math.PI / 180.0) * angles[2];
            let  xScale = size[0], yScale = size[1], zScale = size[2];

            let  z1 = Math.cos(beta),
                  z2 = (Math.cos(alpha) - Math.cos(beta) * Math.cos(gamma)) / Math.sin(gamma),
                  z3 = Math.sqrt(1.0 - z1 * z1 - z2 * z2);

            let  x = [xScale, 0.0, 0.0];
            let  y = [Math.cos(gamma) * yScale, Math.sin(gamma) * yScale, 0.0];
            let  z = [z1 * zScale, z2 * zScale, z3 * zScale];

            return {
                number: number,
                size: size,
                angles: angles,
                basis: { x: x, y: y, z: z }
            };
        }

        let  sampleCount = normalizeOrder(header.sampleCount);

        let  rawData = readValues(block.getCategory('_volume_data_3d').getColumn('values'), sampleCount, header.sampleCount, indices);
        //var field = new Field3DZYX(rawData.data, sampleCount);

        let  data = {
            name: header.name,
            spacegroup: createSpacegroup(header.spacegroupNumber, header.cellSize, header.cellAngles),
            box: {
                origin: normalizeOrder(header.origin),
                dimensions: normalizeOrder(header.dimensions),
                sampleCount: sampleCount
            },
            //data: field,
            data: rawData.data,
            valuesInfo: { min: rawData.min, max: rawData.max, mean: header.mean, sigma: header.sigma }
        };

        return data;
    }

    BinaryParse(data) { let  ic = this.icn3d, me = ic.icn3dui;
    //    let  minVersion = [0, 3];
    //    try {
            let  array = new Uint8Array(data);

            let  unpacked = this.MessagePackParse({
                        buffer: array,
                        offset: 0,
                        dataView: new DataView(array.buffer)
            });

            let  DataBlock = (function () {
                function DataBlock(data) {
                    this.additionalData = {};
                    this.header = data.header;
                    this.categoryList = data.categories.map(function (c) { return new Category(c); });
                    this.categoryMap = new Map();
                    for (let _i = 0, _a = this.categoryList; _i < _a.length; _i++) {
                        let  c = _a[_i];
                        this.categoryMap.set(c.name, c);
                    }
                }
                Object.defineProperty(DataBlock.prototype, "categories", {
                    get: function () { return this.categoryList; },
                    enumerable: true,
                    configurable: true
                });
                DataBlock.prototype.getCategory = function (name) { return this.categoryMap.get(name); };
                DataBlock.prototype.toJSON = function () {
                    return {
                        id: this.header,
                        categories: this.categoryList.map(function (c) { return c.toJSON(); }),
                        additionalData: this.additionalData
                    };
                };
                return DataBlock;
            }());

            let  Category = (function () {
                function Category(data) {
                    this.name = data.name;
                    this.columnCount = data.columns.length;
                    this.rowCount = data.rowCount;
                    this.columnNameList = [];
                    this.encodedColumns = new Map();
                    for (let _i = 0, _a = data.columns; _i < _a.length; _i++) {
                        let  c = _a[_i];
                        this.encodedColumns.set(c.name, c);
                        this.columnNameList.push(c.name);
                    }
                }
                Object.defineProperty(Category.prototype, "columnNames", {
                    get: function () { return this.columnNameList; },
                    enumerable: true,
                    configurable: true
                });

                let  _UndefinedColumn = (function () {
                    function _UndefinedColumn() {
                        this.isDefined = false;
                    }
                    _UndefinedColumn.prototype.getString = function (row) { return null; };
                    ;
                    _UndefinedColumn.prototype.getInteger = function (row) { return 0; };
                    _UndefinedColumn.prototype.getFloat = function (row) { return 0.0; };
                    _UndefinedColumn.prototype.getValuePresence = function (row) { return 1 /* NotSpecified */; };
                    _UndefinedColumn.prototype.areValuesEqual = function (rowA, rowB) { return true; };
                    _UndefinedColumn.prototype.stringEquals = function (row, value) { return value === null; };
                    return _UndefinedColumn;
                }());

                Category.prototype.getColumn = function (name) {
                    let  w = this.encodedColumns.get(name);
                    if (w)
                        return wrapColumn(w);
                    return _UndefinedColumn;
                };
                Category.prototype.toJSON = function () {
                    let  _this = this;
                    let  rows = [];
                    let  columns = this.columnNameList.map(function (name) { return ({ name: name, column: _this.getColumn(name) }); });
                    for (let i = 0; i < this.rowCount; i++) {
                        let  item = {};
                        for (let _i = 0, columns_1 = columns; _i < columns_1.length; _i++) {
                            let  c = columns_1[_i];
                            let  d = c.column.getValuePresence(i);
                            if (d === 0 /* Present */)
                                item[c.name] = c.column.getString(i);
                            else if (d === 1 /* NotSpecified */)
                                item[c.name] = '.';
                            else
                                item[c.name] = '?';
                        }
                        rows[i] = item;
                    }
                    return { name: this.name, columns: this.columnNames, rows: rows };
                };
                return Category;
            }());

            function getIntArray(type, size) {
                switch (type) {
                    case 1 /* Int8 */: return new Int8Array(size);
                    case 2 /* Int16 */: return new Int16Array(size);
                    case 3 /* Int32 */: return new Int32Array(size);
                    case 4 /* Uint8 */: return new Uint8Array(size);
                    case 5 /* Uint16 */: return new Uint16Array(size);
                    case 6 /* Uint32 */: return new Uint32Array(size);
                    default: throw new Error('Unsupported integer data type.');
                }
            }
            function getFloatArray(type, size) {
                switch (type) {
                    case 32 /* Float32 */: return new Float32Array(size);
                    case 33 /* Float64 */: return new Float64Array(size);
                    default: throw new Error('Unsupported floating data type.');
                }
            }
            // http://stackoverflow.com/questions/7869752/javascript-typed-arrays-and-endianness
            let  isLittleEndian = (function () {
                let  arrayBuffer = new ArrayBuffer(2);
                let  uint8Array = new Uint8Array(arrayBuffer);
                let  uint16array = new Uint16Array(arrayBuffer);
                uint8Array[0] = 0xAA;
                uint8Array[1] = 0xBB;
                if (uint16array[0] === 0xBBAA)
                    return true;
                return false;
            })();
            function int8(data) { return new Int8Array(data.buffer, data.byteOffset); }
            function flipByteOrder(data, bytes) {
                let  buffer = new ArrayBuffer(data.length);
                let  ret = new Uint8Array(buffer);
                for (let i = 0, n = data.length; i < n; i += bytes) {
                    for (let j = 0; j < bytes; j++) {
                        ret[i + bytes - j - 1] = data[i + j];
                    }
                }
                return buffer;
            }
            function view(data, byteSize, c) {
                if (isLittleEndian)
                    return new c(data.buffer);
                return new c(flipByteOrder(data, byteSize));
            }
            function int16(data) { return view(data, 2, Int16Array); }
            function uint16(data) { return view(data, 2, Uint16Array); }
            function int32(data) { return view(data, 4, Int32Array); }
            function uint32(data) { return view(data, 4, Uint32Array); }
            function float32(data) { return view(data, 4, Float32Array); }
            function float64(data) { return view(data, 8, Float64Array); }
            function fixedPoint(data, encoding) {
                let  n = data.length;
                let  output = getFloatArray(encoding.srcType, n);
                let  f = 1 / encoding.factor;
                for (let i = 0; i < n; i++) {
                    output[i] = f * data[i];
                }
                return output;
            }
            function intervalQuantization(data, encoding) {
                let  n = data.length;
                let  output = getFloatArray(encoding.srcType, n);
                let  delta = (encoding.max - encoding.min) / (encoding.numSteps - 1);
                let  min = encoding.min;
                for (let i = 0; i < n; i++) {
                    output[i] = min + delta * data[i];
                }
                return output;
            }
            function runLength(data, encoding) {
                let  output = getIntArray(encoding.srcType, encoding.srcSize);
                let  dataOffset = 0;
                for (let i = 0, il = data.length; i < il; i += 2) {
                    let  value = data[i]; // value to be repeated
                    let  length_7 = data[i + 1]; // number of repeats
                    for (let j = 0; j < length_7; ++j) {
                        output[dataOffset++] = value;
                    }
                }
                return output;
            }
            function delta(data, encoding) {
                let  n = data.length;
                let  output = getIntArray(encoding.srcType, n);
                if (!n)
                    return output;
                output[0] = data[0] + (encoding.origin | 0);
                for (let i = 1; i < n; ++i) {
                    output[i] = data[i] + output[i - 1];
                }
                return output;
            }
            function integerPackingSigned(data, encoding) {
                let  upperLimit = encoding.byteCount === 1 ? 0x7F : 0x7FFF;
                let  lowerLimit = -upperLimit - 1;
                let  n = data.length;
                let  output = new Int32Array(encoding.srcSize);
                let  i = 0;
                let  j = 0;
                while (i < n) {
                    let  value = 0, t = data[i];
                    while (t === upperLimit || t === lowerLimit) {
                        value += t;
                        i++;
                        t = data[i];
                    }
                    value += t;
                    output[j] = value;
                    i++;
                    j++;
                }
                return output;
            }
            function integerPackingUnsigned(data, encoding) {
                let  upperLimit = encoding.byteCount === 1 ? 0xFF : 0xFFFF;
                let  n = data.length;
                let  output = new Int32Array(encoding.srcSize);
                let  i = 0;
                let  j = 0;
                while (i < n) {
                    let  value = 0, t = data[i];
                    while (t === upperLimit) {
                        value += t;
                        i++;
                        t = data[i];
                    }
                    value += t;
                    output[j] = value;
                    i++;
                    j++;
                }
                return output;
            }
            function integerPacking(data, encoding) {
                return encoding.isUnsigned ? integerPackingUnsigned(data, encoding) : integerPackingSigned(data, encoding);
            }
            function stringArray(data, encoding) {
                let  str = encoding.stringData;
                let  offsets = decode({ encoding: encoding.offsetEncoding, data: encoding.offsets });
                let  indices = decode({ encoding: encoding.dataEncoding, data: data });
                let  cache = Object.create(null);
                let  result = new Array(indices.length);
                let  offset = 0;
                for (let _i = 0, indices_1 = indices; _i < indices_1.length; _i++) {
                    let  i = indices_1[_i];
                    if (i < 0) {
                        result[offset++] = null;
                        continue;
                    }
                    let  v = cache[i];
                    if (v === void 0) {
                        v = str.substring(offsets[i], offsets[i + 1]);
                        cache[i] = v;
                    }
                    result[offset++] = v;
                }
                return result;
            }

            function decodeStep(data, encoding) {
                switch (encoding.kind) {
                    case 'ByteArray': {
                        switch (encoding.type) {
                            case 4 /* Uint8 */: return data;
                            case 1 /* Int8 */: return int8(data);
                            case 2 /* Int16 */: return int16(data);
                            case 5 /* Uint16 */: return uint16(data);
                            case 3 /* Int32 */: return int32(data);
                            case 6 /* Uint32 */: return uint32(data);
                            case 32 /* Float32 */: return float32(data);
                            case 33 /* Float64 */: return float64(data);
                            default: throw new Error('Unsupported ByteArray type.');
                        }
                    }
                    case 'FixedPoint': return fixedPoint(data, encoding);
                    case 'IntervalQuantization': return intervalQuantization(data, encoding);
                    case 'RunLength': return runLength(data, encoding);
                    case 'Delta': return delta(data, encoding);
                    case 'IntegerPacking': return integerPacking(data, encoding);
                    case 'StringArray': return stringArray(data, encoding);
                }
            }

            function decode(data) {
                let  current = data.data;
                for (let i = data.encoding.length - 1; i >= 0; i--) {
                    current = decodeStep(current, data.encoding[i]);
                }
                return current;
            }

            function wrapColumn(column) {
                if (!column.data.data)
                    return _UndefinedColumn;
                let  data = decode(column.data);
                let  mask = void 0;
                if (column.mask)
                    mask = decode(column.mask);
                if (data.buffer && data.byteLength && data.BYTES_PER_ELEMENT) {
                    return mask ? new MaskedNumericColumn(data, mask) : new NumericColumn(data);
                }
                return mask ? new MaskedStringColumn(data, mask) : new StringColumn(data);
            }
            //var fastParseInt = CIFTools.me.utilsCls.FastNumberParsers.parseInt;
            function fastParseInt(str, start, end) {
                let  ret = 0, neg = 1;
                if (str.charCodeAt(start) === 45 /* - */) {
                    neg = -1;
                    start++;
                }
                for (; start < end; start++) {
                    let  c = str.charCodeAt(start) - 48;
                    if (c > 9 || c < 0)
                        return (neg * ret) | 0;
                    else
                        ret = (10 * ret + c) | 0;
                }
                return neg * ret;
            }
            //var fastParseFloat = CIFTools.me.utilsCls.FastNumberParsers.parseFloat;
            function fastParseFloat(str, start, end) {
                let  neg = 1.0, ret = 0.0, point = 0.0, div = 1.0;
                if (str.charCodeAt(start) === 45) {
                    neg = -1.0;
                    ++start;
                }
                while (start < end) {
                    let  c = str.charCodeAt(start) - 48;
                    if (c >= 0 && c < 10) {
                        ret = ret * 10 + c;
                        ++start;
                    }
                    else if (c === -2) {
                        ++start;
                        while (start < end) {
                            c = str.charCodeAt(start) - 48;
                            if (c >= 0 && c < 10) {
                                point = 10.0 * point + c;
                                div = 10.0 * div;
                                ++start;
                            }
                            else if (c === 53 || c === 21) {
                                return parseScientific(neg * (ret + point / div), str, start + 1, end);
                            }
                            else {
                                return neg * (ret + point / div);
                            }
                        }
                        return neg * (ret + point / div);
                    }
                    else if (c === 53 || c === 21) {
                        return parseScientific(neg * ret, str, start + 1, end);
                    }
                    else
                        break;
                }
                return neg * ret;
            }

            let  NumericColumn = (function () {
                function NumericColumn(data) {
                    this.data = data;
                    this.isDefined = true;
                }
                NumericColumn.prototype.getString = function (row) { return "" + this.data[row]; };
                NumericColumn.prototype.getInteger = function (row) { return this.data[row] | 0; };
                NumericColumn.prototype.getFloat = function (row) { return 1.0 * this.data[row]; };
                NumericColumn.prototype.stringEquals = function (row, value) { return this.data[row] === fastParseFloat(value, 0, value.length); };
                NumericColumn.prototype.areValuesEqual = function (rowA, rowB) { return this.data[rowA] === this.data[rowB]; };
                NumericColumn.prototype.getValuePresence = function (row) { return 0 /* Present */; };
                return NumericColumn;
            }());
            let  MaskedNumericColumn = (function () {
                function MaskedNumericColumn(data, mask) {
                    this.data = data;
                    this.mask = mask;
                    this.isDefined = true;
                }
                MaskedNumericColumn.prototype.getString = function (row) { return this.mask[row] === 0 /* Present */ ? "" + this.data[row] : null; };
                MaskedNumericColumn.prototype.getInteger = function (row) { return this.mask[row] === 0 /* Present */ ? this.data[row] : 0; };
                MaskedNumericColumn.prototype.getFloat = function (row) { return this.mask[row] === 0 /* Present */ ? this.data[row] : 0; };
                MaskedNumericColumn.prototype.stringEquals = function (row, value) { return this.mask[row] === 0 /* Present */ ? this.data[row] === fastParseFloat(value, 0, value.length) : value === null || value === void 0; };
                MaskedNumericColumn.prototype.areValuesEqual = function (rowA, rowB) { return this.data[rowA] === this.data[rowB]; };
                MaskedNumericColumn.prototype.getValuePresence = function (row) { return this.mask[row]; };
                return MaskedNumericColumn;
            }());
            let  StringColumn = (function () {
                function StringColumn(data) {
                    this.data = data;
                    this.isDefined = true;
                }
                StringColumn.prototype.getString = function (row) { return this.data[row]; };
                StringColumn.prototype.getInteger = function (row) { let  v = this.data[row]; return fastParseInt(v, 0, v.length); };
                StringColumn.prototype.getFloat = function (row) { let  v = this.data[row]; return fastParseFloat(v, 0, v.length); };
                StringColumn.prototype.stringEquals = function (row, value) { return this.data[row] === value; };
                StringColumn.prototype.areValuesEqual = function (rowA, rowB) { return this.data[rowA] === this.data[rowB]; };
                StringColumn.prototype.getValuePresence = function (row) { return 0 /* Present */; };
                return StringColumn;
            }());
            let  MaskedStringColumn = (function () {
                function MaskedStringColumn(data, mask) {
                    this.data = data;
                    this.mask = mask;
                    this.isDefined = true;
                }
                MaskedStringColumn.prototype.getString = function (row) { return this.mask[row] === 0 /* Present */ ? this.data[row] : null; };
                MaskedStringColumn.prototype.getInteger = function (row) { if (this.mask[row] !== 0 /* Present */)
                    return 0; let  v = this.data[row]; return fastParseInt(v || '', 0, (v || '').length); };
                MaskedStringColumn.prototype.getFloat = function (row) { if (this.mask[row] !== 0 /* Present */)
                    return 0; let  v = this.data[row]; return fastParseFloat(v || '', 0, (v || '').length); };
                MaskedStringColumn.prototype.stringEquals = function (row, value) { return this.data[row] === value; };
                MaskedStringColumn.prototype.areValuesEqual = function (rowA, rowB) { return this.data[rowA] === this.data[rowB]; };
                MaskedStringColumn.prototype.getValuePresence = function (row) { return this.mask[row]; };
                return MaskedStringColumn;
            }());

            let  File = (function () {
                        function File(data) {
                            this.dataBlocks = data.dataBlocks.map(function (b) { return new DataBlock(b); });
                        }
                        File.prototype.toJSON = function () {
                            return this.dataBlocks.map(function (b) { return b.toJSON(); });
                        };
                        return File;
            }());

            let  file = new File(unpacked);
            return file;

    //    }
    //    catch (e) {
    //        return CIFTools.ParserResult.error('' + e);
    //    }
    }

    MessagePackParse(state) { let  ic = this.icn3d, me = ic.icn3dui;
        let  thisClass = this;

        /*
         * Adapted from https://github.com/rcsb/mmtf-javascript
         * by Alexander Rose <alexander.rose@weirdbyte.de>, MIT License, Copyright (c) 2016
         */
        /**
         * decode all key-value pairs of a map into an object
         * @param  {Integer} length - number of key-value pairs
         * @return {Object} decoded map
         */
        function map(state, length) {
            let  value = {};
            for (let i = 0; i < length; i++) {
                let  key = thisClass.MessagePackParse(state);
                value[key] = thisClass.MessagePackParse(state);
            }
            return value;
        }
        /**
         * decode binary array
         * @param  {Integer} length - number of elements in the array
         * @return {Uint8Array} decoded array
         */
        function bin(state, length) {
            // This approach to binary parsing wastes a bit of memory to trade for speed compared to:
            //
            //   let  value = buffer.subarray(offset, offset + length); //new Uint8Array(buffer.buffer, offset, length);
            //
            // It turns out that using the view created by subarray probably uses DataView
            // in the background, which causes the element access to be several times slower
            // than creating the new byte array.
            let  value = new Uint8Array(length);
            let  o = state.offset;
            for (let i = 0; i < length; i++)
                value[i] = state.buffer[i + o];
            state.offset += length;
            return value;
        }
        /**
             * decode array
             * @param  {Integer} length - number of array elements
             * @return {Array} decoded array
             */
        function array(state, length) {
            let  value = new Array(length);
            for (let i = 0; i < length; i++) {
                value[i] = thisClass.MessagePackParse(state);
            }
            return value;
        }

        /**
         * decode string
         * @param  {Integer} length - number string characters
         * @return {String} decoded string
         */
        function str(state, length) {
            let  value = utf8Read(state.buffer, state.offset, length);
            state.offset += length;
            return value;
        }

        let  __chars = function () {
            let  data = [];
            for (let i = 0; i < 1024; i++)
                data[i] = String.fromCharCode(i);
            return data;
        }();

        function utf8Read(data, offset, length) {
            let  chars = __chars;
            let  str = void 0, chunk = [], chunkSize = 512, chunkOffset = 0;
            for (let i = offset, end = offset + length; i < end; i++) {
                let  byte = data[i];
                // One byte character
                if ((byte & 0x80) === 0x00) {
                    chunk[chunkOffset++] = chars[byte];
                }
                else if ((byte & 0xe0) === 0xc0) {
                    chunk[chunkOffset++] = chars[((byte & 0x0f) << 6) | (data[++i] & 0x3f)];
                }
                else if ((byte & 0xf0) === 0xe0) {
                    chunk[chunkOffset++] = String.fromCharCode(((byte & 0x0f) << 12) |
                        ((data[++i] & 0x3f) << 6) |
                        ((data[++i] & 0x3f) << 0));
                }
                else if ((byte & 0xf8) === 0xf0) {
                    chunk[chunkOffset++] = String.fromCharCode(((byte & 0x07) << 18) |
                        ((data[++i] & 0x3f) << 12) |
                        ((data[++i] & 0x3f) << 6) |
                        ((data[++i] & 0x3f) << 0));
                }
                else
                    throwError("Invalid byte " + byte.toString(16));
                if (chunkOffset === chunkSize) {
                    str = str || [];
                    str[str.length] = chunk.join('');
                    chunkOffset = 0;
                }
            }
            if (!str)
                return chunk.slice(0, chunkOffset).join('');
            if (chunkOffset > 0) {
                str[str.length] = chunk.slice(0, chunkOffset).join('');
            }
            return str.join('');
        }

        let  type = state.buffer[state.offset];

        let  value, length;
        // Positive FixInt
        if ((type & 0x80) === 0x00) {
            state.offset++;
            return type;
        }
        // FixMap
        if ((type & 0xf0) === 0x80) {
            length = type & 0x0f;
            state.offset++;
            return map(state, length);
        }
        // FixArray
        if ((type & 0xf0) === 0x90) {
            length = type & 0x0f;
            state.offset++;
            return array(state, length);
        }
        // FixStr
        if ((type & 0xe0) === 0xa0) {
            length = type & 0x1f;
            state.offset++;
            return str(state, length);
        }
        // Negative FixInt
        if ((type & 0xe0) === 0xe0) {
            value = state.dataView.getInt8(state.offset);
            state.offset++;
            return value;
        }
        switch (type) {
            // nil
            case 0xc0:
                state.offset++;
                return null;
            // false
            case 0xc2:
                state.offset++;
                return false;
            // true
            case 0xc3:
                state.offset++;
                return true;
            // bin 8
            case 0xc4:
                length = state.dataView.getUint8(state.offset + 1);
                state.offset += 2;
                return bin(state, length);
            // bin 16
            case 0xc5:
                length = state.dataView.getUint16(state.offset + 1);
                state.offset += 3;
                return bin(state, length);
            // bin 32
            case 0xc6:
                length = state.dataView.getUint32(state.offset + 1);
                state.offset += 5;
                return bin(state, length);
            // float 32
            case 0xca:
                value = state.dataView.getFloat32(state.offset + 1);
                state.offset += 5;
                return value;
            // float 64
            case 0xcb:
                value = state.dataView.getFloat64(state.offset + 1);
                state.offset += 9;
                return value;
            // uint8
            case 0xcc:
                value = state.buffer[state.offset + 1];
                state.offset += 2;
                return value;
            // uint 16
            case 0xcd:
                value = state.dataView.getUint16(state.offset + 1);
                state.offset += 3;
                return value;
            // uint 32
            case 0xce:
                value = state.dataView.getUint32(state.offset + 1);
                state.offset += 5;
                return value;
            // int 8
            case 0xd0:
                value = state.dataView.getInt8(state.offset + 1);
                state.offset += 2;
                return value;
            // int 16
            case 0xd1:
                value = state.dataView.getInt16(state.offset + 1);
                state.offset += 3;
                return value;
            // int 32
            case 0xd2:
                value = state.dataView.getInt32(state.offset + 1);
                state.offset += 5;
                return value;
            // str 8
            case 0xd9:
                length = state.dataView.getUint8(state.offset + 1);
                state.offset += 2;
                return str(state, length);
            // str 16
            case 0xda:
                length = state.dataView.getUint16(state.offset + 1);
                state.offset += 3;
                return str(state, length);
            // str 32
            case 0xdb:
                length = state.dataView.getUint32(state.offset + 1);
                state.offset += 5;
                return str(state, length);
            // array 16
            case 0xdc:
                length = state.dataView.getUint16(state.offset + 1);
                state.offset += 3;
                return array(state, length);
            // array 32
            case 0xdd:
                length = state.dataView.getUint32(state.offset + 1);
                state.offset += 5;
                return array(state, length);
            // map 16:
            case 0xde:
                length = state.dataView.getUint16(state.offset + 1);
                state.offset += 3;
                return map(state, length);
            // map 32
            case 0xdf:
                length = state.dataView.getUint32(state.offset + 1);
                state.offset += 5;
                return map(state, length);
        }
    }
}

export {DensityCifParser}
