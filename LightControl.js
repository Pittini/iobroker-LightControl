const Version = "2.0.11" //vom 4.10.2021 - Skript um Lichter in Helligkeit, Farbe und Farbtemp global zu steuern - Git: https://github.com/Pittini/iobroker-LightControl - Forum: https://forum.iobroker.net/topic/36578/vorlage-lightcontrol

log("starting LightControl V." + Version);

const praefix = "javascript.0.LightControl2" // Skriptordner
const LuxSensor = 'linkeddevices.0.Klima.Draussen.brightness'; // Datenpunkt des globalen Luxsensors, wird verwendet wenn in der Gruppe kein gesonderter definiert wird
const IsPresenceDp = ""; // Datenpunkt für Anwesenheit (true/false)
const PresenceCountDp = "radar2.0._nHere"; // Datenpunkt für Anwesenheitszähler
const logging = false; // Logging an/aus
const RampSteps = 10; //Wieviele Schritte zum dimmen? Bitte nicht zu hoch setzen, wird zwar smoother, kann aber zu timing Problemen führen wenn gleichzeitig eine kurze Zeit in den Objekten gewählt.

const minCt = 2700; //Regelbereich für Farbtemperatur
const maxCt = 6500;//Regelbereich für Farbtemperatur

const LightGroups = {
    0: {
        description: "Flur Eg.",
        lights: {
            0: {
                description: "Strahler1",
                power: { oid: "zigbee.0.ec1bbdfffe32de48.state", onVal: true, offVal: false },
                bri: { oid: "zigbee.0.ec1bbdfffe32de48.brightness", minVal: 0, maxVal: 100, defaultVal: 100 },
                ct: { oid: "zigbee.0.ec1bbdfffe32de48.colortemp", minVal: 454, maxVal: 250 },
                sat: { oid: "", minVal: null, maxVal: null },
                modeswitch: { oid: "", whiteModeVal: false, colorModeVal: true },
                color: { oid: "", type: "", default: "" }
            },
            1: {
                description: "Strahler2",
                power: { oid: "zigbee.0.680ae2fffe0ca671.state", onVal: true, offVal: false },
                bri: { oid: "zigbee.0.680ae2fffe0ca671.brightness", minVal: 0, maxVal: 100, defaultVal: 100 },
                ct: { oid: "zigbee.0.680ae2fffe0ca671.colortemp", minVal: 454, maxVal: 250 },
                sat: { oid: "", minVal: null, maxVal: null },
                modeswitch: { oid: "", whiteModeVal: false, colorModeVal: true },
                color: { oid: "", type: "", default: "" }
            },
            2: {
                description: "Deckenlicht bei Küche/Heizung",
                power: { oid: "yeelight-2.0.color-0x0000000007e3cadb.control.power", onVal: true, offVal: false },
                bri: { oid: "yeelight-2.0.color-0x0000000007e3cadb.control.active_bright", minVal: 0, maxVal: 100, defaultVal: 100 },
                ct: { oid: "yeelight-2.0.color-0x0000000007e3cadb.control.ct", minVal: 6500, maxVal: 2700 },
                sat: { oid: "yeelight-2.0.color-0x0000000007e3cadb.control.sat", minVal: 0, maxVal: 100 },
                modeswitch: { oid: "yeelight-2.0.color-0x0000000007e3cadb.control.color_mode", whiteModeVal: false, colorModeVal: true },
                color: { oid: "yeelight-2.0.color-0x0000000007e3cadb.control.rgb", type: "hex", default: "#FFFFFF" }
            },
            3: {
                description: "Strahler Toillettenvorraum",
                power: { oid: "yeelight-2.0.White1.control.power", onVal: true, offVal: false },
                bri: { oid: "yeelight-2.0.White1.control.active_bright", minVal: 0, maxVal: 100, defaultVal: 100 },
                ct: { oid: "yeelight-2.0.White1.control.ct", minVal: 6500, maxVal: 2700 },
                sat: { oid: "", minVal: null, maxVal: null },
                modeswitch: { oid: "", whiteModeVal: false, colorModeVal: true },
                color: { oid: "", type: "", default: "" }
            }
        },
        sensors: {
            0: { id: 'linkeddevices.0.Bewegungsmelder.Flur_EG.0.IsMotion' },
            1: { id: 'linkeddevices.0.Bewegungsmelder.Flur_EG.1.IsMotion' },
            2: { id: 'linkeddevices.0.Bewegungsmelder.Flur_EG.2.IsMotion' }
        }
    },
    1: {
        description: "Wohnzimmer",
        lights: {
            0: {
                description: "Lampe Pc",
                power: { oid: "sonoff.0.Sonoff18.POWER", onVal: true, offVal: false },
                bri: { oid: "", minVal: null, maxVal: null, defaultVal: null },
                ct: { oid: "", minVal: null, maxVal: null },
                sat: { oid: "", minVal: null, maxVal: null },
                modeswitch: { oid: "", whiteModeVal: false, colorModeVal: true },
                color: { oid: "", type: "", default: "" }
            },
            1: {
                description: "Drachenlampe",
                power: { oid: "sonoff.0.Sonoff19.POWER", onVal: true, offVal: false },
                bri: { oid: "", minVal: null, maxVal: null, defaultVal: null },
                ct: { oid: "", minVal: null, maxVal: null },
                sat: { oid: "", minVal: null, maxVal: null },
                modeswitch: { oid: "", whiteModeVal: false, colorModeVal: true },
                color: { oid: "", type: "", default: "" }
            },
            2: {
                description: "Stehlampe Couch",
                power: { oid: "sonoff.0.Sonoff20.POWER", onVal: true, offVal: false },
                bri: { oid: "", minVal: null, maxVal: null, defaultVal: null },
                ct: { oid: "", minVal: null, maxVal: null },
                sat: { oid: "", minVal: null, maxVal: null },
                modeswitch: { oid: "", whiteModeVal: false, colorModeVal: true },
                color: { oid: "", type: "", default: "" }
            },
            3: {
                description: "Led Strip am TV",
                power: { oid: "yeelight-2.0.Strip1.control.power", onVal: true, offVal: false },
                bri: { oid: "yeelight-2.0.Strip1.control.active_bright", minVal: 0, maxVal: 100, defaultVal: 100 },
                ct: { oid: "yeelight-2.0.Strip1.control.ct", minVal: 6500, maxVal: 2700 },
                sat: { oid: "yeelight-2.0.Strip1.control.sat", minVal: 0, maxVal: 100 },
                modeswitch: { oid: "yeelight-2.0.Strip1.control.color_mode", whiteModeVal: false, colorModeVal: true },
                color: { oid: "yeelight-2.0.Strip1.control.rgb", type: "hex", default: "#FF0000" }
            },
            4: {
                description: "Kugellampe",
                power: { oid: "zigbee.0.ccccccfffed68f5d.state", onVal: true, offVal: false },
                bri: { oid: "zigbee.0.ccccccfffed68f5d.brightness", minVal: 0, maxVal: 100, defaultVal: 60 },
                ct: { oid: "", minVal: 6500, maxVal: 2700 },
                sat: { oid: "", minVal: 0, maxVal: 100 },
                modeswitch: { oid: "", whiteModeVal: false, colorModeVal: true },
                color: { oid: "zigbee.0.ccccccfffed68f5d.color", type: "hex", default: "#FF0000", warmWhiteColor: "#FFA500", dayLightColor: "#FFE4B5" }
            },
            5: {
                description: "Strahler",
                power: { oid: "zigbee.0.680ae2fffeae5254.state", onVal: true, offVal: false },
                bri: { oid: "zigbee.0.680ae2fffeae5254.brightness", minVal: 0, maxVal: 100, defaultVal: 100 },
                ct: { oid: "", minVal: 6500, maxVal: 2700 },
                sat: { oid: "", minVal: 0, maxVal: 100 },
                modeswitch: { oid: "", whiteModeVal: false, colorModeVal: true },
                color: { oid: "zigbee.0.680ae2fffeae5254.color", type: "hex", default: "#FF0000", warmWhiteColor: "#FFA500", dayLightColor: "#FFE4B5" }
            },
            6: {
                description: "Wooden Bar",
                power: { oid: "wled.0.3c6105d15496.on", onVal: true, offVal: false },
                bri: { oid: "wled.0.3c6105d15496.bri", minVal: 0, maxVal: 255, defaultVal: 200 },
                ct: { oid: "", minVal: 6500, maxVal: 2700 },
                sat: { oid: "", minVal: 0, maxVal: 100 },
                modeswitch: { oid: "", whiteModeVal: false, colorModeVal: true },
                color: { oid: "wled.0.3c6105d15496.seg.0.col.0_HEX", type: "hex", default: "#FF0000", warmWhiteColor: "#FFA500", dayLightColor: "#FFE4B5" }
            },
            7: {
                description: "144er Left Bar",
                power: { oid: "wled.0.3c6105d0a203.on", onVal: true, offVal: false },
                bri: { oid: "wled.0.3c6105d0a203.bri", minVal: 0, maxVal: 255, defaultVal: 200 },
                ct: { oid: "", minVal: 6500, maxVal: 2700 },
                sat: { oid: "", minVal: 0, maxVal: 100 },
                modeswitch: { oid: "", whiteModeVal: false, colorModeVal: true },
                color: { oid: "wled.0.3c6105d0a203.seg.0.col.0_HEX", type: "hex", default: "#FF0000", warmWhiteColor: "#FFA500", dayLightColor: "#FFE4B5" }
            },
            8: {
                description: "144er Right Bar",
                power: { oid: "wled.0.3c6105d1554b.on", onVal: true, offVal: false },
                bri: { oid: "wled.0.3c6105d1554b.bri", minVal: 0, maxVal: 255, defaultVal: 200 },
                ct: { oid: "", minVal: 6500, maxVal: 2700 },
                sat: { oid: "", minVal: 0, maxVal: 100 },
                modeswitch: { oid: "", whiteModeVal: false, colorModeVal: true },
                color: { oid: "wled.0.3c6105d1554b.seg.0.col.0_HEX", type: "hex", default: "#FF0000", warmWhiteColor: "#FFA500", dayLightColor: "#FFE4B5" }
            },
            9: {
                description: "384er Rondell",
                power: { oid: "wled.0.3c6105cfe11e.on", onVal: true, offVal: false },
                bri: { oid: "wled.0.3c6105cfe11e.bri", minVal: 0, maxVal: 255, defaultVal: 15 },
                ct: { oid: "", minVal: 6500, maxVal: 2700 },
                sat: { oid: "", minVal: 0, maxVal: 100 },
                modeswitch: { oid: "", whiteModeVal: false, colorModeVal: true },
                color: { oid: "wled.0.3c6105cfe11e.seg.0.col.0_HEX", type: "hex", default: "#FF0000", warmWhiteColor: "#FFA500", dayLightColor: "#FFE4B5" }
            }
        },
        sensors: {

        }
    },
    2: {
        description: "Klo",

        lights: {
            0: {
                description: "Deckenlampe",
                power: { oid: "zigbee.0.680ae2fffef92c4e.state", onVal: true, offVal: false },
                bri: { oid: "zigbee.0.680ae2fffef92c4e.brightness", minVal: 0, maxVal: 100, defaultVal: 100 },
                ct: { oid: "zigbee.0.680ae2fffef92c4e.colortemp", minVal: 454, maxVal: 250 },
                sat: { oid: "", minVal: null, maxVal: null },
                modeswitch: { oid: "", whiteModeVal: false, colorModeVal: true },
                color: { oid: "", type: "", default: "" }
            }
        },
        sensors: {
            0: { id: 'linkeddevices.0.Bewegungsmelder.Toilette.IsMotion' }
        }
    },
    3: {
        description: "Flur Og.",
        lights: {
            0: {
                description: "Strahlergruppe Colorteil",
                power: { oid: "zigbee.0.ccccccfffed4ee4c.state", onVal: true, offVal: false },
                bri: { oid: "zigbee.0.ccccccfffed4ee4c.brightness", minVal: 0, maxVal: 100, defaultVal: 100 },
                ct: { oid: "", minVal: null, maxVal: null },
                sat: { oid: "", minVal: null, maxVal: null },
                modeswitch: { oid: "", whiteModeVal: false, colorModeVal: true },
                color: { oid: "zigbee.0.ccccccfffed4ee4c.color", type: "hex", default: "#FFFFFF", warmWhiteColor: "#FFA500", dayLightColor: "#FFE4B5" }
            },
            1: {
                description: "Strahlergruppe Teil2",
                power: { oid: "zigbee.0.588e81fffe0ffd7a.state", onVal: true, offVal: false },
                bri: { oid: "zigbee.0.588e81fffe0ffd7a.brightness", minVal: 0, maxVal: 100, defaultVal: 100 },
                ct: { oid: "zigbee.0.588e81fffe0ffd7a.colortemp", minVal: 454, maxVal: 250 },
                sat: { oid: "", minVal: null, maxVal: null },
                modeswitch: { oid: "", whiteModeVal: false, colorModeVal: true },
                color: { oid: "", type: "hex", default: "", warmWhiteColor: "", dayLightColor: "" }
            },
            2: {
                description: "Strahlergruppe Teil3",
                power: { oid: "zigbee.0.ec1bbdfffe6fc795.state", onVal: true, offVal: false },
                bri: { oid: "zigbee.0.ec1bbdfffe6fc795.brightness", minVal: 0, maxVal: 100, defaultVal: 100 },
                ct: { oid: "zigbee.0.ec1bbdfffe6fc795.colortemp", minVal: 454, maxVal: 250 },
                sat: { oid: "", minVal: null, maxVal: null },
                modeswitch: { oid: "", whiteModeVal: false, colorModeVal: true },
                color: { oid: "", type: "hex", default: "", warmWhiteColor: "", dayLightColor: "" }
            }

        },
        sensors: {
            0: { id: 'linkeddevices.0.Bewegungsmelder.Flur_Og1.0.IsMotion' },
            1: { id: 'linkeddevices.0.Bewegungsmelder.Flur_Og1.1.IsMotion' }
        }
    },
    4: {
        description: "Bad",
        lights: {
            0: {
                description: "Deckenlampe",
                power: { oid: "zigbee.0.588e81fffeae2ae0.state", onVal: true, offVal: false },
                bri: { oid: "zigbee.0.588e81fffeae2ae0.brightness", minVal: 0, maxVal: 100, defaultVal: 100 },
                ct: { oid: "zigbee.0.588e81fffeae2ae0.colortemp", minVal: 454, maxVal: 250 },
                sat: { oid: "", minVal: null, maxVal: null },
                modeswitch: { oid: "", whiteModeVal: false, colorModeVal: true },
                color: { oid: "", type: "", default: "" }
            }
        },
        sensors: {
            0: { id: 'linkeddevices.0.Bewegungsmelder.Bad.0.IsMotion' }
        }
    },
    5: {
        description: "Dach",
        lights: {
            0: {
                description: "Klemmstrahler Dachflur",
                power: { oid: "zigbee.0.680ae2fffeaddb07.state", onVal: true, offVal: false },
                bri: { oid: "zigbee.0.680ae2fffeaddb07.brightness", minVal: 0, maxVal: 100, defaultVal: 100 },
                ct: { oid: "zigbee.0.680ae2fffeaddb07.colortemp", minVal: 454, maxVal: 250 },
                sat: { oid: "", minVal: null, maxVal: null },
                modeswitch: { oid: "", whiteModeVal: false, colorModeVal: true },
                color: { oid: "", type: "", default: "" }
            },
            1: {
                description: "Klemmstrahler Dachtreppe",
                power: { oid: "zigbee.0.588e81fffe409146.state", onVal: true, offVal: false },
                bri: { oid: "zigbee.0.588e81fffe409146.brightness", minVal: 0, maxVal: 100, defaultVal: 100 },
                ct: { oid: "zigbee.0.588e81fffe409146.colortemp", minVal: 454, maxVal: 250 },
                sat: { oid: "", minVal: null, maxVal: null },
                modeswitch: { oid: "", whiteModeVal: false, colorModeVal: true },
                color: { oid: "", type: "", default: "" }
            }
        },
        sensors: {

        }
    },
    6: {
        description: "Schlafzimmer C.",
        lights: {
            0: {
                description: "Nachttischlampe Carlo",
                power: { oid: "zigbee.0.680ae2fffec81608.state", onVal: true, offVal: false },
                bri: { oid: "zigbee.0.680ae2fffec81608.brightness", minVal: 0, maxVal: 100, defaultVal: 100 },
                ct: { oid: "zigbee.0.680ae2fffec81608.colortemp", minVal: 454, maxVal: 250 },
                sat: { oid: "", minVal: null, maxVal: null },
                modeswitch: { oid: "", whiteModeVal: false, colorModeVal: true },
                color: { oid: "", type: "", default: "" }
            },
            1: {
                description: "Nachttischlampe Gold",
                power: { oid: "zigbee.0.ccccccfffea91336.state", onVal: true, offVal: false },
                bri: { oid: "zigbee.0.ccccccfffea91336.brightness", minVal: 0, maxVal: 100, defaultVal: 100 },
                ct: { oid: "", minVal: null, maxVal: null },
                sat: { oid: "", minVal: null, maxVal: null },
                modeswitch: { oid: "", whiteModeVal: false, colorModeVal: true },
                color: { oid: "", type: "", default: "" }
            }
        },
        sensors: {

        }
    },
    7: {
        description: "Küche",
        lights: {
            0: {
                description: "Unterbau Leds",
                power: { oid: "zigbee.0.d0cf5efffebe553c.state", onVal: true, offVal: false },
                bri: { oid: "zigbee.0.d0cf5efffebe553c.brightness", minVal: 0, maxVal: 100, defaultVal: 100 },
                ct: { oid: "", minVal: null, maxVal: null },
                sat: { oid: "", minVal: null, maxVal: null },
                modeswitch: { oid: "", whiteModeVal: false, colorModeVal: true },
                color: { oid: "", type: "", default: "" }
            }
        },
        sensors: {
            0: { id: 'linkeddevices.0.Bewegungsmelder.Kueche.0.IsMotion' }
        }
    },
    8: {
        description: "Vitrine",
        lights: {
            0: {
                description: "Unterbau Leds",
                power: { oid: "zigbee.0.680ae2fffeaded15.state", onVal: true, offVal: false },
                bri: { oid: "zigbee.0.680ae2fffeaded15.brightness", minVal: 0, maxVal: 100, defaultVal: 100 },
                ct: { oid: "zigbee.0.680ae2fffeaded15.colortemp", minVal: 454, maxVal: 250 },
                sat: { oid: "", minVal: null, maxVal: null },
                modeswitch: { oid: "", whiteModeVal: false, colorModeVal: true },
                color: { oid: "", type: "", default: "" }
            }
        },
        sensors: {
            0: { id: 'zigbee.0.00158d00042ae926.opened'/*Is open*/ }
        }
    },
    9: {
        description: "Haustür Aussenbeleuchtung",
        lights: {
            0: {
                description: "Lampe Haustür",
                power: { oid: "yeelight-2.0.White2.control.power", onVal: true, offVal: false },
                bri: { oid: "yeelight-2.0.White2.control.active_bright", minVal: 0, maxVal: 100, defaultVal: 100 },
                ct: { oid: "yeelight-2.0.White2.control.ct", minVal: 6500, maxVal: 2700 },
                sat: { oid: "", minVal: null, maxVal: null },
                modeswitch: { oid: "", whiteModeVal: false, colorModeVal: true },
                color: { oid: "", type: "", default: "" }
            }
        },
        sensors: {

        }
    },
    10: {
        description: "Klamotten_C",
        lights: {
            0: {
                description: "12V Strahlergruppe",
                power: { oid: "zigbee.0.842e14fffe186b9d.state", onVal: true, offVal: false },
                bri: { oid: "", minVal: 0, maxVal: 100, defaultVal: 100 },
                ct: { oid: "", minVal: null, maxVal: null },
                sat: { oid: "", minVal: null, maxVal: null },
                modeswitch: { oid: "", whiteModeVal: false, colorModeVal: true },
                color: { oid: "", type: "", default: "" }
            }
        },
        sensors: {
            0: { id: 'linkeddevices.0.Bewegungsmelder.Schlafzimmer_C.0.IsMotion' }
        }
    }

};

// ------------------ AB HIER NIX MEHR ÄNDERN --------------------------
let RampOnIntervalObject = {};
let RampOffIntervalObject = {};
let AutoOffTimeoutObject = {};
let TickerIntervalObj = {};

let ActualGenericLux = 0;
let ActualPresence = true;
let ActualPresenceCount = 1;

const suncalc = require('suncalc');
const result = getObject("system.adapter.javascript.0");
const lat = result.native.latitude;
const long = result.native.longitude;


const GroupTemplate = {
    power: { id: "", common: { read: true, write: true, name: "Power", type: "boolean", role: "switch.power", def: false } },
    bri: { id: "", common: { read: true, write: true, name: "Brightness", type: "number", role: "level.brightness", def: 100, min: 0, max: 100, unit: "%" } },
    ct: { id: "", common: { read: true, write: true, name: "Colortemperature", type: "number", role: "level.color.temperature", def: 3300, min: 2700, max: 6500, unit: "K" } },
    color: { id: "", common: { read: true, write: true, name: "Color", type: "string", role: "level.color.rgb", def: "#FFFFFF" } },
    luxSensorOid: { id: "", common: { read: true, write: true, name: "ObjectId for Luxsensor", type: "string", role: "state", def: LuxSensor } },
    adaptiveBri: { id: "", common: { read: true, write: true, name: "Adaptive Brightness", type: "boolean", role: "switch.enabled", def: false } },
    adaptiveCt: { id: "", common: { read: true, write: true, name: "Adaptive Colortemperature", type: "boolean", role: "switch.enable", def: false } },
    adaptiveCtMode: { id: "", common: { read: true, write: true, name: "Mode for Adaptive Colortemperature", type: "string", role: "switch.mode", def: "solar", states: { linear: "Linear", solar: "Solar", solarInterpolated: "Solar interpolated" } } },
    powerCleaningLight: { id: "", common: { read: true, write: true, name: "Power", type: "boolean", role: "switch.power", def: false } },
    isMotion: { id: "", common: { read: true, write: false, name: "Combines the states of all Sensors for this Group", type: "boolean", role: "indicator.motion", def: false } },
    autoOffTimed: {
        enabled: { id: "", common: { read: true, write: true, name: "Timecontrolled auto off enabled?", type: "boolean", role: "switch.enable", def: false } },
        autoOffTime: { id: "", common: { read: true, write: true, name: "Time until auto off", type: "number", role: "level.timer", def: 120, min: 0, unit: "sek" } },
        noAutoOffWhenMotion: { id: "", common: { read: true, write: true, name: "No timed auto off if motion detected", type: "boolean", role: "switch", def: true } }
    },
    autoOffLux: {
        enabled: { id: "", common: { read: true, write: true, name: "Brightness controlled auto off enabled?", type: "boolean", role: "switch.enable", def: false } },
        minLux: { id: "", common: { read: true, write: true, name: "Brightness for auto off", type: "number", role: "level.brightness", def: 500, min: 0, unit: "lux" } },
        dailyLock: { id: "", common: { read: true, write: false, name: "Switch lock", type: "boolean", role: "indicator", def: false } },
        operator: { id: "", common: { read: true, write: true, name: "Should auto off happen if brightness more or less minLux", type: "string", role: "state", def: ">" } }
    },
    autoOnMotion: {
        enabled: { id: "", common: { read: true, write: true, name: "Motion controlled auto on enabled?", type: "boolean", role: "switch.enable", def: false } },
        minLux: { id: "", common: { read: true, write: true, name: "Brightness for auto on motion", type: "number", role: "level.brightness", def: 300, min: 0, unit: "lux" } },
        bri: { id: "", common: { read: true, write: true, name: "Brightness of lights when auto on, if empty using groupstandard", type: "number", role: "level.brightness", def: 0, min: 0, max: 100, unit: "%" } },
        color: { id: "", common: { read: true, write: true, name: "Color of lights when auto on, if empty using groupstandard", type: "string", role: "level.color.rgb", def: "" } }
    },
    autoOnLux: {
        enabled: { id: "", common: { read: true, write: true, name: "Brightness controlled auto on enabled?", type: "boolean", role: "switch.enable", def: false } },
        minLux: { id: "", common: { read: true, write: true, name: "Brightness for auto on", type: "number", role: "level.brightness", def: 50, min: 0, unit: "lux" } },
        bri: { id: "", common: { read: true, write: true, name: "Brightness of lights when auto on, if empty using groupstandard", type: "number", role: "level.brightness", def: 0, min: 0, max: 100, unit: "%" } },
        color: { id: "", common: { read: true, write: true, name: "Color of lights when auto on, if empty using groupstandard", type: "string", role: "level.color.rgb", def: "" } },
        switchOnlyWhenPresence: { id: "", common: { read: true, write: true, name: "Switch only if there is somebody at home?", type: "boolean", role: "switch", def: true } },
        switchOnlyWhenNoPresence: { id: "", common: { read: true, write: true, name: "Switch only if there is nobody at home?", type: "boolean", role: "switch", def: false } },
        dailyLock: { id: "", common: { read: true, write: false, name: "Switch lock", type: "boolean", role: "indicator", def: false } },
        operator: { id: "", common: { read: true, write: true, name: "Should auto on happen if brightness more or less minLux", type: "string", role: "state", def: "<" } }
    },
    autoOnPresenceIncrease: {
        enabled: { id: "", common: { read: true, write: true, name: "Presence controlled auto on enabled?", type: "boolean", role: "switch.enable", def: false } },
        minLux: { id: "", common: { read: true, write: true, name: "Necessary brightness for auto on", type: "number", role: "level.brightness", def: 50, min: 0, unit: "lux" } },
        bri: { id: "", common: { read: true, write: true, name: "Brightness of lights when auto on, if empty using groupstandard", type: "number", role: "level.brightness", def: 0, max: 100, min: 0, unit: "%" } },
        color: { id: "", common: { read: true, write: true, name: "Color of lights when auto on, if empty using groupstandard", type: "string", role: "level.color.rgb", def: "" } }
    },
    rampOn: {
        enabled: { id: "", common: { read: true, write: true, name: "Ramping on enabled?", type: "boolean", role: "switch.enable", def: false } },
        time: { id: "", common: { read: true, write: true, name: "Time in seconds for ramping on duration", type: "number", role: "level", def: 10, min: 0, unit: "sec" } },
        switchOutletsLast: { id: "", common: { read: true, write: true, name: "Switch outlets after ramping?", type: "boolean", role: "switch.enable", def: true } }
    },
    rampOff: {
        enabled: { id: "", common: { read: true, write: true, name: "Ramping off enabled?", type: "boolean", role: "switch.enable", def: false } },
        time: { id: "", common: { read: true, write: true, name: "Time in seconds for ramping off duration", type: "number", role: "level", def: 10, min: 0, unit: "sec" } },
        switchOutletsLast: { id: "", common: { read: true, write: true, name: "Switch outlets after ramping?", type: "boolean", role: "switch.enable", def: false } }
    },
    blink: {
        enabled: { id: "", common: { read: true, write: true, name: "Blinking enabled?", type: "boolean", role: "button.start", def: false } },
        frequency: { id: "", common: { read: true, write: true, name: "Blink frequency in seconds", type: "number", role: "level", def: 1, min: 1, unit: "hz" } },
        blinks: { id: "", common: { read: true, write: true, name: "How many blinks at activation?", type: "number", role: "level", def: 3, min: 1 } }
    }
}


main();

async function GlobalLuxHandling() {
    // Globale Luxwerte holen und Trigger setzen
    if (LuxSensor != "") {
        ActualGenericLux = (await getStateAsync(LuxSensor)).val;
        log("ActualGenericLux=" + ActualGenericLux)
        on({ id: LuxSensor, change: "ne", ack: true }, function (dp) { //Trigger erstellen, außer Dp ist readonly
            if (logging) log("Triggered Luxsensor " + LuxSensor + " new value is " + dp.state.val);
            ActualGenericLux = dp.state.val;
            RefreshGenericLuxValues();
        });
    };

}

async function GlobalPresenceHandling() {
    if (PresenceCountDp != "") {
        ActualPresenceCount = (await getStateAsync(PresenceCountDp)).val;
        on({ id: PresenceCountDp, change: "gt", ack: true }, function (dp) { //Trigger erstellen, außer Dp ist readonly
            if (logging) log("Triggered PresenceCountDp " + PresenceCountDp + " new value is " + dp.state.val);
            ActualPresenceCount = dp.state.val;
            AutoOnPresenceIncrease();
        });
    };

    if (IsPresenceDp != "") {
        ActualPresence = (await getStateAsync(IsPresenceDp)).val;
        on({ id: IsPresenceDp, change: "ne", ack: true }, function (dp) { //Trigger erstellen, außer Dp ist readonly
            if (logging) log("Triggered IsPresenceDp " + IsPresenceDp + " new value is " + dp.state.val);
            ActualPresence = dp.state.val;
            AutoOnPresenceIncrease();
        });
    };

    if (ActualPresenceCount == 0) {
        ActualPresence = false;
    } else {
        ActualPresence = true;
    };
}

async function init() {
    let DpCount = 0;

    //Datenpunkte anlegen, Objekte erweitern, Daten einlesen, Trigger erzeugen
    for (let Group in LightGroups) { //Gruppen durchgehen
        await DoAllTheSensorThings(Group); //Sonderfall sensors, da diese nicht via Template, sondern dyn. durch User angelegt werden

        for (let prop1 in GroupTemplate) { // Template Properties 1. Ebene durchgehen
            if (typeof GroupTemplate[prop1].id == "undefined") { //Wenn keine id zu finden, nächste, 2. Ebene durchlaufen
                LightGroups[Group][prop1] = {}; //2te Ebene im Objekt anlegen

                for (let z in GroupTemplate[prop1]) {
                    GroupTemplate[prop1][z].id = praefix + "." + Group + "." + prop1 + "." + z;
                    if (!await existsStateAsync(GroupTemplate[prop1][z].id)) {// Prüfen ob state noch nicht vorhanden
                        await createStateAsync(GroupTemplate[prop1][z].id, GroupTemplate[prop1][z].common);//State anlegen
                        log("Created datapoint " + GroupTemplate[prop1][z].id);
                        DpCount++;
                    } else {
                        if (logging) log("Datapoint " + GroupTemplate[prop1][z].id + " still exists, skipping creation and reading data");
                    };

                    LightGroups[Group][prop1][z] = (await getStateAsync(GroupTemplate[prop1][z].id)).val; //Daten in Lightgroups einlesen (auch wenn neu erzeugt), dann

                    if (GroupTemplate[prop1][z].common.write) {
                        //  log("Setting Trigger for: " + GroupTemplate[prop1][z].id)

                        on({ id: GroupTemplate[prop1][z].id, change: "any", ack: false }, function (dp) { //Trigger erstellen
                            log("Triggered " + dp.id + " new value is " + dp.state.val)
                            LightGroups[Group][prop1][z] = dp.state.val;
                            Controller(Group, prop1 + "." + z, dp.oldState.val, dp.state.val);
                        });
                    };
                };

                if (!await existsObjectAsync(praefix + "." + Group + "." + prop1)) { // Channel erstellen wenn noch nicht vorhanden
                    await setObjectAsync(praefix + "." + Group + "." + prop1, { type: 'channel', common: { name: LightGroups[Group].description + " " + prop1 }, native: {} });
                    log("Subchannel " + praefix + "." + Group + "." + prop1 + " created");
                };

            } else {
                GroupTemplate[prop1].id = praefix + "." + Group + "." + prop1;
                if (!await existsStateAsync(GroupTemplate[prop1].id)) { // Prüfen ob state noch nicht vorhanden
                    await createStateAsync(GroupTemplate[prop1].id, GroupTemplate[prop1].common); //State anlegen
                    log("Created datapoint " + GroupTemplate[prop1].id);
                    DpCount++;
                } else {
                    if (logging) log("Datapoint " + GroupTemplate[prop1].id + " still exists, skipping creation and reading data");
                };

                LightGroups[Group][prop1] = (await getStateAsync(GroupTemplate[prop1].id)).val; //Daten in Lightgroups einlesen (auch wenn neu erzeugt), dann
                //  log("LightGroups[" + Group + "][" + prop1 + "]=" + LightGroups[Group][prop1])
                if (logging) log("Read data from:" + praefix + "." + Group + "." + prop1 + ", value is " + LightGroups[Group][prop1]);

                //LuxGroupsensor Handling
                if (prop1 == "luxSensorOid") await DoAllTheLuxSensorThings(Group, prop1);


                if (GroupTemplate[prop1].common.write) { //Trigger für alle Template Dps erstellen, außer Dp ist readonly
                    //  log("Setting Trigger for: " + GroupTemplate[prop1].id)
                    on({ id: GroupTemplate[prop1].id, change: "any", ack: false }, function (dp) {
                        // log("Triggered " + dp.id + " new value is " + dp.state.val);
                        LightGroups[Group][prop1] = dp.state.val;
                        // if (prop1 == "luxSensorOid") ChangeLuxSensorTrigger(Group, prop1, dp.oldState.val, dp.state.val);
                        Controller(Group, prop1, dp.oldState.val, dp.state.val);
                    });
                }
            };
        };

        if (!await existsObjectAsync(praefix + "." + Group)) { //Gruppenchannel anlegen wenn noch nicht vorhanden
            await setObjectAsync(praefix + "." + Group, { type: 'channel', common: { name: LightGroups[Group].description }, native: {} });
            log("Channel " + praefix + "." + Group + " created");
        };

        //  await setStateAsync(praefix + "." + Group + ".autoOnLux.dailyLock", false, true);
        // await setStateAsync(praefix + "." + Group + ".autoOffLux.dailyLock", false, true);

    };
    log("Created " + DpCount + " Datapoints");
    //log(LightGroups)

    onStop(function () { //Bei Scriptende alle Intervalle und Timeouts löschen
        clearRampOnIntervals(null);
        clearRampOffIntervals(null);
        clearInterval(TickerIntervalObj);
    }, 10);
    return true;
}

function clearRampOnIntervals(Group) {
    // log("Reaching ClearRampOnInterval(Group) Group=" + Group);
    if (Group == null) {
        for (let x in LightGroups) {
            if (typeof RampOnIntervalObject[x] == "object") {
                if (logging) log("RampOnInterval for Group=" + x + " deleted.");
                clearInterval(RampOnIntervalObject[x]);
            };
        };
    } else {
        if (typeof RampOnIntervalObject[Group] == "object") {
            if (logging) log("RampOnInterval for Group=" + Group + " deleted.");
            clearInterval(RampOnIntervalObject[Group]);
        };
    };
}

function clearRampOffIntervals(Group) {
    // log("Reaching ClearRampOffInterval(Group) Group=" + Group);
    if (Group == null) {
        for (let x in LightGroups) {
            if (typeof RampOffIntervalObject[x] == "object") {
                if (logging) log("RampOffInterval for Group=" + x + " deleted.");
                clearInterval(RampOffIntervalObject[x]);
            };
        };
    } else {
        if (typeof RampOffIntervalObject[Group] == "object") {
            if (logging) log("RampOffInterval for Group=" + Group + " deleted.");
            clearInterval(RampOffIntervalObject[Group]);
        };
    };
}

function clearAutoOffTimeout(Group) {
    //  log("Reaching clearAutoOffTimeout(Group) Group=" + Group);
    if (Group == null) {
        for (let x in LightGroups) {
            if (typeof AutoOffTimeoutObject[x] == "object") {
                if (logging) log("AutoOffTimeout for Group=" + x + " deleted.");
                clearInterval(AutoOffTimeoutObject[x]);
            };
        };
    } else {
        if (typeof AutoOffTimeoutObject[Group] == "object") {
            if (logging) log("Timeout for Group=" + Group + " deleted.");
            clearInterval(AutoOffTimeoutObject[Group]);
        };
    };
}

/* ------------------------- FUNCTIONS FÜR LUXSENSOR HANDLNG --------------------------------- */
/*
function ChangeLuxSensorTrigger(Group, prop, oldsensor, newsensor) { //Used by init
    log("Changed LuxSensor detected, from: " + oldsensor + " to: " + newsensor + " deleting old subscription and create new one");
    if (oldsensor != "") unsubscribe(oldsensor);
    if (newsensor != "") {
        on({ id: newsensor, change: "ne", ack: true }, function (dp) { //Trigger für Luxsensor erstellen
            if (logging) log("Triggered " + LightGroups[Group][prop] + " new value is " + dp.state.val)
            LightGroups[Group].actualLux = dp.state.val;
            Controller(Group, prop, dp.oldState.val, dp.state.val);
        });
    };
}
*/
async function DoAllTheLuxSensorThings(Group, prop) {  //Used by init
    if (prop == "luxSensorOid" && LightGroups[Group][prop] != "") {
        if (logging) log("LightGroups[" + Group + "].luxSensorOid=" + LightGroups[Group][prop])
        if (LightGroups[Group][prop] == LuxSensor) { //Wenn StandardLuxsensor für Gruppe verwendet Wert nicht wiederholt lesen sondern Globalen Luxwert verwenden
            LightGroups[Group].actualLux = ActualGenericLux;
            if (logging) log("Group " + Group + " using generic luxsensor, value is: " + LightGroups[Group].actualLux);
        } else {
            LightGroups[Group].actualLux = (await getStateAsync(LightGroups[Group][prop])).val; //Individuellen Gruppen luxwert lesen
            if (logging) log("Group " + Group + " using individual luxsensor " + LightGroups[Group][prop] + ", value is: " + LightGroups[Group].actualLux);
            on({ id: LightGroups[Group][prop], change: "ne", ack: true }, function (dp) { //Trigger für individuelle Luxsensoren erstellen
                if (logging) log("Triggered " + LightGroups[Group][prop] + " new value is " + dp.state.val)
                LightGroups[Group].actualLux = dp.state.val;
                //  log("LightGroups[" + Group + "].actualLux = " + LightGroups[Group].actualLux);
                Controller(Group, "actualLux", dp.oldState.val, dp.state.val);
            });
        };
    } else {
        log("No Luxsensor for " + Group + " defined, skip handling");
    };
}

function RefreshGenericLuxValues() { // Used by Init - refreshing ALL Groups using the generic Luxsensor with new value
    if (logging) log("Reaching RefreshGenericLuxValues ")
    for (let Group in LightGroups) {
        if (LightGroups[Group].luxSensorOid != "" && LightGroups[Group].luxSensorOid == LuxSensor) {// Prüfen ob generischer Luxsensor vorhanden. 
            // if (logging) log("Triggered Generic LuxSensor " + LightGroups[Group].luxSensorOid + " new value for " + Group + " is " + ActualGenericLux)
            LightGroups[Group].actualLux = ActualGenericLux;
            Controller(Group, "actualLux", LightGroups[Group].actualLux, ActualGenericLux);
        };
    };
}


/* ------------------------- FUNCTIONS FÜR (MOTION)SENSOR HANDLNG --------------------------------- */

async function DoAllTheSensorThings(Group) {
    if (logging) log("Reaching DoAllTheSensorThings");

    for (let sensorCount in LightGroups[Group].sensors) {
        LightGroups[Group].sensors[sensorCount].isMotion = (await getStateAsync(LightGroups[Group].sensors[sensorCount].id)).val; //Inhalt lesen und neues Property anlegen und füllen
        //Trigger für Dp Inhalt erzeugen wenn nicht leer
        if (LightGroups[Group].sensors[sensorCount].id != "") {
            on({ id: LightGroups[Group].sensors[sensorCount].id, change: "ne", ack: true }, function (dp) { //Trigger erstellen für eingetragenen Sensor
                // log("Triggered linked Sensor " + dp.id + " new value is " + dp.state.val);
                //Controller(Group, prop + "." + tempProperty + ".sensorVal", dp.oldState.val, dp.state.val);
                LightGroups[Group].sensors[sensorCount].isMotion = dp.state.val;
                SummarizeSensors(Group);
            });
        } else {
            log(Group + "." + LightGroups[Group].sensors[sensorCount].id + " has no data, skipping trigger creation");
        };
    };
}
function SummarizeSensors(Group) {
    if (logging) log("Reaching SummarizeSensors, Group=" + Group);
    let Motionstate = false;

    for (let sensorCount in LightGroups[Group].sensors) {
        if (LightGroups[Group].sensors[sensorCount].isMotion) {
            if (logging) log("Gruppe=" + Group + " Sensor " + sensorCount + " with target " + LightGroups[Group].sensors[sensorCount].id + " has value " + LightGroups[Group].sensors[sensorCount].isMotion);
            Motionstate = true;
        };
    };

    if (logging) log("Summarized IsMotion for Group " + Group + " = " + Motionstate);
    if (LightGroups[Group].isMotion != Motionstate) {
        setState(praefix + "." + Group + ".isMotion", Motionstate, true)
        Controller(Group, "isMotion", LightGroups[Group].isMotion, Motionstate);
    };
}

async function SetBrightness(Group, Brightness) {
    if (logging) log("Reaching SetBrightness, Group=" + Group + " Brightness=" + Brightness);
    if (Brightness <= 2) Brightness = 2;
    if (Brightness > 100) Brightness = 100;

    if (LightGroups[Group].power) {
        await setDeviceBri(Group, Brightness);
    };
    setState(praefix + "." + Group + "." + "bri", Brightness, true); //Ausführung mit Ack bestätigen
    return true;
}


function AdaptiveBri(Group) {
    if (logging) log("Reaching AdaptiveBri for Group " + Group + " actual Lux=" + LightGroups[Group].actualLux + " generic lux=" + ActualGenericLux);
    let MinBri = 10;
    let TempBri = 0;

    if (LightGroups[Group].adaptiveBri) {
        if (LightGroups[Group].actualLux == 0) {
            TempBri = MinBri;
        } else if (LightGroups[Group].actualLux >= 10000) {
            TempBri = 100;
        } else if (LightGroups[Group].actualLux > 0 && LightGroups[Group].actualLux < 10000) {
            TempBri = LightGroups[Group].actualLux / 100
            if (TempBri < MinBri) TempBri = MinBri;
        };
        SetBrightness(Group, Math.round(TempBri));
    };
    return Math.round(TempBri);
}

async function setDeviceBri(Group, Brightness) { //Subfunktion für setBri, setzt direkt die Helligkeit der Devices
    for (let Light in LightGroups[Group].lights) { //Alle Lampen der Gruppe durchgehen
        if (LightGroups[Group].lights[Light].bri.oid != "") { //Prüfen ob Eintrag für Helligkeit vorhanden
            await setStateAsync(LightGroups[Group].lights[Light].bri.oid, Math.round(Brightness / 100 * LightGroups[Group].lights[Light].bri.defaultVal), false);
        };
    };
}

async function SetCt(Group) {
    if (logging) log("Reaching SetCt, Group=" + Group + " Ct=" + LightGroups[Group].ct);

    let TempCt = 0;

    if (LightGroups[Group].power) {
        for (let Light in LightGroups[Group].lights) { //Alle Lampen der Gruppe durchgehen
            if (LightGroups[Group].lights[Light].ct.oid != "") { //Prüfen ob Eintrag für Farbtemperatur vorhanden
                if (LightGroups[Group].lights[Light].ct.minVal < 1000) {//Prüfen ob Konvertierung nötig (Es wird davon ausgegangen dass Werte unter 1000 keine Kelvin sind)
                    TempCt = ConvertKelvin(LightGroups[Group].lights[Light].ct.minVal, LightGroups[Group].lights[Light].ct.maxVal, LightGroups[Group].ct);
                } else { //Keine Konvertierung nötig
                    TempCt = LightGroups[Group].ct;
                };
                await setStateAsync(LightGroups[Group].lights[Light].ct.oid, TempCt, false);
            };
        };
    };
    setState(praefix + "." + Group + ".ct", LightGroups[Group].ct, true) //Ack mit true bestätigen nach abarbeitung

    return true;
}

function ConvertKelvin(MinVal, MaxVal, Ct) {
    let KelvinMin = 2700;
    let KelvinMax = 6500;

    let KelvinRange = KelvinMax - KelvinMin; //Wertebereich Kelvin
    let ValRange = MaxVal - MinVal; //Wertebereich Val

    // log("KelvinRange=" + KelvinRange + " ValRange=" + ValRange + " Ct=" + Ct)
    let KelvinProz = (Ct - KelvinMin) / (KelvinRange / 100) //Prozent des aktuellen Kelvinwertes
    let ValProz = ValRange / 100 //1% des Value Wertebereichs
    let KonvertedCt = Math.round(ValProz * KelvinProz + MinVal)
    //  log("KonvertedCt=" + KonvertedCt + " KelvinProz=" + KelvinProz + " ValProz=" + ValProz)

    return KonvertedCt;
}

function AdaptiveCt() {
    let ActualTime = new Date().getTime();

    let CtRange = maxCt - minCt; //Regelbereich

    let adaptiveCtLinear = 0;
    let adaptiveCtSolar = 0;
    let adaptiveCtSolarInterpolated = 0;

    let sunset = getAstroDate("sunset").getTime();  //Sonnenuntergang
    let sunrise = getAstroDate("sunrise").getTime(); //Sonnenaufgang
    let solarNoon = getAstroDate("solarNoon").getTime(); //Höchster Sonnenstand (Mittag)

    let sunMinutesDay = (sunset - sunrise) / 1000 / 60;
    let RangePerMinute = CtRange / sunMinutesDay;

    let now = new Date();
    let sunpos = suncalc.getPosition(now, lat, long);
    let sunposNoon = suncalc.getPosition(solarNoon, lat, long);

    if (compareTime(sunrise, solarNoon, 'between')) {
        //   log("Aufsteigend")
        adaptiveCtLinear = Math.round(minCt + ((ActualTime - sunrise) / 1000 / 60) * RangePerMinute * 2); // Linear = ansteigende Rampe von Sonnenaufgang bis Sonnenmittag, danach abfallend bis Sonnenuntergang
    } else if (compareTime(solarNoon, sunset, 'between')) {
        //   log("Absteigend")
        adaptiveCtLinear = Math.round(maxCt - ((ActualTime - solarNoon) / 1000 / 60) * RangePerMinute * 2);
    };

    if (compareTime(sunrise, sunset, 'between')) {
        adaptiveCtSolar = Math.round(minCt + sunMinutesDay * RangePerMinute * sunpos.altitude); // Solar = Sinusrampe entsprechend direkter Elevation, max Ct differiert nach Jahreszeiten
        adaptiveCtSolarInterpolated = Math.round(minCt + sunMinutesDay * RangePerMinute * sunpos.altitude * (1 / sunposNoon.altitude));// SolarInterpolated = Wie Solar, jedoch wird der Wert so hochgerechnet dass immer zum Sonnenmittag maxCt gesetzt wird, unabhängig der Jahreszeit
    };
    log("adaptiveCtLinear=" + adaptiveCtLinear + " adaptiveCtSolar=" + adaptiveCtSolar + " adaptiveCtSolarInterpolated=" + adaptiveCtSolarInterpolated)
    for (let Group in LightGroups) {
        switch (LightGroups[Group].adaptiveCtMode) {
            case "linear":
                if (LightGroups[Group].adaptiveCt && LightGroups[Group].ct != adaptiveCtLinear) {
                    setState(praefix + "." + Group + ".ct", adaptiveCtLinear, false) //Ack false um SetCt zu triggern
                };
                break;
            case "solar":
                if (LightGroups[Group].adaptiveCt && LightGroups[Group].ct != adaptiveCtSolar) {
                    setState(praefix + "." + Group + ".ct", adaptiveCtSolar, false) //Ack false um SetCt zu triggern
                };
                break;
            case "solarInterpolated":
                if (LightGroups[Group].adaptiveCt && LightGroups[Group].ct != adaptiveCtSolarInterpolated) {
                    setState(praefix + "." + Group + ".ct", adaptiveCtSolarInterpolated, false) //Ack false um SetCt zu triggern
                };
                break;
        };
    };
}

async function SetWhiteSubstituteColor(Group) {
    // log ("Reaching WhiteSubstituteColor for Group"+Group+" = "+LightGroups[Group].description+" LightGroups[Group].power="+LightGroups[Group].power+" LightGroups[Group].color ="+LightGroups[Group].color)
    if (LightGroups[Group].power && LightGroups[Group].color.toUpperCase() == "#FFFFFF") { //Nur ausführen bei anschalten und Farbe weiß
        // log("anschalten und Farbe weiß")
        if (LightGroups[Group].ct < (maxCt - minCt) / 3 + minCt || LightGroups[Group].ct > (maxCt - minCt) / 3 * 2 + minCt) { //Ct Regelbereich dritteln, erstes drittel ist ww, 2tes kw und drittes wieder ww
            log("Warmweiss")
            for (let Light in LightGroups[Group].lights) {
                if (LightGroups[Group].lights[Light].ct.oid == "" && LightGroups[Group].lights[Light].color.oid != "" && LightGroups[Group].lights[Light].color.warmWhiteColor != "" && LightGroups[Group].lights[Light].color.dayLightColor != "") {
                    await setStateAsync(LightGroups[Group].lights[Light].color.oid, LightGroups[Group].lights[Light].color.warmWhiteColor, false);

                };
            };
        } else { //Hier kw
            log("Kaltweiss")
            for (let Light in LightGroups[Group].lights) {
                if (LightGroups[Group].lights[Light].ct.oid == "" && LightGroups[Group].lights[Light].color.oid != "" && LightGroups[Group].lights[Light].color.warmWhiteColor != "" && LightGroups[Group].lights[Light].color.dayLightColor != "") {
                    await setStateAsync(LightGroups[Group].lights[Light].color.oid, LightGroups[Group].lights[Light].color.dayLightColor, false);

                };
            };
        };
    };
}

async function SetColorMode(Group) {
    log("Reaching SetColorMode for Group " + Group)
    if (LightGroups[Group].power) {
        for (let Light in LightGroups[Group].lights) { //Alle Lampen der Gruppe durchgehen
            if (LightGroups[Group].lights[Light].modeswitch.oid != "") { //Prüfen ob Datenpunkt für Colormode vorhanden
                if (LightGroups[Group].color.toUpperCase() == "#FFFFFF") { //bei Farbe weiss 
                    await setStateAsync(LightGroups[Group].lights[Light].modeswitch.oid, LightGroups[Group].lights[Light].modeswitch.whiteModeVal, false);
                    log("Device=" + LightGroups[Group].lights[Light].modeswitch.oid + " Val=" + LightGroups[Group].lights[Light].modeswitch.whiteModeVal)
                } else { //Bei allen anderen Farben
                    await setStateAsync(LightGroups[Group].lights[Light].modeswitch.oid, LightGroups[Group].lights[Light].modeswitch.colorModeVal, false);
                };
            };
        };
    };
    return true;
}

async function SetColor(Group) {
    log("Reaching SetColor for Group " + Group + " power=" + LightGroups[Group].power)
    if (LightGroups[Group].power) {
        for (let Light in LightGroups[Group].lights) { //Alle Lampen der Gruppe durchgehen
            if (LightGroups[Group].lights[Light].color.oid != "") { //Prüfen ob Datenpunkt für Color vorhanden
                if (LightGroups[Group].lights[Light].color.type == "hex") { //Keine Konvertierung nötig
                    log("LightGroups[Group].lights[Light].color.type=" + LightGroups[Group].lights[Light].color.type)
                    await setStateAsync(LightGroups[Group].lights[Light].color.oid, LightGroups[Group].color, false);
                } else if (LightGroups[Group].lights[Light].color.type == "rgb") {

                }

            };
        };
        return true;
    }
}

/* ------------------------- FUNCTIONS FOR Switching On/Off --------------------------------- */

async function GroupPowerOnOff(Group, OnOff) {
    log("Reaching GroupPowerOnOff for Group " + Group + ", OnOff=" + OnOff + " rampOn=" + LightGroups[Group].rampOn.enabled + " - " + JSON.stringify(LightGroups[Group].rampOn) + " rampOff=" + LightGroups[Group].rampOff.enabled + " - " + JSON.stringify(LightGroups[Group].rampOff));
    let LoopCount = 0;

    //Normales schalten ohne Ramping
    if (OnOff && !LightGroups[Group].rampOn.enabled) { //Anschalten
        log("Normales anschalten ohne Ramping für " + LightGroups[Group].description);
        for (let Light in LightGroups[Group].lights) {
            await setStateAsync(LightGroups[Group].lights[Light].power.oid, LightGroups[Group].lights[Light].power.onVal);
            log("A Switching " + Light + " " + LightGroups[Group].lights[Light].power.oid + " to: " + OnOff);
        };
        if (LightGroups[Group].autoOffTimed.enabled) { //Wenn Zeitabschaltung aktiv und Anschaltung, AutoOff aktivieren
            AutoOffTimed(Group); //
        };

    } else if (!OnOff && !LightGroups[Group].rampOff.enabled) { //Ausschalten
        log("Normales ausschalten ohne Ramping für " + LightGroups[Group].description);
        if (LightGroups[Group].rampOn.enabled) {//Vor dem ausschalten Helligkeit auf 2 (0+1 wird bei manchchen Devices als aus gewertet) um bei rampon nicht mit voller Pulle zu starten
            await setDeviceBri(Group, 2);
        }
        for (let Light in LightGroups[Group].lights) {
            await setStateAsync(LightGroups[Group].lights[Light].power.oid, LightGroups[Group].lights[Light].power.offVal);
            log("B Switching " + Light + " " + LightGroups[Group].lights[Light].power.oid + " to: " + OnOff);
        };
    };

    // Anschalten mit ramping
    if (OnOff && LightGroups[Group].rampOn.enabled && LightGroups[Group].rampOn.switchOutletsLast) { //Anschalten mit Ramping und einfache Lampen/Steckdosen zuletzt
        log("Anschalten mit Ramping und einfache Lampen zuletzt für " + LightGroups[Group].description);
        for (let Light in LightGroups[Group].lights) { //Alles anschalten wo
            if (LightGroups[Group].lights[Light].bri.oid != "") { //bri nicht leer
                await setStateAsync(LightGroups[Group].lights[Light].power.oid, LightGroups[Group].lights[Light].power.onVal);
                log("Ca Switching " + Light + " " + LightGroups[Group].lights[Light].power.oid + " to: " + OnOff + " now setting brightness");
            };
        };
        clearInterval(RampOnIntervalObject[Group]);
        RampOnIntervalObject[Group] = setInterval(function () { // Interval starten
            LoopCount++;
            //  SetBrightness(Group, Math.round(RampSteps * LoopCount * (LightGroups[Group].bri / 100)));
            setDeviceBri(Group, Math.round(RampSteps * LoopCount * (LightGroups[Group].bri / 100)))

            if (LoopCount >= RampSteps) { //Interval stoppen und einfache Lampen schalten
                for (let Light in LightGroups[Group].lights) { //Alles anschalten wo
                    if (LightGroups[Group].lights[Light].bri.oid == "") { //bri leer
                        setStateAsync(LightGroups[Group].lights[Light].power.oid, LightGroups[Group].lights[Light].power.onVal);
                        log("Cb Switching " + Light + " " + LightGroups[Group].lights[Light].power.oid + " to: " + OnOff);
                    };
                };
                if (LightGroups[Group].autoOffTimed.enabled) { //Wenn Zeitabschaltung aktiv und Anschaltung, AutoOff aktivieren
                    AutoOffTimed(Group); //
                };

                clearInterval(RampOnIntervalObject[Group]);
            };
        }, Math.round(LightGroups[Group].rampOn.time / RampSteps) * 1000); //
    }
    else if (OnOff && LightGroups[Group].rampOn.enabled && !LightGroups[Group].rampOn.switchOutletsLast) { //Anschalten mit Ramping und einfache Lampen zuerst
        log("Anschalten mit Ramping und einfache Lampen zuerst für " + LightGroups[Group].description);

        for (let Light in LightGroups[Group].lights) { //Alles anschalten
            await setStateAsync(LightGroups[Group].lights[Light].power.oid, LightGroups[Group].lights[Light].power.onVal);
            log("D Switching " + Light + " " + LightGroups[Group].lights[Light].power.oid + " to: " + OnOff + " now setting brightness");
        };
        clearInterval(RampOnIntervalObject[Group]);
        RampOnIntervalObject[Group] = setInterval(function () { // Interval starten
            //SetBrightness(Group, Math.round(RampSteps * LoopCount * (LightGroups[Group].bri / 100)));
            setDeviceBri(Group, Math.round(RampSteps * LoopCount * (LightGroups[Group].bri / 100)))
            LoopCount++;
            //  log("Loopcount=" + LoopCount + " - " + " Rampsteps=" + RampSteps + " RampOnTime= " + LightGroups[Group].rampOn.time)
            if (LoopCount >= RampSteps) {
                if (LightGroups[Group].autoOffTimed.enabled) { //Wenn Zeitabschaltung aktiv und Anschaltung, AutoOff aktivieren
                    AutoOffTimed(Group); //
                };
                clearInterval(RampOnIntervalObject[Group]);
            }
        }, Math.round(LightGroups[Group].rampOn.time / RampSteps) * 1000); //
    }

    //Ausschalten mit Ramping
    else if (!OnOff && LightGroups[Group].rampOff.enabled && LightGroups[Group].rampOff.switchOutletsLast) { ////Ausschalten mit Ramping und einfache Lampen zuletzt
        log("Ausschalten mit Ramping und einfache Lampen zuletzt für " + LightGroups[Group].description);
        clearInterval(RampOffIntervalObject[Group]);
        RampOffIntervalObject[Group] = setInterval(function () { // Interval starten
            // SetBrightness(Group, LightGroups[Group].bri - LightGroups[Group].bri / RampSteps - Math.round(RampSteps * LoopCount * (LightGroups[Group].bri / 100)));
            setDeviceBri(Group, LightGroups[Group].bri - LightGroups[Group].bri / RampSteps - Math.round(RampSteps * LoopCount * (LightGroups[Group].bri / 100)));
            LoopCount++;
            //  log("Loopcount=" + LoopCount + " - " + " Rampsteps=" + RampSteps + " RampOffTime= " + LightGroups[Group].rampOff.time)
            if (LoopCount >= RampSteps) {
                clearInterval(RampOffIntervalObject[Group]);
                for (let Light in LightGroups[Group].lights) {
                    if (LightGroups[Group].lights[Light].bri.oid == "") { //prüfen ob Helligkeitsdatenpunkt vorhanden
                        setStateAsync(LightGroups[Group].lights[Light].power.oid, LightGroups[Group].lights[Light].power.offVal); //Einfache Lampen ausschalten, dann
                        log("F Switching " + Light + " " + LightGroups[Group].lights[Light].power.oid + " to: " + OnOff);
                    };
                };
            };
        }, Math.round(LightGroups[Group].rampOff.time / RampSteps) * 1000); //
    }
    else if (!OnOff && LightGroups[Group].rampOff.enabled && !LightGroups[Group].rampOff.switchOutletsLast) { ////Ausschalten mit Ramping und einfache Lampen zuerst
        log("Ausschalten mit Ramping und einfache Lampen zuerst für " + LightGroups[Group].description);
        for (let Light in LightGroups[Group].lights) {
            if (LightGroups[Group].lights[Light].bri.oid == "") { //prüfen ob Helligkeitsdatenpunkt vorhanden, wenn nein
                await setStateAsync(LightGroups[Group].lights[Light].power.oid, LightGroups[Group].lights[Light].power.offVal); //Einfache Lampen ausschalten, dann
                log("F Switching " + Light + " " + LightGroups[Group].lights[Light].power.oid + " to: " + OnOff);
            };
        };
        clearInterval(RampOffIntervalObject[Group]);
        RampOffIntervalObject[Group] = setInterval(function () { // Interval starten
            LightGroups[Group].power = true; //Power intern wieder auf true, um Bri auszuführen wo auf power geprüft wird
            // SetBrightness(Group, LightGroups[Group].bri - LightGroups[Group].bri / RampSteps - Math.round(RampSteps * LoopCount * (LightGroups[Group].bri / 100)));
            setDeviceBri(Group, LightGroups[Group].bri - LightGroups[Group].bri / RampSteps - Math.round(RampSteps * LoopCount * (LightGroups[Group].bri / 100)));
            LoopCount++;
            log("Loopcount=" + LoopCount + " - " + " Rampsteps=" + RampSteps + " RampOffTime= " + LightGroups[Group].rampOff.time);

            if (LoopCount >= RampSteps) {
                LightGroups[Group].power = false;

                DeviceSwitch(Group, OnOff);
                clearInterval(RampOffIntervalObject[Group]);
            };
        }, Math.round(LightGroups[Group].rampOff.time / RampSteps) * 1000); //
    };

    setState(praefix + "." + Group + ".power", OnOff, true); // Power on mit ack bestätigen, bzw. bei Auto Funktionen nach Ausführung den DP setzen
    LightGroups[Group].power = OnOff;
    return true;
}

async function DeviceSwitch(Group, OnOff) { //Ausgelagert von GroupOnOff da im Interval kein await möglich
    for (let Light in LightGroups[Group].lights) {
        if (LightGroups[Group].lights[Light].bri.oid != "") { //prüfen ob Helligkeitsdatenpunkt vorhanden, wenn ja
            await setStateAsync(LightGroups[Group].lights[Light].power.oid, LightGroups[Group].lights[Light].power.offVal); //Lampen schalten
            log("F Switching " + Light + " " + LightGroups[Group].lights[Light].power.oid + " to: " + OnOff);
        };
    };
}

async function GroupPowerCleaningLightOnOff(Group, OnOff) {
    if (logging) log("Reaching GroupPowerCleaningLightOnOff")
    if (OnOff) {
        for (let Light in LightGroups[Group].lights) {
            await setStateAsync(LightGroups[Group].lights[Light].power.oid, LightGroups[Group].lights[Light].power.onVal);
            log("Switching " + Light + " " + LightGroups[Group].lights[Light].power.oid + " to: " + OnOff);
        };
        SetBrightness(Group, 100);
    } else {
        for (let Light in LightGroups[Group].lights) {
            await setStateAsync(LightGroups[Group].lights[Light].power.oid, LightGroups[Group].lights[Light].power.offVal);
            log("Switching " + Light + " " + LightGroups[Group].lights[Light].power.oid + " to: " + OnOff);
        };
    };
}

function Ticker() {
    AdaptiveCt(); //
    TickerIntervalObj = setInterval(function () { // Wenn 
        AdaptiveCt(); //
    }, 60000);
}

async function AutoOnLux(Group) {
    if (logging) log("Reaching AutoOnLux for Group:," + Group + " enabled=" + LightGroups[Group].autoOnLux.enabled + " ,actuallux=" + LightGroups[Group].actualLux + " ,minLux=" + LightGroups[Group].autoOnLux.minLux + " LightGroups[Group].autoOnLux.dailyLock=" + LightGroups[Group].autoOnLux.dailyLock)
    //Handling für AutoOnLux
    if ((LightGroups[Group].autoOnLux.switchOnlyWhenPresence && ActualPresence) || (LightGroups[Group].autoOnLux.switchOnlyWhenNoPresence && !ActualPresence)) {
        if (LightGroups[Group].autoOnLux.enabled && !LightGroups[Group].power && !LightGroups[Group].autoOnLux.dailyLock) {
            if (LightGroups[Group].autoOnLux.operator == "<" && LightGroups[Group].actualLux < LightGroups[Group].autoOnLux.minLux) {
                await GroupPowerOnOff(Group, true);

                LightGroups[Group].autoOnLux.dailyLock = true;
                await setStateAsync(praefix + "." + Group + ".autoOnLux.dailyLock", true, true);
            } else if (LightGroups[Group].autoOnLux.operator == ">" && LightGroups[Group].actualLux > LightGroups[Group].autoOnLux.minLux) {
                await GroupPowerOnOff(Group, true);

                LightGroups[Group].autoOnLux.dailyLock = true;
                await setStateAsync(praefix + "." + Group + ".autoOnLux.dailyLock", true, true);
            };
            if (LightGroups[Group].autoOnLux.bri != 0) {
                SetBrightness(Group, LightGroups[Group].autoOnLux.bri);
            };
        }
    };

    if (LightGroups[Group].actualLux > LightGroups[Group].autoOnLux.minLux && LightGroups[Group].autoOnLux.dailyLock) {
        LightGroups[Group].autoOnLux.dailyLock = false;
        await setStateAsync(praefix + "." + Group + ".autoOnLux.dailyLock", false, true);
    };

}

async function AutoOnMotion(Group) {
    //  log("Reaching AutoOnMotion for Group:," + Group + " enabled=" + LightGroups[Group].autoOnMotion.enabled + " ,actuallux=" + LightGroups[Group].actualLux + " ,minLux=" + LightGroups[Group].autoOnMotion.minLux)
    if (LightGroups[Group].autoOnMotion.enabled && LightGroups[Group].actualLux < LightGroups[Group].autoOnMotion.minLux && LightGroups[Group].isMotion) {
        log("Motion for Group " + Group + " detected, switching on")
        await GroupPowerOnOff(Group, true);
        if (LightGroups[Group].autoOnMotion.bri != 0) {
            SetBrightness(Group, LightGroups[Group].autoOnMotion.bri);
        };
        SetWhiteSubstituteColor(Group)
    };
}

async function AutoOnPresenceIncrease() {
    if (logging) log("Reaching AutoPresenceIncrease");
    for (let Group in LightGroups) {
        if (LightGroups[Group].autoOnPresenceIncrease.enabled && LightGroups[Group].actualLux < LightGroups[Group].autoOnPresenceIncrease.minLux && !LightGroups[Group].power) {
            await GroupPowerOnOff(Group, true);
            if (LightGroups[Group].autoOnPresenceIncrease.bri != 0) {
                SetBrightness(Group, LightGroups[Group].autoOnPresenceIncrease.bri);
            };
        };
    }
}


/* ------------------------- FUNCTIONS FOR Switching Off --------------------------------- */

async function AutoOffLux(Group) {//Handling für AutoOffLux
    if (logging) log("Reaching AutoOffLux, for Group=" + Group + " =" + LightGroups[Group].description)

    if (LightGroups[Group].autoOffLux.operator == "<" && LightGroups[Group].actualLux < LightGroups[Group].autoOffLux.minLux && LightGroups[Group].autoOffLux.enabled && LightGroups[Group].power && !LightGroups[Group].autoOffLux.dailyLock) {
        GroupPowerOnOff(Group, false);
        LightGroups[Group].autoOffLux.dailyLock = true;
        await setStateAsync(praefix + "." + Group + ".autoOffLux.dailyLock", true, true);
    } else if (LightGroups[Group].autoOffLux.operator == ">" && LightGroups[Group].actualLux > LightGroups[Group].autoOffLux.minLux && LightGroups[Group].autoOffLux.enabled && LightGroups[Group].power && !LightGroups[Group].autoOffLux.dailyLock) {
        GroupPowerOnOff(Group, false);
        LightGroups[Group].autoOffLux.dailyLock = true;
        await setStateAsync(praefix + "." + Group + ".autoOffLux.dailyLock", true, true);
    };

    if (LightGroups[Group].autoOffLux.operator == "<") { //DailyLock resetten
        if (LightGroups[Group].actualLux > LightGroups[Group].autoOffLux.minLux && LightGroups[Group].autoOffLux.dailyLock) {
            LightGroups[Group].autoOffLux.dailyLock = false;
            await setStateAsync(praefix + "." + Group + ".autoOffLux.dailyLock", false, true);
        };
    } else if (LightGroups[Group].autoOffLux.operator == ">") {
        if (LightGroups[Group].actualLux < LightGroups[Group].autoOffLux.minLux && LightGroups[Group].autoOffLux.dailyLock) {
            LightGroups[Group].autoOffLux.dailyLock = false;
            await setStateAsync(praefix + "." + Group + ".autoOffLux.dailyLock", false, true);
        };
    };

}

function AutoOffTimed(Group) {
    if (logging) log("Reaching AutoOffTimed for Group " + Group + " set time=" + LightGroups[Group].autoOffTimed.autoOffTime + " LightGroups[Group].isMotion=" + LightGroups[Group].isMotion + " LightGroups[Group].autoOffTimed.noAutoOffWhenMotion=" + LightGroups[Group].autoOffTimed.noAutoOffWhenMotion)
    if (LightGroups[Group].autoOffTimed.enabled) {
        clearAutoOffTimeout(Group);
        AutoOffTimeoutObject[Group] = setTimeout(function () { // Interval starten
            if (LightGroups[Group].autoOffTimed.noAutoOffWhenMotion && LightGroups[Group].isMotion) { //Wenn noAutoOffWhneotion aktiv und Bewegung erkannt
                log("Motion detected, restarting Timeout");
                AutoOffTimed(Group);// TimeOut neustarten
            } else {
                log("Group " + Group + " timed out, switching off. Motion=" + LightGroups[Group].isMotion);
                GroupPowerOnOff(Group, false);

            };
        }, Math.round(LightGroups[Group].autoOffTimed.autoOffTime) * 1000); //

    };

}

// -----------------------

async function main() {
    await GlobalPresenceHandling();
    await GlobalLuxHandling();
    await init();
    Ticker();
}

async function Controller(Group, prop1, OldVal, NewVal) { //Used by all
    // log("Reaching Controller, Group=" + Group + " Property1=" + prop1 + " NewVal=" + NewVal + " OldVal=" + OldVal);

    switch (prop1) {
        case "actualLux":
            AutoOnLux(Group);
            AutoOffLux(Group);
            AdaptiveBri(Group);
            break;
        case "isMotion":
            LightGroups[Group].isMotion = NewVal;
            AutoOnMotion(Group);
            break;
        case "rampOn.enabled":
        case "rampOn.switchOutletsLast":
            break;
        case "rampOff.enabled":
        case "rampOff.switchOutletsLast":
            break;
        case "autoOffTimed.enabled":
        case "autoOffTimed.autoOffTime":

            break;
        case "autoOnMotion.enabled":
        case "autoOnMotion.minLux":
            break;
        case "autoOffLux.enabled":
        case "autoOffLux.operator":
        case "autoOffLux.minLux":
        case "autoOffLux.switchOnlyWhenPresence":
        case "autoOffLux.switchOnlyWhenNoPresence":
            AutoOffLux(Group);
            break;
        case "autoOnLux.enabled":
        case "autoOnLux.switchOnlyWhenNoPresence":
        case "autoOnLux.switchOnlyWhenPresence":
        case "autoOnLux.minLux":
        case "autoOnLux.bri":
            AutoOnLux(Group);
            break;
        case "autoOnPresenceIncrease.enabled":
        case "autoOnPresenceIncrease.bri":
        case "autoOnPresenceIncrease.color":
        case "autoOnPresenceIncrease.minLux":
            AutoOnPresenceIncrease()
            break;
        case "bri":
            await SetBrightness(Group, LightGroups[Group].bri);
            break;
        case "ct":
            await SetCt(Group);
            await SetWhiteSubstituteColor(Group);
            break;
        case "color":
            await SetColor(Group);
            if (NewVal.toUpperCase() == "#FFFFFF") await SetWhiteSubstituteColor(Group);
            await SetColorMode(Group);

            break;
        case "power":
            if (NewVal != OldVal) await GroupPowerOnOff(Group, NewVal); //Alles schalten
            if (!LightGroups[Group].rampOn.enabled && NewVal) await SetBrightness(Group, LightGroups[Group].bri); //Wenn kein RampOn Helligkeit direkt setzen
            if (NewVal) {
                await SetColor(Group);//Nach anschalten Color setzen
                if (LightGroups[Group].color.toUpperCase() == "#FFFFFF") await SetWhiteSubstituteColor(Group);
                await SetColorMode(Group); //Nach anschalten Colormode setzen
                if (LightGroups[Group].color.toUpperCase() == "#FFFFFF") await SetCt(Group);//Nach anschalten Ct setzen

            };
            if (LightGroups[Group].autoOffTimed.enabled && NewVal) { //Wenn Zeitabschaltung und Anschaltung
                //   AutoOffTimed(Group); //
            };
            break;
        case "powerCleaningLight":
            GroupPowerCleaningLightOnOff(Group, NewVal);
            break;
        case "adaptiveBri":
            break;
        case "adaptiveCt":
            await SetCt(Group);
            break;
        case "adaptiveCtMode":
            break;
        default:
            log("Error, unknown or missing property: " + prop1, "warn");
    };



}


