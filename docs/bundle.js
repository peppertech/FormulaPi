define('components/header',["require", "exports", "preact", "ojs/ojresponsiveutils", "ojs/ojtoolbar", "ojs/ojmenu", "ojs/ojbutton"], function (require, exports, preact_1, ResponsiveUtils) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Header = void 0;
    class Header extends preact_1.Component {
        constructor(props) {
            super(props);
            const smallOnlyQuery = ResponsiveUtils.getFrameworkQuery("sm-only");
            this.mediaQuery = window.matchMedia(smallOnlyQuery);
            this._mediaQueryChangeListener = this._mediaQueryChangeListener.bind(this);
            const displayType = this._getDisplayTypeFromMediaQuery(this.mediaQuery);
            const endIconClass = this._getEndIconClassFromDisplayType(displayType);
            this.state = {
                displayType,
                endIconClass
            };
        }
        render(props, state) {
            return ((0, preact_1.h)("header", { role: "banner", class: "oj-web-applayout-header" },
                (0, preact_1.h)("div", { class: "oj-web-applayout-max-width oj-flex-bar oj-sm-align-items-center" },
                    (0, preact_1.h)("div", { class: "oj-flex-bar-middle oj-sm-align-items-baseline" },
                        (0, preact_1.h)("span", { role: "img", class: "oj-icon demo-oracle-icon", title: "Oracle Logo", alt: "Oracle Logo" }),
                        (0, preact_1.h)("h1", { class: "oj-sm-only-hide oj-web-applayout-header-title", title: props.appName }, props.appName)),
                    (0, preact_1.h)("div", { class: "oj-flex-bar-end" }))));
        }
        componentDidMount() {
            this.mediaQuery.addEventListener("change", this._mediaQueryChangeListener);
        }
        componentWillUnmount() {
            this.mediaQuery.removeEventListener("change", this._mediaQueryChangeListener);
        }
        _mediaQueryChangeListener(mediaQuery) {
            const displayType = this._getDisplayTypeFromMediaQuery(mediaQuery);
            const endIconClass = this._getEndIconClassFromDisplayType(displayType);
            this.setState({
                displayType,
                endIconClass
            });
        }
        _getDisplayTypeFromMediaQuery(mediaQuery) {
            return mediaQuery.matches ? "icons" : "all";
        }
        _getEndIconClassFromDisplayType(displayType) {
            return displayType === "icons" ?
                "oj-icon demo-appheader-avatar" :
                "oj-component-icon oj-button-menu-dropdown-icon";
        }
    }
    exports.Header = Header;
});

/**
 * @license text 2.0.15 Copyright jQuery Foundation and other contributors.
 * Released under MIT license, http://github.com/requirejs/text/LICENSE
 */
/*jslint regexp: true */
/*global require, XMLHttpRequest, ActiveXObject,
  define, window, process, Packages,
  java, location, Components, FileUtils */

define('text',['module'], function (module) {
    'use strict';

    var text, fs, Cc, Ci, xpcIsWindows,
        progIds = ['Msxml2.XMLHTTP', 'Microsoft.XMLHTTP', 'Msxml2.XMLHTTP.4.0'],
        xmlRegExp = /^\s*<\?xml(\s)+version=[\'\"](\d)*.(\d)*[\'\"](\s)*\?>/im,
        bodyRegExp = /<body[^>]*>\s*([\s\S]+)\s*<\/body>/im,
        hasLocation = typeof location !== 'undefined' && location.href,
        defaultProtocol = hasLocation && location.protocol && location.protocol.replace(/\:/, ''),
        defaultHostName = hasLocation && location.hostname,
        defaultPort = hasLocation && (location.port || undefined),
        buildMap = {},
        masterConfig = (module.config && module.config()) || {};

    function useDefault(value, defaultValue) {
        return value === undefined || value === '' ? defaultValue : value;
    }

    //Allow for default ports for http and https.
    function isSamePort(protocol1, port1, protocol2, port2) {
        if (port1 === port2) {
            return true;
        } else if (protocol1 === protocol2) {
            if (protocol1 === 'http') {
                return useDefault(port1, '80') === useDefault(port2, '80');
            } else if (protocol1 === 'https') {
                return useDefault(port1, '443') === useDefault(port2, '443');
            }
        }
        return false;
    }

    text = {
        version: '2.0.15',

        strip: function (content) {
            //Strips <?xml ...?> declarations so that external SVG and XML
            //documents can be added to a document without worry. Also, if the string
            //is an HTML document, only the part inside the body tag is returned.
            if (content) {
                content = content.replace(xmlRegExp, "");
                var matches = content.match(bodyRegExp);
                if (matches) {
                    content = matches[1];
                }
            } else {
                content = "";
            }
            return content;
        },

        jsEscape: function (content) {
            return content.replace(/(['\\])/g, '\\$1')
                .replace(/[\f]/g, "\\f")
                .replace(/[\b]/g, "\\b")
                .replace(/[\n]/g, "\\n")
                .replace(/[\t]/g, "\\t")
                .replace(/[\r]/g, "\\r")
                .replace(/[\u2028]/g, "\\u2028")
                .replace(/[\u2029]/g, "\\u2029");
        },

        createXhr: masterConfig.createXhr || function () {
            //Would love to dump the ActiveX crap in here. Need IE 6 to die first.
            var xhr, i, progId;
            if (typeof XMLHttpRequest !== "undefined") {
                return new XMLHttpRequest();
            } else if (typeof ActiveXObject !== "undefined") {
                for (i = 0; i < 3; i += 1) {
                    progId = progIds[i];
                    try {
                        xhr = new ActiveXObject(progId);
                    } catch (e) {}

                    if (xhr) {
                        progIds = [progId];  // so faster next time
                        break;
                    }
                }
            }

            return xhr;
        },

        /**
         * Parses a resource name into its component parts. Resource names
         * look like: module/name.ext!strip, where the !strip part is
         * optional.
         * @param {String} name the resource name
         * @returns {Object} with properties "moduleName", "ext" and "strip"
         * where strip is a boolean.
         */
        parseName: function (name) {
            var modName, ext, temp,
                strip = false,
                index = name.lastIndexOf("."),
                isRelative = name.indexOf('./') === 0 ||
                             name.indexOf('../') === 0;

            if (index !== -1 && (!isRelative || index > 1)) {
                modName = name.substring(0, index);
                ext = name.substring(index + 1);
            } else {
                modName = name;
            }

            temp = ext || modName;
            index = temp.indexOf("!");
            if (index !== -1) {
                //Pull off the strip arg.
                strip = temp.substring(index + 1) === "strip";
                temp = temp.substring(0, index);
                if (ext) {
                    ext = temp;
                } else {
                    modName = temp;
                }
            }

            return {
                moduleName: modName,
                ext: ext,
                strip: strip
            };
        },

        xdRegExp: /^((\w+)\:)?\/\/([^\/\\]+)/,

        /**
         * Is an URL on another domain. Only works for browser use, returns
         * false in non-browser environments. Only used to know if an
         * optimized .js version of a text resource should be loaded
         * instead.
         * @param {String} url
         * @returns Boolean
         */
        useXhr: function (url, protocol, hostname, port) {
            var uProtocol, uHostName, uPort,
                match = text.xdRegExp.exec(url);
            if (!match) {
                return true;
            }
            uProtocol = match[2];
            uHostName = match[3];

            uHostName = uHostName.split(':');
            uPort = uHostName[1];
            uHostName = uHostName[0];

            return (!uProtocol || uProtocol === protocol) &&
                   (!uHostName || uHostName.toLowerCase() === hostname.toLowerCase()) &&
                   ((!uPort && !uHostName) || isSamePort(uProtocol, uPort, protocol, port));
        },

        finishLoad: function (name, strip, content, onLoad) {
            content = strip ? text.strip(content) : content;
            if (masterConfig.isBuild) {
                buildMap[name] = content;
            }
            onLoad(content);
        },

        load: function (name, req, onLoad, config) {
            //Name has format: some.module.filext!strip
            //The strip part is optional.
            //if strip is present, then that means only get the string contents
            //inside a body tag in an HTML string. For XML/SVG content it means
            //removing the <?xml ...?> declarations so the content can be inserted
            //into the current doc without problems.

            // Do not bother with the work if a build and text will
            // not be inlined.
            if (config && config.isBuild && !config.inlineText) {
                onLoad();
                return;
            }

            masterConfig.isBuild = config && config.isBuild;

            var parsed = text.parseName(name),
                nonStripName = parsed.moduleName +
                    (parsed.ext ? '.' + parsed.ext : ''),
                url = req.toUrl(nonStripName),
                useXhr = (masterConfig.useXhr) ||
                         text.useXhr;

            // Do not load if it is an empty: url
            if (url.indexOf('empty:') === 0) {
                onLoad();
                return;
            }

            //Load the text. Use XHR if possible and in a browser.
            if (!hasLocation || useXhr(url, defaultProtocol, defaultHostName, defaultPort)) {
                text.get(url, function (content) {
                    text.finishLoad(name, parsed.strip, content, onLoad);
                }, function (err) {
                    if (onLoad.error) {
                        onLoad.error(err);
                    }
                });
            } else {
                //Need to fetch the resource across domains. Assume
                //the resource has been optimized into a JS module. Fetch
                //by the module name + extension, but do not include the
                //!strip part to avoid file system issues.
                req([nonStripName], function (content) {
                    text.finishLoad(parsed.moduleName + '.' + parsed.ext,
                                    parsed.strip, content, onLoad);
                });
            }
        },

        write: function (pluginName, moduleName, write, config) {
            if (buildMap.hasOwnProperty(moduleName)) {
                var content = text.jsEscape(buildMap[moduleName]);
                write.asModule(pluginName + "!" + moduleName,
                               "define(function () { return '" +
                                   content +
                               "';});\n");
            }
        },

        writeFile: function (pluginName, moduleName, req, write, config) {
            var parsed = text.parseName(moduleName),
                extPart = parsed.ext ? '.' + parsed.ext : '',
                nonStripName = parsed.moduleName + extPart,
                //Use a '.js' file name so that it indicates it is a
                //script that can be loaded across domains.
                fileName = req.toUrl(parsed.moduleName + extPart) + '.js';

            //Leverage own load() method to load plugin value, but only
            //write out values that do not have the strip argument,
            //to avoid any potential issues with ! in file names.
            text.load(nonStripName, req, function (value) {
                //Use own write() method to construct full module value.
                //But need to create shell that translates writeFile's
                //write() to the right interface.
                var textWrite = function (contents) {
                    return write(fileName, contents);
                };
                textWrite.asModule = function (moduleName, contents) {
                    return write.asModule(moduleName, fileName, contents);
                };

                text.write(pluginName, nonStripName, textWrite, config);
            }, config);
        }
    };

    if (masterConfig.env === 'node' || (!masterConfig.env &&
            typeof process !== "undefined" &&
            process.versions &&
            !!process.versions.node &&
            !process.versions['node-webkit'] &&
            !process.versions['atom-shell'])) {
        //Using special require.nodeRequire, something added by r.js.
        fs = require.nodeRequire('fs');

        text.get = function (url, callback, errback) {
            try {
                var file = fs.readFileSync(url, 'utf8');
                //Remove BOM (Byte Mark Order) from utf8 files if it is there.
                if (file[0] === '\uFEFF') {
                    file = file.substring(1);
                }
                callback(file);
            } catch (e) {
                if (errback) {
                    errback(e);
                }
            }
        };
    } else if (masterConfig.env === 'xhr' || (!masterConfig.env &&
            text.createXhr())) {
        text.get = function (url, callback, errback, headers) {
            var xhr = text.createXhr(), header;
            xhr.open('GET', url, true);

            //Allow plugins direct access to xhr headers
            if (headers) {
                for (header in headers) {
                    if (headers.hasOwnProperty(header)) {
                        xhr.setRequestHeader(header.toLowerCase(), headers[header]);
                    }
                }
            }

            //Allow overrides specified in config
            if (masterConfig.onXhr) {
                masterConfig.onXhr(xhr, url);
            }

            xhr.onreadystatechange = function (evt) {
                var status, err;
                //Do not explicitly handle errors, those should be
                //visible via console output in the browser.
                if (xhr.readyState === 4) {
                    status = xhr.status || 0;
                    if (status > 399 && status < 600) {
                        //An http 4xx or 5xx error. Signal an error.
                        err = new Error(url + ' HTTP status: ' + status);
                        err.xhr = xhr;
                        if (errback) {
                            errback(err);
                        }
                    } else {
                        callback(xhr.responseText);
                    }

                    if (masterConfig.onXhrComplete) {
                        masterConfig.onXhrComplete(xhr, url);
                    }
                }
            };
            xhr.send(null);
        };
    } else if (masterConfig.env === 'rhino' || (!masterConfig.env &&
            typeof Packages !== 'undefined' && typeof java !== 'undefined')) {
        //Why Java, why is this so awkward?
        text.get = function (url, callback) {
            var stringBuffer, line,
                encoding = "utf-8",
                file = new java.io.File(url),
                lineSeparator = java.lang.System.getProperty("line.separator"),
                input = new java.io.BufferedReader(new java.io.InputStreamReader(new java.io.FileInputStream(file), encoding)),
                content = '';
            try {
                stringBuffer = new java.lang.StringBuffer();
                line = input.readLine();

                // Byte Order Mark (BOM) - The Unicode Standard, version 3.0, page 324
                // http://www.unicode.org/faq/utf_bom.html

                // Note that when we use utf-8, the BOM should appear as "EF BB BF", but it doesn't due to this bug in the JDK:
                // http://bugs.sun.com/bugdatabase/view_bug.do?bug_id=4508058
                if (line && line.length() && line.charAt(0) === 0xfeff) {
                    // Eat the BOM, since we've already found the encoding on this file,
                    // and we plan to concatenating this buffer with others; the BOM should
                    // only appear at the top of a file.
                    line = line.substring(1);
                }

                if (line !== null) {
                    stringBuffer.append(line);
                }

                while ((line = input.readLine()) !== null) {
                    stringBuffer.append(lineSeparator);
                    stringBuffer.append(line);
                }
                //Make sure we return a JavaScript string and not a Java string.
                content = String(stringBuffer.toString()); //String
            } finally {
                input.close();
            }
            callback(content);
        };
    } else if (masterConfig.env === 'xpconnect' || (!masterConfig.env &&
            typeof Components !== 'undefined' && Components.classes &&
            Components.interfaces)) {
        //Avert your gaze!
        Cc = Components.classes;
        Ci = Components.interfaces;
        Components.utils['import']('resource://gre/modules/FileUtils.jsm');
        xpcIsWindows = ('@mozilla.org/windows-registry-key;1' in Cc);

        text.get = function (url, callback) {
            var inStream, convertStream, fileObj,
                readData = {};

            if (xpcIsWindows) {
                url = url.replace(/\//g, '\\');
            }

            fileObj = new FileUtils.File(url);

            //XPCOM, you so crazy
            try {
                inStream = Cc['@mozilla.org/network/file-input-stream;1']
                           .createInstance(Ci.nsIFileInputStream);
                inStream.init(fileObj, 1, 0, false);

                convertStream = Cc['@mozilla.org/intl/converter-input-stream;1']
                                .createInstance(Ci.nsIConverterInputStream);
                convertStream.init(inStream, "utf-8", inStream.available(),
                Ci.nsIConverterInputStream.DEFAULT_REPLACEMENT_CHARACTER);

                convertStream.readString(inStream.available(), readData);
                convertStream.close();
                inStream.close();
                callback(readData.value);
            } catch (e) {
                throw new Error((fileObj && fileObj.path || '') + ': ' + e);
            }
        };
    }
    return text;
});



define('components/content/index',["require", "exports", "preact", "preact/hooks", "text!./data/fastestlap.json", "ojs/ojgauge", "ojs/ojbutton", "ojs/ojtoolbar"], function (require, exports, preact_1, hooks_1, trackData) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Content = void 0;
    // const wsServiceUrl = "ws://130.61.139.189:8001"; Nacho
    const wsServiceUrl = "ws://130.61.139.189:8001";
    let carData = null;
    let socket = null;
    let timerId = null;
    let dataFlow = null;
    let flowIndex = 0;
    const imgPath = "styles/images/car/";
    function Content() {
        /* car behavior states  */
        const [speed, setSpeed] = (0, hooks_1.useState)(0);
        const [throttle, setThrottle] = (0, hooks_1.useState)("");
        const [brake, setBrake] = (0, hooks_1.useState)("");
        const [gear, setGear] = (0, hooks_1.useState)(0);
        const [rpm, setRPM] = (0, hooks_1.useState)(0);
        const [steer, setSteer] = (0, hooks_1.useState)(0);
        /* session data states
          0 = unknown,
          1 = P1,
          2 = P2,
          3 = P3,
          4 = Short P,
          5 = Q1,
          6 = Q2,
          7 = Q3,
          8 = Short Q,
          9 = OSQ,
          10 = R,
          11 = R2,
          12 = R3,
          13 = Time Trial
        */
        const [sessionType, setSessionType] = (0, hooks_1.useState)(0);
        /* Run mode  */
        const [mode, setMode] = (0, hooks_1.useState)("simulator");
        /* Simulator data and config  */
        const [frameNum, setFrameNum] = (0, hooks_1.useState)(0);
        const data = JSON.parse(trackData);
        const frameRate = 40;
        /* Connect to Websocket relay for live data  */
        const connectToServer = () => {
            setMode("live");
            if (!socket || socket.readyState !== 1) {
                socket = new WebSocket(wsServiceUrl);
            }
            socket.addEventListener("open", (event) => {
                socket.send("getPacketSessionData");
                timerId = setInterval(() => socket.send("getPacketCarTelemetryData"), 1000 / frameRate);
            });
            /* Listen for data coming from socket request */
            socket.addEventListener("message", function (event) {
                let jsonData = JSON.parse(event.data);
                if (typeof jsonData === "string") {
                    jsonData = JSON.parse(jsonData);
                }
                if (jsonData.m_session_type) {
                    setSessionType(jsonData.m_session_type);
                    setweatherStyles({ type: jsonData.m_weather });
                    console.log('Session Data: ' + JSON.stringify(jsonData));
                }
                if (jsonData.m_car_telemetry_data) {
                    carData = jsonData;
                    console.log('Car Data: ' + JSON.stringify(carData));
                    if (Object.keys(carData).length !== 0) {
                        setSpeed(carData.m_car_telemetry_data[0].m_speed);
                        setThrottle(carData.m_car_telemetry_data[0].m_throttle);
                        setBrake(carData.m_car_telemetry_data[0].m_brake);
                        setGear(carData.m_car_telemetry_data[0].m_gear);
                        setRPM(carData.m_car_telemetry_data[0].m_engine_rpm);
                        setSteer(carData.m_car_telemetry_data[0].m_steer);
                        setsteeringStyles({ type: carData.m_car_telemetry_data[0].m_steer });
                        if (sessionType != 13) {
                            settyreTempRL({
                                type: carData.m_car_telemetry_data[0]
                                    .m_tyres_surface_temperature[0],
                                location: "03",
                            });
                            settyreTempRR({
                                type: carData.m_car_telemetry_data[0]
                                    .m_tyres_surface_temperature[1],
                                location: "02",
                            });
                            setTyreTempFL({
                                type: carData.m_car_telemetry_data[0]
                                    .m_tyres_surface_temperature[2],
                                location: "04",
                            });
                            setTyreTempFR({
                                type: carData.m_car_telemetry_data[0]
                                    .m_tyres_surface_temperature[3],
                                location: "01",
                            });
                        }
                    }
                }
            });
        };
        /* Process simulated fastestlap data  */
        const runSimulation = () => {
            setMode("simulator");
            flowIndex = 0;
            let randomWeather = Math.floor(Math.random() * 6);
            setweatherStyles({ type: randomWeather });
            const throttleDataFlow = () => {
                if (flowIndex < data.length) {
                    setFrameNum(data[flowIndex].M_FRAME);
                    setSpeed(data[flowIndex].M_SPEED);
                    setThrottle(data[flowIndex].M_THROTTLE);
                    setBrake(data[flowIndex].M_BRAKE);
                    setGear(data[flowIndex].M_GEAR);
                    setRPM(data[flowIndex].M_ENGINERPM);
                    setSteer(data[flowIndex].M_STEER);
                    setsteeringStyles({ type: data[flowIndex].M_STEER });
                    flowIndex++;
                }
                else {
                    clearInterval(dataFlow);
                }
            };
            dataFlow = setInterval(throttleDataFlow, 1000 / frameRate); // read the fastestlap data at one 18 frames per second.
        };
        /* Stop simulator or live connection  */
        const disconnectFromServer = (event) => {
            if (mode === "simulator") {
                clearInterval(dataFlow);
                flowIndex = 9999999;
                console.log("Simulator stopped");
            }
            else {
                if (socket != null && socket.readyState === 1) {
                    clearInterval(timerId);
                    socket.close();
                    console.log("Server connection closed");
                }
                if (socket.readyState === 3) {
                    console.log('Server connection was already closed.');
                }
                ;
            }
        };
        /* Weather types
          0 = clear/sunny,
          1 = light cloud,
          2 = overcast
          3 = light rain,
          4 = heavy rain,
          5 = storm
        */
        const defineWeatherStyle = (state, action) => {
            switch (action.type) {
                case 1:
                    return "weather light-clouds";
                case 2:
                    return "weather overcast";
                case 3:
                    return "weather light-rain";
                case 4:
                    return "weather heavy-rain";
                case 5:
                    return "weather storms";
                default:
                    return "weather sunny";
            }
        };
        /* setup steering wheel animation styles  */
        const getStyles = (state, action) => {
            let steerDirection = 0;
            if (action.type < 0)
                steerDirection = -1;
            if (action.type > 0)
                steerDirection = 1;
            switch (steerDirection) {
                case -1:
                    return "steering-size steer-left";
                case 1:
                    return "steering-size steer-right";
                default:
                    return "steering-size steer-straight";
            }
        };
        /* Tyre temp color coding is
         **  Less than 100 degrees : Green
         **  Greater than 100 but less than 125 : Yellow / Sand
         **  Greater than or equal to 125 : Red
         */
        const defineTyreColor = (state, action) => {
            let code = "";
            if (action.type <= 86) {
                code = "green";
            }
            else if (action.type < 96) {
                code = "yellow";
            }
            else if (action.type >= 96) {
                code = "red";
            }
            switch (code) {
                case "red":
                    return imgPath + "red_" + action.location + ".png";
                case "yellow":
                    return imgPath + "yellow_" + action.location + ".png";
                case "green":
                    return imgPath + "green_" + action.location + ".png";
                default:
                    return imgPath + "sand_" + action.location + ".png";
            }
        };
        /* Tyre temperature */
        const [tyreTempFR, setTyreTempFR] = (0, hooks_1.useReducer)(defineTyreColor, imgPath + "sand_01.png"); // Front Right
        const [tyreTempRR, settyreTempRR] = (0, hooks_1.useReducer)(defineTyreColor, imgPath + "sand_02.png"); // Rear Right
        const [tyreTempRL, settyreTempRL] = (0, hooks_1.useReducer)(defineTyreColor, imgPath + "sand_03.png"); // Rear Left
        const [tyreTempFL, setTyreTempFL] = (0, hooks_1.useReducer)(defineTyreColor, imgPath + "sand_04.png"); // Front Left
        const [steeringStyles, setsteeringStyles] = (0, hooks_1.useReducer)(getStyles, "steering-size");
        const [weatherStyles, setweatherStyles] = (0, hooks_1.useReducer)(defineWeatherStyle, "weather sunny");
        (0, hooks_1.useEffect)(() => { }, []);
        const thresholdValues = [
            { max: 11500, color: "#77b0b8" },
            { max: 13500, color: "#e6cc87" },
            { max: 15000, color: "#c74634" },
        ];
        const referenceLines = [
            { value: 11500, color: "#e6cc87" },
            { value: 13500, color: "#c74634" },
        ];
        return ((0, preact_1.h)("div", { class: "" },
            (0, preact_1.h)("div", { class: "oj-flex oj-sm-flex-direction-column oj-flex-align oj-panel oj-panel-shadow-xs oj-bg-neutral-20 f1-dashboard bg-fiber" },
                (0, preact_1.h)("div", { class: "oj-flex-item oj-flex-bar oj-md-margin-10x-bottom", style: "max-height:25px;" },
                    (0, preact_1.h)("div", { class: "oj-flex-bar-start" },
                        (0, preact_1.h)("div", { class: weatherStyles, title: weatherStyles })),
                    (0, preact_1.h)("div", { class: "oj-flex-bar-end" },
                        (0, preact_1.h)("oj-toolbar", { class: "oj-color-invert" },
                            (0, preact_1.h)("oj-button", { onojAction: runSimulation, chroming: "callToAction" }, "Simulator"),
                            (0, preact_1.h)("oj-button", { onojAction: connectToServer, chroming: "callToAction" }, "Live"),
                            (0, preact_1.h)("oj-button", { onojAction: disconnectFromServer, chroming: "callToAction" }, "Disconnect")))),
                (0, preact_1.h)("div", { class: "oj-flex oj-flex-init oj-md-justify-content-space-between oj-sm-only-flex-direction-column top-row-alignment" },
                    (0, preact_1.h)("div", { class: "oj-flex-item oj-flex oj-sm-flex-items-initial oj-sm-justify-content-center " },
                        (0, preact_1.h)("div", { class: "oj-flex-item oj-flex oj-sm-flex-items-initial oj-sm-justify-content-center oj-sm-flex-direction-column" },
                            (0, preact_1.h)("div", { class: "oj-flex-item" },
                                (0, preact_1.h)("img", { src: tyreTempFR, class: "f1-meter-tire" })),
                            (0, preact_1.h)("div", { class: "oj-flex-item" },
                                (0, preact_1.h)("img", { src: tyreTempRL, class: "f1-meter-tire" }))),
                        (0, preact_1.h)("div", { class: "oj-flex-item oj-flex oj-sm-flex-items-initial oj-sm-justify-content-center oj-sm-flex-direction-column" },
                            (0, preact_1.h)("div", { class: "oj-flex-item" },
                                (0, preact_1.h)("img", { src: tyreTempRR, class: "f1-meter-tire" })),
                            (0, preact_1.h)("div", { class: "oj-flex-item" },
                                (0, preact_1.h)("img", { src: tyreTempFL, class: "f1-meter-tire" })))),
                    (0, preact_1.h)("div", { class: "oj-flex-item oj-flex oj-sm-flex-items-initial oj-sm-justify-content-center" },
                        (0, preact_1.h)("div", { class: "oj-flex-item oj-flex oj-sm-flex-items-initial oj-sm-justify-content-center oj-sm-flex-direction-column" },
                            (0, preact_1.h)("div", { class: "oj-flex-item position-center" },
                                (0, preact_1.h)("oj-status-meter-gauge", { class: "f1-meter-lg", min: 0, max: 350, size: 'fit', value: speed, startAngle: 180, labelledBy: "startAngle", angleExtent: 180, color: '#161513', borderColor: '#161513', metricLabel: {
                                        style: {
                                            color: "#f9f9f6",
                                            fontSize: "1.2rem",
                                            fontFamily: "sans-comic",
                                        },
                                    }, plotArea: { color: '#e3dbbf', borderColor: '#161513' }, orientation: "circular" })))),
                    (0, preact_1.h)("div", { class: "oj-flex-item oj-flex oj-sm-flex-items-initial oj-sm-justify-content-center oj-sm-only-margin-6x-top" },
                        (0, preact_1.h)("div", { class: "oj-flex-item oj-flex oj-sm-flex-items-initial oj-sm-justify-content-center oj-sm-flex-direction-column" },
                            (0, preact_1.h)("div", { class: "oj-flex-item oj-sm-margin-4x-bottom oj-md-margin-10x-bottom" },
                                (0, preact_1.h)("oj-status-meter-gauge", { class: "f1-meter-md", min: 0, max: 15000, size: "fit", value: rpm, startAngle: 180, labelledBy: "startAngle", angleExtent: 180, metricLabel: {
                                        position: "outsidePlotArea",
                                        style: {
                                            color: "#f9f9f6",
                                            fontSize: "1.2rem",
                                            fontFamily: "sans-comic",
                                        },
                                    }, plotArea: { color: '#e3dbbf' }, thresholds: thresholdValues, referenceLines: referenceLines, orientation: "circular" }))))),
                (0, preact_1.h)("div", { class: "oj-flex oj-flex-init oj-md-justify-content-space-between oj-sm-only-flex-direction-column bottom-row-alignment" },
                    (0, preact_1.h)("div", { class: "oj-flex-item oj-flex oj-md-4 oj-sm-flex-items-initial oj-sm-justify-content-center oj-sm-only-margin-6x-top" },
                        (0, preact_1.h)("div", { class: "oj-flex-item oj-flex oj-sm-flex-items-initial oj-sm-justify-content-center oj-sm-flex-direction-column" },
                            (0, preact_1.h)("div", { class: "oj-flex-item oj-sm-margin-4x-bottom oj-md-margin-10x-bottom" },
                                (0, preact_1.h)("div", { class: "oj-flex-item" },
                                    (0, preact_1.h)("span", { class: "oj-typography-subheading-md oj-color-invert" },
                                        "Throttle",
                                        " "),
                                    (0, preact_1.h)("span", { class: throttle ? "on" : "clear", style: "display:inline-block;width:30px;height:1rem" })),
                                (0, preact_1.h)("div", { class: "oj-flex-item" },
                                    (0, preact_1.h)("span", { class: "oj-typography-subheading-md oj-color-invert" },
                                        "Brake",
                                        " "),
                                    (0, preact_1.h)("span", { class: brake ? "off" : "clear", style: "display:inline-block;width:30px;height:1rem" }))))),
                    (0, preact_1.h)("div", { class: "oj-flex-item oj-flex oj-sm-flex-items-initial oj-sm-justify-content-center oj-sm-only-margin-6x-top" },
                        (0, preact_1.h)("div", { class: "oj-flex-item oj-flex oj-sm-flex-items-initial oj-sm-justify-content-center oj-sm-flex-direction-column" },
                            (0, preact_1.h)("div", { class: "oj-flex-item" },
                                (0, preact_1.h)("img", { src: "styles/images/sw.png", alt: "steering wheel", class: steeringStyles })))),
                    (0, preact_1.h)("div", { class: "oj-flex-item oj-flex oj-sm-flex-items-initial oj-sm-justify-content-center oj-sm-only-margin-6x-top" },
                        (0, preact_1.h)("div", { class: "oj-flex-item oj-flex oj-sm-flex-items-initial oj-sm-justify-content-center oj-sm-flex-direction-column" },
                            (0, preact_1.h)("div", { class: "oj-flex-item oj-sm-margin-4x-bottom oj-md-margin-10x-bottom" },
                                (0, preact_1.h)("oj-status-meter-gauge", { class: "f1-meter-gear", min: 0, max: 10, size: "fit", value: gear, startAngle: 180, color: '#161513', borderColor: '#161513', labelledBy: "startAngle", angleExtent: 180, metricLabel: {
                                        position: "outsidePlotArea",
                                        style: {
                                            color: "#f9f9f6",
                                            fontSize: "1.2rem",
                                            fontFamily: "sans-comic",
                                        },
                                    }, plotArea: { color: '#e3dbbf', borderColor: '#161513' }, orientation: "circular" }))))))));
    }
    exports.Content = Content;
});

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
define('components/app',["require", "exports", "ojs/ojvcomponent", "preact", "ojs/ojcontext", "./header", "./content/index"], function (require, exports, ojvcomponent_1, preact_1, Context, header_1, index_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.App = void 0;
    let App = class App extends preact_1.Component {
        render(props) {
            return ((0, preact_1.h)("div", { id: "appContainer", class: "oj-web-applayout-page" },
                (0, preact_1.h)(header_1.Header, { appName: props.appName, userLogin: props.userLogin }),
                (0, preact_1.h)(index_1.Content, null)));
        }
        componentDidMount() {
            Context.getPageContext().getBusyContext().applicationBootstrapComplete();
        }
    };
    App.defaultProps = {
        appName: 'Formula Pi',
        userLogin: "john.hancock@oracle.com"
    };
    App.metadata = { "properties": { "appName": { "type": "string" }, "userLogin": { "type": "string" } } };
    App = __decorate([
        (0, ojvcomponent_1.customElement)("app-root")
    ], App);
    exports.App = App;
});

define('index',["require","exports","./components/app"],(function(require,e){"use strict";Object.defineProperty(e,"__esModule",{value:!0})}));
/**
 * @license
 * Copyright (c) 2014, 2021, Oracle and/or its affiliates.
 * Licensed under The Universal Permissive License (UPL), Version 1.0
 * as shown at https://oss.oracle.com/licenses/upl/
 * @ignore
 */
requirejs.config({baseUrl:".",paths:{knockout:"https://static.oracle.com/cdn/jet/12.0.1/3rdparty/knockout/knockout-3.5.1",jquery:"https://static.oracle.com/cdn/jet/12.0.1/3rdparty/jquery/jquery-3.6.0.min","jqueryui-amd":"https://static.oracle.com/cdn/jet/12.0.1/3rdparty/jquery/jqueryui-amd-1.13.0.min",hammerjs:"https://static.oracle.com/cdn/jet/12.0.1/3rdparty/hammer/hammer-2.0.8.min",ojdnd:"https://static.oracle.com/cdn/jet/12.0.1/3rdparty/dnd-polyfill/dnd-polyfill-1.0.2.min",ojL10n:"libs/oj/v12.0.1/ojL10n",persist:"https://static.oracle.com/cdn/jet/12.0.1/3rdparty/persist/min",text:"libs/require/text",signals:"https://static.oracle.com/cdn/jet/12.0.1/3rdparty/js-signals/signals.min",touchr:"https://static.oracle.com/cdn/jet/12.0.1/3rdparty/touchr/touchr",preact:"https://static.oracle.com/cdn/jet/12.0.1/3rdparty/preact/dist/preact.umd","preact/hooks":"https://static.oracle.com/cdn/jet/12.0.1/3rdparty/preact/hooks/dist/hooks.umd","preact/compat":"https://static.oracle.com/cdn/jet/12.0.1/3rdparty/preact/compat/dist/compat.umd","preact/debug":"https://static.oracle.com/cdn/jet/12.0.1/3rdparty/preact/debug/dist/debug.umd","preact/devtools":"https://static.oracle.com/cdn/jet/12.0.1/3rdparty/preact/devtools/dist/devtools.umd",proj4:"https://static.oracle.com/cdn/jet/12.0.1/3rdparty/proj4js/dist/proj4",css:"libs/require-css/css.min",ojcss:"libs/oj/v12.0.1/min/ojcss","ojs/ojcss":"libs/oj/v12.0.1/min/ojcss","css-builder":"libs/require-css/css-builder",normalize:"libs/require-css/normalize","ojs/normalize":"libs/require-css/normalize",components:"components"}}),require(["./index"]);
define("bundle-temp", function(){});
