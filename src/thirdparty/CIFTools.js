
; var __CIFTools = function () {
  'use strict';
/*
 * Copyright (c) 2016 - now David Sehnal, licensed under MIT License, See LICENSE file for more info.
 */
var CIFTools;
(function (CIFTools) {
    CIFTools.VERSION = { number: "1.1.7", date: "Oct 30 2018" };
})(CIFTools || (CIFTools = {}));
/*
 * Copyright (c) 2016 - now David Sehnal, licensed under MIT License, See LICENSE file for more info.
 */
var CIFTools;
(function (CIFTools) {
    var Utils;
    (function (Utils) {
        var ChunkedArray;
        (function (ChunkedArray) {
            function is(x) {
                return x.creator && x.chunkSize;
            }
            ChunkedArray.is = is;
            function add4(array, x, y, z, w) {
                if (array.currentIndex >= array.chunkSize) {
                    array.currentIndex = 0;
                    array.current = array.creator(array.chunkSize);
                    array.parts[array.parts.length] = array.current;
                }
                array.current[array.currentIndex++] = x;
                array.current[array.currentIndex++] = y;
                array.current[array.currentIndex++] = z;
                array.current[array.currentIndex++] = w;
                return array.elementCount++;
            }
            ChunkedArray.add4 = add4;
            function add3(array, x, y, z) {
                if (array.currentIndex >= array.chunkSize) {
                    array.currentIndex = 0;
                    array.current = array.creator(array.chunkSize);
                    array.parts[array.parts.length] = array.current;
                }
                array.current[array.currentIndex++] = x;
                array.current[array.currentIndex++] = y;
                array.current[array.currentIndex++] = z;
                return array.elementCount++;
            }
            ChunkedArray.add3 = add3;
            function add2(array, x, y) {
                if (array.currentIndex >= array.chunkSize) {
                    array.currentIndex = 0;
                    array.current = array.creator(array.chunkSize);
                    array.parts[array.parts.length] = array.current;
                }
                array.current[array.currentIndex++] = x;
                array.current[array.currentIndex++] = y;
                return array.elementCount++;
            }
            ChunkedArray.add2 = add2;
            function add(array, x) {
                if (array.currentIndex >= array.chunkSize) {
                    array.currentIndex = 0;
                    array.current = array.creator(array.chunkSize);
                    array.parts[array.parts.length] = array.current;
                }
                array.current[array.currentIndex++] = x;
                return array.elementCount++;
            }
            ChunkedArray.add = add;
            function compact(array) {
                var ret = array.creator(array.elementSize * array.elementCount), offset = (array.parts.length - 1) * array.chunkSize, offsetInner = 0, part;
                if (array.parts.length > 1) {
                    if (array.parts[0].buffer) {
                        for (var i = 0; i < array.parts.length - 1; i++) {
                            ret.set(array.parts[i], array.chunkSize * i);
                        }
                    }
                    else {
                        for (var i = 0; i < array.parts.length - 1; i++) {
                            offsetInner = array.chunkSize * i;
                            part = array.parts[i];
                            for (var j = 0; j < array.chunkSize; j++) {
                                ret[offsetInner + j] = part[j];
                            }
                        }
                    }
                }
                if (array.current.buffer && array.currentIndex >= array.chunkSize) {
                    ret.set(array.current, array.chunkSize * (array.parts.length - 1));
                }
                else {
                    for (var i = 0; i < array.currentIndex; i++) {
                        ret[offset + i] = array.current[i];
                    }
                }
                return ret;
            }
            ChunkedArray.compact = compact;
            function forVertex3D(chunkVertexCount) {
                if (chunkVertexCount === void 0) { chunkVertexCount = 262144; }
                return create(function (size) { return new Float32Array(size); }, chunkVertexCount, 3);
            }
            ChunkedArray.forVertex3D = forVertex3D;
            function forIndexBuffer(chunkIndexCount) {
                if (chunkIndexCount === void 0) { chunkIndexCount = 262144; }
                return create(function (size) { return new Uint32Array(size); }, chunkIndexCount, 3);
            }
            ChunkedArray.forIndexBuffer = forIndexBuffer;
            function forTokenIndices(chunkTokenCount) {
                if (chunkTokenCount === void 0) { chunkTokenCount = 131072; }
                return create(function (size) { return new Int32Array(size); }, chunkTokenCount, 2);
            }
            ChunkedArray.forTokenIndices = forTokenIndices;
            function forIndices(chunkTokenCount) {
                if (chunkTokenCount === void 0) { chunkTokenCount = 131072; }
                return create(function (size) { return new Int32Array(size); }, chunkTokenCount, 1);
            }
            ChunkedArray.forIndices = forIndices;
            function forInt32(chunkSize) {
                if (chunkSize === void 0) { chunkSize = 131072; }
                return create(function (size) { return new Int32Array(size); }, chunkSize, 1);
            }
            ChunkedArray.forInt32 = forInt32;
            function forFloat32(chunkSize) {
                if (chunkSize === void 0) { chunkSize = 131072; }
                return create(function (size) { return new Float32Array(size); }, chunkSize, 1);
            }
            ChunkedArray.forFloat32 = forFloat32;
            function forArray(chunkSize) {
                if (chunkSize === void 0) { chunkSize = 131072; }
                return create(function (size) { return []; }, chunkSize, 1);
            }
            ChunkedArray.forArray = forArray;
            function create(creator, chunkElementCount, elementSize) {
                chunkElementCount = chunkElementCount | 0;
                if (chunkElementCount <= 0)
                    chunkElementCount = 1;
                var chunkSize = chunkElementCount * elementSize;
                var current = creator(chunkSize);
                return {
                    elementSize: elementSize,
                    chunkSize: chunkSize,
                    creator: creator,
                    current: current,
                    parts: [current],
                    currentIndex: 0,
                    elementCount: 0
                };
            }
            ChunkedArray.create = create;
        })(ChunkedArray = Utils.ChunkedArray || (Utils.ChunkedArray = {}));
    })(Utils = CIFTools.Utils || (CIFTools.Utils = {}));
})(CIFTools || (CIFTools = {}));
/*
 * Copyright (c) 2016 - now David Sehnal, licensed under MIT License, See LICENSE file for more info.
 */
/**
 * Efficient integer and float parsers.
 *
 * For the purposes of parsing numbers from the mmCIF data representations,
 * up to 4 times faster than JS parseInt/parseFloat.
 */
var CIFTools;
(function (CIFTools) {
    var Utils;
    (function (Utils) {
        var FastNumberParsers;
        (function (FastNumberParsers) {
            "use strict";
            function parseIntSkipTrailingWhitespace(str, start, end) {
                while (start < end && str.charCodeAt(start) === 32)
                    start++;
                return parseInt(str, start, end);
            }
            FastNumberParsers.parseIntSkipTrailingWhitespace = parseIntSkipTrailingWhitespace;
            function parseInt(str, start, end) {
                var ret = 0, neg = 1;
                if (str.charCodeAt(start) === 45 /* - */) {
                    neg = -1;
                    start++;
                }
                for (; start < end; start++) {
                    var c = str.charCodeAt(start) - 48;
                    if (c > 9 || c < 0)
                        return (neg * ret) | 0;
                    else
                        ret = (10 * ret + c) | 0;
                }
                return neg * ret;
            }
            FastNumberParsers.parseInt = parseInt;
            function parseScientific(main, str, start, end) {
                // handle + in '1e+1' separately.
                if (str.charCodeAt(start) === 43 /* + */)
                    start++;
                return main * Math.pow(10.0, parseInt(str, start, end));
            }
            function parseFloatSkipTrailingWhitespace(str, start, end) {
                while (start < end && str.charCodeAt(start) === 32)
                    start++;
                return parseFloat(str, start, end);
            }
            FastNumberParsers.parseFloatSkipTrailingWhitespace = parseFloatSkipTrailingWhitespace;
            function parseFloat(str, start, end) {
                var neg = 1.0, ret = 0.0, point = 0.0, div = 1.0;
                if (str.charCodeAt(start) === 45) {
                    neg = -1.0;
                    ++start;
                }
                while (start < end) {
                    var c = str.charCodeAt(start) - 48;
                    if (c >= 0 && c < 10) {
                        ret = ret * 10 + c;
                        ++start;
                    }
                    else if (c === -2) { // .
                        ++start;
                        while (start < end) {
                            c = str.charCodeAt(start) - 48;
                            if (c >= 0 && c < 10) {
                                point = 10.0 * point + c;
                                div = 10.0 * div;
                                ++start;
                            }
                            else if (c === 53 || c === 21) { // 'e'/'E'
                                return parseScientific(neg * (ret + point / div), str, start + 1, end);
                            }
                            else {
                                return neg * (ret + point / div);
                            }
                        }
                        return neg * (ret + point / div);
                    }
                    else if (c === 53 || c === 21) { // 'e'/'E'
                        return parseScientific(neg * ret, str, start + 1, end);
                    }
                    else
                        break;
                }
                return neg * ret;
            }
            FastNumberParsers.parseFloat = parseFloat;
        })(FastNumberParsers = Utils.FastNumberParsers || (Utils.FastNumberParsers = {}));
    })(Utils = CIFTools.Utils || (CIFTools.Utils = {}));
})(CIFTools || (CIFTools = {}));
/*
 * Copyright (c) 2016 - now David Sehnal, licensed under MIT License, See LICENSE file for more info.
 */
var CIFTools;
(function (CIFTools) {
    var Utils;
    (function (Utils) {
        var __paddingSpaces = [];
        (function () {
            var s = '';
            for (var i = 0; i < 512; i++) {
                __paddingSpaces[i] = s;
                s = s + ' ';
            }
        })();
        var StringWriter;
        (function (StringWriter) {
            function create(chunkCapacity) {
                if (chunkCapacity === void 0) { chunkCapacity = 512; }
                return {
                    chunkData: [],
                    chunkOffset: 0,
                    chunkCapacity: chunkCapacity,
                    data: []
                };
            }
            StringWriter.create = create;
            function asString(writer) {
                if (!writer.data.length) {
                    if (writer.chunkData.length === writer.chunkOffset)
                        return writer.chunkData.join('');
                    return writer.chunkData.splice(0, writer.chunkOffset).join('');
                }
                if (writer.chunkOffset > 0) {
                    writer.data[writer.data.length] = writer.chunkData.splice(0, writer.chunkOffset).join('');
                }
                return writer.data.join('');
            }
            StringWriter.asString = asString;
            function writeTo(writer, stream) {
                finalize(writer);
                for (var _i = 0, _a = writer.data; _i < _a.length; _i++) {
                    var s = _a[_i];
                    stream.writeString(s);
                }
            }
            StringWriter.writeTo = writeTo;
            function finalize(writer) {
                if (writer.chunkOffset > 0) {
                    if (writer.chunkData.length === writer.chunkOffset)
                        writer.data[writer.data.length] = writer.chunkData.join('');
                    else
                        writer.data[writer.data.length] = writer.chunkData.splice(0, writer.chunkOffset).join('');
                    writer.chunkOffset = 0;
                }
            }
            function newline(writer) {
                write(writer, '\n');
            }
            StringWriter.newline = newline;
            function whitespace(writer, len) {
                write(writer, __paddingSpaces[len]);
            }
            StringWriter.whitespace = whitespace;
            function write(writer, val) {
                if (val === undefined || val === null) {
                    return;
                }
                if (writer.chunkOffset === writer.chunkCapacity) {
                    writer.data[writer.data.length] = writer.chunkData.join('');
                    writer.chunkOffset = 0;
                }
                writer.chunkData[writer.chunkOffset++] = val;
            }
            StringWriter.write = write;
            function writeSafe(writer, val) {
                if (writer.chunkOffset === writer.chunkCapacity) {
                    writer.data[writer.data.length] = writer.chunkData.join('');
                    writer.chunkOffset = 0;
                }
                writer.chunkData[writer.chunkOffset++] = val;
            }
            StringWriter.writeSafe = writeSafe;
            function writePadLeft(writer, val, totalWidth) {
                if (val === undefined || val === null) {
                    write(writer, __paddingSpaces[totalWidth]);
                }
                var padding = totalWidth - val.length;
                if (padding > 0)
                    write(writer, __paddingSpaces[padding]);
                write(writer, val);
            }
            StringWriter.writePadLeft = writePadLeft;
            function writePadRight(writer, val, totalWidth) {
                if (val === undefined || val === null) {
                    write(writer, __paddingSpaces[totalWidth]);
                }
                var padding = totalWidth - val.length;
                write(writer, val);
                if (padding > 0)
                    write(writer, __paddingSpaces[padding]);
            }
            StringWriter.writePadRight = writePadRight;
            function writeInteger(writer, val) {
                write(writer, '' + val);
            }
            StringWriter.writeInteger = writeInteger;
            function writeIntegerPadLeft(writer, val, totalWidth) {
                var s = '' + val;
                var padding = totalWidth - s.length;
                if (padding > 0)
                    write(writer, __paddingSpaces[padding]);
                write(writer, s);
            }
            StringWriter.writeIntegerPadLeft = writeIntegerPadLeft;
            function writeIntegerPadRight(writer, val, totalWidth) {
                var s = '' + val;
                var padding = totalWidth - s.length;
                write(writer, s);
                if (padding > 0)
                    write(writer, __paddingSpaces[padding]);
            }
            StringWriter.writeIntegerPadRight = writeIntegerPadRight;
            /**
             * @example writeFloat(123.2123, 100) -- 2 decim
             */
            function writeFloat(writer, val, precisionMultiplier) {
                write(writer, '' + Math.round(precisionMultiplier * val) / precisionMultiplier);
            }
            StringWriter.writeFloat = writeFloat;
            function writeFloatPadLeft(writer, val, precisionMultiplier, totalWidth) {
                var s = '' + Math.round(precisionMultiplier * val) / precisionMultiplier;
                var padding = totalWidth - s.length;
                if (padding > 0)
                    write(writer, __paddingSpaces[padding]);
                write(writer, s);
            }
            StringWriter.writeFloatPadLeft = writeFloatPadLeft;
            function writeFloatPadRight(writer, val, precisionMultiplier, totalWidth) {
                var s = '' + Math.round(precisionMultiplier * val) / precisionMultiplier;
                var padding = totalWidth - s.length;
                write(writer, s);
                if (padding > 0)
                    write(writer, __paddingSpaces[padding]);
            }
            StringWriter.writeFloatPadRight = writeFloatPadRight;
        })(StringWriter = Utils.StringWriter || (Utils.StringWriter = {}));
    })(Utils = CIFTools.Utils || (CIFTools.Utils = {}));
})(CIFTools || (CIFTools = {}));
/*
 * Copyright (c) 2016 - now David Sehnal, licensed under MIT License, See LICENSE file for more info.
 */
var CIFTools;
(function (CIFTools) {
    "use strict";
    /**
     * Represents a column that is not present.
     */
    var _UndefinedColumn = /** @class */ (function () {
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
    CIFTools.UndefinedColumn = new _UndefinedColumn();
    /**
     * Helper functions for categoies.
     */
    var Category;
    (function (Category) {
        /**
         * Extracts a matrix from a category from a specified rowIndex.
         *
         * _category.matrix[1][1] v11
         * ....
         * ....
         * _category.matrix[rows][cols] vRowsCols
         */
        function getMatrix(category, field, rows, cols, rowIndex) {
            var ret = [];
            for (var i = 1; i <= rows; i++) {
                var row = [];
                for (var j = 1; j <= cols; j++) {
                    row[j - 1] = category.getColumn(field + "[" + i + "][" + j + "]").getFloat(rowIndex);
                }
                ret[i - 1] = row;
            }
            return ret;
        }
        Category.getMatrix = getMatrix;
        /**
         * Extracts a vector from a category from a specified rowIndex.
         *
         * _category.matrix[1][1] v11
         * ....
         * ....
         * _category.matrix[rows][cols] vRowsCols
         */
        function getVector(category, field, rows, cols, rowIndex) {
            var ret = [];
            for (var i = 1; i <= rows; i++) {
                ret[i - 1] = category.getColumn(field + "[" + i + "]").getFloat(rowIndex);
            }
            return ret;
        }
        Category.getVector = getVector;
    })(Category = CIFTools.Category || (CIFTools.Category = {}));
})(CIFTools || (CIFTools = {}));
/*
 * Copyright (c) 2016 - now David Sehnal, licensed under MIT License, See LICENSE file for more info.
 */
var CIFTools;
(function (CIFTools) {
    "use strict";
    var ParserResult;
    (function (ParserResult) {
        function error(message, line) {
            if (line === void 0) { line = -1; }
            return new ParserError(message, line);
        }
        ParserResult.error = error;
        function success(result, warnings) {
            if (warnings === void 0) { warnings = []; }
            return new ParserSuccess(result, warnings);
        }
        ParserResult.success = success;
    })(ParserResult = CIFTools.ParserResult || (CIFTools.ParserResult = {}));
    var ParserError = /** @class */ (function () {
        function ParserError(message, line) {
            this.message = message;
            this.line = line;
            this.isError = true;
        }
        ParserError.prototype.toString = function () {
            if (this.line >= 0) {
                return "[Line " + this.line + "] " + this.message;
            }
            return this.message;
        };
        return ParserError;
    }());
    CIFTools.ParserError = ParserError;
    var ParserSuccess = /** @class */ (function () {
        function ParserSuccess(result, warnings) {
            this.result = result;
            this.warnings = warnings;
            this.isError = false;
        }
        return ParserSuccess;
    }());
    CIFTools.ParserSuccess = ParserSuccess;
})(CIFTools || (CIFTools = {}));
/*
 * Copyright (c) 2016 - now David Sehnal, licensed under MIT License, See LICENSE file for more info.
 */
/*
 * Copyright (c) 2016 - now David Sehnal, licensed under MIT License, See LICENSE file for more info.
 */
/*
    On data representation of molecular files

    Consider an mmCIF file that stores a molecule with 100k atoms. For the sake of simplicity,
    lets ignore things like symmetry or assemblies, and assume, that the file only stores the
    _atom_site records. The atom site "table" in the standard mmCIF from PDB database currently
    has 26 columns.

    So the data looks something like this:

        loop_
        _atom_site.column1
        ....
        _atom_site.column26
        t1,1 .... t1,26
        t100000,1 .... t100000,26

    The straightforward way to represent this data in JavaScript is to have an array of objects
    with properties named "column1" ..., "column26":

        [{ column1: "t1,1", ..., column26: "t1,26" },
          ...,
         { column1: "t100000,1", ..., column26: "t100000,26" }]

    So in order to represent the atoms sites, we would need 100k objects and 2.6 million strings.
    Is this bad? well, sort of. It would not be so bad if this representation would be the only
    thing we need to keep in memory and/or the life time of the object was short. But usually
    we would need to keep the object around for the entire lifetime of the app. This alone
    adds a very non-significant overhead for the garbage collector (which increases the app's
    latency). What's worse is that we usually only need a fraction of this data, but this can
    vary application for application. For just 100k atoms, the overhead is not "that bad", but
    consider 1M atoms and suddenly we have a problem.

    The following data model shows an alternative way of storing molecular file s
    in memory that is very efficient, fast and introduces a very minimal overhead.

 */
var CIFTools;
(function (CIFTools) {
    var Text;
    (function (Text) {
        "use strict";
        var ShortStringPool;
        (function (ShortStringPool) {
            function create() { return Object.create(null); }
            ShortStringPool.create = create;
            function get(pool, str) {
                if (str.length > 6)
                    return str;
                var value = pool[str];
                if (value !== void 0)
                    return value;
                pool[str] = str;
                return str;
            }
            ShortStringPool.get = get;
        })(ShortStringPool || (ShortStringPool = {}));
        /**
         * Represents the input file.
         */
        var File = /** @class */ (function () {
            function File(data) {
                /**
                 * Data blocks inside the file. If no data block is present, a "default" one is created.
                 */
                this.dataBlocks = [];
                this.data = data;
            }
            File.prototype.toJSON = function () {
                return this.dataBlocks.map(function (b) { return b.toJSON(); });
            };
            return File;
        }());
        Text.File = File;
        /**
         * Represents a single data block.
         */
        var DataBlock = /** @class */ (function () {
            function DataBlock(data, header) {
                this.header = header;
                this.data = data;
                this.categoryList = [];
                this.additionalData = {};
                this.categoryMap = new Map();
            }
            Object.defineProperty(DataBlock.prototype, "categories", {
                /**
                 * Categories of the block.
                 * block.categories._atom_site / ['_atom_site']
                 */
                get: function () {
                    return this.categoryList;
                },
                enumerable: true,
                configurable: true
            });
            /**
             * Gets a category by its name.
             */
            DataBlock.prototype.getCategory = function (name) {
                return this.categoryMap.get(name);
            };
            /**
             * Adds a category.
             */
            DataBlock.prototype.addCategory = function (category) {
                this.categoryList[this.categoryList.length] = category;
                this.categoryMap.set(category.name, category);
            };
            DataBlock.prototype.toJSON = function () {
                return {
                    id: this.header,
                    categories: this.categoryList.map(function (c) { return c.toJSON(); }),
                    additionalData: this.additionalData
                };
            };
            return DataBlock;
        }());
        Text.DataBlock = DataBlock;
        /**
         * Represents a single CIF category.
         */
        var Category = /** @class */ (function () {
            function Category(data, name, startIndex, endIndex, columns, tokens, tokenCount) {
                this.name = name;
                this.tokens = tokens;
                this.data = data;
                this.startIndex = startIndex;
                this.endIndex = endIndex;
                this.columnCount = columns.length;
                this.rowCount = (tokenCount / columns.length) | 0;
                this.columnIndices = new Map();
                this.columnNameList = [];
                for (var i = 0; i < columns.length; i++) {
                    var colName = columns[i].substr(name.length + 1);
                    this.columnIndices.set(colName, i);
                    this.columnNameList.push(colName);
                }
            }
            Object.defineProperty(Category.prototype, "columnNames", {
                /**
                 * The array of columns.
                 */
                get: function () {
                    return this.columnNameList;
                },
                enumerable: true,
                configurable: true
            });
            /**
             * Get a column object that makes accessing data easier.
             * @returns undefined if the column isn't present, the Column object otherwise.
             */
            Category.prototype.getColumn = function (name) {
                var i = this.columnIndices.get(name);
                if (i !== void 0)
                    return new Column(this, this.data, name, i);
                return CIFTools.UndefinedColumn;
            };
            Category.prototype.toJSON = function () {
                var rows = [], data = this.data, tokens = this.tokens;
                var colNames = this.columnNameList;
                var strings = ShortStringPool.create();
                for (var i = 0; i < this.rowCount; i++) {
                    var item = {};
                    for (var j = 0; j < this.columnCount; j++) {
                        var tk = (i * this.columnCount + j) * 2;
                        item[colNames[j]] = ShortStringPool.get(strings, data.substring(tokens[tk], tokens[tk + 1]));
                    }
                    rows[i] = item;
                }
                return { name: this.name, columns: colNames, rows: rows };
            };
            return Category;
        }());
        Text.Category = Category;
        var fastParseInt = CIFTools.Utils.FastNumberParsers.parseInt;
        var fastParseFloat = CIFTools.Utils.FastNumberParsers.parseFloat;
        /**
         * Represents a single column of a CIF category.
         */
        var Column = /** @class */ (function () {
            function Column(category, data, name, index) {
                this.data = data;
                this.name = name;
                this.index = index;
                this.stringPool = ShortStringPool.create();
                this.isDefined = true;
                this.tokens = category.tokens;
                this.columnCount = category.columnCount;
            }
            /**
             * Returns the string value at given row.
             */
            Column.prototype.getString = function (row) {
                var i = (row * this.columnCount + this.index) * 2;
                var ret = ShortStringPool.get(this.stringPool, this.data.substring(this.tokens[i], this.tokens[i + 1]));
                if (ret === "." || ret === "?")
                    return null;
                return ret;
            };
            /**
             * Returns the integer value at given row.
             */
            Column.prototype.getInteger = function (row) {
                var i = (row * this.columnCount + this.index) * 2;
                return fastParseInt(this.data, this.tokens[i], this.tokens[i + 1]);
            };
            /**
             * Returns the float value at given row.
             */
            Column.prototype.getFloat = function (row) {
                var i = (row * this.columnCount + this.index) * 2;
                return fastParseFloat(this.data, this.tokens[i], this.tokens[i + 1]);
            };
            /**
             * Returns true if the token has the specified string value.
             */
            Column.prototype.stringEquals = function (row, value) {
                var aIndex = (row * this.columnCount + this.index) * 2, s = this.tokens[aIndex], len = value.length;
                if (len !== this.tokens[aIndex + 1] - s)
                    return false;
                for (var i = 0; i < len; i++) {
                    if (this.data.charCodeAt(i + s) !== value.charCodeAt(i))
                        return false;
                }
                return true;
            };
            /**
             * Determines if values at the given rows are equal.
             */
            Column.prototype.areValuesEqual = function (rowA, rowB) {
                var aIndex = (rowA * this.columnCount + this.index) * 2, bIndex = (rowB * this.columnCount + this.index) * 2;
                var aS = this.tokens[aIndex], bS = this.tokens[bIndex], len = this.tokens[aIndex + 1] - aS;
                if (len !== this.tokens[bIndex + 1] - bS)
                    return false;
                for (var i = 0; i < len; i++) {
                    if (this.data.charCodeAt(i + aS) !== this.data.charCodeAt(i + bS)) {
                        return false;
                    }
                }
                return true;
            };
            /**
             * Returns true if the value is not defined (. or ? token).
             */
            Column.prototype.getValuePresence = function (row) {
                var index = row * this.columnCount + this.index;
                var s = this.tokens[2 * index];
                if (this.tokens[2 * index + 1] - s !== 1)
                    return 0 /* Present */;
                var v = this.data.charCodeAt(s);
                if (v === 46 /* . */)
                    return 1 /* NotSpecified */;
                if (v === 63 /* ? */)
                    return 2 /* Unknown */;
                return 0 /* Present */;
            };
            return Column;
        }());
        Text.Column = Column;
    })(Text = CIFTools.Text || (CIFTools.Text = {}));
})(CIFTools || (CIFTools = {}));
/*
 * Copyright (c) 2016 - now David Sehnal, licensed under MIT License, See LICENSE file for more info.
 */
var CIFTools;
(function (CIFTools) {
    var Text;
    (function (Text) {
        "use strict";
        var TokenIndexBuilder;
        (function (TokenIndexBuilder) {
            function resize(builder) {
                // scale the size using golden ratio, because why not.
                var newBuffer = new Int32Array((1.61 * builder.tokens.length) | 0);
                newBuffer.set(builder.tokens);
                builder.tokens = newBuffer;
                builder.tokensLenMinus2 = (newBuffer.length - 2) | 0;
            }
            function addToken(builder, start, end) {
                if (builder.count >= builder.tokensLenMinus2) {
                    resize(builder);
                }
                builder.tokens[builder.count++] = start;
                builder.tokens[builder.count++] = end;
            }
            TokenIndexBuilder.addToken = addToken;
            function create(size) {
                return {
                    tokensLenMinus2: (size - 2) | 0,
                    count: 0,
                    tokens: new Int32Array(size)
                };
            }
            TokenIndexBuilder.create = create;
        })(TokenIndexBuilder || (TokenIndexBuilder = {}));
        /**
         * Eat everything until a whitespace/newline occurs.
         */
        function eatValue(state) {
            while (state.position < state.length) {
                switch (state.data.charCodeAt(state.position)) {
                    case 9: // \t
                    case 10: // \n
                    case 13: // \r
                    case 32: // ' '
                        state.currentTokenEnd = state.position;
                        return;
                    default:
                        ++state.position;
                        break;
                }
            }
            state.currentTokenEnd = state.position;
        }
        /**
         * Eats an escaped values. Handles the "degenerate" cases as well.
         *
         * "Degenerate" cases:
         * - 'xx'x' => xx'x
         * - 'xxxNEWLINE => 'xxx
         *
         */
        function eatEscaped(state, esc) {
            var next, c;
            ++state.position;
            while (state.position < state.length) {
                c = state.data.charCodeAt(state.position);
                if (c === esc) {
                    next = state.data.charCodeAt(state.position + 1);
                    switch (next) {
                        case 9: // \t
                        case 10: // \n
                        case 13: // \r
                        case 32: // ' '
                            // get rid of the quotes.
                            state.currentTokenStart++;
                            state.currentTokenEnd = state.position;
                            state.isEscaped = true;
                            ++state.position;
                            return;
                        default:
                            if (next === void 0) { // = "end of stream"
                                // get rid of the quotes.
                                state.currentTokenStart++;
                                state.currentTokenEnd = state.position;
                                state.isEscaped = true;
                                ++state.position;
                                return;
                            }
                            ++state.position;
                            break;
                    }
                }
                else {
                    // handle 'xxxNEWLINE => 'xxx
                    if (c === 10 || c === 13) {
                        state.currentTokenEnd = state.position;
                        return;
                    }
                    ++state.position;
                }
            }
            state.currentTokenEnd = state.position;
        }
        /**
         * Eats a multiline token of the form NL;....NL;
         */
        function eatMultiline(state) {
            var prev = 59, pos = state.position + 1, c;
            while (pos < state.length) {
                c = state.data.charCodeAt(pos);
                if (c === 59 && (prev === 10 || prev === 13)) { // ;, \n \r
                    state.position = pos + 1;
                    // get rid of the ;
                    state.currentTokenStart++;
                    // remove trailing newlines
                    pos--;
                    c = state.data.charCodeAt(pos);
                    while (c === 10 || c === 13) {
                        pos--;
                        c = state.data.charCodeAt(pos);
                    }
                    state.currentTokenEnd = pos + 1;
                    state.isEscaped = true;
                    return;
                }
                else {
                    // handle line numbers
                    if (c === 13) { // \r
                        state.currentLineNumber++;
                    }
                    else if (c === 10 && prev !== 13) { // \r\n
                        state.currentLineNumber++;
                    }
                    prev = c;
                    ++pos;
                }
            }
            state.position = pos;
            return prev;
        }
        /**
         * Skips until \n or \r occurs -- therefore the newlines get handled by the "skipWhitespace" function.
         */
        function skipCommentLine(state) {
            while (state.position < state.length) {
                var c = state.data.charCodeAt(state.position);
                if (c === 10 || c === 13) {
                    return;
                }
                ++state.position;
            }
        }
        /**
         * Skips all the whitespace - space, tab, newline, CR
         * Handles incrementing line count.
         */
        function skipWhitespace(state) {
            var prev = 10;
            while (state.position < state.length) {
                var c = state.data.charCodeAt(state.position);
                switch (c) {
                    case 9: // '\t'
                    case 32: // ' '
                        prev = c;
                        ++state.position;
                        break;
                    case 10: // \n
                        // handle \r\n
                        if (prev !== 13) {
                            ++state.currentLineNumber;
                        }
                        prev = c;
                        ++state.position;
                        break;
                    case 13: // \r
                        prev = c;
                        ++state.position;
                        ++state.currentLineNumber;
                        break;
                    default:
                        return prev;
                }
            }
            return prev;
        }
        function isData(state) {
            // here we already assume the 5th char is _ and that the length >= 5
            // d/D
            var c = state.data.charCodeAt(state.currentTokenStart);
            if (c !== 68 && c !== 100)
                return false;
            // a/A
            c = state.data.charCodeAt(state.currentTokenStart + 1);
            if (c !== 65 && c !== 97)
                return false;
            // t/t
            c = state.data.charCodeAt(state.currentTokenStart + 2);
            if (c !== 84 && c !== 116)
                return false;
            // a/A
            c = state.data.charCodeAt(state.currentTokenStart + 3);
            if (c !== 65 && c !== 97)
                return false;
            return true;
        }
        function isSave(state) {
            // here we already assume the 5th char is _ and that the length >= 5
            // s/S
            var c = state.data.charCodeAt(state.currentTokenStart);
            if (c !== 83 && c !== 115)
                return false;
            // a/A
            c = state.data.charCodeAt(state.currentTokenStart + 1);
            if (c !== 65 && c !== 97)
                return false;
            // v/V
            c = state.data.charCodeAt(state.currentTokenStart + 2);
            if (c !== 86 && c !== 118)
                return false;
            // e/E
            c = state.data.charCodeAt(state.currentTokenStart + 3);
            if (c !== 69 && c !== 101)
                return false;
            return true;
        }
        function isLoop(state) {
            // here we already assume the 5th char is _ and that the length >= 5
            if (state.currentTokenEnd - state.currentTokenStart !== 5)
                return false;
            // l/L
            var c = state.data.charCodeAt(state.currentTokenStart);
            if (c !== 76 && c !== 108)
                return false;
            // o/O
            c = state.data.charCodeAt(state.currentTokenStart + 1);
            if (c !== 79 && c !== 111)
                return false;
            // o/O
            c = state.data.charCodeAt(state.currentTokenStart + 2);
            if (c !== 79 && c !== 111)
                return false;
            // p/P
            c = state.data.charCodeAt(state.currentTokenStart + 3);
            if (c !== 80 && c !== 112)
                return false;
            return true;
        }
        /**
         * Checks if the current token shares the namespace with string at <start,end).
         */
        function isNamespace(state, start, end) {
            var i, nsLen = end - start, offset = state.currentTokenStart - start, tokenLen = state.currentTokenEnd - state.currentTokenStart;
            if (tokenLen < nsLen)
                return false;
            for (i = start; i < end; ++i) {
                if (state.data.charCodeAt(i) !== state.data.charCodeAt(i + offset))
                    return false;
            }
            if (nsLen === tokenLen)
                return true;
            if (state.data.charCodeAt(i + offset) === 46) { // .
                return true;
            }
            return false;
        }
        /**
         * Returns the index of '.' in the current token. If no '.' is present, returns currentTokenEnd.
         */
        function getNamespaceEnd(state) {
            var i;
            for (i = state.currentTokenStart; i < state.currentTokenEnd; ++i) {
                if (state.data.charCodeAt(i) === 46)
                    return i;
            }
            return i;
        }
        /**
         * Get the namespace string. endIndex is obtained by the getNamespaceEnd() function.
         */
        function getNamespace(state, endIndex) {
            return state.data.substring(state.currentTokenStart, endIndex);
        }
        /**
         * String representation of the current token.
         */
        function getTokenString(state) {
            return state.data.substring(state.currentTokenStart, state.currentTokenEnd);
        }
        /**
         * Move to the next token.
         */
        function moveNextInternal(state) {
            var prev = skipWhitespace(state);
            if (state.position >= state.length) {
                state.currentTokenType = 6 /* End */;
                return;
            }
            state.currentTokenStart = state.position;
            state.currentTokenEnd = state.position;
            state.isEscaped = false;
            var c = state.data.charCodeAt(state.position);
            switch (c) {
                case 35: // #, comment
                    skipCommentLine(state);
                    state.currentTokenType = 5 /* Comment */;
                    break;
                case 34: // ", escaped value
                case 39: // ', escaped value
                    eatEscaped(state, c);
                    state.currentTokenType = 3 /* Value */;
                    break;
                case 59: // ;, possible multiline value
                    // multiline value must start at the beginning of the line.
                    if (prev === 10 || prev === 13) { // /n or /r
                        eatMultiline(state);
                    }
                    else {
                        eatValue(state);
                    }
                    state.currentTokenType = 3 /* Value */;
                    break;
                default:
                    eatValue(state);
                    // escaped is always Value
                    if (state.isEscaped) {
                        state.currentTokenType = 3 /* Value */;
                        // _ always means column name
                    }
                    else if (state.data.charCodeAt(state.currentTokenStart) === 95) { // _
                        state.currentTokenType = 4 /* ColumnName */;
                        // 5th char needs to be _ for data_ or loop_
                    }
                    else if (state.currentTokenEnd - state.currentTokenStart >= 5 && state.data.charCodeAt(state.currentTokenStart + 4) === 95) {
                        if (isData(state))
                            state.currentTokenType = 0 /* Data */;
                        else if (isSave(state))
                            state.currentTokenType = 1 /* Save */;
                        else if (isLoop(state))
                            state.currentTokenType = 2 /* Loop */;
                        else
                            state.currentTokenType = 3 /* Value */;
                        // all other tests failed, we are at Value token.
                    }
                    else {
                        state.currentTokenType = 3 /* Value */;
                    }
                    break;
            }
        }
        /**
         * Moves to the next non-comment token.
         */
        function moveNext(state) {
            moveNextInternal(state);
            while (state.currentTokenType === 5 /* Comment */)
                moveNextInternal(state);
        }
        function createTokenizer(data) {
            return {
                data: data,
                length: data.length,
                position: 0,
                currentTokenStart: 0,
                currentTokenEnd: 0,
                currentTokenType: 6 /* End */,
                currentLineNumber: 1,
                isEscaped: false
            };
        }
        /**
         * Reads a category containing a single row.
         */
        function handleSingle(tokenizer, block) {
            var nsStart = tokenizer.currentTokenStart, nsEnd = getNamespaceEnd(tokenizer), name = getNamespace(tokenizer, nsEnd), column, columns = [], tokens = TokenIndexBuilder.create(512), tokenCount = 0, readingNames = true;
            while (readingNames) {
                if (tokenizer.currentTokenType !== 4 /* ColumnName */ || !isNamespace(tokenizer, nsStart, nsEnd)) {
                    readingNames = false;
                    break;
                }
                column = getTokenString(tokenizer);
                moveNext(tokenizer);
                if (tokenizer.currentTokenType !== 3 /* Value */) {
                    return {
                        hasError: true,
                        errorLine: tokenizer.currentLineNumber,
                        errorMessage: "Expected value."
                    };
                }
                columns[columns.length] = column;
                TokenIndexBuilder.addToken(tokens, tokenizer.currentTokenStart, tokenizer.currentTokenEnd);
                tokenCount++;
                moveNext(tokenizer);
            }
            block.addCategory(new Text.Category(block.data, name, nsStart, tokenizer.currentTokenStart, columns, tokens.tokens, tokenCount));
            return {
                hasError: false,
                errorLine: 0,
                errorMessage: ""
            };
        }
        /**
         * Reads a loop.
         */
        function handleLoop(tokenizer, block) {
            var start = tokenizer.currentTokenStart, loopLine = tokenizer.currentLineNumber;
            moveNext(tokenizer);
            var name = getNamespace(tokenizer, getNamespaceEnd(tokenizer)), columns = [], tokens = TokenIndexBuilder.create(name === "_atom_site" ? (block.data.length / 1.85) | 0 : 1024), tokenCount = 0;
            while (tokenizer.currentTokenType === 4 /* ColumnName */) {
                columns[columns.length] = getTokenString(tokenizer);
                moveNext(tokenizer);
            }
            while (tokenizer.currentTokenType === 3 /* Value */) {
                TokenIndexBuilder.addToken(tokens, tokenizer.currentTokenStart, tokenizer.currentTokenEnd);
                tokenCount++;
                moveNext(tokenizer);
            }
            if (tokenCount % columns.length !== 0) {
                return {
                    hasError: true,
                    errorLine: tokenizer.currentLineNumber,
                    errorMessage: "The number of values for loop starting at line " + loopLine + " is not a multiple of the number of columns."
                };
            }
            block.addCategory(new Text.Category(block.data, name, start, tokenizer.currentTokenStart, columns, tokens.tokens, tokenCount));
            return {
                hasError: false,
                errorLine: 0,
                errorMessage: ""
            };
        }
        /**
         * Creates an error result.
         */
        function error(line, message) {
            return CIFTools.ParserResult.error(message, line);
        }
        /**
         * Creates a data result.
         */
        function result(data) {
            return CIFTools.ParserResult.success(data);
        }
        /**
         * Parses an mmCIF file.
         *
         * @returns CifParserResult wrapper of the result.
         */
        function parseInternal(data) {
            var tokenizer = createTokenizer(data), cat, id, file = new Text.File(data), block = new Text.DataBlock(data, "default"), saveFrame = new Text.DataBlock(data, "empty"), inSaveFrame = false, blockSaveFrames;
            moveNext(tokenizer);
            while (tokenizer.currentTokenType !== 6 /* End */) {
                var token = tokenizer.currentTokenType;
                // Data block
                if (token === 0 /* Data */) {
                    if (inSaveFrame) {
                        return error(tokenizer.currentLineNumber, "Unexpected data block inside a save frame.");
                    }
                    if (block.categories.length > 0) {
                        file.dataBlocks.push(block);
                    }
                    block = new Text.DataBlock(data, data.substring(tokenizer.currentTokenStart + 5, tokenizer.currentTokenEnd));
                    moveNext(tokenizer);
                    // Save frame
                }
                else if (token === 1 /* Save */) {
                    id = data.substring(tokenizer.currentTokenStart + 5, tokenizer.currentTokenEnd);
                    if (id.length === 0) {
                        if (saveFrame.categories.length > 0) {
                            blockSaveFrames = block.additionalData["saveFrames"];
                            if (!blockSaveFrames) {
                                blockSaveFrames = [];
                                block.additionalData["saveFrames"] = blockSaveFrames;
                            }
                            blockSaveFrames[blockSaveFrames.length] = saveFrame;
                        }
                        inSaveFrame = false;
                    }
                    else {
                        if (inSaveFrame) {
                            return error(tokenizer.currentLineNumber, "Save frames cannot be nested.");
                        }
                        inSaveFrame = true;
                        saveFrame = new Text.DataBlock(data, id);
                    }
                    moveNext(tokenizer);
                    // Loop
                }
                else if (token === 2 /* Loop */) {
                    cat = handleLoop(tokenizer, inSaveFrame ? saveFrame : block);
                    if (cat.hasError) {
                        return error(cat.errorLine, cat.errorMessage);
                    }
                    // Single row
                }
                else if (token === 4 /* ColumnName */) {
                    cat = handleSingle(tokenizer, inSaveFrame ? saveFrame : block);
                    if (cat.hasError) {
                        return error(cat.errorLine, cat.errorMessage);
                    }
                    // Out of options
                }
                else {
                    return error(tokenizer.currentLineNumber, "Unexpected token. Expected data_, loop_, or data name.");
                }
            }
            // Check if the latest save frame was closed.
            if (inSaveFrame) {
                return error(tokenizer.currentLineNumber, "Unfinished save frame (`" + saveFrame.header + "`).");
            }
            if (block.categories.length > 0) {
                file.dataBlocks.push(block);
            }
            return result(file);
        }
        function parse(data) {
            return parseInternal(data);
        }
        Text.parse = parse;
    })(Text = CIFTools.Text || (CIFTools.Text = {}));
})(CIFTools || (CIFTools = {}));
/*
 * Copyright (c) 2016 - now David Sehnal, licensed under MIT License, See LICENSE file for more info.
 */
var CIFTools;
(function (CIFTools) {
    var Text;
    (function (Text) {
        "use strict";
        var StringWriter = CIFTools.Utils.StringWriter;
        var Writer = /** @class */ (function () {
            function Writer() {
                this.writer = StringWriter.create();
                this.encoded = false;
                this.dataBlockCreated = false;
            }
            Writer.prototype.startDataBlock = function (header) {
                this.dataBlockCreated = true;
                StringWriter.write(this.writer, "data_" + (header || '').replace(/[ \n\t]/g, '').toUpperCase() + "\n#\n");
            };
            Writer.prototype.writeCategory = function (category, contexts) {
                if (this.encoded) {
                    throw new Error('The writer contents have already been encoded, no more writing.');
                }
                if (!this.dataBlockCreated) {
                    throw new Error('No data block created.');
                }
                var src = !contexts || !contexts.length ? [category(void 0)] : contexts.map(function (c) { return category(c); });
                var data = src.filter(function (c) { return c && c.count > 0; });
                if (!data.length)
                    return;
                var count = data.reduce(function (a, c) { return a + (c.count === void 0 ? 1 : c.count); }, 0);
                if (!count)
                    return;
                else if (count === 1) {
                    writeCifSingleRecord(data[0], this.writer);
                }
                else {
                    writeCifLoop(data, this.writer);
                }
            };
            Writer.prototype.encode = function () {
                this.encoded = true;
            };
            Writer.prototype.flush = function (stream) {
                StringWriter.writeTo(this.writer, stream);
            };
            return Writer;
        }());
        Text.Writer = Writer;
        function isMultiline(value) {
            return !!value && value.indexOf('\n') >= 0;
        }
        function writeCifSingleRecord(category, writer) {
            var fields = category.desc.fields;
            var data = category.data;
            var width = fields.reduce(function (w, s) { return Math.max(w, s.name.length); }, 0) + category.desc.name.length + 5;
            for (var _i = 0, fields_1 = fields; _i < fields_1.length; _i++) {
                var f = fields_1[_i];
                StringWriter.writePadRight(writer, category.desc.name + "." + f.name, width);
                var presence = f.presence;
                var p = presence ? presence(data, 0) : 0 /* Present */;
                if (p !== 0 /* Present */) {
                    if (p === 1 /* NotSpecified */)
                        writeNotSpecified(writer);
                    else
                        writeUnknown(writer);
                }
                else {
                    var val = f.string(data, 0);
                    if (isMultiline(val)) {
                        writeMultiline(writer, val);
                        StringWriter.newline(writer);
                    }
                    else {
                        writeChecked(writer, val);
                    }
                }
                StringWriter.newline(writer);
            }
            StringWriter.write(writer, '#\n');
        }
        function writeCifLoop(categories, writer) {
            writeLine(writer, 'loop_');
            var first = categories[0];
            var fields = first.desc.fields;
            for (var _i = 0, fields_2 = fields; _i < fields_2.length; _i++) {
                var f = fields_2[_i];
                writeLine(writer, first.desc.name + "." + f.name);
            }
            for (var _a = 0, categories_1 = categories; _a < categories_1.length; _a++) {
                var category = categories_1[_a];
                var data = category.data;
                var count = category.count;
                for (var i = 0; i < count; i++) {
                    for (var _b = 0, fields_3 = fields; _b < fields_3.length; _b++) {
                        var f = fields_3[_b];
                        var presence = f.presence;
                        var p = presence ? presence(data, i) : 0 /* Present */;
                        if (p !== 0 /* Present */) {
                            if (p === 1 /* NotSpecified */)
                                writeNotSpecified(writer);
                            else
                                writeUnknown(writer);
                        }
                        else {
                            var val = f.string(data, i);
                            if (isMultiline(val)) {
                                writeMultiline(writer, val);
                                StringWriter.newline(writer);
                            }
                            else {
                                writeChecked(writer, val);
                            }
                        }
                    }
                    StringWriter.newline(writer);
                }
            }
            StringWriter.write(writer, '#\n');
        }
        function writeLine(writer, val) {
            StringWriter.write(writer, val);
            StringWriter.newline(writer);
        }
        function writeInteger(writer, val) {
            StringWriter.writeSafe(writer, '' + val + ' ');
        }
        /**
            * eg writeFloat(123.2123, 100) -- 2 decim
            */
        function writeFloat(writer, val, precisionMultiplier) {
            StringWriter.writeSafe(writer, '' + Math.round(precisionMultiplier * val) / precisionMultiplier + ' ');
        }
        /**
            * Writes '. '
            */
        function writeNotSpecified(writer) {
            StringWriter.writeSafe(writer, '. ');
        }
        /**
            * Writes '? '
            */
        function writeUnknown(writer) {
            StringWriter.writeSafe(writer, '? ');
        }
        function writeChecked(writer, val) {
            if (!val) {
                StringWriter.writeSafe(writer, '. ');
                return;
            }
            var escape = false, escapeCharStart = '\'', escapeCharEnd = '\' ';
            var hasWhitespace = false;
            var hasSingle = false;
            var hasDouble = false;
            for (var i = 0, _l = val.length - 1; i < _l; i++) {
                var c = val.charCodeAt(i);
                switch (c) {
                    case 9:
                        hasWhitespace = true;
                        break; // \t
                    case 10: // \n
                        StringWriter.writeSafe(writer, '\n;' + val);
                        StringWriter.writeSafe(writer, '\n; ');
                        return;
                    case 32:
                        hasWhitespace = true;
                        break; // ' '
                    case 34: // "
                        if (hasSingle) {
                            StringWriter.writeSafe(writer, '\n;' + val);
                            StringWriter.writeSafe(writer, '\n; ');
                            return;
                        }
                        hasDouble = true;
                        escape = true;
                        escapeCharStart = '\'';
                        escapeCharEnd = '\' ';
                        break;
                    case 39: // '
                        if (hasDouble) {
                            StringWriter.writeSafe(writer, '\n;' + val);
                            StringWriter.writeSafe(writer, '\n; ');
                            return;
                        }
                        escape = true;
                        hasSingle = true;
                        escapeCharStart = '"';
                        escapeCharEnd = '" ';
                        break;
                }
            }
            var fst = val.charCodeAt(0);
            if (!escape && (fst === 35 /* # */ || fst === 36 /* $ */ || fst === 59 /* ; */ || fst === 91 /* [ */ || fst === 93 /* ] */ || hasWhitespace)) {
                escapeCharStart = '\'';
                escapeCharEnd = '\' ';
                escape = true;
            }
            if (escape) {
                StringWriter.writeSafe(writer, escapeCharStart + val + escapeCharEnd);
            }
            else {
                StringWriter.write(writer, val);
                StringWriter.writeSafe(writer, ' ');
            }
        }
        function writeMultiline(writer, val) {
            StringWriter.writeSafe(writer, '\n;' + val);
            StringWriter.writeSafe(writer, '\n; ');
        }
        function writeToken(writer, data, start, end) {
            var escape = false, escapeCharStart = '\'', escapeCharEnd = '\' ';
            for (var i = start; i < end - 1; i++) {
                var c = data.charCodeAt(i);
                switch (c) {
                    case 10: // \n
                        StringWriter.writeSafe(writer, '\n;' + data.substring(start, end));
                        StringWriter.writeSafe(writer, '\n; ');
                        return;
                    case 34: // "
                        escape = true;
                        escapeCharStart = '\'';
                        escapeCharEnd = '\' ';
                        break;
                    case 39: // '
                        escape = true;
                        escapeCharStart = '"';
                        escapeCharEnd = '" ';
                        break;
                }
            }
            if (!escape && data.charCodeAt(start) === 59 /* ; */) {
                escapeCharStart = '\'';
                escapeCharEnd = '\' ';
                escape = true;
            }
            if (escape) {
                StringWriter.writeSafe(writer, escapeCharStart + data.substring(start, end));
                StringWriter.writeSafe(writer, escapeCharStart);
            }
            else {
                StringWriter.write(writer, data.substring(start, end));
                StringWriter.writeSafe(writer, ' ');
            }
        }
    })(Text = CIFTools.Text || (CIFTools.Text = {}));
})(CIFTools || (CIFTools = {}));
/*
 * Copyright (c) 2016 - now David Sehnal, licensed under MIT License, See LICENSE file for more info.
 */
var CIFTools;
(function (CIFTools) {
    var Binary;
    (function (Binary) {
        var MessagePack;
        (function (MessagePack) {
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
                var value = {};
                for (var i = 0; i < length; i++) {
                    var key = parse(state);
                    value[key] = parse(state);
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
                //   let value = buffer.subarray(offset, offset + length); //new Uint8Array(buffer.buffer, offset, length);
                // 
                // It turns out that using the view created by subarray probably uses DataView
                // in the background, which causes the element access to be several times slower
                // than creating the new byte array.
                var value = new Uint8Array(length);
                var o = state.offset;
                for (var i = 0; i < length; i++)
                    value[i] = state.buffer[i + o];
                state.offset += length;
                return value;
            }
            /**
             * decode string
             * @param  {Integer} length - number string characters
             * @return {String} decoded string
             */
            function str(state, length) {
                var value = MessagePack.utf8Read(state.buffer, state.offset, length);
                state.offset += length;
                return value;
            }
            /**
                 * decode array
                 * @param  {Integer} length - number of array elements
                 * @return {Array} decoded array
                 */
            function array(state, length) {
                var value = new Array(length);
                for (var i = 0; i < length; i++) {
                    value[i] = parse(state);
                }
                return value;
            }
            /**
             * recursively parse the MessagePack data
             * @return {Object|Array|String|Number|Boolean|null} decoded MessagePack data
             */
            function parse(state) {
                var type = state.buffer[state.offset];
                var value, length;
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
                throw new Error("Unknown type 0x" + type.toString(16));
            }
            function decode(buffer) {
                return parse({
                    buffer: buffer,
                    offset: 0,
                    dataView: new DataView(buffer.buffer)
                });
            }
            MessagePack.decode = decode;
        })(MessagePack = Binary.MessagePack || (Binary.MessagePack = {}));
    })(Binary = CIFTools.Binary || (CIFTools.Binary = {}));
})(CIFTools || (CIFTools = {}));
/*
 * Copyright (c) 2016 - now David Sehnal, licensed under MIT License, See LICENSE file for more info.
 */
var CIFTools;
(function (CIFTools) {
    var Binary;
    (function (Binary) {
        var MessagePack;
        (function (MessagePack) {
            /*
             * Adapted from https://github.com/rcsb/mmtf-javascript
             * by Alexander Rose <alexander.rose@weirdbyte.de>, MIT License, Copyright (c) 2016
             */
            function encode(value) {
                var buffer = new ArrayBuffer(encodedSize(value));
                var view = new DataView(buffer);
                var bytes = new Uint8Array(buffer);
                encodeInternal(value, view, bytes, 0);
                return bytes;
            }
            MessagePack.encode = encode;
            function encodedSize(value) {
                var type = typeof value;
                // Raw Bytes
                if (type === "string") {
                    var length_1 = MessagePack.utf8ByteCount(value);
                    if (length_1 < 0x20) {
                        return 1 + length_1;
                    }
                    if (length_1 < 0x100) {
                        return 2 + length_1;
                    }
                    if (length_1 < 0x10000) {
                        return 3 + length_1;
                    }
                    if (length_1 < 0x100000000) {
                        return 5 + length_1;
                    }
                }
                if (value instanceof Uint8Array) {
                    var length_2 = value.byteLength;
                    if (length_2 < 0x100) {
                        return 2 + length_2;
                    }
                    if (length_2 < 0x10000) {
                        return 3 + length_2;
                    }
                    if (length_2 < 0x100000000) {
                        return 5 + length_2;
                    }
                }
                if (type === "number") {
                    // Floating Point
                    // double
                    if (Math.floor(value) !== value)
                        return 9;
                    // Integers
                    if (value >= 0) {
                        // positive fixnum
                        if (value < 0x80)
                            return 1;
                        // uint 8
                        if (value < 0x100)
                            return 2;
                        // uint 16
                        if (value < 0x10000)
                            return 3;
                        // uint 32
                        if (value < 0x100000000)
                            return 5;
                        throw new Error("Number too big 0x" + value.toString(16));
                    }
                    // negative fixnum
                    if (value >= -0x20)
                        return 1;
                    // int 8
                    if (value >= -0x80)
                        return 2;
                    // int 16
                    if (value >= -0x8000)
                        return 3;
                    // int 32
                    if (value >= -0x80000000)
                        return 5;
                    throw new Error("Number too small -0x" + value.toString(16).substr(1));
                }
                // Boolean, null
                if (type === "boolean" || value === null || value === void 0)
                    return 1;
                // Container Types
                if (type === "object") {
                    var length_3, size = 0;
                    if (Array.isArray(value)) {
                        length_3 = value.length;
                        for (var i = 0; i < length_3; i++) {
                            size += encodedSize(value[i]);
                        }
                    }
                    else {
                        var keys = Object.keys(value);
                        length_3 = keys.length;
                        for (var i = 0; i < length_3; i++) {
                            var key = keys[i];
                            size += encodedSize(key) + encodedSize(value[key]);
                        }
                    }
                    if (length_3 < 0x10) {
                        return 1 + size;
                    }
                    if (length_3 < 0x10000) {
                        return 3 + size;
                    }
                    if (length_3 < 0x100000000) {
                        return 5 + size;
                    }
                    throw new Error("Array or object too long 0x" + length_3.toString(16));
                }
                throw new Error("Unknown type " + type);
            }
            function encodeInternal(value, view, bytes, offset) {
                var type = typeof value;
                // Strings Bytes
                if (type === "string") {
                    var length_4 = MessagePack.utf8ByteCount(value);
                    // fix str
                    if (length_4 < 0x20) {
                        view.setUint8(offset, length_4 | 0xa0);
                        MessagePack.utf8Write(bytes, offset + 1, value);
                        return 1 + length_4;
                    }
                    // str 8
                    if (length_4 < 0x100) {
                        view.setUint8(offset, 0xd9);
                        view.setUint8(offset + 1, length_4);
                        MessagePack.utf8Write(bytes, offset + 2, value);
                        return 2 + length_4;
                    }
                    // str 16
                    if (length_4 < 0x10000) {
                        view.setUint8(offset, 0xda);
                        view.setUint16(offset + 1, length_4);
                        MessagePack.utf8Write(bytes, offset + 3, value);
                        return 3 + length_4;
                    }
                    // str 32
                    if (length_4 < 0x100000000) {
                        view.setUint8(offset, 0xdb);
                        view.setUint32(offset + 1, length_4);
                        MessagePack.utf8Write(bytes, offset + 5, value);
                        return 5 + length_4;
                    }
                }
                if (value instanceof Uint8Array) {
                    var length_5 = value.byteLength;
                    var bytes_1 = new Uint8Array(view.buffer);
                    // bin 8
                    if (length_5 < 0x100) {
                        view.setUint8(offset, 0xc4);
                        view.setUint8(offset + 1, length_5);
                        bytes_1.set(value, offset + 2);
                        return 2 + length_5;
                    }
                    // bin 16
                    if (length_5 < 0x10000) {
                        view.setUint8(offset, 0xc5);
                        view.setUint16(offset + 1, length_5);
                        bytes_1.set(value, offset + 3);
                        return 3 + length_5;
                    }
                    // bin 32
                    if (length_5 < 0x100000000) {
                        view.setUint8(offset, 0xc6);
                        view.setUint32(offset + 1, length_5);
                        bytes_1.set(value, offset + 5);
                        return 5 + length_5;
                    }
                }
                if (type === "number") {
                    if (!isFinite(value)) {
                        throw new Error("Number not finite: " + value);
                    }
                    // Floating point
                    if (Math.floor(value) !== value) {
                        view.setUint8(offset, 0xcb);
                        view.setFloat64(offset + 1, value);
                        return 9;
                    }
                    // Integers
                    if (value >= 0) {
                        // positive fixnum
                        if (value < 0x80) {
                            view.setUint8(offset, value);
                            return 1;
                        }
                        // uint 8
                        if (value < 0x100) {
                            view.setUint8(offset, 0xcc);
                            view.setUint8(offset + 1, value);
                            return 2;
                        }
                        // uint 16
                        if (value < 0x10000) {
                            view.setUint8(offset, 0xcd);
                            view.setUint16(offset + 1, value);
                            return 3;
                        }
                        // uint 32
                        if (value < 0x100000000) {
                            view.setUint8(offset, 0xce);
                            view.setUint32(offset + 1, value);
                            return 5;
                        }
                        throw new Error("Number too big 0x" + value.toString(16));
                    }
                    // negative fixnum
                    if (value >= -0x20) {
                        view.setInt8(offset, value);
                        return 1;
                    }
                    // int 8
                    if (value >= -0x80) {
                        view.setUint8(offset, 0xd0);
                        view.setInt8(offset + 1, value);
                        return 2;
                    }
                    // int 16
                    if (value >= -0x8000) {
                        view.setUint8(offset, 0xd1);
                        view.setInt16(offset + 1, value);
                        return 3;
                    }
                    // int 32
                    if (value >= -0x80000000) {
                        view.setUint8(offset, 0xd2);
                        view.setInt32(offset + 1, value);
                        return 5;
                    }
                    throw new Error("Number too small -0x" + (-value).toString(16).substr(1));
                }
                // null
                if (value === null || value === undefined) {
                    view.setUint8(offset, 0xc0);
                    return 1;
                }
                // Boolean
                if (type === "boolean") {
                    view.setUint8(offset, value ? 0xc3 : 0xc2);
                    return 1;
                }
                // Container Types
                if (type === "object") {
                    var length_6, size = 0;
                    var isArray = Array.isArray(value);
                    var keys = void 0;
                    if (isArray) {
                        length_6 = value.length;
                    }
                    else {
                        keys = Object.keys(value);
                        length_6 = keys.length;
                    }
                    if (length_6 < 0x10) {
                        view.setUint8(offset, length_6 | (isArray ? 0x90 : 0x80));
                        size = 1;
                    }
                    else if (length_6 < 0x10000) {
                        view.setUint8(offset, isArray ? 0xdc : 0xde);
                        view.setUint16(offset + 1, length_6);
                        size = 3;
                    }
                    else if (length_6 < 0x100000000) {
                        view.setUint8(offset, isArray ? 0xdd : 0xdf);
                        view.setUint32(offset + 1, length_6);
                        size = 5;
                    }
                    if (isArray) {
                        for (var i = 0; i < length_6; i++) {
                            size += encodeInternal(value[i], view, bytes, offset + size);
                        }
                    }
                    else {
                        for (var _i = 0, _a = keys; _i < _a.length; _i++) {
                            var key = _a[_i];
                            size += encodeInternal(key, view, bytes, offset + size);
                            size += encodeInternal(value[key], view, bytes, offset + size);
                        }
                    }
                    return size;
                }
                throw new Error("Unknown type " + type);
            }
        })(MessagePack = Binary.MessagePack || (Binary.MessagePack = {}));
    })(Binary = CIFTools.Binary || (CIFTools.Binary = {}));
})(CIFTools || (CIFTools = {}));
/*
 * Copyright (c) 2016 - now David Sehnal, licensed under MIT License, See LICENSE file for more info.
 */
var CIFTools;
(function (CIFTools) {
    var Binary;
    (function (Binary) {
        var MessagePack;
        (function (MessagePack) {
            /*
             * Adapted from https://github.com/rcsb/mmtf-javascript
             * by Alexander Rose <alexander.rose@weirdbyte.de>, MIT License, Copyright (c) 2016
             */
            function utf8Write(data, offset, str) {
                var byteLength = data.byteLength;
                for (var i = 0, l = str.length; i < l; i++) {
                    var codePoint = str.charCodeAt(i);
                    // One byte of UTF-8
                    if (codePoint < 0x80) {
                        data[offset++] = codePoint >>> 0 & 0x7f | 0x00;
                        continue;
                    }
                    // Two bytes of UTF-8
                    if (codePoint < 0x800) {
                        data[offset++] = codePoint >>> 6 & 0x1f | 0xc0;
                        data[offset++] = codePoint >>> 0 & 0x3f | 0x80;
                        continue;
                    }
                    // Three bytes of UTF-8.
                    if (codePoint < 0x10000) {
                        data[offset++] = codePoint >>> 12 & 0x0f | 0xe0;
                        data[offset++] = codePoint >>> 6 & 0x3f | 0x80;
                        data[offset++] = codePoint >>> 0 & 0x3f | 0x80;
                        continue;
                    }
                    // Four bytes of UTF-8
                    if (codePoint < 0x110000) {
                        data[offset++] = codePoint >>> 18 & 0x07 | 0xf0;
                        data[offset++] = codePoint >>> 12 & 0x3f | 0x80;
                        data[offset++] = codePoint >>> 6 & 0x3f | 0x80;
                        data[offset++] = codePoint >>> 0 & 0x3f | 0x80;
                        continue;
                    }
                    throw new Error("bad codepoint " + codePoint);
                }
            }
            MessagePack.utf8Write = utf8Write;
            var __chars = function () {
                var data = [];
                for (var i = 0; i < 1024; i++)
                    data[i] = String.fromCharCode(i);
                return data;
            }();
            function throwError(err) {
                throw new Error(err);
            }
            function utf8Read(data, offset, length) {
                var chars = __chars;
                var str = void 0, chunk = [], chunkSize = 512, chunkOffset = 0;
                for (var i = offset, end = offset + length; i < end; i++) {
                    var byte = data[i];
                    // One byte character
                    if ((byte & 0x80) === 0x00) {
                        chunk[chunkOffset++] = chars[byte];
                    }
                    // Two byte character
                    else if ((byte & 0xe0) === 0xc0) {
                        chunk[chunkOffset++] = chars[((byte & 0x0f) << 6) | (data[++i] & 0x3f)];
                    }
                    // Three byte character
                    else if ((byte & 0xf0) === 0xe0) {
                        chunk[chunkOffset++] = String.fromCharCode(((byte & 0x0f) << 12) |
                            ((data[++i] & 0x3f) << 6) |
                            ((data[++i] & 0x3f) << 0));
                    }
                    // Four byte character
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
            MessagePack.utf8Read = utf8Read;
            function utf8ByteCount(str) {
                var count = 0;
                for (var i = 0, l = str.length; i < l; i++) {
                    var codePoint = str.charCodeAt(i);
                    if (codePoint < 0x80) {
                        count += 1;
                        continue;
                    }
                    if (codePoint < 0x800) {
                        count += 2;
                        continue;
                    }
                    if (codePoint < 0x10000) {
                        count += 3;
                        continue;
                    }
                    if (codePoint < 0x110000) {
                        count += 4;
                        continue;
                    }
                    throwError("bad codepoint " + codePoint);
                }
                return count;
            }
            MessagePack.utf8ByteCount = utf8ByteCount;
        })(MessagePack = Binary.MessagePack || (Binary.MessagePack = {}));
    })(Binary = CIFTools.Binary || (CIFTools.Binary = {}));
})(CIFTools || (CIFTools = {}));
/*
 * Copyright (c) 2016 - now David Sehnal, licensed under MIT License, See LICENSE file for more info.
 */
var CIFTools;
(function (CIFTools) {
    var Binary;
    (function (Binary) {
        "use strict";
        /**
         * Fixed point, delta, RLE, integer packing adopted from https://github.com/rcsb/mmtf-javascript/
         * by Alexander Rose <alexander.rose@weirdbyte.de>, MIT License, Copyright (c) 2016
         */
        function decode(data) {
            var current = data.data;
            for (var i = data.encoding.length - 1; i >= 0; i--) {
                current = Decoder.decodeStep(current, data.encoding[i]);
            }
            return current;
        }
        Binary.decode = decode;
        var Decoder;
        (function (Decoder) {
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
            Decoder.decodeStep = decodeStep;
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
            /* http://stackoverflow.com/questions/7869752/javascript-typed-arrays-and-endianness */
            var isLittleEndian = (function () {
                var arrayBuffer = new ArrayBuffer(2);
                var uint8Array = new Uint8Array(arrayBuffer);
                var uint16array = new Uint16Array(arrayBuffer);
                uint8Array[0] = 0xAA;
                uint8Array[1] = 0xBB;
                if (uint16array[0] === 0xBBAA)
                    return true;
                return false;
            })();
            function int8(data) { return new Int8Array(data.buffer, data.byteOffset); }
            function flipByteOrder(data, bytes) {
                var buffer = new ArrayBuffer(data.length);
                var ret = new Uint8Array(buffer);
                for (var i = 0, n = data.length; i < n; i += bytes) {
                    for (var j = 0; j < bytes; j++) {
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
                var n = data.length;
                var output = getFloatArray(encoding.srcType, n);
                var f = 1 / encoding.factor;
                for (var i = 0; i < n; i++) {
                    output[i] = f * data[i];
                }
                return output;
            }
            function intervalQuantization(data, encoding) {
                var n = data.length;
                var output = getFloatArray(encoding.srcType, n);
                var delta = (encoding.max - encoding.min) / (encoding.numSteps - 1);
                var min = encoding.min;
                for (var i = 0; i < n; i++) {
                    output[i] = min + delta * data[i];
                }
                return output;
            }
            function runLength(data, encoding) {
                var output = getIntArray(encoding.srcType, encoding.srcSize);
                var dataOffset = 0;
                for (var i = 0, il = data.length; i < il; i += 2) {
                    var value = data[i]; // value to be repeated
                    var length_7 = data[i + 1]; // number of repeats
                    for (var j = 0; j < length_7; ++j) {
                        output[dataOffset++] = value;
                    }
                }
                return output;
            }
            function delta(data, encoding) {
                var n = data.length;
                var output = getIntArray(encoding.srcType, n);
                if (!n)
                    return output;
                output[0] = data[0] + (encoding.origin | 0);
                for (var i = 1; i < n; ++i) {
                    output[i] = data[i] + output[i - 1];
                }
                return output;
            }
            function integerPackingSigned(data, encoding) {
                var upperLimit = encoding.byteCount === 1 ? 0x7F : 0x7FFF;
                var lowerLimit = -upperLimit - 1;
                var n = data.length;
                var output = new Int32Array(encoding.srcSize);
                var i = 0;
                var j = 0;
                while (i < n) {
                    var value = 0, t = data[i];
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
                var upperLimit = encoding.byteCount === 1 ? 0xFF : 0xFFFF;
                var n = data.length;
                var output = new Int32Array(encoding.srcSize);
                var i = 0;
                var j = 0;
                while (i < n) {
                    var value = 0, t = data[i];
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
                var str = encoding.stringData;
                var offsets = decode({ encoding: encoding.offsetEncoding, data: encoding.offsets });
                var indices = decode({ encoding: encoding.dataEncoding, data: data });
                var cache = Object.create(null);
                var result = new Array(indices.length);
                var offset = 0;
                for (var _i = 0, indices_1 = indices; _i < indices_1.length; _i++) {
                    var i = indices_1[_i];
                    if (i < 0) {
                        result[offset++] = null;
                        continue;
                    }
                    var v = cache[i];
                    if (v === void 0) {
                        v = str.substring(offsets[i], offsets[i + 1]);
                        cache[i] = v;
                    }
                    result[offset++] = v;
                }
                return result;
            }
        })(Decoder || (Decoder = {}));
    })(Binary = CIFTools.Binary || (CIFTools.Binary = {}));
})(CIFTools || (CIFTools = {}));
/*
 * Copyright (c) 2016 - now David Sehnal, licensed under MIT License, See LICENSE file for more info.
 */
var CIFTools;
(function (CIFTools) {
    var Binary;
    (function (Binary) {
        "use strict";
        var File = /** @class */ (function () {
            function File(data) {
                this.dataBlocks = data.dataBlocks.map(function (b) { return new DataBlock(b); });
            }
            File.prototype.toJSON = function () {
                return this.dataBlocks.map(function (b) { return b.toJSON(); });
            };
            return File;
        }());
        Binary.File = File;
        var DataBlock = /** @class */ (function () {
            function DataBlock(data) {
                this.additionalData = {};
                this.header = data.header;
                this.categoryList = data.categories.map(function (c) { return new Category(c); });
                this.categoryMap = new Map();
                for (var _i = 0, _a = this.categoryList; _i < _a.length; _i++) {
                    var c = _a[_i];
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
        Binary.DataBlock = DataBlock;
        var Category = /** @class */ (function () {
            function Category(data) {
                this.name = data.name;
                this.columnCount = data.columns.length;
                this.rowCount = data.rowCount;
                this.columnNameList = [];
                this.encodedColumns = new Map();
                for (var _i = 0, _a = data.columns; _i < _a.length; _i++) {
                    var c = _a[_i];
                    this.encodedColumns.set(c.name, c);
                    this.columnNameList.push(c.name);
                }
            }
            Object.defineProperty(Category.prototype, "columnNames", {
                get: function () { return this.columnNameList; },
                enumerable: true,
                configurable: true
            });
            Category.prototype.getColumn = function (name) {
                var w = this.encodedColumns.get(name);
                if (w)
                    return wrapColumn(w);
                return CIFTools.UndefinedColumn;
            };
            Category.prototype.toJSON = function () {
                var _this = this;
                var rows = [];
                var columns = this.columnNameList.map(function (name) { return ({ name: name, column: _this.getColumn(name) }); });
                for (var i = 0; i < this.rowCount; i++) {
                    var item = {};
                    for (var _i = 0, columns_1 = columns; _i < columns_1.length; _i++) {
                        var c = columns_1[_i];
                        var d = c.column.getValuePresence(i);
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
        Binary.Category = Category;
        function wrapColumn(column) {
            if (!column.data.data)
                return CIFTools.UndefinedColumn;
            var data = Binary.decode(column.data);
            var mask = void 0;
            if (column.mask)
                mask = Binary.decode(column.mask);
            if (data.buffer && data.byteLength && data.BYTES_PER_ELEMENT) {
                return mask ? new MaskedNumericColumn(data, mask) : new NumericColumn(data);
            }
            return mask ? new MaskedStringColumn(data, mask) : new StringColumn(data);
        }
        var fastParseInt = CIFTools.Utils.FastNumberParsers.parseInt;
        var fastParseFloat = CIFTools.Utils.FastNumberParsers.parseFloat;
        var NumericColumn = /** @class */ (function () {
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
        var MaskedNumericColumn = /** @class */ (function () {
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
        var StringColumn = /** @class */ (function () {
            function StringColumn(data) {
                this.data = data;
                this.isDefined = true;
            }
            StringColumn.prototype.getString = function (row) { return this.data[row]; };
            StringColumn.prototype.getInteger = function (row) { var v = this.data[row]; return fastParseInt(v, 0, v.length); };
            StringColumn.prototype.getFloat = function (row) { var v = this.data[row]; return fastParseFloat(v, 0, v.length); };
            StringColumn.prototype.stringEquals = function (row, value) { return this.data[row] === value; };
            StringColumn.prototype.areValuesEqual = function (rowA, rowB) { return this.data[rowA] === this.data[rowB]; };
            StringColumn.prototype.getValuePresence = function (row) { return 0 /* Present */; };
            return StringColumn;
        }());
        var MaskedStringColumn = /** @class */ (function () {
            function MaskedStringColumn(data, mask) {
                this.data = data;
                this.mask = mask;
                this.isDefined = true;
            }
            MaskedStringColumn.prototype.getString = function (row) { return this.mask[row] === 0 /* Present */ ? this.data[row] : null; };
            MaskedStringColumn.prototype.getInteger = function (row) { if (this.mask[row] !== 0 /* Present */)
                return 0; var v = this.data[row]; return fastParseInt(v || '', 0, (v || '').length); };
            MaskedStringColumn.prototype.getFloat = function (row) { if (this.mask[row] !== 0 /* Present */)
                return 0; var v = this.data[row]; return fastParseFloat(v || '', 0, (v || '').length); };
            MaskedStringColumn.prototype.stringEquals = function (row, value) { return this.data[row] === value; };
            MaskedStringColumn.prototype.areValuesEqual = function (rowA, rowB) { return this.data[rowA] === this.data[rowB]; };
            MaskedStringColumn.prototype.getValuePresence = function (row) { return this.mask[row]; };
            return MaskedStringColumn;
        }());
    })(Binary = CIFTools.Binary || (CIFTools.Binary = {}));
})(CIFTools || (CIFTools = {}));
/*
 * Copyright (c) 2016 - now David Sehnal, licensed under MIT License, See LICENSE file for more info.
 */
var CIFTools;
(function (CIFTools) {
    var Binary;
    (function (Binary) {
        "use strict";
        /**
         * Fixed point, delta, RLE, integer packing adopted from https://github.com/rcsb/mmtf-javascript/
         * by Alexander Rose <alexander.rose@weirdbyte.de>, MIT License, Copyright (c) 2016
         */
        var Encoder = /** @class */ (function () {
            function Encoder(providers) {
                this.providers = providers;
            }
            Encoder.prototype.and = function (f) {
                return new Encoder(this.providers.concat([f]));
            };
            Encoder.prototype.encode = function (data) {
                var encoding = [];
                for (var _i = 0, _a = this.providers; _i < _a.length; _i++) {
                    var p = _a[_i];
                    var t = p(data);
                    if (!t.encodings.length) {
                        throw new Error('Encodings must be non-empty.');
                    }
                    data = t.data;
                    for (var _b = 0, _c = t.encodings; _b < _c.length; _b++) {
                        var e = _c[_b];
                        encoding.push(e);
                    }
                }
                if (!(data instanceof Uint8Array)) {
                    throw new Error('The encoding must result in a Uint8Array. Fix your encoding chain.');
                }
                return {
                    encoding: encoding,
                    data: data
                };
            };
            return Encoder;
        }());
        Binary.Encoder = Encoder;
        (function (Encoder) {
            var _a, _b;
            function by(f) {
                return new Encoder([f]);
            }
            Encoder.by = by;
            function uint8(data) {
                return {
                    encodings: [{ kind: 'ByteArray', type: 4 /* Uint8 */ }],
                    data: data
                };
            }
            function int8(data) {
                return {
                    encodings: [{ kind: 'ByteArray', type: 1 /* Int8 */ }],
                    data: new Uint8Array(data.buffer, data.byteOffset)
                };
            }
            var writers = (_a = {},
                _a[2 /* Int16 */] = function (v, i, a) { v.setInt16(2 * i, a, true); },
                _a[5 /* Uint16 */] = function (v, i, a) { v.setUint16(2 * i, a, true); },
                _a[3 /* Int32 */] = function (v, i, a) { v.setInt32(4 * i, a, true); },
                _a[6 /* Uint32 */] = function (v, i, a) { v.setUint32(4 * i, a, true); },
                _a[32 /* Float32 */] = function (v, i, a) { v.setFloat32(4 * i, a, true); },
                _a[33 /* Float64 */] = function (v, i, a) { v.setFloat64(8 * i, a, true); },
                _a);
            var byteSizes = (_b = {},
                _b[2 /* Int16 */] = 2,
                _b[5 /* Uint16 */] = 2,
                _b[3 /* Int32 */] = 4,
                _b[6 /* Uint32 */] = 4,
                _b[32 /* Float32 */] = 4,
                _b[33 /* Float64 */] = 8,
                _b);
            function byteArray(data) {
                var type = Binary.Encoding.getDataType(data);
                if (type === 1 /* Int8 */)
                    return int8(data);
                else if (type === 4 /* Uint8 */)
                    return uint8(data);
                var result = new Uint8Array(data.length * byteSizes[type]);
                var w = writers[type];
                var view = new DataView(result.buffer);
                for (var i = 0, n = data.length; i < n; i++) {
                    w(view, i, data[i]);
                }
                return {
                    encodings: [{ kind: 'ByteArray', type: type }],
                    data: result
                };
            }
            Encoder.byteArray = byteArray;
            function _fixedPoint(data, factor) {
                var srcType = Binary.Encoding.getDataType(data);
                var result = new Int32Array(data.length);
                for (var i = 0, n = data.length; i < n; i++) {
                    result[i] = Math.round(data[i] * factor);
                }
                return {
                    encodings: [{ kind: 'FixedPoint', factor: factor, srcType: srcType }],
                    data: result
                };
            }
            function fixedPoint(factor) { return function (data) { return _fixedPoint(data, factor); }; }
            Encoder.fixedPoint = fixedPoint;
            function _intervalQuantizaiton(data, min, max, numSteps, arrayType) {
                var srcType = Binary.Encoding.getDataType(data);
                if (!data.length) {
                    return {
                        encodings: [{ kind: 'IntervalQuantization', min: min, max: max, numSteps: numSteps, srcType: srcType }],
                        data: new Int32Array(0)
                    };
                }
                if (max < min) {
                    var t = min;
                    min = max;
                    max = t;
                }
                var delta = (max - min) / (numSteps - 1);
                var output = new arrayType(data.length);
                for (var i = 0, n = data.length; i < n; i++) {
                    var v = data[i];
                    if (v <= min)
                        output[i] = 0;
                    else if (v >= max)
                        output[i] = numSteps;
                    else
                        output[i] = (Math.round((v - min) / delta)) | 0;
                }
                return {
                    encodings: [{ kind: 'IntervalQuantization', min: min, max: max, numSteps: numSteps, srcType: srcType }],
                    data: output
                };
            }
            function intervalQuantizaiton(min, max, numSteps, arrayType) {
                if (arrayType === void 0) { arrayType = Int32Array; }
                return function (data) { return _intervalQuantizaiton(data, min, max, numSteps, arrayType); };
            }
            Encoder.intervalQuantizaiton = intervalQuantizaiton;
            function runLength(data) {
                var srcType = Binary.Encoding.getDataType(data);
                if (srcType === void 0) {
                    data = new Int32Array(data);
                    srcType = 3 /* Int32 */;
                }
                if (!data.length) {
                    return {
                        encodings: [{ kind: 'RunLength', srcType: srcType, srcSize: 0 }],
                        data: new Int32Array(0)
                    };
                }
                // calculate output size
                var fullLength = 2;
                for (var i = 1, il = data.length; i < il; i++) {
                    if (data[i - 1] !== data[i]) {
                        fullLength += 2;
                    }
                }
                var output = new Int32Array(fullLength);
                var offset = 0;
                var runLength = 1;
                for (var i = 1, il = data.length; i < il; i++) {
                    if (data[i - 1] !== data[i]) {
                        output[offset] = data[i - 1];
                        output[offset + 1] = runLength;
                        runLength = 1;
                        offset += 2;
                    }
                    else {
                        ++runLength;
                    }
                }
                output[offset] = data[data.length - 1];
                output[offset + 1] = runLength;
                return {
                    encodings: [{ kind: 'RunLength', srcType: srcType, srcSize: data.length }],
                    data: output
                };
            }
            Encoder.runLength = runLength;
            function delta(data) {
                if (!Binary.Encoding.isSignedIntegerDataType(data)) {
                    throw new Error('Only signed integer types can be encoded using delta encoding.');
                }
                var srcType = Binary.Encoding.getDataType(data);
                if (srcType === void 0) {
                    data = new Int32Array(data);
                    srcType = 3 /* Int32 */;
                }
                if (!data.length) {
                    return {
                        encodings: [{ kind: 'Delta', origin: 0, srcType: srcType }],
                        data: new data.constructor(0)
                    };
                }
                var output = new data.constructor(data.length);
                var origin = data[0];
                output[0] = data[0];
                for (var i = 1, n = data.length; i < n; i++) {
                    output[i] = data[i] - data[i - 1];
                }
                output[0] = 0;
                return {
                    encodings: [{ kind: 'Delta', origin: origin, srcType: srcType }],
                    data: output
                };
            }
            Encoder.delta = delta;
            function isSigned(data) {
                for (var i = 0, n = data.length; i < n; i++) {
                    if (data[i] < 0)
                        return true;
                }
                return false;
            }
            function packingSize(data, upperLimit) {
                var lowerLimit = -upperLimit - 1;
                var size = 0;
                for (var i = 0, n = data.length; i < n; i++) {
                    var value = data[i];
                    if (value === 0) {
                        size += 1;
                    }
                    else if (value > 0) {
                        size += Math.ceil(value / upperLimit);
                        if (value % upperLimit === 0)
                            size += 1;
                    }
                    else {
                        size += Math.ceil(value / lowerLimit);
                        if (value % lowerLimit === 0)
                            size += 1;
                    }
                }
                return size;
            }
            function determinePacking(data) {
                var signed = isSigned(data);
                var size8 = signed ? packingSize(data, 0x7F) : packingSize(data, 0xFF);
                var size16 = signed ? packingSize(data, 0x7FFF) : packingSize(data, 0xFFFF);
                if (data.length * 4 < size16 * 2) {
                    // 4 byte packing is the most effective
                    return {
                        isSigned: signed,
                        size: data.length,
                        bytesPerElement: 4
                    };
                }
                else if (size16 * 2 < size8) {
                    // 2 byte packing is the most effective
                    return {
                        isSigned: signed,
                        size: size16,
                        bytesPerElement: 2
                    };
                }
                else {
                    // 1 byte packing is the most effective
                    return {
                        isSigned: signed,
                        size: size8,
                        bytesPerElement: 1
                    };
                }
                ;
            }
            function _integerPacking(data, packing) {
                var upperLimit = packing.isSigned
                    ? (packing.bytesPerElement === 1 ? 0x7F : 0x7FFF)
                    : (packing.bytesPerElement === 1 ? 0xFF : 0xFFFF);
                var lowerLimit = -upperLimit - 1;
                var n = data.length;
                var packed = packing.isSigned
                    ? packing.bytesPerElement === 1 ? new Int8Array(packing.size) : new Int16Array(packing.size)
                    : packing.bytesPerElement === 1 ? new Uint8Array(packing.size) : new Uint16Array(packing.size);
                var j = 0;
                for (var i = 0; i < n; i++) {
                    var value = data[i];
                    if (value >= 0) {
                        while (value >= upperLimit) {
                            packed[j] = upperLimit;
                            ++j;
                            value -= upperLimit;
                        }
                    }
                    else {
                        while (value <= lowerLimit) {
                            packed[j] = lowerLimit;
                            ++j;
                            value -= lowerLimit;
                        }
                    }
                    packed[j] = value;
                    ++j;
                }
                var result = byteArray(packed);
                return {
                    encodings: [{
                            kind: 'IntegerPacking',
                            byteCount: packing.bytesPerElement,
                            isUnsigned: !packing.isSigned,
                            srcSize: n
                        },
                        result.encodings[0]
                    ],
                    data: result.data
                };
            }
            /**
             * Packs Int32 array. The packing level is determined automatically to either 1-, 2-, or 4-byte words.
             */
            function integerPacking(data) {
                if (!(data instanceof Int32Array)) {
                    throw new Error('Integer packing can only be applied to Int32 data.');
                }
                var packing = determinePacking(data);
                if (packing.bytesPerElement === 4) {
                    // no packing done, Int32 encoding will be used
                    return byteArray(data);
                }
                return _integerPacking(data, packing);
            }
            Encoder.integerPacking = integerPacking;
            function stringArray(data) {
                var map = Object.create(null);
                var strings = [];
                var accLength = 0;
                var offsets = CIFTools.Utils.ChunkedArray.create(function (s) { return new Int32Array(s); }, 1024, 1);
                var output = new Int32Array(data.length);
                CIFTools.Utils.ChunkedArray.add(offsets, 0);
                var i = 0;
                for (var _i = 0, data_1 = data; _i < data_1.length; _i++) {
                    var s = data_1[_i];
                    // handle null strings.
                    if (s === null || s === void 0) {
                        output[i++] = -1;
                        continue;
                    }
                    var index = map[s];
                    if (index === void 0) {
                        // increment the length
                        accLength += s.length;
                        // store the string and index                   
                        index = strings.length;
                        strings[index] = s;
                        map[s] = index;
                        // write the offset
                        CIFTools.Utils.ChunkedArray.add(offsets, accLength);
                    }
                    output[i++] = index;
                }
                var encOffsets = Encoder.by(delta).and(integerPacking).encode(CIFTools.Utils.ChunkedArray.compact(offsets));
                var encOutput = Encoder.by(delta).and(runLength).and(integerPacking).encode(output);
                return {
                    encodings: [{ kind: 'StringArray', dataEncoding: encOutput.encoding, stringData: strings.join(''), offsetEncoding: encOffsets.encoding, offsets: encOffsets.data }],
                    data: encOutput.data
                };
            }
            Encoder.stringArray = stringArray;
        })(Encoder = Binary.Encoder || (Binary.Encoder = {}));
    })(Binary = CIFTools.Binary || (CIFTools.Binary = {}));
})(CIFTools || (CIFTools = {}));
/*
 * Copyright (c) 2016 - now David Sehnal, licensed under MIT License, See LICENSE file for more info.
 */
var CIFTools;
(function (CIFTools) {
    var Binary;
    (function (Binary) {
        "use strict";
        Binary.VERSION = '0.3.0';
        var Encoding;
        (function (Encoding) {
            function getDataType(data) {
                var srcType;
                if (data instanceof Int8Array)
                    srcType = 1 /* Int8 */;
                else if (data instanceof Int16Array)
                    srcType = 2 /* Int16 */;
                else if (data instanceof Int32Array)
                    srcType = 3 /* Int32 */;
                else if (data instanceof Uint8Array)
                    srcType = 4 /* Uint8 */;
                else if (data instanceof Uint16Array)
                    srcType = 5 /* Uint16 */;
                else if (data instanceof Uint32Array)
                    srcType = 6 /* Uint32 */;
                else if (data instanceof Float32Array)
                    srcType = 32 /* Float32 */;
                else if (data instanceof Float64Array)
                    srcType = 33 /* Float64 */;
                else
                    throw new Error('Unsupported integer data type.');
                return srcType;
            }
            Encoding.getDataType = getDataType;
            function isSignedIntegerDataType(data) {
                return data instanceof Int8Array || data instanceof Int16Array || data instanceof Int32Array;
            }
            Encoding.isSignedIntegerDataType = isSignedIntegerDataType;
        })(Encoding = Binary.Encoding || (Binary.Encoding = {}));
    })(Binary = CIFTools.Binary || (CIFTools.Binary = {}));
})(CIFTools || (CIFTools = {}));
/*
 * Copyright (c) 2016 - now David Sehnal, licensed under MIT License, See LICENSE file for more info.
 */
var CIFTools;
(function (CIFTools) {
    var Binary;
    (function (Binary) {
        "use strict";
        function checkVersions(min, current) {
            for (var i = 0; i < 2; i++) {
                if (min[i] > current[i])
                    return false;
            }
            return true;
        }
        function parse(data) {
            var minVersion = [0, 3];
            try {
                var array = new Uint8Array(data);
                var unpacked = Binary.MessagePack.decode(array);
                if (!checkVersions(minVersion, unpacked.version.match(/(\d)\.(\d)\.\d/).slice(1))) {
                    return CIFTools.ParserResult.error("Unsupported format version. Current " + unpacked.version + ", required " + minVersion.join('.') + ".");
                }
                var file = new Binary.File(unpacked);
                return CIFTools.ParserResult.success(file);
            }
            catch (e) {
                return CIFTools.ParserResult.error('' + e);
            }
        }
        Binary.parse = parse;
    })(Binary = CIFTools.Binary || (CIFTools.Binary = {}));
})(CIFTools || (CIFTools = {}));
/*
 * Copyright (c) 2016 - now David Sehnal, licensed under MIT License, See LICENSE file for more info.
 */
var CIFTools;
(function (CIFTools) {
    var Binary;
    (function (Binary) {
        "use strict";
        function encodeField(field, data, totalCount) {
            var array, isNative = false;
            if (field.typedArray) {
                array = new field.typedArray(totalCount);
            }
            else {
                isNative = true;
                array = new Array(totalCount);
            }
            var mask = new Uint8Array(totalCount);
            var presence = field.presence;
            var getter = field.number ? field.number : field.string;
            var allPresent = true;
            var offset = 0;
            for (var _i = 0, data_2 = data; _i < data_2.length; _i++) {
                var _d = data_2[_i];
                var d = _d.data;
                for (var i = 0, _b = _d.count; i < _b; i++) {
                    var p = presence ? presence(d, i) : 0 /* Present */;
                    if (p !== 0 /* Present */) {
                        mask[offset] = p;
                        if (isNative)
                            array[offset] = null;
                        allPresent = false;
                    }
                    else {
                        mask[offset] = 0 /* Present */;
                        array[offset] = getter(d, i);
                    }
                    offset++;
                }
            }
            var encoder = field.encoder ? field.encoder : Binary.Encoder.by(Binary.Encoder.stringArray);
            var encoded = encoder.encode(array);
            var maskData = void 0;
            if (!allPresent) {
                var maskRLE = Binary.Encoder.by(Binary.Encoder.runLength).and(Binary.Encoder.byteArray).encode(mask);
                if (maskRLE.data.length < mask.length) {
                    maskData = maskRLE;
                }
                else {
                    maskData = Binary.Encoder.by(Binary.Encoder.byteArray).encode(mask);
                }
            }
            return {
                name: field.name,
                data: encoded,
                mask: maskData
            };
        }
        var Writer = /** @class */ (function () {
            function Writer(encoder) {
                this.dataBlocks = [];
                this.data = {
                    encoder: encoder,
                    version: Binary.VERSION,
                    dataBlocks: this.dataBlocks
                };
            }
            Writer.prototype.startDataBlock = function (header) {
                this.dataBlocks.push({
                    header: (header || '').replace(/[ \n\t]/g, '').toUpperCase(),
                    categories: []
                });
            };
            Writer.prototype.writeCategory = function (category, contexts) {
                if (!this.data) {
                    throw new Error('The writer contents have already been encoded, no more writing.');
                }
                if (!this.dataBlocks.length) {
                    throw new Error('No data block created.');
                }
                var src = !contexts || !contexts.length ? [category(void 0)] : contexts.map(function (c) { return category(c); });
                var categories = src.filter(function (c) { return c && c.count > 0; });
                if (!categories.length)
                    return;
                var count = categories.reduce(function (a, c) { return a + c.count; }, 0);
                if (!count)
                    return;
                var first = categories[0];
                var cat = { name: first.desc.name, columns: [], rowCount: count };
                var data = categories.map(function (c) { return ({ data: c.data, count: c.count }); });
                for (var _i = 0, _a = first.desc.fields; _i < _a.length; _i++) {
                    var f = _a[_i];
                    cat.columns.push(encodeField(f, data, count));
                }
                this.dataBlocks[this.dataBlocks.length - 1].categories.push(cat);
            };
            Writer.prototype.encode = function () {
                this.encodedData = Binary.MessagePack.encode(this.data);
                this.data = null;
                this.dataBlocks = null;
            };
            Writer.prototype.flush = function (stream) {
                stream.writeBinary(this.encodedData);
            };
            return Writer;
        }());
        Binary.Writer = Writer;
    })(Binary = CIFTools.Binary || (CIFTools.Binary = {}));
})(CIFTools || (CIFTools = {}));
  return CIFTools;
}
if (typeof module === 'object' && typeof module.exports === 'object') {
  module.exports = __CIFTools();
} else if (typeof define === 'function' && define.amd) {
  define(['require'], function(require) { return __CIFTools(); })
} else {
  var __target = !!window ? window : this;
  __target.CIFTools = __CIFTools();
}

