"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ContentstackGatsby = void 0;
var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));
var _typeof2 = _interopRequireDefault(require("@babel/runtime/helpers/typeof"));
var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));
var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));
var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));
var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));
var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));
var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));
var _contentstack = _interopRequireDefault(require("contentstack"));
var _utils = require("@contentstack/utils");
var _lodash = _interopRequireDefault(require("lodash.isempty"));
var _storageHelper = require("./storage-helper");
function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
// max depth for nested references
var MAX_DEPTH_ALLOWED = 5;
var ContentstackGatsby = /*#__PURE__*/function () {
  function ContentstackGatsby(config) {
    (0, _classCallCheck2["default"])(this, ContentstackGatsby);
    (0, _defineProperty2["default"])(this, "config", void 0);
    (0, _defineProperty2["default"])(this, "stackSdk", void 0);
    (0, _defineProperty2["default"])(this, "contentTypes", void 0);
    (0, _defineProperty2["default"])(this, "referenceFields", void 0);
    (0, _defineProperty2["default"])(this, "referenceFieldPaths", void 0);
    this.config = config;
    this.livePreviewConfig = {
      hash: "",
      content_type_uid: "",
      entry_uid: ""
    };
    var stackConfig = _objectSpread(_objectSpread(_objectSpread({
      api_key: config.api_key,
      delivery_token: config.delivery_token,
      environment: config.environment
    }, config.region && {
      region: config.region
    }), config.branch && {
      branch: config.branch
    }), {}, {
      live_preview: {
        host: config.live_preview.host,
        management_token: config.live_preview.management_token,
        enable: config.live_preview.enable
      }
    });
    this.stackSdk = _contentstack["default"].Stack(stackConfig);

    // reference fields in various CTs and the CTs they refer
    this.referenceFieldsStorage = new _storageHelper.Storage(window.sessionStorage, 'reference_fields');
    this.referenceFields = this.referenceFieldsStorage.get();
    this.statusStorage = new _storageHelper.Storage(window.sessionStorage, "status");

    // json rte fields in various CTs
    this.jsonRteFieldsStorage = new _storageHelper.Storage(window.sessionStorage, 'json_rte_fields');
    this.jsonRteFields = this.jsonRteFieldsStorage.get();

    // only field paths extracted from the above map for current CT
    this.referenceFieldPaths = [];

    // store content types in LP site's session storage
    this.contentTypesStorage = new _storageHelper.Storage(window.sessionStorage, 'content_types');
    this.contentTypes = this.contentTypesStorage.get();
  }
  (0, _createClass2["default"])(ContentstackGatsby, [{
    key: "setHost",
    value: function setHost(host) {
      this.stackSdk.setHost(host);
    }
  }, {
    key: "fetchContentTypes",
    value: function () {
      var _fetchContentTypes = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(uids) {
        var result, contentTypes;
        return _regenerator["default"].wrap(function _callee$(_context) {
          while (1) switch (_context.prev = _context.next) {
            case 0:
              _context.prev = 0;
              _context.next = 3;
              return this.stackSdk.getContentTypes({
                query: {
                  uid: {
                    $in: uids
                  }
                }
              });
            case 3:
              result = _context.sent;
              if (!result) {
                _context.next = 8;
                break;
              }
              contentTypes = {};
              result.content_types.forEach(function (ct) {
                contentTypes[ct.uid] = ct;
              });
              return _context.abrupt("return", contentTypes);
            case 8:
              _context.next = 14;
              break;
            case 10:
              _context.prev = 10;
              _context.t0 = _context["catch"](0);
              console.error('ContentstackGatsby - Failed to fetch content types');
              throw _context.t0;
            case 14:
            case "end":
              return _context.stop();
          }
        }, _callee, this, [[0, 10]]);
      }));
      function fetchContentTypes(_x) {
        return _fetchContentTypes.apply(this, arguments);
      }
      return fetchContentTypes;
    }()
  }, {
    key: "getContentTypes",
    value: function () {
      var _getContentTypes = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2(uids) {
        var _this = this;
        var uidsToFetch, types;
        return _regenerator["default"].wrap(function _callee2$(_context2) {
          while (1) switch (_context2.prev = _context2.next) {
            case 0:
              // fetch and filter only content types that are not available in cache
              uidsToFetch = uids.filter(function (uid) {
                return !_this.contentTypes[uid];
              });
              if (uidsToFetch.length) {
                _context2.next = 3;
                break;
              }
              return _context2.abrupt("return", this.contentTypes);
            case 3:
              _context2.next = 5;
              return this.fetchContentTypes(uidsToFetch);
            case 5:
              types = _context2.sent;
              uidsToFetch.forEach(function (uid) {
                // TODO need to set it in two places, can be better
                _this.contentTypes[uid] = types[uid];
                _this.contentTypesStorage.set(uid, types[uid]);
              });
              return _context2.abrupt("return", this.contentTypes);
            case 8:
            case "end":
              return _context2.stop();
          }
        }, _callee2, this);
      }));
      function getContentTypes(_x2) {
        return _getContentTypes.apply(this, arguments);
      }
      return getContentTypes;
    }()
  }, {
    key: "extractReferences",
    value: function () {
      var _extractReferences = (0, _asyncToGenerator2["default"])(function () {
        var _this2 = this;
        var refPathMap = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
        var status = arguments.length > 1 ? arguments[1] : undefined;
        var jsonRtePaths = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];
        var depth = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : MAX_DEPTH_ALLOWED;
        var seen = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : [];
        return /*#__PURE__*/_regenerator["default"].mark(function _callee3() {
          var uids, contentTypes, refPathsCount, explorePaths, _iterator, _step, _step$value, refPath, refUids, _iterator2, _step2, uid, rPath;
          return _regenerator["default"].wrap(function _callee3$(_context3) {
            while (1) switch (_context3.prev = _context3.next) {
              case 0:
                if (!(depth <= 0)) {
                  _context3.next = 2;
                  break;
                }
                return _context3.abrupt("return", refPathMap);
              case 2:
                uids = (0, _toConsumableArray2["default"])(new Set(Object.values(refPathMap).flat()));
                _context3.next = 5;
                return _this2.getContentTypes(uids);
              case 5:
                contentTypes = _context3.sent;
                refPathsCount = Object.keys(refPathMap).length;
                explorePaths = Object.entries(refPathMap).filter(function (_ref) {
                  var _ref2 = (0, _slicedToArray2["default"])(_ref, 1),
                    path = _ref2[0];
                  return !seen.includes(path);
                });
                _iterator = _createForOfIteratorHelper(explorePaths);
                try {
                  for (_iterator.s(); !(_step = _iterator.n()).done;) {
                    _step$value = (0, _slicedToArray2["default"])(_step.value, 2), refPath = _step$value[0], refUids = _step$value[1];
                    // mark this reference path as seen
                    seen.push(refPath);
                    _iterator2 = _createForOfIteratorHelper(refUids);
                    try {
                      for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
                        uid = _step2.value;
                        rPath = refPath.split('.'); // when path is root, set path to []
                        if (refPath === '') {
                          rPath = [];
                        }
                        if (!status.hasLivePreviewEntryFound) {
                          status.hasLivePreviewEntryFound = _this2.isCurrentEntryEdited(uid);
                        }
                        _this2.extractUids(contentTypes[uid].schema, rPath, refPathMap, jsonRtePaths);
                      }
                    } catch (err) {
                      _iterator2.e(err);
                    } finally {
                      _iterator2.f();
                    }
                  }
                } catch (err) {
                  _iterator.e(err);
                } finally {
                  _iterator.f();
                }
                if (!(Object.keys(refPathMap).length > refPathsCount)) {
                  _context3.next = 13;
                  break;
                }
                _context3.next = 13;
                return _this2.extractReferences(refPathMap, status, jsonRtePaths, depth - 1, seen);
              case 13:
                return _context3.abrupt("return", {
                  refPathMap: refPathMap,
                  jsonRtePaths: jsonRtePaths
                });
              case 14:
              case "end":
                return _context3.stop();
            }
          }, _callee3);
        })();
      });
      function extractReferences() {
        return _extractReferences.apply(this, arguments);
      }
      return extractReferences;
    }()
  }, {
    key: "extractUids",
    value: function extractUids(schema) {
      var pathPrefix = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
      var refPathMap = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
      var jsonRtePaths = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : [];
      var referredUids = [];
      var _iterator3 = _createForOfIteratorHelper(schema),
        _step3;
      try {
        for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
          var _field$field_metadata;
          var field = _step3.value;
          var fieldPath = [].concat((0, _toConsumableArray2["default"])(pathPrefix), [field.uid]);
          if (field.data_type === 'reference' && Array.isArray(field.reference_to) && field.reference_to.length > 0) {
            referredUids.push.apply(referredUids, (0, _toConsumableArray2["default"])(field.reference_to));
            refPathMap[fieldPath.join('.')] = field.reference_to;
          } else if (field.data_type === 'blocks' && field.blocks && field.blocks.length > 0) {
            var _iterator4 = _createForOfIteratorHelper(field.blocks),
              _step4;
            try {
              for (_iterator4.s(); !(_step4 = _iterator4.n()).done;) {
                var block = _step4.value;
                var _this$extractUids = this.extractUids(block.schema, [].concat((0, _toConsumableArray2["default"])(fieldPath), [block.uid]), refPathMap, jsonRtePaths),
                  blockRefUids = _this$extractUids.referredUids;
                referredUids.push.apply(referredUids, (0, _toConsumableArray2["default"])(blockRefUids));
              }
            } catch (err) {
              _iterator4.e(err);
            } finally {
              _iterator4.f();
            }
          } else if (field.data_type === 'group' && field.schema && field.schema.length > 0) {
            var _this$extractUids2 = this.extractUids(field.schema, (0, _toConsumableArray2["default"])(fieldPath), refPathMap, jsonRtePaths),
              groupRefUids = _this$extractUids2.referredUids;
            referredUids.push.apply(referredUids, (0, _toConsumableArray2["default"])(groupRefUids));
          } else if (field.data_type === 'json' && (_field$field_metadata = field.field_metadata) !== null && _field$field_metadata !== void 0 && _field$field_metadata.allow_json_rte) {
            var rtePath = [].concat((0, _toConsumableArray2["default"])(pathPrefix), [field.uid]).join('.');
            jsonRtePaths.push(rtePath);
          }
        }
      } catch (err) {
        _iterator3.e(err);
      } finally {
        _iterator3.f();
      }
      return {
        referredUids: referredUids,
        refPathMap: refPathMap
      };
    }
  }, {
    key: "isNested",
    value: function isNested(value) {
      if ((0, _typeof2["default"])(value) === 'object' && !Array.isArray(value) && value !== null) {
        return true;
      }
      return false;
    }

    /**
     * Identify reference paths in user-provided data
     * @param {any} data - entry data
     * @param {string[]} currentPath - traversal path
     * @param {string[]} referenceFieldPaths - content type reference paths
     */
  }, {
    key: "identifyReferences",
    value: function identifyReferences(data) {
      var _this3 = this;
      var currentPath = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
      var referenceFieldPaths = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];
      var paths = [];
      var _loop = function _loop() {
        var _Object$entries$_i = (0, _slicedToArray2["default"])(_Object$entries[_i], 2),
          k = _Object$entries$_i[0],
          v = _Object$entries$_i[1];
        if (!v) {
          return "continue";
        }
        if (currentPath.length > 0) {
          var refPath = currentPath.join('.');
          // if a reference path and not already collected, collect it
          if (referenceFieldPaths.includes(refPath) && !paths.includes(refPath)) {
            paths.push(refPath);
          }
        }
        if (_this3.isNested(v)) {
          var tempPath = (0, _toConsumableArray2["default"])(currentPath);
          tempPath.push(k);
          var p = _this3.identifyReferences(v, tempPath, referenceFieldPaths);
          paths.push.apply(paths, (0, _toConsumableArray2["default"])(p));
        } else if (Array.isArray(v)) {
          var _tempPath = (0, _toConsumableArray2["default"])(currentPath);
          _tempPath.push(k);
          if (v.length > 0) {
            // need to go over all refs since each of them could be of different
            // content type and might contain refs
            var _iterator5 = _createForOfIteratorHelper(v),
              _step5;
            try {
              for (_iterator5.s(); !(_step5 = _iterator5.n()).done;) {
                var val = _step5.value;
                var _p = _this3.identifyReferences(val, _tempPath, referenceFieldPaths);
                paths.push.apply(paths, (0, _toConsumableArray2["default"])(_p));
              }
            } catch (err) {
              _iterator5.e(err);
            } finally {
              _iterator5.f();
            }
          }
          // no multiple ref present, Gatsby value -> [] (empty array)
          // no single ref present, Gatsby value -> []
          else if (v.length === 0 && referenceFieldPaths.includes(_tempPath.join('.'))) {
            // it is a single or multiple ref
            // also no idea what child references the user must be querying
            // so need to get all child refs
            paths.push(_tempPath.join('.'));
            var childRefPaths = referenceFieldPaths.filter(function (path) {
              return path.startsWith(_tempPath);
            });
            paths.push.apply(paths, (0, _toConsumableArray2["default"])(childRefPaths));
          }
        }
      };
      for (var _i = 0, _Object$entries = Object.entries(data); _i < _Object$entries.length; _i++) {
        var _ret = _loop();
        if (_ret === "continue") continue;
      }
      return (0, _toConsumableArray2["default"])(new Set(paths));
    }
  }, {
    key: "isCurrentEntryEdited",
    value: function isCurrentEntryEdited(entryContentType) {
      var _this$livePreviewConf;
      return entryContentType === ((_this$livePreviewConf = this.livePreviewConfig) === null || _this$livePreviewConf === void 0 ? void 0 : _this$livePreviewConf.content_type_uid);
    }
  }, {
    key: "get",
    value: function () {
      var _get = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee4(data) {
        var receivedData, live_preview, status, _this$statusStorage$g, contentTypeUid, entryUid, _yield$this$extractRe, refPathMap, jsonRtePaths, referencePaths, paths, entry, _this$jsonRteFields$c;
        return _regenerator["default"].wrap(function _callee4$(_context4) {
          while (1) switch (_context4.prev = _context4.next) {
            case 0:
              receivedData = structuredClone(data);
              live_preview = this.stackSdk.live_preview;
              status = {
                hasLivePreviewEntryFound: false
              };
              if (!(live_preview !== null && live_preview !== void 0 && live_preview.hash && live_preview.hash !== 'init')) {
                _context4.next = 34;
                break;
              }
              this.livePreviewConfig = live_preview;
              if (receivedData.__typename) {
                _context4.next = 7;
                break;
              }
              throw new Error("Entry data must contain __typename for live preview");
            case 7:
              if (receivedData.uid) {
                _context4.next = 9;
                break;
              }
              throw new Error("Entry data must contain uid for live preview");
            case 9:
              contentTypeUid = receivedData.__typename.split("_").slice(1).join("_");
              entryUid = receivedData.uid;
              status = (_this$statusStorage$g = this.statusStorage.get(contentTypeUid)) !== null && _this$statusStorage$g !== void 0 ? _this$statusStorage$g : {
                hasLivePreviewEntryFound: this.isCurrentEntryEdited(contentTypeUid)
              };
              if (!((0, _lodash["default"])(this.referenceFields[contentTypeUid]) || (0, _lodash["default"])(this.jsonRteFields[contentTypeUid]))) {
                _context4.next = 22;
                break;
              }
              _context4.next = 15;
              return this.extractReferences({
                '': [contentTypeUid]
              }, status);
            case 15:
              _yield$this$extractRe = _context4.sent;
              refPathMap = _yield$this$extractRe.refPathMap;
              jsonRtePaths = _yield$this$extractRe.jsonRtePaths;
              // store reference paths
              this.referenceFields[contentTypeUid] = refPathMap;
              this.referenceFieldsStorage.set(contentTypeUid, this.referenceFields[contentTypeUid]);
              // store json rte paths
              this.jsonRteFields[contentTypeUid] = jsonRtePaths;
              this.jsonRteFieldsStorage.set(contentTypeUid, this.jsonRteFields[contentTypeUid]);
            case 22:
              referencePaths = Object.keys(this.referenceFields[contentTypeUid]);
              referencePaths = referencePaths.filter(function (field) {
                return !!field;
              });
              paths = this.identifyReferences(receivedData, [], referencePaths);
              this.statusStorage.set(contentTypeUid, status);
              if (status.hasLivePreviewEntryFound) {
                _context4.next = 28;
                break;
              }
              return _context4.abrupt("return", receivedData);
            case 28:
              _context4.next = 30;
              return this.stackSdk.ContentType(contentTypeUid).Entry(entryUid).includeReference(paths).toJSON().fetch();
            case 30:
              entry = _context4.sent;
              if ((0, _lodash["default"])(entry)) {
                _context4.next = 34;
                break;
              }
              if (this.config.jsonRteToHtml) {
                (0, _utils.jsonToHTML)({
                  entry: entry,
                  paths: (_this$jsonRteFields$c = this.jsonRteFields[contentTypeUid]) !== null && _this$jsonRteFields$c !== void 0 ? _this$jsonRteFields$c : []
                });
              }
              return _context4.abrupt("return", entry);
            case 34:
              return _context4.abrupt("return", receivedData);
            case 35:
            case "end":
              return _context4.stop();
          }
        }, _callee4, this);
      }));
      function get(_x3) {
        return _get.apply(this, arguments);
      }
      return get;
    }()
  }], [{
    key: "addContentTypeUidFromTypename",
    value: function addContentTypeUidFromTypename(entry) {
      if (typeof entry === "undefined") {
        throw new TypeError("entry cannot be empty");
      }
      if (entry === null) {
        throw new TypeError("entry cannot be null");
      }
      if ((0, _typeof2["default"])(entry) !== "object") {
        throw new TypeError("entry must be an object");
      }
      if (Array.isArray(entry)) {
        throw new TypeError("entry cannot be an object, pass an instance of entry");
      }
      traverse(entry);
      function traverse(field) {
        if (!field || (0, _typeof2["default"])(field) !== "object") {
          return;
        }
        if (Array.isArray(field)) {
          field.forEach(function (instance) {
            return traverse(instance);
          });
        }
        if (Object.hasOwnProperty.call(field, "__typename") && typeof field.__typename == "string") {
          field._content_type_uid = field.__typename.split("_").slice(1).join("_");
        }
        Object.values(field).forEach(function (subField) {
          return traverse(subField);
        });
      }
    }
  }]);
  return ContentstackGatsby;
}();
exports.ContentstackGatsby = ContentstackGatsby;
//# sourceMappingURL=index.js.map