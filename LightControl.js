const Version = "2.0.19" //vom 6.1.2022 - Skript um Lichter in Helligkeit, Farbe und Farbtemp global zu steuern - Git: https://github.com/Pittini/iobroker-LightControl - Forum: https://forum.iobroker.net/topic/36578/vorlage-lightcontrol

log("starting LightControl V." + Version);

const praefix = "javascript.0.LightControl2" // Skriptordner
const LuxSensor = 'linkeddevices.0.Klima.Draussen.brightness'; // Datenpunkt des globalen Luxsensors, wird verwendet wenn in der Gruppe kein gesonderter definiert wird
const IsPresenceDp = ""; // Datenpunkt für Anwesenheit (true/false)
const PresenceCountDp = "radar2.0._nHere"; // Datenpunkt für Anwesenheitszähler
const logging = false; // Logging an/aus
const RampSteps = 10; //Wieviele Schritte zum dimmen? Bitte nicht zu hoch setzen, wird zwar smoother, kann aber zu timing Problemen führen wenn gleichzeitig eine kurze Zeit in den Objekten gewählt.

const minCt = 2700; //Regelbereich für Farbtemperatur in Kelvin für Adaptive Ct
const maxCt = 6500;//Regelbereich für Farbtemperatur in Kelvin für Adaptive Ct
const minBri = 10; //Mindesthelligkeit für AdaptiveBri

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
            0: { id: 'linkeddevices.0.Bewegungsmelder.Flur_EG.0.IsMotion', motionVal: true, noMotionVal: false },
            1: { id: 'linkeddevices.0.Bewegungsmelder.Flur_EG.1.IsMotion', motionVal: true, noMotionVal: false },
            2: { id: 'linkeddevices.0.Bewegungsmelder.Flur_EG.2.IsMotion', motionVal: true, noMotionVal: false }
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
                color: { oid: "yeelight-2.0.Strip1.control.rgb", type: "hex", default: "#FFFFFF" }
            },
            4: {
                description: "Kugellampe",
                power: { oid: "zigbee.0.ccccccfffed68f5d.state", onVal: true, offVal: false },
                bri: { oid: "zigbee.0.ccccccfffed68f5d.brightness", minVal: 0, maxVal: 100, defaultVal: 60 },
                ct: { oid: "", minVal: 6500, maxVal: 2700 },
                sat: { oid: "", minVal: 0, maxVal: 100 },
                modeswitch: { oid: "", whiteModeVal: false, colorModeVal: true },
                color: { oid: "zigbee.0.ccccccfffed68f5d.color", type: "hex", default: "#FFFFFF", warmWhiteColor: "#FFA500", dayLightColor: "#FFE4B5" }
            },
            5: {
                description: "Strahler",
                power: { oid: "zigbee.0.680ae2fffeae5254.state", onVal: true, offVal: false },
                bri: { oid: "zigbee.0.680ae2fffeae5254.brightness", minVal: 0, maxVal: 100, defaultVal: 100 },
                ct: { oid: "", minVal: 6500, maxVal: 2700 },
                sat: { oid: "", minVal: 0, maxVal: 100 },
                modeswitch: { oid: "", whiteModeVal: false, colorModeVal: true },
                color: { oid: "zigbee.0.680ae2fffeae5254.color", type: "hex", default: "#FFFFFF", warmWhiteColor: "#FFA500", dayLightColor: "#FFE4B5" }
            },
            6: {
                description: "Wooden Bar",
                power: { oid: "wled.0.3c6105d15496.on", onVal: true, offVal: false },
                bri: { oid: "wled.0.3c6105d15496.bri", minVal: 0, maxVal: 255, defaultVal: 200 },
                ct: { oid: "", minVal: 6500, maxVal: 2700 },
                sat: { oid: "", minVal: 0, maxVal: 100 },
                modeswitch: { oid: "", whiteModeVal: false, colorModeVal: true },
                color: { oid: "wled.0.3c6105d15496.seg.0.col.0_HEX", type: "hex", default: "#FFFFFF", warmWhiteColor: "#FFA500", dayLightColor: "#FFE4B5" }
            },
            7: {
                description: "144er Left Bar",
                power: { oid: "wled.0.3c6105d0a203.on", onVal: true, offVal: false },
                bri: { oid: "wled.0.3c6105d0a203.bri", minVal: 0, maxVal: 255, defaultVal: 200 },
                ct: { oid: "", minVal: 6500, maxVal: 2700 },
                sat: { oid: "", minVal: 0, maxVal: 100 },
                modeswitch: { oid: "", whiteModeVal: false, colorModeVal: true },
                color: { oid: "wled.0.3c6105d0a203.seg.0.col.0_HEX", type: "hex", default: "#FFFFFF", warmWhiteColor: "#FFA500", dayLightColor: "#FFE4B5" }
            },
            8: {
                description: "144er Right Bar",
                power: { oid: "wled.0.3c6105d1554b.on", onVal: true, offVal: false },
                bri: { oid: "wled.0.3c6105d1554b.bri", minVal: 0, maxVal: 255, defaultVal: 200 },
                ct: { oid: "", minVal: 6500, maxVal: 2700 },
                sat: { oid: "", minVal: 0, maxVal: 100 },
                modeswitch: { oid: "", whiteModeVal: false, colorModeVal: true },
                color: { oid: "wled.0.3c6105d1554b.seg.0.col.0_HEX", type: "hex", default: "#FFFFFF", warmWhiteColor: "#FFA500", dayLightColor: "#FFE4B5" }
            },
            9: {
                description: "384er Rondell",
                power: { oid: "wled.0.ec94cb648b40.on", onVal: true, offVal: false },
                bri: { oid: "wled.0.ec94cb648b40.bri", minVal: 0, maxVal: 255, defaultVal: 15 },
                ct: { oid: "", minVal: 6500, maxVal: 2700 },
                sat: { oid: "", minVal: 0, maxVal: 100 },
                modeswitch: { oid: "", whiteModeVal: false, colorModeVal: true },
                color: { oid: "wled.0.ec94cb648b40.seg.0.col.0_HEX", type: "hex", default: "#FF0000", warmWhiteColor: "#FFA500", dayLightColor: "#FFE4B5" }
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
            0: { id: 'linkeddevices.0.Bewegungsmelder.Toilette.IsMotion', motionVal: true, noMotionVal: false }
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
            0: { id: 'linkeddevices.0.Bewegungsmelder.Flur_Og1.0.IsMotion', motionVal: true, noMotionVal: false },
            1: { id: 'linkeddevices.0.Bewegungsmelder.Flur_Og1.1.IsMotion', motionVal: true, noMotionVal: false }
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
            0: { id: 'linkeddevices.0.Bewegungsmelder.Bad.0.IsMotion', motionVal: true, noMotionVal: false }
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
            0: { id: 'linkeddevices.0.Bewegungsmelder.Kueche.0.IsMotion', motionVal: true, noMotionVal: false }
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
            0: { id: 'zigbee.0.00158d00042ae926.opened', motionVal: true, noMotionVal: false }
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
            0: { id: 'linkeddevices.0.Magnetkontakt.Flur_Eg.Haustuer.opened', motionVal: true, noMotionVal: false }
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
            0: { id: 'linkeddevices.0.Bewegungsmelder.Schlafzimmer_C.0.IsMotion', motionVal: true, noMotionVal: false }
        }
    },
    11: {
        description: "Test",
        lights: {
            0: {
                description: "Testlampe",
                power: { oid: "0_userdata.0.TestDatenpunkte.Lampen.power", onVal: true, offVal: false },
                bri: { oid: "0_userdata.0.TestDatenpunkte.Lampen.bri", minVal: 0, maxVal: 100, defaultVal: 100 },
                ct: { oid: "0_userdata.0.TestDatenpunkte.Lampen.ct", minVal: 2100, maxVal: null },
                sat: { oid: "", minVal: null, maxVal: null },
                modeswitch: { oid: "", whiteModeVal: false, colorModeVal: true },
                color: { oid: "", type: "", default: "" }
            }
        },
        sensors: {

        }
    }

};

// ------------------ AB HIER NIX MEHR ÄNDERN --------------------------
let RampOnIntervalObject = {};
let RampOffIntervalObject = {};
let AutoOffTimeoutObject = {};
let TickerIntervalObj = {};
let BlinkIntervalObj = {};


let ActualGenericLux = 0;
let ActualPresence = true;
let ActualPresenceCount = 1;

const suncalc = require('suncalc');
const result = getObject("system.adapter.javascript.0");
const lat = result.native.latitude;
const long = result.native.longitude;

const GroupAllTemplate = {
    power: { id: praefix + ".all.power", common: { read: true, write: true, name: "Masterpower", type: "boolean", role: "switch.power", def: false } },
    anyOn: { id: praefix + ".all.anyOn", common: { read: true, write: false, name: "Any Group is On", type: "boolean", role: "indicator.state", def: false } },
}

const GroupTemplate = {
    power: { id: "", common: { read: true, write: true, name: "Power", type: "boolean", role: "switch.power", def: false } },
    dimmUp: { id: "", common: { read: true, write: true, name: "DimmUp", type: "boolean", role: "button", def: false } },
    dimmDown: { id: "", common: { read: true, write: true, name: "DimmDown", type: "boolean", role: "button", def: false } },
    dimmAmount: { id: "", common: { read: true, write: true, name: "Brightnesssteps for dimming", type: "number", role: "level.brightness", def: 10, min: 2, max: 50, unit: "%" } },
    bri: { id: "", common: { read: true, write: true, name: "Brightness", type: "number", role: "level.brightness", def: 100, min: 0, max: 100, unit: "%" } },
    ct: { id: "", common: { read: true, write: true, name: "Colortemperature", type: "number", role: "level.color.temperature", def: 3300, min: 2100, max: 6500, unit: "K" } },
    color: { id: "", common: { read: true, write: true, name: "Color", type: "string", role: "level.color.rgb", def: "#FFFFFF" } },
    luxSensorOid: { id: "", common: { read: true, write: true, name: "ObjectId for Luxsensor", type: "string", role: "state", def: LuxSensor } },
    adaptiveBri: { id: "", common: { read: true, write: true, name: "Adaptive Brightness", type: "boolean", role: "switch.enable", def: false } },
    adaptiveCt: { id: "", common: { read: true, write: true, name: "Adaptive Colortemperature", type: "boolean", role: "switch.enable", def: false } },
    adaptiveCtMode: { id: "", common: { read: true, write: true, name: "Mode for Adaptive Colortemperature", type: "string", role: "switch.mode", def: "solar", states: { linear: "Linear", solar: "Solar", solarInterpolated: "Solar interpolated", timed: "StartYourDay" } } },
    adaptiveCtTime: { id: "", common: { read: true, write: true, name: "Startzeit Adaptive Colortemperature bei Modus: StartYourDay", type: "string", unit: "Uhr", role: "value", def: "06:00" } },
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
        frequency: { id: "", common: { read: true, write: true, name: "Blink frequency in seconds", type: "number", role: "level", def: 1, min: 1, unit: "sek" } },
        blinks: { id: "", common: { read: true, write: true, name: "How many blinks at activation?", type: "number", role: "level", def: 3, min: 1 } },
        bri: { id: "", common: { read: true, write: true, name: "Brightness of lights when blinking, if empty using groupstandard", type: "number", role: "level.brightness", def: 100, max: 100, min: 0, unit: "%" } },
        color: { id: "", common: { read: true, write: true, name: "Color of lights when blinking, if empty using groupstandard", type: "string", role: "level.color.rgb", def: "#FF0000" } }
    }
}

main();

async function GlobalLuxHandling() {
    // Globale Luxwerte holen und Trigger setzen
    if (LuxSensor != "") {
        ActualGenericLux = (await getStateAsync(LuxSensor)).val;
        //  log("ActualGenericLux=" + ActualGenericLux)
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
        await DoAllTheSensorThings(Group); //Sonderfall sensors

        for (let prop1 in GroupTemplate) { // Template Properties 1. Ebene durchgehen
            if (typeof GroupTemplate[prop1].id == "undefined") { //Wenn keine id zu finden, nächste, 2. Ebene durchlaufen
                LightGroups[Group][prop1] = {}; //2te Ebene im Objekt anlegen

                for (let z in GroupTemplate[prop1]) {
                    GroupTemplate[prop1][z].id = praefix + "." + Group + "." + prop1 + "." + z;
                    if (!await existsStateAsync(GroupTemplate[prop1][z].id)) {// Prüfen ob state noch nicht vorhanden
                        await createStateAsync(GroupTemplate[prop1][z].id, GroupTemplate[prop1][z].common);//State anlegen
                        log("Init: Created datapoint " + GroupTemplate[prop1][z].id);
                        DpCount++;
                    } else {
                        if (logging) log("Init: Datapoint " + GroupTemplate[prop1][z].id + " still exists, skipping creation and reading data");
                    };

                    LightGroups[Group][prop1][z] = (await getStateAsync(GroupTemplate[prop1][z].id)).val; //Daten in Lightgroups einlesen (auch wenn neu erzeugt), dann

                    if (GroupTemplate[prop1][z].common.write) {
                        //  log("Setting Trigger for: " + GroupTemplate[prop1][z].id)

                        on({ id: GroupTemplate[prop1][z].id, change: "any", ack: false }, function (dp) { //Trigger erstellen
                            if (logging) log("Triggered " + dp.id + " new value is " + dp.state.val)
                            LightGroups[Group][prop1][z] = dp.state.val;
                            Controller(Group, prop1 + "." + z, dp.oldState.val, dp.state.val);
                        });
                    };
                };

                if (!await existsObjectAsync(praefix + "." + Group + "." + prop1)) { // Channel erstellen wenn noch nicht vorhanden
                    await setObjectAsync(praefix + "." + Group + "." + prop1, { type: 'channel', common: { name: LightGroups[Group].description + " " + prop1 }, native: {} });
                    log("Init: Subchannel " + praefix + "." + Group + "." + prop1 + " created");
                };

            } else {
                GroupTemplate[prop1].id = praefix + "." + Group + "." + prop1;
                if (!await existsStateAsync(GroupTemplate[prop1].id)) { // Prüfen ob state noch nicht vorhanden
                    await createStateAsync(GroupTemplate[prop1].id, GroupTemplate[prop1].common); //State anlegen
                    log("Init: Created datapoint " + GroupTemplate[prop1].id);
                    DpCount++;
                } else {
                    if (logging) log("Init:Datapoint " + GroupTemplate[prop1].id + " still exists, skipping creation and reading data");
                };

                LightGroups[Group][prop1] = (await getStateAsync(GroupTemplate[prop1].id)).val; //Daten in Lightgroups einlesen (auch wenn neu erzeugt), dann
                //  log("LightGroups[" + Group + "][" + prop1 + "]=" + LightGroups[Group][prop1])
                if (logging) log("Init: Read data from:" + praefix + "." + Group + "." + prop1 + ", value is " + LightGroups[Group][prop1]);

                //LuxGroupsensor Handling
                if (prop1 == "luxSensorOid") await DoAllTheLuxSensorThings(Group, prop1);


                if (GroupTemplate[prop1].common.write) { //Trigger für alle Template Dps erstellen, außer Dp ist readonly
                    //  log("Init: Setting Trigger for: " + GroupTemplate[prop1].id)
                    on({ id: GroupTemplate[prop1].id, change: "any", ack: false }, function (dp) {
                        // log("Init: Triggered " + dp.id + " new value is " + dp.state.val);
                        LightGroups[Group][prop1] = dp.state.val;
                        // if (prop1 == "luxSensorOid") ChangeLuxSensorTrigger(Group, prop1, dp.oldState.val, dp.state.val);
                        Controller(Group, prop1, dp.oldState.val, dp.state.val);
                    });
                };
            };
        };

        if (!await existsObjectAsync(praefix + "." + Group)) { //Gruppenchannel anlegen wenn noch nicht vorhanden
            await setObjectAsync(praefix + "." + Group, { type: 'channel', common: { name: LightGroups[Group].description }, native: {} });
            log("Init: Channel " + praefix + "." + Group + " created");
        };

        //  await setStateAsync(praefix + "." + Group + ".autoOnLux.dailyLock", false, true);
        // await setStateAsync(praefix + "." + Group + ".autoOffLux.dailyLock", false, true);
        LightGroups[Group].autoOnLux.dailyLockCounter = 0;
        LightGroups[Group].autoOffLux.dailyLockCounter = 0;
    };

    for (let prop1 in GroupAllTemplate) { // Sondergruppe "all" anlegen
        if (!await existsStateAsync(GroupAllTemplate[prop1].id)) {// Prüfen ob state noch nicht vorhanden
            await createStateAsync(GroupAllTemplate[prop1].id, GroupAllTemplate[prop1].common);//State anlegen
            log("Init: Created datapoint " + GroupAllTemplate[prop1].id);
            DpCount++;
        } else {
            if (logging) log("Init: Datapoint " + GroupAllTemplate[prop1].id + " still exists, skipping creation and setting trigger");
        };
        if (GroupAllTemplate[prop1].common.write) { //Trigger für alle Template Dps erstellen, außer Dp ist readonly
            on({ id: GroupAllTemplate[prop1].id, change: "any", ack: false }, function (dp) {
                log("Init: Triggered " + dp.id + " new value is " + dp.state.val);
                if (prop1 == "power") SetMasterPower(dp.oldState.val, dp.state.val);
            });
        }
    };
    if (!await existsObjectAsync(praefix + "." + "all")) { //Gruppenchannel anlegen wenn noch nicht vorhanden
        await setObjectAsync(praefix + "." + "all", { type: 'channel', common: { name: "Sammelfunktion um alle Gruppen gleichzeitig zu steuern" }, native: {} });
        log("Init: Channel " + praefix + "." + "all" + " created");
    };


    log("Init: Created " + DpCount + " Datapoints");

    onStop(function () { //Bei Scriptende alle Intervalle und Timeouts löschen
        clearRampOnIntervals(null);
        clearRampOffIntervals(null);
        clearBlinkIntervals(null);
        clearAutoOffTimeouts(null);
        clearInterval(TickerIntervalObj);
    }, 10);
    return true;
}

async function SetMasterPower(oldVal, NewVal) {
    log("Reaching SetMasterPower");
    for (let Group in LightGroups) {
        log("Switching Group " + LightGroups[Group].description + ", Id:" + praefix + "." + Group + ".power" + " to " + NewVal);
        await setStateAsync(praefix + "." + Group + ".power", NewVal, false);
    };

}

async function SetLightStateTrigger() {
    on({ id: praefix + "." + Group + ".power, change: "ne", ack: true }, function (dp) {
        await SetLightState();
    });
}

async function SetLightState() {
    log("Reaching Light States anyOn and Masterswitch");
    let groupLength = Object.keys(LightGroups).length;
    setStateAsync(praefix + ".all.anyOn", (await countGroups() > 0) ? true : false , true);
    setStateAsync(praefix + ".all.power", (await countGroups() === groupLength) ? true : false, true);
}

async function countGroups() {
    let i = 0;        
    for (let Group in LightGroups) {            
        if ((await getStateAsync(praefix + "." + Group + ".power")).val) {
            i++;
        };
    };
    return i;
}

async function clearRampOnIntervals(Group) {
    // log("Reaching ClearRampOnInterval(Group) Group=" + Group);
    if (Group == null) {
        for (let x in LightGroups) {
            if (typeof RampOnIntervalObject[x] == "object") {
                if (logging) log("RampOnInterval for Group=" + x + " deleted.");
                await clearInterval(RampOnIntervalObject[x]);
            };
        };
    } else {
        if (typeof RampOnIntervalObject[Group] == "object") {
            if (logging) log("RampOnInterval for Group=" + Group + " deleted.");
            await clearInterval(RampOnIntervalObject[Group]);
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

async function clearAutoOffTimeouts(Group) {
    //  log("Reaching clearAutoOffTimeout(Group) Group=" + Group);
    if (Group == null) {
        for (let x in LightGroups) {
            if (typeof AutoOffTimeoutObject[x] == "object") {
                if (logging) log("clearAutoOffTimeout: AutoOffTimeout for Group=" + x + " deleted.");
                await clearInterval(AutoOffTimeoutObject[x]);
            };
        };
    } else {
        if (typeof AutoOffTimeoutObject[Group] == "object") {
            if (logging) log("clearAutoOffTimeout: Timeout for Group=" + Group + " deleted.");
            await clearInterval(AutoOffTimeoutObject[Group]);
        };
    };
}

function clearBlinkIntervals(Group) {
    if (Group == null) {
        for (let x in LightGroups) {
            if (typeof BlinkIntervalObj[x] == "object") {
                if (logging) log("BlinkInterval for Group=" + x + " deleted.");
                clearInterval(BlinkIntervalObj[x]);
            };
        };
    } else {
        if (typeof BlinkIntervalObj[Group] == "object") {
            if (logging) log("BlinkInterval for Group=" + Group + " deleted.");
            clearInterval(BlinkIntervalObj[Group]);
        };
    };

}
/* ------------------------- FUNCTIONS FÜR LUXSENSOR HANDLNG --------------------------------- */

function ChangeLuxSensorTrigger(Group, prop, oldsensor, newsensor) { //Used by controller
    log("Changed LuxSensor detected, from: " + oldsensor + " to: " + newsensor + " deleting old subscription and create new one. ");
    if (oldsensor != "") unsubscribe(oldsensor);
    if (newsensor != "") {
        on({ id: newsensor, change: "ne" }, function (dp) { //Trigger für Luxsensor erstellen
            if (logging) log("Triggered " + LightGroups[Group][prop] + " new value is " + dp.state.val)
            LightGroups[Group].actualLux = dp.state.val;
            Controller(Group, "actualLux", dp.oldState.val, dp.state.val);
        });
    };
}

async function DoAllTheLuxSensorThings(Group, prop) {  //Used by init
    if (logging) log("Reaching DoAllTheLuxSensorThings for Group" + Group + " prop=" + LightGroups[Group][prop])

    if (prop == "luxSensorOid" && LightGroups[Group][prop] != "") {
        if (logging) log("LightGroups[" + Group + "].luxSensorOid=" + LightGroups[Group][prop])
        if (LightGroups[Group][prop] == LuxSensor) { //Wenn StandardLuxsensor für Gruppe verwendet Wert nicht wiederholt lesen sondern Globalen Luxwert verwenden
            LightGroups[Group].actualLux = ActualGenericLux;
            if (logging) log("Group " + Group + " using generic luxsensor, value is: " + LightGroups[Group].actualLux);
        } else {
            LightGroups[Group].actualLux = (await getStateAsync(LightGroups[Group][prop])).val; //Individuellen Gruppen luxwert lesen
            if (logging) log("Group " + Group + " using individual luxsensor " + LightGroups[Group][prop] + ", value is: " + LightGroups[Group].actualLux);
            on({ id: LightGroups[Group][prop], change: "ne" }, function (dp) { //Trigger für individuelle Luxsensoren erstellen
                log("Triggered individual luxsensor " + LightGroups[Group][prop] + " new value is " + dp.state.val)
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
        if ((await getStateAsync(LightGroups[Group].sensors[sensorCount].id)).val == LightGroups[Group].sensors[sensorCount].motionVal) {//Inhalt lesen und neues Property anlegen und füllen
            LightGroups[Group].sensors[sensorCount].isMotion = true;
        } else {
            LightGroups[Group].sensors[sensorCount].isMotion = false;
        };
        //Trigger für Dp Inhalt erzeugen wenn nicht leer
        if (LightGroups[Group].sensors[sensorCount].id != "") {
            on({ id: LightGroups[Group].sensors[sensorCount].id, change: "ne", ack: true }, function (dp) { //Trigger erstellen für eingetragenen Sensor
                if (logging) log("Triggered linked Sensor " + dp.id + " new value is " + dp.state.val);
                if (dp.state.val == LightGroups[Group].sensors[sensorCount].motionVal) {//Inhalt lesen und neues Property anlegen und füllen
                    LightGroups[Group].sensors[sensorCount].isMotion = true;
                } else {
                    LightGroups[Group].sensors[sensorCount].isMotion = false;
                };
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

/* ------------------------- FUNCTIONS FÜR LICHT HANDLNG --------------------------------- */


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
    let TempBri = 0;

    if (LightGroups[Group].adaptiveBri) {
        if (LightGroups[Group].actualLux == 0) {
            TempBri = minBri;
        } else if (LightGroups[Group].actualLux >= 10000) {
            TempBri = 100;
        } else if (LightGroups[Group].actualLux > 0 && LightGroups[Group].actualLux < 10000) {
            TempBri = LightGroups[Group].actualLux / 100;
            if (TempBri < minBri) TempBri = minBri;
        };
        //  await SetBrightness(Group, Math.round(TempBri));
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

async function SetCt(Group, ct = LightGroups[Group].ct) {
    if (logging) log("Reaching SetCt, Group=" + Group + " Ct=" + LightGroups[Group].ct);

    let TempCt = 0;

    if (LightGroups[Group].power) {
        for (let Light in LightGroups[Group].lights) { //Alle Lampen der Gruppe durchgehen
            if (LightGroups[Group].lights[Light].ct.oid != "") { //Prüfen ob Eintrag für Farbtemperatur vorhanden
                if (LightGroups[Group].lights[Light].ct.minVal < 1000) {//Prüfen ob Konvertierung nötig (Es wird davon ausgegangen dass Werte unter 1000 keine Kelvin sind)
                    TempCt = ConvertKelvin(LightGroups[Group].lights[Light].ct.minVal, LightGroups[Group].lights[Light].ct.maxVal, ct);
                } else { //Keine Konvertierung nötig
                    TempCt = ct;
                };
                await setStateAsync(LightGroups[Group].lights[Light].ct.oid, TempCt, false);
            };
        };
    };
    setState(praefix + "." + Group + ".ct", LightGroups[Group].ct, true) //Ack mit true bestätigen nach abarbeitung

    return true;
}

function ConvertKelvin(MinVal, MaxVal, Ct) {
    if (logging) log("Reaching ConvertKelvin");
    let KelvinRange = maxCt - minCt; //Wertebereich Kelvin
    let ValRange = MaxVal - MinVal; //Wertebereich Val

    // log("KelvinRange=" + KelvinRange + " ValRange=" + ValRange + " Ct=" + Ct)
    let KelvinProz = (Ct - minCt) / (KelvinRange / 100) //Prozent des aktuellen Kelvinwertes
    let ValProz = ValRange / 100 //1% des Value Wertebereichs
    let ConvertedCt = Math.round(ValProz * KelvinProz + MinVal)
    //  log("ConvertedCt=" + ConvertedCt + " KelvinProz=" + KelvinProz + " ValProz=" + ValProz)

    return ConvertedCt;
}

function AdaptiveCt() {
    let ActualTime = new Date().getTime();

    let CtRange = maxCt - minCt; //Regelbereich

    let adaptiveCtLinear = 0;
    let adaptiveCtSolar = 0;
    let adaptiveCtSolarInterpolated = 0;
    let adaptiveCtTimed = 0;

    let sunset = getAstroDate("sunset").getTime();  //Sonnenuntergang
    let sunrise = getAstroDate("sunrise").getTime(); //Sonnenaufgang
    let solarNoon = getAstroDate("solarNoon").getTime(); //Höchster Sonnenstand (Mittag)
    let morningTime = 0;
    
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

    if (logging) log("adaptiveCtLinear=" + adaptiveCtLinear + " adaptiveCtSolar=" + adaptiveCtSolar + " adaptiveCtSolarInterpolated=" + adaptiveCtSolarInterpolated + " adaptiveCtTimed=" + adaptiveCtTimed);

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
            case "timed":
                if (LightGroups[Group].adaptiveCt && LightGroups[Group].ct != adaptiveCtTimed) {
                    morningTime = getDateObject(LightGroups[Group].adaptiveCtTime).getTime(); // Aufstehzeit
                    sunMinutesDay = (sunset - morningTime) / 1000 / 60;
                    RangePerMinute = CtRange / sunMinutesDay;

                    if (compareTime(morningTime, sunset, 'between')) {
                        //   log("Absteigend von Morgens bis Abends")        
                        adaptiveCtTimed = Math.round(maxCt - ((ActualTime - morningTime) / 1000 / 60) * RangePerMinute);
                    };

                    setState(praefix + "." + Group + ".ct", adaptiveCtTimed, false) //Ack false um SetCt zu triggern
                };
                break;
        };
    };
}

async function SetWhiteSubstituteColor(Group) {
    if (logging) log("Reaching WhiteSubstituteColor for Group" + Group + " = " + LightGroups[Group].description + " LightGroups[Group].power=" + LightGroups[Group].power + " LightGroups[Group].color =" + LightGroups[Group].color)
    if (LightGroups[Group].power && LightGroups[Group].color.toUpperCase() == "#FFFFFF") { //Nur ausführen bei anschalten und Farbe weiß
        // log("anschalten und Farbe weiß")
        if (LightGroups[Group].ct < ((maxCt - minCt) / 4 + minCt) || LightGroups[Group].ct > ((maxCt - minCt) / 4 * 3 + minCt)) { //Ct Regelbereich vierteln, erstes viertel ist ww, 2tes und drittes wieder kw, das letzte ww
            //  log("Warmweiss - ct=" + LightGroups[Group].ct + " (maxCt - minCt) / 4 + minCt=" + ((maxCt - minCt) / 4 + minCt) + " (maxCt - minCt) / 4 * 3 + minCt=" + ((maxCt - minCt) / 4 * 3 + minCt))
            for (let Light in LightGroups[Group].lights) {
                if (LightGroups[Group].lights[Light].ct.oid == "" && LightGroups[Group].lights[Light].color.oid != "" && LightGroups[Group].lights[Light].color.warmWhiteColor != "" && LightGroups[Group].lights[Light].color.dayLightColor != "") {
                    await setStateAsync(LightGroups[Group].lights[Light].color.oid, LightGroups[Group].lights[Light].color.warmWhiteColor, false);

                };
            };
        } else { //Hier kw
            //  log("Kaltweiss")
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

async function SetColor(Group, Color) {
    log("Reaching SetColor for Group " + Group + " power=" + LightGroups[Group].power + " Color=" + Color);
    let rgbTemp = ConvertHexToRgb(Color);
    if (LightGroups[Group].power) {
        for (let Light in LightGroups[Group].lights) { //Alle Lampen der Gruppe durchgehen
            if (LightGroups[Group].lights[Light].color.oid != "") { //Prüfen ob Datenpunkt für Color vorhanden

              //  log("SetColor: LightGroups[Group].lights[Light].color.type=" + LightGroups[Group].lights[Light].color.type)
                switch (LightGroups[Group].lights[Light].color.type) {
                    case "hex": //Keine Konvertierung nötig
                        await setStateAsync(LightGroups[Group].lights[Light].color.oid, Color, false);
                        break;
                    case "rgb":
                        await setStateAsync(LightGroups[Group].lights[Light].color.oid, rgbTemp, false);
                        break;
                    case "xy":
                        await setStateAsync(LightGroups[Group].lights[Light].color.oid, ConvertRgbToXy(rgbTemp), false);
                        break;
                    default:
                        log("SetColor: Unknown colortype, please specify", "warn");
                };
            };
        };
        setState(praefix + "." + Group + ".color", LightGroups[Group].color, true) //Ack mit true bestätigen nach abarbeitung

        return true;
    } else {
        return false;
    };
}


/* ------------------------- FUNCTIONS FOR Switching On/Off --------------------------------- */
async function SimpleGroupPowerOnOff(Group, OnOff) {

    if (OnOff) { //Anschalten
        log("SimpleGroupPowerOnOff: Normales anschalten ohne Ramping für " + LightGroups[Group].description);
        for (let Light in LightGroups[Group].lights) {
            if ((await getStateAsync(LightGroups[Group].lights[Light].power.oid)).val == LightGroups[Group].lights[Light].power.offVal) { //Prüfen ob Device schon an
                await setStateAsync(LightGroups[Group].lights[Light].power.oid, LightGroups[Group].lights[Light].power.onVal);
                // log("SimpleGroupPowerOnOff: Switching " + Light + " " + LightGroups[Group].lights[Light].power.oid + " to: " + OnOff);
            };
        };
    } else { //Ausschalten
        log("SimpleGroupPowerOnOff: Normales ausschalten ohne Ramping für " + LightGroups[Group].description);
        if (typeof AutoOffTimeoutObject[Group] == "object") clearTimeout(AutoOffTimeoutObject[Group]);

        for (let Light in LightGroups[Group].lights) {
            if ((await getStateAsync(LightGroups[Group].lights[Light].power.oid)).val == LightGroups[Group].lights[Light].power.onVal) {
                await setStateAsync(LightGroups[Group].lights[Light].power.oid, LightGroups[Group].lights[Light].power.offVal);
                //  log("SimpleGroupPowerOnOff: Switching " + Light + " " + LightGroups[Group].lights[Light].power.oid + " to: " + OnOff);
            };
        };
    };
    setState(praefix + "." + Group + ".power", OnOff, true); // Power on mit ack bestätigen, bzw. bei Auto Funktionen nach Ausführung den DP setzen
    LightGroups[Group].power = OnOff;

    return true;
}

async function GroupPowerOnOff(Group, OnOff) {
    log("Reaching GroupPowerOnOff for Group " + Group + " (" + LightGroups[Group].description + "), OnOff=" + OnOff + " rampOn=" + LightGroups[Group].rampOn.enabled + " - " + JSON.stringify(LightGroups[Group].rampOn) + " rampOff=" + LightGroups[Group].rampOff.enabled + " - " + JSON.stringify(LightGroups[Group].rampOff));
    let LoopCount = 0;

    //Normales schalten ohne Ramping
    if (OnOff && !LightGroups[Group].rampOn.enabled) { //Anschalten
        //  log("GroupPowerOnOff: Normales anschalten ohne Ramping für " + LightGroups[Group].description);
        await SimpleGroupPowerOnOff(Group, OnOff);
        if (LightGroups[Group].autoOffTimed.enabled) { //Wenn Zeitabschaltung aktiv und Anschaltung, AutoOff aktivieren
            AutoOffTimed(Group); //
        };

    } else if (!OnOff && !LightGroups[Group].rampOff.enabled) { //Ausschalten
        //  log("GroupPowerOnOff: Normales ausschalten ohne Ramping für " + LightGroups[Group].description);
        if (LightGroups[Group].rampOn.enabled) {//Vor dem ausschalten Helligkeit auf 2 (0+1 wird bei manchchen Devices als aus gewertet) um bei rampon nicht mit voller Pulle zu starten
            await setDeviceBri(Group, 2);
        };

        await SimpleGroupPowerOnOff(Group, OnOff);
    };

    // Anschalten mit ramping
    if (OnOff && LightGroups[Group].rampOn.enabled && LightGroups[Group].rampOn.switchOutletsLast) { //Anschalten mit Ramping und einfache Lampen/Steckdosen zuletzt
        log("Anschalten mit Ramping und einfache Lampen zuletzt für " + LightGroups[Group].description);
        for (let Light in LightGroups[Group].lights) { //Alles anschalten wo
            if (LightGroups[Group].lights[Light].bri.oid != "") { //bri nicht leer
                await setStateAsync(LightGroups[Group].lights[Light].power.oid, LightGroups[Group].lights[Light].power.onVal);
               // log("GroupPowerOnOff: Ca Switching " + Light + " " + LightGroups[Group].lights[Light].power.oid + " to: " + OnOff + " now setting brightness");
            };
        };
        if (typeof RampOnIntervalObject[Group] == "object") clearInterval(RampOnIntervalObject[Group]);
        RampOnIntervalObject[Group] = setInterval(function () { // Interval starten
            LoopCount++;
            //  SetBrightness(Group, Math.round(RampSteps * LoopCount * (LightGroups[Group].bri / 100)));
            setDeviceBri(Group, Math.round(RampSteps * LoopCount * (LightGroups[Group].bri / 100)))

            if (LoopCount >= RampSteps) { //Interval stoppen und einfache Lampen schalten
                for (let Light in LightGroups[Group].lights) { //Alles anschalten wo
                    if (LightGroups[Group].lights[Light].bri.oid == "") { //bri leer
                        setStateAsync(LightGroups[Group].lights[Light].power.oid, LightGroups[Group].lights[Light].power.onVal);
                      //  log("GroupPowerOnOff: Cb Switching " + Light + " " + LightGroups[Group].lights[Light].power.oid + " to: " + OnOff);
                    };
                };
                if (LightGroups[Group].autoOffTimed.enabled) { //Wenn Zeitabschaltung aktiv und Anschaltung, AutoOff aktivieren
                    AutoOffTimed(Group); //
                };
                if (typeof RampOnIntervalObject[Group] == "object") clearInterval(RampOnIntervalObject[Group]);
            };
        }, Math.round(LightGroups[Group].rampOn.time / RampSteps) * 1000); //
    }
    else if (OnOff && LightGroups[Group].rampOn.enabled && !LightGroups[Group].rampOn.switchOutletsLast) { //Anschalten mit Ramping und einfache Lampen zuerst
        log("GroupPowerOnOff: Anschalten mit Ramping und einfache Lampen zuerst für " + LightGroups[Group].description);

        for (let Light in LightGroups[Group].lights) { //Alles anschalten
            await setStateAsync(LightGroups[Group].lights[Light].power.oid, LightGroups[Group].lights[Light].power.onVal);
           // log("GroupPowerOnOff: D Switching " + Light + " " + LightGroups[Group].lights[Light].power.oid + " to: " + OnOff + " now setting brightness");
        };
        if (typeof RampOnIntervalObject[Group] == "object") clearInterval(RampOnIntervalObject[Group]);
        RampOnIntervalObject[Group] = setInterval(function () { // Interval starten
            //SetBrightness(Group, Math.round(RampSteps * LoopCount * (LightGroups[Group].bri / 100)));
            setDeviceBri(Group, Math.round(RampSteps * LoopCount * (LightGroups[Group].bri / 100)))
            LoopCount++;
            //  log("Loopcount=" + LoopCount + " - " + " Rampsteps=" + RampSteps + " RampOnTime= " + LightGroups[Group].rampOn.time)
            if (LoopCount >= RampSteps) {
                if (LightGroups[Group].autoOffTimed.enabled) { //Wenn Zeitabschaltung aktiv und Anschaltung, AutoOff aktivieren
                    AutoOffTimed(Group); //
                };
                if (typeof RampOnIntervalObject[Group] == "object") clearInterval(RampOnIntervalObject[Group]);
            }
        }, Math.round(LightGroups[Group].rampOn.time / RampSteps) * 1000); //
    }

    //Ausschalten mit Ramping
    else if (!OnOff && LightGroups[Group].rampOff.enabled && LightGroups[Group].rampOff.switchOutletsLast) { ////Ausschalten mit Ramping und einfache Lampen zuletzt
        log("GroupPowerOnOff: Ausschalten mit Ramping und einfache Lampen zuletzt für " + LightGroups[Group].description);
        if (typeof RampOffIntervalObject[Group] == "object") clearInterval(RampOffIntervalObject[Group]);
        RampOffIntervalObject[Group] = setInterval(function () { // Interval starten
            // SetBrightness(Group, LightGroups[Group].bri - LightGroups[Group].bri / RampSteps - Math.round(RampSteps * LoopCount * (LightGroups[Group].bri / 100)));
            setDeviceBri(Group, LightGroups[Group].bri - LightGroups[Group].bri / RampSteps - Math.round(RampSteps * LoopCount * (LightGroups[Group].bri / 100)));
            LoopCount++;
            //  log("Loopcount=" + LoopCount + " - " + " Rampsteps=" + RampSteps + " RampOffTime= " + LightGroups[Group].rampOff.time)
            if (LoopCount >= RampSteps) {
                if (typeof RampOffIntervalObject[Group] == "object") clearInterval(RampOffIntervalObject[Group]);
                for (let Light in LightGroups[Group].lights) {
                    if (LightGroups[Group].lights[Light].bri.oid == "") { //prüfen ob Helligkeitsdatenpunkt vorhanden
                        setStateAsync(LightGroups[Group].lights[Light].power.oid, LightGroups[Group].lights[Light].power.offVal); //Einfache Lampen ausschalten, dann
                      //  log("GroupPowerOnOff: F Switching " + Light + " " + LightGroups[Group].lights[Light].power.oid + " to: " + OnOff);
                    };
                };
            };
        }, Math.round(LightGroups[Group].rampOff.time / RampSteps) * 1000); //
    }
    else if (!OnOff && LightGroups[Group].rampOff.enabled && !LightGroups[Group].rampOff.switchOutletsLast) { ////Ausschalten mit Ramping und einfache Lampen zuerst
        log("GroupPowerOnOff: Ausschalten mit Ramping und einfache Lampen zuerst für " + LightGroups[Group].description);
        for (let Light in LightGroups[Group].lights) {
            if (LightGroups[Group].lights[Light].bri.oid == "") { //prüfen ob Helligkeitsdatenpunkt vorhanden, wenn nein
                await setStateAsync(LightGroups[Group].lights[Light].power.oid, LightGroups[Group].lights[Light].power.offVal); //Einfache Lampen ausschalten, dann
               // log("GroupPowerOnOff: F Switching " + Light + " " + LightGroups[Group].lights[Light].power.oid + " to: " + OnOff);
            };
        };
        if (typeof RampOffIntervalObject[Group] == "object") clearInterval(RampOffIntervalObject[Group]);
        RampOffIntervalObject[Group] = setInterval(function () { // Interval starten
            LightGroups[Group].power = true; //Power intern wieder auf true, um Bri auszuführen wo auf power geprüft wird
            setDeviceBri(Group, LightGroups[Group].bri - LightGroups[Group].bri / RampSteps - Math.round(RampSteps * LoopCount * (LightGroups[Group].bri / 100)));
            LoopCount++;
           // log("GroupPowerOnOff: Loopcount=" + LoopCount + " - " + " Rampsteps=" + RampSteps + " RampOffTime= " + LightGroups[Group].rampOff.time);

            if (LoopCount >= RampSteps) {
                LightGroups[Group].power = false;
                DeviceSwitch(Group, OnOff);
                if (typeof RampOffIntervalObject[Group] == "object") clearInterval(RampOffIntervalObject[Group]);
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
            log("DeviceSwitch: Switching " + Light + " " + LightGroups[Group].lights[Light].power.oid + " to: " + OnOff);
        };
    };
}

async function GroupPowerCleaningLightOnOff(Group, OnOff) {
    if (logging) log("Reaching GroupPowerCleaningLightOnOff")
    if (OnOff) { //Anschalten
        for (let Light in LightGroups[Group].lights) {
            await setStateAsync(LightGroups[Group].lights[Light].power.oid, LightGroups[Group].lights[Light].power.onVal);
            log("GroupPowerCleaningLightOnOff: Switching " + Light + " " + LightGroups[Group].lights[Light].power.oid + " to: " + OnOff);
            if (LightGroups[Group].lights[Light].bri.oid != "") { //Prüfen ob Eintrag für Helligkeit vorhanden
                await setStateAsync(LightGroups[Group].lights[Light].bri.oid, LightGroups[Group].lights[Light].bri.maxVal, false); //Auf max. Helligkeit setzen
            };

        };
    } else { //Ausschalten
        for (let Light in LightGroups[Group].lights) {
            await setStateAsync(LightGroups[Group].lights[Light].power.oid, LightGroups[Group].lights[Light].power.offVal);
            log("GroupPowerCleaningLightOnOff: Switching " + Light + " " + LightGroups[Group].lights[Light].power.oid + " to: " + OnOff);
        };
    };
    await setStateAsync(praefix + "." + Group + ".powerCleaningLight", LightGroups[Group].powerCleaningLight, true) //Ack mit true bestätigen nach abarbeitung
    await setStateAsync(praefix + "." + Group + ".power", OnOff, true); //Normale power synchen
    LightGroups[Group].power = OnOff;
}

function Ticker() {
    AdaptiveCt(); //
    TickerIntervalObj = setInterval(function () { // Wenn 
        AdaptiveCt(); //
    }, 60000);
}

async function AutoOnLux(Group) { //Handling für AutoOnLux
    // log("Reaching AutoOnLux for Group: " + Group + " (" + LightGroups[Group].description + ") enabled=" + LightGroups[Group].autoOnLux.enabled + ", actuallux=" + LightGroups[Group].actualLux + ", minLux=" + LightGroups[Group].autoOnLux.minLux + " LightGroups[Group].autoOnLux.dailyLock=" + LightGroups[Group].autoOnLux.dailyLock)

    let tempBri = 0;
    let tempColor = "";

    if (LightGroups[Group].autoOnLux.operator == "<") {
        if (LightGroups[Group].autoOnLux.enabled && !LightGroups[Group].power && !LightGroups[Group].autoOnLux.dailyLock && LightGroups[Group].actualLux <= LightGroups[Group].autoOnLux.minLux) {
            log("AutoOn_Lux() activated group=" + Group + " (" + LightGroups[Group].description + " )");
            if ((LightGroups[Group].autoOnLux.switchOnlyWhenPresence && ActualPresence) || (LightGroups[Group].autoOnLux.switchOnlyWhenNoPresence && !ActualPresence)) {
                await GroupPowerOnOff(Group, true);
                if (LightGroups[Group].autoOnLux.bri != 0) {
                    tempBri = LightGroups[Group].autoOnLux.bri;
                } else {
                    tempBri = LightGroups[Group].bri
                };

                await SetWhiteSubstituteColor(Group);
                if (LightGroups[Group].autoOnLux.color != "") {
                    tempColor = LightGroups[Group].autoOnLux.color;
                } else {
                    tempColor = LightGroups[Group].color;
                };
                PowerOnAftercare(Group, tempBri, LightGroups[Group].ct, tempColor);
            };
            LightGroups[Group].autoOnLux.dailyLock = true;
            await setStateAsync(praefix + "." + Group + ".autoOnLux.dailyLock", true, true);
        } else if (LightGroups[Group].autoOnLux.dailyLock && LightGroups[Group].actualLux > LightGroups[Group].autoOnLux.minLux) {//DailyLock zurücksetzen
            LightGroups[Group].autoOnLux.dailyLockCounter++;
            if (LightGroups[Group].autoOnLux.dailyLockCounter >= 5) { //5 Werte abwarten = Ausreisserschutz wenns am morgen kurz mal dunkler wird
                LightGroups[Group].autoOnLux.dailyLockCounter = 0;
                LightGroups[Group].autoOnLux.dailyLock = false;
                await setStateAsync(praefix + "." + Group + ".autoOnLux.dailyLock", false, true);
                log("AutoOn_Lux() setting DailyLock to " + LightGroups[Group].autoOnLux.dailyLock);
            };
        };
    } else if (LightGroups[Group].autoOnLux.operator == ">") {
        if (LightGroups[Group].autoOnLux.enabled && !LightGroups[Group].power && !LightGroups[Group].autoOnLux.dailyLock && LightGroups[Group].actualLux >= LightGroups[Group].autoOnLux.minLux) {
            log("AutoOn_Lux() activated group=" + Group + " (" + LightGroups[Group].description + " )");
            if ((LightGroups[Group].autoOnLux.switchOnlyWhenPresence && ActualPresence) || (LightGroups[Group].autoOnLux.switchOnlyWhenNoPresence && !ActualPresence)) {
                await GroupPowerOnOff(Group, true);
                if (LightGroups[Group].autoOnLux.bri != 0) {
                    tempBri = LightGroups[Group].autoOnLux.bri;
                } else {
                    tempBri = LightGroups[Group].bri
                };

                await SetWhiteSubstituteColor(Group);
                if (LightGroups[Group].autoOnLux.color != "") {
                    tempColor = LightGroups[Group].autoOnLux.color;
                } else {
                    tempColor = LightGroups[Group].color;
                };
                PowerOnAftercare(Group, tempBri, LightGroups[Group].ct, tempColor);
            };
            LightGroups[Group].autoOnLux.dailyLock = true;
            await setStateAsync(praefix + "." + Group + ".autoOnLux.dailyLock", true, true);

        } else if (LightGroups[Group].autoOnLux.dailyLock && LightGroups[Group].actualLux < LightGroups[Group].autoOnLux.minLux) {//DailyLock zurücksetzen
            LightGroups[Group].autoOnLux.dailyLockCounter++;
            if (LightGroups[Group].autoOnLux.dailyLockCounter >= 5) { //5 Werte abwarten = Ausreisserschutz wenns am morgen kurz mal dunkler wird
                LightGroups[Group].autoOnLux.dailyLockCounter = 0;
                LightGroups[Group].autoOnLux.dailyLock = false;
                await setStateAsync(praefix + "." + Group + ".autoOnLux.dailyLock", false, true);
                log("AutoOn_Lux() setting DailyLock to " + LightGroups[Group].autoOnLux.dailyLock);
            };
        };
    };
}


async function AutoOnMotion(Group) {
    // log("Reaching AutoOnMotion for Group:," + Group + " enabled=" + LightGroups[Group].autoOnMotion.enabled + " ,actuallux=" + LightGroups[Group].actualLux + " ,minLux=" + LightGroups[Group].autoOnMotion.minLux)
    let tempBri = 0;
    let tempColor = "";

    if (LightGroups[Group].autoOnMotion.enabled && LightGroups[Group].actualLux < LightGroups[Group].autoOnMotion.minLux && LightGroups[Group].isMotion) {
        log("Motion for Group " + Group + " (" + LightGroups[Group].description + " )" + " detected, switching on")
        await GroupPowerOnOff(Group, true);

        if (LightGroups[Group].autoOnMotion.bri != 0) {
            tempBri = LightGroups[Group].autoOnMotion.bri;
            // await SetBrightness(Group, LightGroups[Group].autoOnMotion.bri);
        } else {
            tempBri = LightGroups[Group].bri;
        };
        await SetWhiteSubstituteColor(Group);
        if (LightGroups[Group].autoOnMotion.color != "") {
            tempColor = LightGroups[Group].autoOnMotion.color;
        } else {
            tempColor = LightGroups[Group].color;
        };
        PowerOnAftercare(Group, tempBri, LightGroups[Group].ct, tempColor);
    };
}

async function AutoOnPresenceIncrease() {
    if (logging) log("Reaching AutoOnPresenceIncrease");
    let tempBri = 0;
    let tempColor = "";


    for (let Group in LightGroups) {
        if (LightGroups[Group].autoOnPresenceIncrease.enabled && LightGroups[Group].actualLux < LightGroups[Group].autoOnPresenceIncrease.minLux && !LightGroups[Group].power) {
            await GroupPowerOnOff(Group, true);
            if (LightGroups[Group].autoOnPresenceIncrease.bri != 0) {
                tempBri = LightGroups[Group].autoOnPresenceIncrease.bri;
            } else {

            };
            await SetWhiteSubstituteColor(Group);
            if (LightGroups[Group].autoOnPresenceIncrease.color != "") {
                tempColor = LightGroups[Group].autoOnPresenceIncrease.color;
            } else {
                tempColor = LightGroups[Group].color;
            };
            PowerOnAftercare(Group, tempBri, LightGroups[Group].ct, tempColor);
        };
    }
}

async function blink(Group) {
    let loopcount = 0;

    if (!LightGroups[Group].power) { //Wenn Gruppe aus, anschalten und ggfs. Helligkeit und Farbe setzen
        log("an " + loopcount);
        for (let Light in LightGroups[Group].lights) {
            await setStateAsync(LightGroups[Group].lights[Light].power.oid, LightGroups[Group].lights[Light].power.onVal, false);
            log("Blink: Switching " + Light + " " + LightGroups[Group].lights[Light].power.oid + " to: on");
        };
        LightGroups[Group].power = true;
        await setStateAsync(praefix + "." + Group + ".power", true, true);

        if (LightGroups[Group].blink.bri != 0) {
            await SetBrightness(Group, LightGroups[Group].blink.bri);
        };
        await SetWhiteSubstituteColor(Group);
        if (LightGroups[Group].blink.color != "") {
            await SetColor(Group, LightGroups[Group].blink.color);
        };


        loopcount++;
    };

    if (typeof BlinkIntervalObj[Group] == "object") clearInterval(BlinkIntervalObj[Group]);

    BlinkIntervalObj[Group] = setInterval(function () { // Wenn 
        loopcount++;

        if (loopcount <= LightGroups[Group].blink.blinks * 2) {
            if (LightGroups[Group].power) {
                log("aus " + loopcount);
                for (let Light in LightGroups[Group].lights) {
                    setStateAsync(LightGroups[Group].lights[Light].power.oid, LightGroups[Group].lights[Light].power.offVal, false);
                    log("Blink: Switching " + Light + " " + LightGroups[Group].lights[Light].power.oid + " to: off");
                };
                LightGroups[Group].power = false;
                setStateAsync(praefix + "." + Group + ".power", false, true);
            } else {
                log("an " + loopcount);
                for (let Light in LightGroups[Group].lights) {
                    setStateAsync(LightGroups[Group].lights[Light].power.oid, LightGroups[Group].lights[Light].power.onVal, false);
                    log("Blink: Switching " + Light + " " + LightGroups[Group].lights[Light].power.oid + " to: on");
                };
                LightGroups[Group].power = true;
                setStateAsync(praefix + "." + Group + ".power", true, true);
            };
        } else {
            clearInterval(BlinkIntervalObj[Group]);
        };

    }, LightGroups[Group].blink.frequency * 1000);
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
            LightGroups[Group].autoOffLux.dailyLockCounter++;
            if (LightGroups[Group].autoOffLux.dailyLockCounter >= 5) {
                LightGroups[Group].autoOffLux.dailyLock = false;
                await setStateAsync(praefix + "." + Group + ".autoOffLux.dailyLock", false, true);
                LightGroups[Group].autoOffLux.dailyLockCounter = 0;
            };
        };
    } else if (LightGroups[Group].autoOffLux.operator == ">") {
        if (LightGroups[Group].actualLux < LightGroups[Group].autoOffLux.minLux && LightGroups[Group].autoOffLux.dailyLock) {
            LightGroups[Group].autoOffLux.dailyLockCounter++;
            if (LightGroups[Group].autoOffLux.dailyLockCounter >= 5) {
                LightGroups[Group].autoOffLux.dailyLock = false;
                await setStateAsync(praefix + "." + Group + ".autoOffLux.dailyLock", false, true);
                LightGroups[Group].autoOffLux.dailyLockCounter = 0;
            };
        };
    };
}

async function AutoOffTimed(Group) {
    if (logging) log("Reaching AutoOffTimed for Group " + Group + " set time=" + LightGroups[Group].autoOffTimed.autoOffTime + " LightGroups[Group].isMotion=" + LightGroups[Group].isMotion + " LightGroups[Group].autoOffTimed.noAutoOffWhenMotion=" + LightGroups[Group].autoOffTimed.noAutoOffWhenMotion)
    if (LightGroups[Group].autoOffTimed.enabled) {
        AutoOffTimeoutObject[Group] = setTimeout(function () { // Interval starten
            if (LightGroups[Group].autoOffTimed.noAutoOffWhenMotion && LightGroups[Group].isMotion) { //Wenn noAutoOffWhenmotion aktiv und Bewegung erkannt
                log("AutoOffTimed: Motion detected, restarting Timeout for Group " + Group + " set time=" + LightGroups[Group].autoOffTimed.autoOffTime);
                AutoOffTimed(Group);// TimeOut neustarten
            } else {
                log("AutoOffTimed: Group " + Group + " (" + LightGroups[Group].description + " )" + " timed out, switching off. Motion=" + LightGroups[Group].isMotion);
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
    await SetLightStateTrigger();
    Ticker();
}

async function PowerOnAftercare(Group, bri = LightGroups[Group].bri, ct = LightGroups[Group].ct, color = LightGroups[Group].color) {
    log("Reaching powerOnAfterCare for Group " + Group + " bri=" + bri + " ct=" + ct + " color=" + color)
    if (LightGroups[Group].power) { //Nur bei anschalten ausführen
        if (!LightGroups[Group].rampOn.enabled) {//Wenn kein RampOn Helligkeit direkt setzen
            if (LightGroups[Group].adaptiveBri) { //Bei aktiviertem AdaptiveBri
                // await AdaptiveBri(Group);
                await SetBrightness(Group, AdaptiveBri(Group));
            } else {
                log("Now setting bri to " + bri + "% for Group " + LightGroups[Group].description);
                await SetBrightness(Group, bri);
            };
        };
        await SetColor(Group, color);//Nach anschalten Color setzen
        if (color == "#FFFFFF") await SetWhiteSubstituteColor(Group);
        await SetColorMode(Group); //Nach anschalten Colormode setzen
        if (color == "#FFFFFF") await SetCt(Group, ct);//Nach anschalten Ct setzen
    };

}

async function Controller(Group, prop1, OldVal, NewVal) { //Used by all
    if (logging) log("Reaching Controller, Group=" + Group + " Property1=" + prop1 + " NewVal=" + NewVal + " OldVal=" + OldVal);

    switch (prop1) {
        case "luxSensorOid":
            ChangeLuxSensorTrigger(Group, prop1, OldVal, NewVal)
            break;
        case "actualLux":
            if (!LightGroups[Group].powerCleaningLight) { //Autofunktionen nur wenn Putzlicht nicht aktiv
                AutoOnLux(Group);
                AutoOffLux(Group);
                //  AdaptiveBri(Group);
                if (LightGroups[Group].adaptiveBri) await SetBrightness(Group, AdaptiveBri(Group));
                await AutoOnMotion(Group);
            };
            break;
        case "isMotion":
            LightGroups[Group].isMotion = NewVal;

            if (!LightGroups[Group].powerCleaningLight) {
                if (LightGroups[Group].isMotion && LightGroups[Group].power) { //AutoOff Timer wird nach jeder Bewegung neugestartet
                    log("Controller: Motion detected, restarting AutoOff Timer for Group " + Group + " (" + LightGroups[Group].description + " )");
                    AutoOffTimed(Group);
                };
                await AutoOnMotion(Group);
            };
            break;
        case "rampOn.enabled":
        case "rampOn.switchOutletsLast":
        case "rampOn.time":
            break;
        case "rampOff.enabled":
        case "rampOff.switchOutletsLast":
            break;
        case "autoOffTimed.enabled":
        case "autoOffTimed.autoOffTime":
        case "autoOffTimed.noAutoOffWhenMotion":
        case "autoOffTimed.noAutoOffWhenMotionMode":
            break;
        case "autoOnMotion.enabled":
        case "autoOnMotion.minLux":
        case "autoOnMotion.bri":
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
            await AutoOnPresenceIncrease();
            break;
        case "bri":
            await SetBrightness(Group, LightGroups[Group].bri);
            break;
        case "ct":
            await SetCt(Group, LightGroups[Group].ct);
            await SetWhiteSubstituteColor(Group);
            break;
        case "color":
            LightGroups[Group].color = NewVal.toUpperCase();
            await SetColor(Group, LightGroups[Group].color);
            if (LightGroups[Group].color == "#FFFFFF") await SetWhiteSubstituteColor(Group);
            await SetColorMode(Group);

            break;
        case "power":
            if (NewVal != OldVal) {
                await GroupPowerOnOff(Group, NewVal); //Alles schalten
                await PowerOnAftercare(Group);
                if (!NewVal && LightGroups[Group].autoOffTimed.enabled) { //Wenn ausschalten und autoOffTimed ist aktiv, dieses löschen, da sonst erneute ausschaltung nach Ablauf der Zeit. Ist zusätzlich rampon aktiv, führt dieses zu einem einschalten mit sofort folgenden ausschalten
                    if (typeof AutoOffTimeoutObject[Group] == "object") clearTimeout(AutoOffTimeoutObject[Group]);
                };
                if (!NewVal && LightGroups[Group].powerCleaningLight) { //Wenn via Cleaninglight angeschaltet wurde, jetzt aber normal ausgeschaltet, powerCleaningLight synchen um Blockade der Autofunktionen zu vermeiden
                    LightGroups[Group].powerCleaningLight = false;
                    await setStateAsync(praefix + "." + Group + ".powerCleaningLight", false, true);
                };
            } else {
                await clearAutoOffTimeouts(Group);
                await SimpleGroupPowerOnOff(Group, NewVal); //Alles schalten
            };

            break;
        case "powerCleaningLight":
            await GroupPowerCleaningLightOnOff(Group, NewVal);
            break;
        case "adaptiveBri":
            //  AdaptiveBri(Group);
            await SetBrightness(Group, AdaptiveBri(Group));

            break;
        case "adaptiveCt":
            await SetCt(Group, LightGroups[Group].ct);
            break;
        case "adaptiveCtMode":
            break;
        case "adaptiveCtTime":
            break;
        case "dimmUp":
            await setStateAsync(praefix + "." + Group + "." + "bri", (Math.min(Math.max(LightGroups[Group].bri + LightGroups[Group].dimmAmount, 10), 100)), false);
            break;
        case "dimmDown":
            await setStateAsync(praefix + "." + Group + "." + "bri", (Math.min(Math.max(LightGroups[Group].bri - LightGroups[Group].dimmAmount, 2), 100)), false);
            break;
        case "dimmAmount":
            break;
        case "blink.blinks":
        case "blink.frequency":
        case "blink.bri":
        case "blink.color":
            break;
        case "blink.enabled":
            blink(Group);
            break;
        default:
            log("Controller: Error, unknown or missing property: " + prop1, "warn");
    };

}

// Conversion functions, taken from: https://github.com/Qix-/color-convert

function ConvertHsvToRgb(hsv) {
    const h = hsv[0] / 60;
    const s = hsv[1] / 100;
    let v = hsv[2] / 100;
    const hi = Math.floor(h) % 6;

    const f = h - Math.floor(h);
    const p = 255 * v * (1 - s);
    const q = 255 * v * (1 - (s * f));
    const t = 255 * v * (1 - (s * (1 - f)));
    v *= 255;

    switch (hi) {
        case 0:
            return [v, t, p];
        case 1:
            return [q, v, p];
        case 2:
            return [p, v, t];
        case 3:
            return [p, q, v];
        case 4:
            return [t, p, v];
        case 5:
            return [v, p, q];
    }
};

function ConvertRgbToHsl(rgb) {
    const r = rgb[0] / 255;
    const g = rgb[1] / 255;
    const b = rgb[2] / 255;
    const min = Math.min(r, g, b);
    const max = Math.max(r, g, b);
    const delta = max - min;
    let h;
    let s;

    if (max === min) {
        h = 0;
    } else if (r === max) {
        h = (g - b) / delta;
    } else if (g === max) {
        h = 2 + (b - r) / delta;
    } else if (b === max) {
        h = 4 + (r - g) / delta;
    }

    h = Math.min(h * 60, 360);

    if (h < 0) {
        h += 360;
    }

    const l = (min + max) / 2;

    if (max === min) {
        s = 0;
    } else if (l <= 0.5) {
        s = delta / (max + min);
    } else {
        s = delta / (2 - max - min);
    }

    return [h, s * 100, l * 100];
};

function ConvertRgbToHsv(rgb) {
    let rdif;
    let gdif;
    let bdif;
    let h;
    let s;

    const r = rgb[0] / 255;
    const g = rgb[1] / 255;
    const b = rgb[2] / 255;
    const v = Math.max(r, g, b);
    const diff = v - Math.min(r, g, b);
    const diffc = function (c) {
        return (v - c) / 6 / diff + 1 / 2;
    };

    if (diff === 0) {
        h = 0;
        s = 0;
    } else {
        s = diff / v;
        rdif = diffc(r);
        gdif = diffc(g);
        bdif = diffc(b);

        if (r === v) {
            h = bdif - gdif;
        } else if (g === v) {
            h = (1 / 3) + rdif - bdif;
        } else if (b === v) {
            h = (2 / 3) + gdif - rdif;
        }

        if (h < 0) {
            h += 1;
        } else if (h > 1) {
            h -= 1;
        }
    }

    return [
        h * 360,
        s * 100,
        v * 100
    ];
};

function ConvertRgbToCmyk(rgb) {
    const r = rgb[0] / 255;
    const g = rgb[1] / 255;
    const b = rgb[2] / 255;

    const k = Math.min(1 - r, 1 - g, 1 - b);
    const c = (1 - r - k) / (1 - k) || 0;
    const m = (1 - g - k) / (1 - k) || 0;
    const y = (1 - b - k) / (1 - k) || 0;

    return [c * 100, m * 100, y * 100, k * 100];
};

function comparativeDistance(x, y) {
    /*
        See https://en.m.wikipedia.org/wiki/Euclidean_distance#Squared_Euclidean_distance
    */
    return (
        ((x[0] - y[0]) ** 2) +
        ((x[1] - y[1]) ** 2) +
        ((x[2] - y[2]) ** 2)
    );
}

function ConvertRgbToKeyword(rgb) {
    const reversed = reverseKeywords[rgb];
    if (reversed) {
        return reversed;
    }

    let currentClosestDistance = Infinity;
    let currentClosestKeyword;

    for (const keyword of Object.keys(cssKeywords)) {
        const value = cssKeywords[keyword];

        // Compute comparative distance
        const distance = comparativeDistance(rgb, value);

        // Check if its less, if so set as closest
        if (distance < currentClosestDistance) {
            currentClosestDistance = distance;
            currentClosestKeyword = keyword;
        }
    }

    return currentClosestKeyword;
};

function ConvertKeywordToRgb(keyword) {
    return cssKeywords[keyword];
};

function ConvertRgbToXyz(rgb) {
    let r = rgb[0] / 255;
    let g = rgb[1] / 255;
    let b = rgb[2] / 255;

    // Assume sRGB
    r = r > 0.04045 ? (((r + 0.055) / 1.055) ** 2.4) : (r / 12.92);
    g = g > 0.04045 ? (((g + 0.055) / 1.055) ** 2.4) : (g / 12.92);
    b = b > 0.04045 ? (((b + 0.055) / 1.055) ** 2.4) : (b / 12.92);

    const x = (r * 0.4124564) + (g * 0.3575761) + (b * 0.1804375);
    const y = (r * 0.2126729) + (g * 0.7151522) + (b * 0.072175);
    const z = (r * 0.0193339) + (g * 0.119192) + (b * 0.9503041);

    return [x * 100, y * 100, z * 100];
};


function ConvertRgbToXy(rgb) {
    if (logging) log("Reaching ConvertRgbToXy(rgb) rgb=" + rgb)
    let r = rgb[0] / 255;
    let g = rgb[1] / 255;
    let b = rgb[2] / 255;

    // Assume sRGB
    r = r > 0.04045 ? (((r + 0.055) / 1.055) ** 2.4) : (r / 12.92);
    g = g > 0.04045 ? (((g + 0.055) / 1.055) ** 2.4) : (g / 12.92);
    b = b > 0.04045 ? (((b + 0.055) / 1.055) ** 2.4) : (b / 12.92);

    const x = (r * 0.4124564) + (g * 0.3575761) + (b * 0.1804375);
    const y = (r * 0.2126729) + (g * 0.7151522) + (b * 0.072175);
    const z = (r * 0.0193339) + (g * 0.119192) + (b * 0.9503041);

    let X = x / (x + y + z);
    let Y = y / (x + y + z);
    return [X, Y];
    //return X + "," + Y;

}

function ConvertRgbToLab(rgb) {
    const xyz = ConvertRgbToXyz(rgb);
    let x = xyz[0];
    let y = xyz[1];
    let z = xyz[2];

    x /= 95.047;
    y /= 100;
    z /= 108.883;

    x = x > 0.008856 ? (x ** (1 / 3)) : (7.787 * x) + (16 / 116);
    y = y > 0.008856 ? (y ** (1 / 3)) : (7.787 * y) + (16 / 116);
    z = z > 0.008856 ? (z ** (1 / 3)) : (7.787 * z) + (16 / 116);

    const l = (116 * y) - 16;
    const a = 500 * (x - y);
    const b = 200 * (y - z);

    return [l, a, b];
};

function ConvertRgbToHex(args) {
    const integer = ((Math.round(args[0]) & 0xFF) << 16)
        + ((Math.round(args[1]) & 0xFF) << 8)
        + (Math.round(args[2]) & 0xFF);

    const string = integer.toString(16).toUpperCase();
    return '000000'.substring(string.length) + string;
};

function ConvertHexToRgb(args) {
    const match = args.toString(16).match(/[a-f0-9]{6}|[a-f0-9]{3}/i);
    if (!match) {
        return [0, 0, 0];
    }

    let colorString = match[0];

    if (match[0].length === 3) {
        colorString = colorString.split('').map(char => {
            return char + char;
        }).join('');
    }

    const integer = parseInt(colorString, 16);
    const r = (integer >> 16) & 0xFF;
    const g = (integer >> 8) & 0xFF;
    const b = integer & 0xFF;

    return [r, g, b];
};

const cssKeywords = {
    "aliceblue": [240, 248, 255],
    "antiquewhite": [250, 235, 215],
    "aqua": [0, 255, 255],
    "aquamarine": [127, 255, 212],
    "azure": [240, 255, 255],
    "beige": [245, 245, 220],
    "bisque": [255, 228, 196],
    "black": [0, 0, 0],
    "blanchedalmond": [255, 235, 205],
    "blue": [0, 0, 255],
    "blueviolet": [138, 43, 226],
    "brown": [165, 42, 42],
    "burlywood": [222, 184, 135],
    "cadetblue": [95, 158, 160],
    "chartreuse": [127, 255, 0],
    "chocolate": [210, 105, 30],
    "coral": [255, 127, 80],
    "cornflowerblue": [100, 149, 237],
    "cornsilk": [255, 248, 220],
    "crimson": [220, 20, 60],
    "cyan": [0, 255, 255],
    "darkblue": [0, 0, 139],
    "darkcyan": [0, 139, 139],
    "darkgoldenrod": [184, 134, 11],
    "darkgray": [169, 169, 169],
    "darkgreen": [0, 100, 0],
    "darkgrey": [169, 169, 169],
    "darkkhaki": [189, 183, 107],
    "darkmagenta": [139, 0, 139],
    "darkolivegreen": [85, 107, 47],
    "darkorange": [255, 140, 0],
    "darkorchid": [153, 50, 204],
    "darkred": [139, 0, 0],
    "darksalmon": [233, 150, 122],
    "darkseagreen": [143, 188, 143],
    "darkslateblue": [72, 61, 139],
    "darkslategray": [47, 79, 79],
    "darkslategrey": [47, 79, 79],
    "darkturquoise": [0, 206, 209],
    "darkviolet": [148, 0, 211],
    "deeppink": [255, 20, 147],
    "deepskyblue": [0, 191, 255],
    "dimgray": [105, 105, 105],
    "dimgrey": [105, 105, 105],
    "dodgerblue": [30, 144, 255],
    "firebrick": [178, 34, 34],
    "floralwhite": [255, 250, 240],
    "forestgreen": [34, 139, 34],
    "fuchsia": [255, 0, 255],
    "gainsboro": [220, 220, 220],
    "ghostwhite": [248, 248, 255],
    "gold": [255, 215, 0],
    "goldenrod": [218, 165, 32],
    "gray": [128, 128, 128],
    "green": [0, 128, 0],
    "greenyellow": [173, 255, 47],
    "grey": [128, 128, 128],
    "honeydew": [240, 255, 240],
    "hotpink": [255, 105, 180],
    "indianred": [205, 92, 92],
    "indigo": [75, 0, 130],
    "ivory": [255, 255, 240],
    "khaki": [240, 230, 140],
    "lavender": [230, 230, 250],
    "lavenderblush": [255, 240, 245],
    "lawngreen": [124, 252, 0],
    "lemonchiffon": [255, 250, 205],
    "lightblue": [173, 216, 230],
    "lightcoral": [240, 128, 128],
    "lightcyan": [224, 255, 255],
    "lightgoldenrodyellow": [250, 250, 210],
    "lightgray": [211, 211, 211],
    "lightgreen": [144, 238, 144],
    "lightgrey": [211, 211, 211],
    "lightpink": [255, 182, 193],
    "lightsalmon": [255, 160, 122],
    "lightseagreen": [32, 178, 170],
    "lightskyblue": [135, 206, 250],
    "lightslategray": [119, 136, 153],
    "lightslategrey": [119, 136, 153],
    "lightsteelblue": [176, 196, 222],
    "lightyellow": [255, 255, 224],
    "lime": [0, 255, 0],
    "limegreen": [50, 205, 50],
    "linen": [250, 240, 230],
    "magenta": [255, 0, 255],
    "maroon": [128, 0, 0],
    "mediumaquamarine": [102, 205, 170],
    "mediumblue": [0, 0, 205],
    "mediumorchid": [186, 85, 211],
    "mediumpurple": [147, 112, 219],
    "mediumseagreen": [60, 179, 113],
    "mediumslateblue": [123, 104, 238],
    "mediumspringgreen": [0, 250, 154],
    "mediumturquoise": [72, 209, 204],
    "mediumvioletred": [199, 21, 133],
    "midnightblue": [25, 25, 112],
    "mintcream": [245, 255, 250],
    "mistyrose": [255, 228, 225],
    "moccasin": [255, 228, 181],
    "navajowhite": [255, 222, 173],
    "navy": [0, 0, 128],
    "oldlace": [253, 245, 230],
    "olive": [128, 128, 0],
    "olivedrab": [107, 142, 35],
    "orange": [255, 165, 0],
    "orangered": [255, 69, 0],
    "orchid": [218, 112, 214],
    "palegoldenrod": [238, 232, 170],
    "palegreen": [152, 251, 152],
    "paleturquoise": [175, 238, 238],
    "palevioletred": [219, 112, 147],
    "papayawhip": [255, 239, 213],
    "peachpuff": [255, 218, 185],
    "peru": [205, 133, 63],
    "pink": [255, 192, 203],
    "plum": [221, 160, 221],
    "powderblue": [176, 224, 230],
    "purple": [128, 0, 128],
    "rebeccapurple": [102, 51, 153],
    "red": [255, 0, 0],
    "rosybrown": [188, 143, 143],
    "royalblue": [65, 105, 225],
    "saddlebrown": [139, 69, 19],
    "salmon": [250, 128, 114],
    "sandybrown": [244, 164, 96],
    "seagreen": [46, 139, 87],
    "seashell": [255, 245, 238],
    "sienna": [160, 82, 45],
    "silver": [192, 192, 192],
    "skyblue": [135, 206, 235],
    "slateblue": [106, 90, 205],
    "slategray": [112, 128, 144],
    "slategrey": [112, 128, 144],
    "snow": [255, 250, 250],
    "springgreen": [0, 255, 127],
    "steelblue": [70, 130, 180],
    "tan": [210, 180, 140],
    "teal": [0, 128, 128],
    "thistle": [216, 191, 216],
    "tomato": [255, 99, 71],
    "turquoise": [64, 224, 208],
    "violet": [238, 130, 238],
    "wheat": [245, 222, 179],
    "white": [255, 255, 255],
    "whitesmoke": [245, 245, 245],
    "yellow": [255, 255, 0],
    "yellowgreen": [154, 205, 50]
};

// NOTE: conversions should only return primitive values (i.e. arrays, or
//       values that give correct `typeof` results).
//       do not use box values types (i.e. Number(), String(), etc.)

const reverseKeywords = {};
for (const key of Object.keys(cssKeywords)) {
    reverseKeywords[cssKeywords[key]] = key;
}
