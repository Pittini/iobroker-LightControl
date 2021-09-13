const Version = "2.0.6" //vom 20.5.2021 - Skript um Lichter in Helligkeit, Farbe und Farbtemp global zu steuern - Git: https://github.com/Pittini/iobroker-LightControl - Forum: https://forum.iobroker.net/topic/36578/vorlage-lightcontrol
//To do:  Colorflow
log("starting LightControl V." + Version);



const praefix = "javascript.1.LightControl2" // Skriptordner
const LuxSensor = 'linkeddevices.0.Klima.Draussen.brightness'; // Datenpunkt des globalen Luxsensors, wird verwendet wenn in der Gruppe kein gesonderter definiert wird
const IsPresenceDp = ""; // Datenpunkt für Anwesenheit (true/false)
const PresenceCountDp = "radar2.0._nHere"; // Datenpunkt für Anwesenheitszähler
const logging = true; // Logging an/aus
const RampSteps = 10;
let RampIntervalObject

let ActualGenericLux = 0;
let ActualPresence = true;
let ActualPresenceCount = 1;

const GroupTemplate = {
    power: { id: "", common: { read: true, write: true, name: "Power", type: "boolean", role: "switch.power", def: false } },
    bri: { id: "", common: { read: true, write: true, name: "Brightness", type: "number", role: "level.brightness", def: 0, min: 0, max: 100, unit: "%" } },
    ct: { id: "", common: { read: true, write: true, name: "Colortemperature", type: "number", role: "level.color.temperature", def: 0, min: 0, max: 100, unit: "%" } },
    color: { id: "", common: { read: true, write: true, name: "Color", type: "string", role: "level.color.rgb", def: "#FFFFFF" } },
    luxSensorOid: { id: "", common: { read: true, write: true, name: "ObjectId for Luxsensor", type: "string", role: "state", def: LuxSensor } },
    adaptiveBri: { id: "", common: { read: true, write: true, name: "Adaptive Brightness", type: "boolean", role: "switch.enabled", def: false } },
    adaptiveCt: { id: "", common: { read: true, write: true, name: "Adaptive Colortemperature", type: "boolean", role: "switch.enable", def: false } },
    powerCleaningLight: { id: "", common: { read: true, write: true, name: "Power", type: "boolean", role: "switch.power", def: false } },
    isMotion: { id: "", common: { read: true, write: false, name: "Combines the states of all Sensors for this Group", type: "boolean", role: "indicator.motion", def: false } },
    autoOffTimed: {
        enabled: { id: "", common: { read: true, write: true, name: "Timecontrolled auto off enabled?", type: "boolean", role: "switch.enable", def: false } },
        autoOffTime: { id: "", common: { read: true, write: true, name: "Time until auto off", type: "number", role: "level.timer", def: 0, min: 0, unit: "sek" } },
        noAutoOffWheMotion: { id: "", common: { read: true, write: true, name: "No timed auto off if motion detected", type: "boolean", role: "switch", def: true } }
    },
    autoOffLux: {
        enabled: { id: "", common: { read: true, write: true, name: "Brightness controlled auto off enabled?", type: "boolean", role: "switch.enable", def: false } },
        minLux: { id: "", common: { read: true, write: true, name: "Brightness for auto off", type: "number", role: "level.brightness", def: 500, min: 0, unit: "lux" } },
        dailyLock: { id: "", common: { read: true, write: false, name: "Switch lock", type: "boolean", role: "indicator", def: false } },
        operator: { id: "", common: { read: true, write: true, name: "Should auto off happen if brightness more or less minLux", type: "string", role: "state", def: "<" } }
    },
    autoOnMotion: {
        enabled: { id: "", common: { read: true, write: true, name: "Motion controlled auto on enabled?", type: "boolean", role: "switch.enable", def: false } },
        minLux: { id: "", common: { read: true, write: true, name: "Brightness for auto on motion", type: "number", role: "level.brightness", def: 300, min: 0, unit: "lux" } },
        bri: { id: "", common: { read: true, write: true, name: "Brightness of lights when auto on, if empty using groupstandard", type: "number", role: "level.brightness", def: 300, min: 0, unit: "lux" } },
        color: { id: "", common: { read: true, write: true, name: "Color of lights when auto on, if empty using groupstandard", type: "string", role: "level.color.rgb", def: "" } }
    },
    autoOnLux: {
        enabled: { id: "", common: { read: true, write: true, name: "Brightness controlled auto on enabled?", type: "boolean", role: "switch.enable", def: false } },
        minLux: { id: "", common: { read: true, write: true, name: "Brightness for auto on", type: "number", role: "level.brightness", def: 50, min: 0, unit: "lux" } },
        bri: { id: "", common: { read: true, write: true, name: "Brightness of lights when auto on, if empty using groupstandard", type: "number", role: "level.brightness", min: 0, max: 100, unit: "%" } },
        color: { id: "", common: { read: true, write: true, name: "Color of lights when auto on, if empty using groupstandard", type: "string", role: "level.color.rgb", def: "" } },
        switchOnlyWhenPresence: { id: "", common: { read: true, write: true, name: "Switch only if there is somebody at home?", type: "boolean", role: "switch", def: false } },
        switchOnlyWhenNoPresence: { id: "", common: { read: true, write: true, name: "Switch only if there is nobody at home?", type: "boolean", role: "switch", def: false } },
        dailyLock: { id: "", common: { read: true, write: false, name: "Switch lock", type: "boolean", role: "indicator", def: false } },
        operator: { id: "", common: { read: true, write: true, name: "Should auto on happen if brightness more or less minLux", type: "string", role: "state", def: "<" } }
    },
    autoOnPresenceIncrease: {
        enabled: { id: "", common: { read: true, write: true, name: "Presence controlled auto on enabled?", type: "boolean", role: "switch.enable", def: false } },
        minLux: { id: "", common: { read: true, write: true, name: "Necessary brightness for auto on", type: "number", role: "level.brightness", def: 50, min: 0, unit: "lux" } },
        bri: { id: "", common: { read: true, write: true, name: "Brightness of lights when auto on, if empty using groupstandard", type: "number", role: "level.brightness", max: 100, min: 0, unit: "%" } },
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

const LightGroups = {
    Flur_Eg: {
        description: "Flur Eg.",
        lights: {
            0: {
                description: "Strahler1",
                power: { oid: "zigbee.0.ec1bbdfffe32de48.state", onVal: true, offVal: false },
                bri: { oid: "zigbee.0.ec1bbdfffe32de48.brightness", minVal: 0, maxVal: 100, defaultVal: 100 },
                ct: { oid: "zigbee.0.ec1bbdfffe32de48.colortemp", minVal: 250, maxVal: 454 },
                sat: { oid: "", minVal: null, maxVal: null },
                modeswitch: { oid: "", whiteModeVal: false, colorModeVal: true },
                color: { oid: "", type: "", default: "" }
            },
            1: {
                description: "Strahler2",
                power: { oid: "zigbee.0.680ae2fffe0ca671.state", onVal: true, offVal: false },
                bri: { oid: "zigbee.0.680ae2fffe0ca671.brightness", minVal: 0, maxVal: 100, defaultVal: 100 },
                ct: { oid: "zigbee.0.680ae2fffe0ca671.colortemp", minVal: 250, maxVal: 454 },
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
    Wohnzimmer: {
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
                bri: { oid: "wled.0.3c6105cfe11e.bri", minVal: 0, maxVal: 255, defaultVal: 5 },
                ct: { oid: "", minVal: 6500, maxVal: 2700 },
                sat: { oid: "", minVal: 0, maxVal: 100 },
                modeswitch: { oid: "", whiteModeVal: false, colorModeVal: true },
                color: { oid: "wled.0.3c6105cfe11e.seg.0.col.0_HEX", type: "hex", default: "#FF0000", warmWhiteColor: "#FFA500", dayLightColor: "#FFE4B5" }
            }
        },
        sensors: {

        }
    },
    Klo: {
        description: "Klo",

        lights: {
            0: {
                description: "Deckenlampe",
                power: { oid: "zigbee.0.680ae2fffef92c4e.state", onVal: true, offVal: false },
                bri: { oid: "zigbee.0.680ae2fffef92c4e.brightness", minVal: 0, maxVal: 100, defaultVal: 100 },
                ct: { oid: "zigbee.0.680ae2fffef92c4e.colortemp", minVal: 250, maxVal: 454 },
                sat: { oid: "", minVal: null, maxVal: null },
                modeswitch: { oid: "", whiteModeVal: false, colorModeVal: true },
                color: { oid: "", type: "", default: "" }
            }
        },
        sensors: {
            0: { id: 'linkeddevices.0.Bewegungsmelder.Toilette.IsMotion' }
        }
    },
    Flur_Og: {
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
                ct: { oid: "zigbee.0.588e81fffe0ffd7a", minVal: 250, maxVal: 454 },
                sat: { oid: "", minVal: null, maxVal: null },
                modeswitch: { oid: "", whiteModeVal: false, colorModeVal: true },
                color: { oid: "", type: "hex", default: "", warmWhiteColor: "", dayLightColor: "" }
            },
            2: {
                description: "Strahlergruppe Teil3",
                power: { oid: "zigbee.0.ec1bbdfffe6fc795.state", onVal: true, offVal: false },
                bri: { oid: "zigbee.0.ec1bbdfffe6fc795.brightness", minVal: 0, maxVal: 100, defaultVal: 100 },
                ct: { oid: "zigbee.0.ec1bbdfffe6fc795", minVal: 250, maxVal: 454 },
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
    Bad: {
        description: "Bad",
        lights: {
            0: {
                description: "Deckenlampe",
                power: { oid: "zigbee.0.588e81fffeae2ae0.state", onVal: true, offVal: false },
                bri: { oid: "zigbee.0.588e81fffeae2ae0.brightness", minVal: 0, maxVal: 100, defaultVal: 100 },
                ct: { oid: "zigbee.0.588e81fffeae2ae0.colortemp", minVal: 250, maxVal: 454 },
                sat: { oid: "", minVal: null, maxVal: null },
                modeswitch: { oid: "", whiteModeVal: false, colorModeVal: true },
                color: { oid: "", type: "", default: "" }
            }
        },
        sensors: {
            0: { id: 'linkeddevices.0.Bewegungsmelder.Bad.0.IsMotion' }
        }
    },
    Dach: {
        description: "Dach",
        lights: {
            0: {
                description: "Klemmstrahler Dachflur",
                power: { oid: "zigbee.0.680ae2fffeaddb07.state", onVal: true, offVal: false },
                bri: { oid: "zigbee.0.680ae2fffeaddb07.brightness", minVal: 0, maxVal: 100, defaultVal: 100 },
                ct: { oid: "zigbee.0.680ae2fffeaddb07.colortemp", minVal: 250, maxVal: 454 },
                sat: { oid: "", minVal: null, maxVal: null },
                modeswitch: { oid: "", whiteModeVal: false, colorModeVal: true },
                color: { oid: "", type: "", default: "" }
            },
            1: {
                description: "Klemmstrahler Dachtreppe",
                power: { oid: "zigbee.0.588e81fffe409146.state", onVal: true, offVal: false },
                bri: { oid: "zigbee.0.588e81fffe409146.brightness", minVal: 0, maxVal: 100, defaultVal: 100 },
                ct: { oid: "zigbee.0.588e81fffe409146.colortemp", minVal: 250, maxVal: 454 },
                sat: { oid: "", minVal: null, maxVal: null },
                modeswitch: { oid: "", whiteModeVal: false, colorModeVal: true },
                color: { oid: "", type: "", default: "" }
            }
        },
        sensors: {

        }
    },
    Schlafzimmer_C: {
        description: "Schlafzimmer C.",
        lights: {
            0: {
                description: "Nachttischlampe Carlo",
                power: { oid: "zigbee.0.680ae2fffec81608.state", onVal: true, offVal: false },
                bri: { oid: "zigbee.0.680ae2fffec81608.brightness", minVal: 0, maxVal: 100, defaultVal: 100 },
                ct: { oid: "zigbee.0.680ae2fffec81608.colortemp", minVal: 250, maxVal: 454 },
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
    Kueche: {
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
    Vitrine: {
        description: "Vitrine",
        lights: {
            0: {
                description: "Unterbau Leds",
                power: { oid: "zigbee.0.680ae2fffeaded15.state", onVal: true, offVal: false },
                bri: { oid: "zigbee.0.680ae2fffeaded15.brightness", minVal: 0, maxVal: 100, defaultVal: 100 },
                ct: { oid: "zigbee.0.680ae2fffeaded15.colortemp", minVal: 250, maxVal: 454 },
                sat: { oid: "", minVal: null, maxVal: null },
                modeswitch: { oid: "", whiteModeVal: false, colorModeVal: true },
                color: { oid: "", type: "", default: "" }
            }
        },
        sensors: {

        }
    },
    Haustuer: {
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
    Klamotten_C: {
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
        on({ id: PresenceCountDp, change: "ne", ack: true }, function (dp) { //Trigger erstellen, außer Dp ist readonly
            if (logging) log("Triggered PresenceCountDp " + PresenceCountDp + " new value is " + dp.state.val);
            ActualPresenceCount = dp.state.val;

        });
    };

    if (IsPresenceDp != "") {
        ActualPresence = (await getStateAsync(IsPresenceDp)).val;
        on({ id: IsPresenceDp, change: "ne", ack: true }, function (dp) { //Trigger erstellen, außer Dp ist readonly
            if (logging) log("Triggered IsPresenceDp " + IsPresenceDp + " new value is " + dp.state.val);
            ActualPresence = dp.state.val;

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
                for (let z in GroupTemplate[prop1]) {
                    GroupTemplate[prop1][z].id = praefix + "." + Group + "." + prop1 + "." + z;
                    if (!await existsStateAsync(GroupTemplate[prop1][z].id)) {// Prüfen ob state noch nicht vorhanden
                        await createStateAsync(GroupTemplate[prop1][z].id, GroupTemplate[prop1][z].common);//State anlegen
                        log("Created datapoint " + GroupTemplate[prop1][z].id);
                        DpCount++;
                    } else {
                        if (logging) log("Datapoint " + GroupTemplate[prop1][z].id + " still exists, skipping creation and reading data");
                    };

                    LightGroups[Group][prop1] = {}; //2te Ebene im Objekt anlegen
                    LightGroups[Group][prop1][z] = (await getStateAsync(GroupTemplate[prop1][z].id)).val; //Daten in Lightgroups einlesen (auch wenn neu erzeugt), dann


                    if (GroupTemplate[prop1][z].common.write) {
                        on({ id: GroupTemplate[prop1][z].id, change: "any", ack: false }, function (dp) { //Trigger erstellen
                            if (logging) log("Triggered " + GroupTemplate[prop1][z].id + " new value is " + dp.state.val)
                            //   LightGroups[Group][y][z] = dp.state.val;
                            Controller(Group, prop1 + "." + z, dp.oldState.val, dp.state.val);
                        });
                    };
                };

                if (!await existsObjectAsync(praefix + "." + Group + "." + prop1)) { // Channel erstellen wenn noch nicht vorhanden
                    await setObjectAsync(praefix + "." + Group + "." + prop1, { type: 'channel', common: { name: Group }, native: {} });
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
                // log("GroupTemplate[y].id "+GroupTemplate[y].id)
                if (logging) log("Read data from:" + praefix + "." + Group + "." + prop1 + ", value is " + LightGroups[Group][prop1].val);

                //LuxGroupsensor Handling
                if (prop1 == "luxSensorOid") await DoAllTheLuxSensorThings(Group, prop1);


                if (GroupTemplate[prop1].common.write) { //Trigger für alle Template Dps erstellen, außer Dp ist readonly
                    on({ id: GroupTemplate[prop1].id, change: "any", ack: false }, function (dp) {
                        if (logging) log("Triggered " + GroupTemplate[prop1].id + " new value is " + dp.state.val);
                        //  LightGroups[Group][y] = dp.state.val;
                        if (prop1 == "luxSensorOid") ChangeLuxSensorTrigger(Group, prop1, dp.oldState.val, dp.state.val);
                        Controller(Group, prop1, dp.oldState.val, dp.state.val);
                    });
                }
            };
        };

        if (!await existsObjectAsync(praefix + "." + Group)) { //Gruppenchannel anlegen wenn noch nicht vorhanden
            await setObjectAsync(praefix + "." + Group, { type: 'channel', common: { name: LightGroups[Group].description }, native: {} });
            log("Channel " + praefix + "." + Group + " created");
        };
    };
    log("Created " + DpCount + " Datapoints");
}



/* ------------------------- FUNCTIONS FÜR LUXSENSOR HANDLNG --------------------------------- */
function ChangeLuxSensorTrigger(Group, prop, oldsensor, newsensor) { //Used by init
    log("Changed LuxSensor detected, from: " + oldsensor + " to: " + newsensor + " deleting old subscription and create new one");
    if (oldsensor != "") unsubscribe(oldsensor);
    if (newsensor != "") {
        on({ id: newsensor, change: "ne", ack: true }, function (dp) { //Trigger für Luxsensor erstellen
            if (logging) log("Triggered " + LightGroups[Group][prop] + " new value is " + dp.state.val)
            //  LightGroups[Group].actualLux = dp.state.val;
            //   log("LightGroups[" + Group + "].actualLux=" + LightGroups[Group].actualLux);
            Controller(Group, prop, dp.oldState.val, dp.state.val);
        });
    };
}


async function DoAllTheLuxSensorThings(Group, prop) {  //Used by init
    if (prop == "luxSensorOid" && LightGroups[Group][prop] != "") {
        log("LightGroups[" + Group + "].luxSensorOid=" + LightGroups[Group][prop])
        if (LightGroups[Group][prop] == LuxSensor) { //Wenn StandardLuxsensor für Gruppe verwendet Wert nicht wiederholt lesen sondern Globalen Luxwert verwenden
            LightGroups[Group].actualLux = ActualGenericLux;
            log("Group " + Group + " using generic luxsensor, value is: " + LightGroups[Group].actualLux);
        } else {
            LightGroups[Group].actualLux = (await getStateAsync(LightGroups[Group][prop])).val; //Individuellen Gruppen luxwert lesen
            log("Group " + Group + " using individual luxsensor " + LightGroups[Group][prop] + ", value is: " + LightGroups[Group].actualLux);
            on({ id: LightGroups[Group][prop], change: "ne", ack: true }, function (dp) { //Trigger für individuelle Luxsensoren erstellen
                if (logging) log("Triggered " + LightGroups[Group][prop] + " new value is " + dp.state.val)
                //  LightGroups[Group].actualLux = dp.state.val;
                //  log("LightGroups[" + Group + "].actualLux = " + LightGroups[Group].actualLux);
                Controller(Group, "actualLux", dp.oldState.val, dp.state.val);
            });


        };
    } else {
        log("No Luxsensor for " + Group + " defined, skip handling");
    };
}

function RefreshGenericLuxValues() { // Used by Init - refreshing ALL Groups using the generic Luxsensor with new value
    log("Reaching RefreshGenericLuxValues ")
    for (let Group in LightGroups) {
        if (LightGroups[Group].luxSensorOid != "" && LightGroups[Group].luxSensorOid == LuxSensor) {// Prüfen ob generischer Luxsensor vorhanden. 
            // if (logging) log("Triggered Generic LuxSensor " + LightGroups[Group].luxSensorOid + " new value for " + Group + " is " + ActualGenericLux)
            Controller(Group, "actualLux", LightGroups[Group].actualLux, ActualGenericLux);
            // LightGroups[Group].actualLux = ActualGenericLux;
        };
    };
}


/* ------------------------- FUNCTIONS FÜR (MOTION)SENSOR HANDLNG --------------------------------- */


async function DoAllTheSensorThings(Group) {
    log("Reaching DoAllTheSensorThings");

    for (let sensorCount in LightGroups[Group].sensors) {
        LightGroups[Group].sensors[sensorCount].isMotion = (await getStateAsync(LightGroups[Group].sensors[sensorCount].id)).val; //Inhalt lesen und neues Property anlegen und füllen
        //Trigger für Dp Inhalt erzeugen wenn nicht leer
        if (LightGroups[Group].sensors[sensorCount].id != "") {
            on({ id: LightGroups[Group].sensors[sensorCount].id, change: "ne", ack: true }, function (dp) { //Trigger erstellen für eingetragenen Sensor
                log("Triggered linked Sensor " + dp.id + " new value is " + dp.state.val);
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
    log("Reaching SummarizeSensors, Group=" + Group);
    let Motionstate = false;

    for (let sensorCount in LightGroups[Group].sensors) {
        if (LightGroups[Group].sensors[sensorCount].isMotion) {
            log("Gruppe=" + Group + " Sensor " + sensorCount + " with target " + LightGroups[Group].sensors[sensorCount].id + " has value " + LightGroups[Group].sensors[sensorCount].isMotion);

            Motionstate = true;
        };
    };

    log("Summarized IsMotion for Group " + Group + " = " + Motionstate);
    if (LightGroups[Group].isMotion != Motionstate) {
        //  LightGroups[Group].isMotion = Motionstate;
        Controller(Group, "IsMotion", LightGroups[Group].isMotion, Motionstate);
    };
}

/* ------------------------- FUNCTIONS FOR Switching On/Off --------------------------------- */

async function GroupPowerOnOff(Group, OnOff) {
    log("Reaching GroupPowerOnOff, ramping="+LightGroups[Group].rampOn.enabled);
    let LoopCount = 0;
log(GroupTemplate)

    //Normales schalten ohne Ramping
    if (OnOff && !LightGroups[Group].rampOn.enabled) { //Anschalten
        for (let Light in LightGroups[Group].lights) {
            await setStateAsync(LightGroups[Group].lights[Light].power.oid, LightGroups[Group].lights[Light].power.onVal);
            log("A Switching " + Light + " " + LightGroups[Group].lights[Light].power.oid + " to: " + OnOff);
        };
    } else if (!OnOff && !LightGroups[Group].rampOff.enabled) { //Ausschalten
        for (let Light in LightGroups[Group].lights) {
            await setStateAsync(LightGroups[Group].lights[Light].power.oid, LightGroups[Group].lights[Light].power.offVal);
            log("B Switching " + Light + " " + LightGroups[Group].lights[Light].power.oid + " to: " + OnOff);
        };
    };

    // Schalten mit ramping
    if (OnOff && LightGroups[Group].rampOn.enabled && LightGroups[Group].rampOn.switchOutletsLast) { //Anschalten mit Ramping und einfache Lampen zuletzt
        for (let Light in LightGroups[Group].lights) {
            await setStateAsync(LightGroups[Group].lights[Light].power.oid, LightGroups[Group].lights[Light].power.onVal);
            log("C Switching " + Light + " " + LightGroups[Group].lights[Light].power.oid + " to: " + OnOff+" now setting brightness");
        };
    }
    else if (OnOff && LightGroups[Group].rampOn.enabled && !LightGroups[Group].rampOn.switchOutletsLast) { //Anschalten mit Ramping und einfache Lampen zuerst
    log("ppp")
        for (let Light in LightGroups[Group].lights) { //Alles anschalten
            await setStateAsync(LightGroups[Group].lights[Light].power.oid, LightGroups[Group].lights[Light].power.onVal);
            log("D Switching " + Light + " " + LightGroups[Group].lights[Light].power.oid + " to: " + OnOff+" now setting brightness");
        };

        for (let Light in LightGroups[Group].lights) { //Alle Lampen durchgehen und 
            if (LightGroups[Group].lights[Light].bri != "") { //prüfen ob Helligkeitsdatenpunkt vorhanden
                RampIntervalObject[Group] = setInterval(function () { // Interval starten
                    SetBrightness(Group, RampSteps*LoopCount)
                    LoopCount++;
                    if (LoopCount >= RampSteps) { clearInterval(RampIntervalObject[Group]) }
                }, parseInt(LightGroups[Group].rampOn.time / LoopCount) * 1000); //

            }
        }

    }
    else if (!OnOff && LightGroups[Group].rampOff.enabled && LightGroups[Group].rampOn.switchOutletsLast) { ////Ausschalten mit Ramping und einfache Lampen zuletzt
        for (let Light in LightGroups[Group].lights) {
            await setStateAsync(LightGroups[Group].lights[Light].power.oid, LightGroups[Group].lights[Light].power.offVal);
            log("E Switching " + Light + " " + LightGroups[Group].lights[Light].power.oid + " to: " + OnOff);
        };
    }
    else if (!OnOff && LightGroups[Group].rampOff.enabled && !LightGroups[Group].rampOn.switchOutletsLast) { ////Ausschalten mit Ramping und einfache Lampen zuerst
        for (let Light in LightGroups[Group].lights) {
            await setStateAsync(LightGroups[Group].lights[Light].power.oid, LightGroups[Group].lights[Light].power.offVal);
            log("F Switching " + Light + " " + LightGroups[Group].lights[Light].power.oid + " to: " + OnOff);
        };
    };
}

async function GroupPowerCleaningLightOnOff(Group, OnOff) {
    log("Reaching GroupPowerCleaningLightOnOff")
    if (OnOff) {
        for (let Light in LightGroups[Group].lights) {
            await setStateAsync(LightGroups[Group].lights[Light].power.oid, LightGroups[Group].lights[Light].power.onVal);
            log("Switching " + Light + " " + LightGroups[Group].lights[Light].power.oid + " to: " + OnOff);
        };
    } else {
        for (let Light in LightGroups[Group].lights) {
            await setStateAsync(LightGroups[Group].lights[Light].power.oid, LightGroups[Group].lights[Light].power.offVal);
            log("Switching " + Light + " " + LightGroups[Group].lights[Light].power.oid + " to: " + OnOff);
        };
    };
}

function AutoOnLux(Group) {
    //Handling für AutoOnLux
    if ((LightGroups[Group].autoOnLux.switchOnlyWhenPresence && ActualPresence) || (LightGroups[Group].autoOnLux.switchOnlyWhenNoPresence && !ActualPresence)) {
        if (LightGroups[Group].autoOnLux.operator == "<" && LightGroups[Group].autoOnLux.minLux < LightGroups[Group].actualLux && LightGroups[Group].autoOnLux.enabled && !LightGroups[Group].power) {
            GroupPowerOnOff(Group, true);
        } else if (LightGroups[Group].autoOnLux.operator == ">" && LightGroups[Group].autoOnLux.minLux > LightGroups[Group].actualLux && LightGroups[Group].autoOnLux.enabled && !LightGroups[Group].power) {
            GroupPowerOnOff(Group, true);
        };
    };

}

function AutoOnMotion(Group) {
    log("Reaching AutoOnMotion")
    if (LightGroups[Group].autoOnMotion.enabled && LightGroups[Group].autoOnMotion.minLux < ActualGenericLux) {
        GroupPowerOnOff(Group, true);

    };
}

function AutoOnPresenceIncrease(Group) {
    log("Reaching AutoPresenceIncrease")
    if (LightGroups[Group].autoOnPresenceIncrease.enabled && LightGroups[Group].autoOnPresenceIncrease.minLux < ActualGenericLux) {
        GroupPowerOnOff(Group, true);
    };


}


/* ------------------------- FUNCTIONS FOR Switching Off --------------------------------- */

function AutoOffLux(Group) {
    //Handling für AutoOffLux
    if ((LightGroups[Group].autoOffLux.switchOnlyWhenPresence && ActualPresence) || (LightGroups[Group].autoOffLux.switchOnlyWhenNoPresence && !ActualPresence)) {
        if (LightGroups[Group].autoOffLux.operator == "<" && LightGroups[Group].autoOffLux.minLux < LightGroups[Group].actualLux && LightGroups[Group].autoOffLux.enabled && !LightGroups[Group].power) {
            GroupPowerOnOff(Group, false);
        } else if (LightGroups[Group].autoOffLux.operator == ">" && LightGroups[Group].autoOffLux.minLux > LightGroups[Group].actualLux && LightGroups[Group].autoOffLux.enabled && !LightGroups[Group].power) {
            GroupPowerOnOff(Group, false);
        };
    };

}

function AutoOffTimed(Group) {
    log("Reaching AutoOffTimed")
    if (LightGroups[Group].autoOffTimed.enabled) {

    };

}

function RampOnOff(Group, OnOff) {


}

function SetBrightness(Group, Brightness) {
log("Reaching SetBrightness, Group="+Group+" Brightness="+Brightness)
}

async function main() {
    await GlobalPresenceHandling();
    await GlobalLuxHandling();
    init();
}




async function Controller(Group, prop1, OldVal, NewVal) { //Used by all
    log("Reaching Controller, Group=" + Group + " Property1=" + prop1 + " NewVal=" + NewVal + " OldVal=" + OldVal);
    LightGroups[Group][prop1] = NewVal;

    switch (prop1) {
        case "sensors.NewSensor": //Klick auf Button um neuen Eintrag für Sensoren zu erstellen, Wert ist immer true
            log("New Sensordatapoint creation iniitiated");
            createNewSensorEntry(Group);
            break;
        case "actualLux":
            AutoOnLux(Group);
            AutoOffLux(Group);
            break;
        case "IsMotion":
            AutoOnMotion(Group);
            break;
        case "autoOnLux.switchOnlyWhenPresence":
            AutoOnLux(Group);
            break;
        case "autoOnLux.switchOnlyWhenNoPresence":
            AutoOnLux(Group);
            break;

        case "autoOffLux.switchOnlyWhenPresence":
            AutoOffLux(Group);
            break;
        case "autoOffLux.switchOnlyWhenNoPresence":
            AutoOffLux(Group);
            break;


        case "power":
            if (LightGroups[Group].rampOn && NewVal) {

            } else if (LightGroups[Group].rampOff && !NewVal) {

            } else {
            }
                await GroupPowerOnOff(Group, NewVal);

            break;
        case "powerCleaningLight":
            GroupPowerCleaningLightOnOff(Group, NewVal);
            SetBrightness(Group, NewVal);

            break;
        default:
            log("Error, unknown or missing property: " + prop1, "warn");
    };



}


