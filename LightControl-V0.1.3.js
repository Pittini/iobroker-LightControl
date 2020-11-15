const Version = "0.1.3" //vom 5.11.2020 - Skript um Lichter in Helligkeit, Farbe und Farbtemp global zu steuern - Git: https://github.com/Pittini/iobroker-LightControl - Forum: https://forum.iobroker.net/topic/36578/vorlage-lightcontrol
//To do:  Colorflow
log("starting LightControl V." + Version);

const praefix = "javascript.0.LightControl" // Skriptordner
const LuxSensor = "wiffi-wz.0.root.192_168_2_131.w_lux"; // Datenpunkt des globalen Luxsensors, wird verwendet wenn in der Gruppe kein gesonderter definiert wird
const IsPresenceDp = ""; // Datenpunkt für Anwesenheit (true/false)
const PresenceCountDp = "radar2.0._nHere"; // Datenpunkt für Anwesenheitszähler
const logging = true; // Logging an/aus


const Groups = [["Flur Eg"], ["Wohnzimmer"], ["Toilette"], ["Flur Og"], ["Bad"], ["Dach"], ["Schlafzimmer Carlo"], ["Kueche Unterbau"], ["Vitrine"], ["Hauseingang"]]; //Initialisiert das Gruppenarray mit den Gruppennamen. In folge werden hier alle Gruppenstates eingelesen
const LightGroups = []; // Array mit den Daten der Device Datenpunkte

//Jede Lightgroup hat x Devices. Jedes Device hat max. 4 Sätze von Dps für 0=an/aus, 1=Helligkeit, 2=Farbtemperatur, 3=Farbe, 4=Umschaltung color/weiss
//Gruppe - Lampen - Funktion (onoff/ct/bri) -  Eigenschaften (id, min Wert, max. Wert, default Wert bei an)

//  id - min Wert - max. Wert - default Wert bei an - 
LightGroups[0] = [];//Gruppe Flur Eg
LightGroups[0][0] = []; // Strahler1
LightGroups[0][0][0] = ["zigbee.0.ec1bbdfffe32de48.state", true, false]; // Datenpunkt - an Wert - aus Wert
LightGroups[0][0][1] = ["zigbee.0.ec1bbdfffe32de48.brightness", 0, 100, 100]; //  Id für Helligkeit - min. Wert - max. Wert - default Wert
LightGroups[0][0][2] = ["zigbee.0.ec1bbdfffe32de48.colortemp", 250, 454]; //  Id für Farbtemperatur - min. Wert - max. Wert - default Wert

LightGroups[0][1] = [];  // Strahler2
LightGroups[0][1][0] = ["zigbee.0.680ae2fffe0ca671.state", true, false]; // Datenpunkt - an Wert - aus Wert
LightGroups[0][1][1] = ["zigbee.0.680ae2fffe0ca671.brightness", 0, 100, 10]; //  Id für Helligkeit - min. Wert - max. Wert - default Wert
LightGroups[0][1][2] = ["zigbee.0.680ae2fffe0ca671.colortemp", 250, 454]; //  Id für Farbtemperatur - min. Wert - max. Wert - default Wert

LightGroups[0][2] = [];  // Deckenlicht bei Küche/Heizung
LightGroups[0][2][0] = ["yeelight-2.0.color-0x0000000007e3cadb.control.power", true, false]; // Datenpunkt - an Wert - aus Wert
LightGroups[0][2][1] = ["yeelight-2.0.color-0x0000000007e3cadb.control.active_bright", 0, 100, 100]; //  Id für Helligkeit - min. Wert - max. Wert - default Wert
LightGroups[0][2][2] = ["yeelight-2.0.color-0x0000000007e3cadb.control.ct", 6500, 2700]; //  Id für Farbtemperatur - min. Wert - max. Wert - default Wert
LightGroups[0][2][3] = ["yeelight-2.0.color-0x0000000007e3cadb.control.rgb", "hex", "#FFFFFF"];
LightGroups[0][2][4] = ["yeelight-2.0.color-0x0000000007e3cadb.control.color_mode", true, false];
LightGroups[0][2][5] = ["yeelight-2.0.color-0x0000000007e3cadb.control.sat", 0, 100, 100];

LightGroups[0][3] = []; //Strahler Toillettenvorraum
LightGroups[0][3][0] = ["yeelight-2.0.White1.control.power", true, false]; // Datenpunkt - an Wert - aus Wert
LightGroups[0][3][1] = ["yeelight-2.0.White1.control.active_bright", 0, 100, 100]; //  Id für Helligkeit - min. Wert - max. Wert - default Wert
LightGroups[0][3][2] = ["yeelight-2.0.White1.control.ct", 6500, 2700]; //  Id für Farbtemperatur - min. Wert - max. Wert - default Wert


LightGroups[1] = []; //Gruppe Wohnzimmer
LightGroups[1][0] = []; //Lampe PC
LightGroups[1][0][0] = ["sonoff.0.Sonoff18.POWER", true, false]; // Datenpunkt - an Wert - aus Wert

LightGroups[1][1] = []; //Drachenlampe
LightGroups[1][1][0] = ["sonoff.0.Sonoff19.POWER", true, false]; // Datenpunkt - an Wert - aus Wert

LightGroups[1][2] = []; //Stehlampe Couch
LightGroups[1][2][0] = ["sonoff.0.Sonoff20.POWER", true, false]; // Datenpunkt - an Wert - aus Wert

LightGroups[1][3] = []; //Salzlampe
LightGroups[1][3][0] = ["sonoff.0.Sonoff21.POWER", true, false]; // Datenpunkt - an Wert - aus Wert

LightGroups[1][4] = [];  //Led Strip am TV
LightGroups[1][4][0] = ["yeelight-2.0.Strip1.control.power", true, false]; // Datenpunkt - an Wert - aus Wert
LightGroups[1][4][1] = ["yeelight-2.0.Strip1.control.active_bright", 0, 100, 100]; //  Id für Helligkeit - min. Wert - max. Wert - default Wert
LightGroups[1][4][2] = ["yeelight-2.0.Strip1.control.ct", 6500, 2700]; //  Id für Farbtemperatur - min. Wert - max. Wert - default Wert
LightGroups[1][4][3] = ["yeelight-2.0.Strip1.control.rgb", "hex", "FF0000"];
LightGroups[1][4][4] = ["yeelight-2.0.Strip1.control.color_mode", true, false];


LightGroups[1][5] = []; //Kugellampe
LightGroups[1][5][0] = ["zigbee.0.ccccccfffed68f5d.state", true, false]; // Datenpunkt - an Wert - aus Wert
LightGroups[1][5][1] = ["zigbee.0.ccccccfffed68f5d.brightness", 0, 100, 60]; //  Id für Helligkeit - min. Wert - max. Wert - default Wert

LightGroups[1][5][3] = ["zigbee.0.ccccccfffed68f5d.color", "hex", "#FF0000", "#FFA500", "#FFE4B5"]; // Datenpunkt - Farbsystem - Standardfarbe(aktuell rot) - Farbe für warmweiss - Farbe für Tageslichtweiss 

LightGroups[1][6] = []; //Strahler
LightGroups[1][6][0] = ["zigbee.0.680ae2fffeae5254.state", true, false]; // Datenpunkt - an Wert - aus Wert
LightGroups[1][6][1] = ["zigbee.0.680ae2fffeae5254.brightness", 0, 100, 100]; //  Id für Helligkeit - min. Wert - max. Wert - default Wert

LightGroups[1][6][3] = ["zigbee.0.680ae2fffeae5254.color", "hex", "#FF0000", "#FFA500", "#FFE4B5"];  // Datenpunkt - Farbsystem - Standardfarbe(aktuell rot) - Farbe für warmweiss - Farbe für Tageslichtweiss 


LightGroups[2] = []; //Gruppe Klo
LightGroups[2][0] = []; //Deckenlampe
LightGroups[2][0][0] = ["zigbee.0.680ae2fffef92c4e.state", true, false]; // Datenpunkt - an Wert - aus Wert
LightGroups[2][0][1] = ["zigbee.0.680ae2fffef92c4e.brightness", 0, 100, 100]; //  Id für Helligkeit - min. Wert - max. Wert - default Wert
LightGroups[2][0][2] = ["zigbee.0.680ae2fffef92c4e.colortemp", 250, 454]; //  Id für Farbtemperatur - min. Wert - max. Wert - default Wert


LightGroups[3] = [];//Gruppe Flur Og
LightGroups[3][0] = []; //Strahlergruppe Colorteil
LightGroups[3][0][0] = ["zigbee.0.ccccccfffed4ee4c.state", true, false]; // Datenpunkt - an Wert - aus Wert
LightGroups[3][0][1] = ["zigbee.0.ccccccfffed4ee4c.brightness", 0, 100, 100]; // Datenpunkt - min. Wert - max. Wert - Defaultwert
//LightGroups[3][0][2] = ["deconz.0.Lights.ccccccfffed4ee4c.ct", 250, 454]; // Datenpunkt - min. Wert - max. Wert - Defaultwert
LightGroups[3][0][3] = ["zigbee.0.ccccccfffed4ee4c.color", "hex", "#FFA500", "#FFA500", "#FFE4B5"]; // Datenpunkt - Farbsystem - Standardfarbe(aktuell Warmweiss) - Farbe für warmweiss - Farbe für Tageslichtweiss 

LightGroups[3][1] = []; //Strahlergruppe Teil1
LightGroups[3][1][0] = ["zigbee.0.588e81fffe0ffd7a.state", true, false]; // Datenpunkt - an Wert - aus Wert
LightGroups[3][1][1] = ["zigbee.0.588e81fffe0ffd7a.brightness", 0, 100, 100]; //  Id für Helligkeit - min. Wert - max. Wert - default Wert
LightGroups[3][1][2] = ["zigbee.0.588e81fffe0ffd7a.colortemp", 250, 454]; //  Id für Farbtemperatur - min. Wert - max. Wert - default Wert

LightGroups[3][2] = []; //Strahlergruppe Teil3
LightGroups[3][2][0] = ["zigbee.0.ec1bbdfffe6fc795.state", true, false]; // Datenpunkt - an Wert - aus Wert
LightGroups[3][2][1] = ["zigbee.0.ec1bbdfffe6fc795.brightness", 0, 100, 100]; //  Id für Helligkeit - min. Wert - max. Wert - default Wert
LightGroups[3][2][2] = ["zigbee.0.ec1bbdfffe6fc795.colortemp", 250, 454]; //  Id für Farbtemperatur - min. Wert - max. Wert - default Wert

LightGroups[4] = [];//Gruppe Bad
LightGroups[4][0] = []; //Deckenleuchte
LightGroups[4][0][0] = ["zigbee.0.588e81fffeae2ae0.state", true, false]; // Datenpunkt - an Wert - aus Wert
LightGroups[4][0][1] = ["zigbee.0.588e81fffeae2ae0.brightness", 0, 100, 100]; //  Id für Helligkeit - min. Wert - max. Wert - default Wert
LightGroups[4][0][2] = ["zigbee.0.588e81fffeae2ae0.colortemp", 250, 454]; //  Id für Farbtemperatur - min. Wert - max. Wert - default Wert

LightGroups[5] = [];//Gruppe Dach
LightGroups[5][0] = []; //Klemmstrahler Dachflur
LightGroups[5][0][0] = ["zigbee.0.680ae2fffeaddb07.state", true, false]; // Datenpunkt - an Wert - aus Wert
LightGroups[5][0][1] = ["zigbee.0.680ae2fffeaddb07.brightness", 0, 100, 100]; //  Id für Helligkeit - min. Wert - max. Wert - default Wert
LightGroups[5][0][2] = ["zigbee.0.680ae2fffeaddb07.colortemp", 250, 454]; //  Id für Farbtemperatur - min. Wert - max. Wert - default Wert

LightGroups[5][1] = []; //Klemmstrahler Dachtreppe
LightGroups[5][1][0] = ["zigbee.0.588e81fffe409146.state", true, false]; // Datenpunkt - an Wert - aus Wert
LightGroups[5][1][1] = ["zigbee.0.588e81fffe409146.brightness", 0, 100, 100]; //  Id für Helligkeit - min. Wert - max. Wert - default Wert
LightGroups[5][1][2] = ["zigbee.0.588e81fffe409146.colortemp", 250, 454]; //  Id für Farbtemperatur - min. Wert - max. Wert - default Wert

LightGroups[6] = [];//Gruppe Schlafzimmer Carlo
LightGroups[6][0] = []; //Nachttischlampe Carlo
LightGroups[6][0][0] = ["zigbee.0.680ae2fffec81608.state", true, false]; // Datenpunkt - an Wert - aus Wert
LightGroups[6][0][1] = ["zigbee.0.680ae2fffec81608.brightness", 0, 100, 80]; //  Id für Helligkeit - min. Wert - max. Wert - default Wert
LightGroups[6][0][2] = ["zigbee.0.680ae2fffec81608.colortemp", 250, 454]; //  Id für Farbtemperatur - min. Wert - max. Wert - default Wert

LightGroups[6][1] = []; //Nachtischlampe 2 (gold)
LightGroups[6][1][0] = ["zigbee.0.ccccccfffea91336.state", true, false]; // Datenpunkt - an Wert - aus Wert
LightGroups[6][1][1] = ["zigbee.0.ccccccfffea91336.brightness", 0, 100, 100]; //  Id für Helligkeit - min. Wert - max. Wert - default Wert

LightGroups[7] = [];//Gruppe Küche
LightGroups[7][0] = []; //Unterbau Leds
LightGroups[7][0][0] = ["zigbee.0.d0cf5efffebe553c.state", true, false]; // Datenpunkt - an Wert - aus Wert
LightGroups[7][0][1] = ["zigbee.0.d0cf5efffebe553c.brightness", 0, 100, 100]; //  Id für Helligkeit - min. Wert - max. Wert - default Wert

LightGroups[8] = [];//Gruppe Vitrine
LightGroups[8][0] = [];  // Deckenlicht bei Küche/Heizung
LightGroups[8][0][0] = ["zigbee.0.680ae2fffeaded15.state", true, false]; // Datenpunkt - an Wert - aus Wert
LightGroups[8][0][1] = ["zigbee.0.680ae2fffeaded15.brightness", 0, 100, 100]; //  Id für Helligkeit - min. Wert - max. Wert - default Wert
LightGroups[8][0][2] = ["zigbee.0.680ae2fffeaded15.colortemp", 250, 454]; //  Id für Farbtemperatur - min. Wert - max. Wert - default Wert

LightGroups[9] = [];//Gruppe Hauseingangsbeleuchtung
LightGroups[9][0] = []; //Lampe Haustür
LightGroups[9][0][0] = ["yeelight-2.0.White2.control.power", true, false]; // Datenpunkt - an Wert - aus Wert
LightGroups[9][0][1] = ["yeelight-2.0.White2.control.active_bright", 0, 100, 100]; //  Id für Helligkeit - min. Wert - max. Wert - default Wert
LightGroups[9][0][2] = ["yeelight-2.0.White2.control.ct", 6500, 2700]; //  Id für Farbtemperatur - min. Wert - max. Wert - default Wert

//Ab hier nix mehr ändern
let DpCount = 0; //Zähler
let Counter = 0; //Zähler
const States = []; //Array mit anzulegenden Dps
let IsLuxEvening = false;
let IsTimeSlotActive = false; //Timeslot für Lux Autoauslösung
let ActualLux = getState(LuxSensor).val; //Aktueller Luxwert
let PresenceCount = 0;
let PresenceCountIncrease = false;
const OldPowerState = []; //Speichert bei autom, Aktionen den alten Power Zustand um diesen wiederherstellen zu können
const RampInterval = [];
const BlinkInterval = [];
const AutoOffTimeOutObject = [];

let CheckCount = 0;
let Dps = [".Power", ".Bri", ".Ct", ".Color", ".AutoOff_Timed.AutoOffTime", ".AutoOff_Timed.Enabled", ".AutoOff_Timed.NoAutoOffWhenMotion", ".MotionSensors.Sensor0", ".AutoOn_Motion.Enabled", ".AutoOn_Motion.MinLux", ".LuxDp", ".AdaptiveBri", ".AdaptiveCt", ".RampOn.Enabled", ".RampOff.Enabled", ".RampOn.Time", ".RampOff.Time", ".Blink.BlinkEnabled", ".Blink.BlinkNow", ".OnOverride", ".RampOff.SwitchOutletsLast", ".AutoOn_Motion.AutoOnBri", ".AutoOn_Motion.AutoOnColor", ".IsMotion", ".AutoOn_Lux.Enabled", ".AutoOn_Lux.MinLux", ".AutoOn_Lux.OnlyIfPresence", ".AutoOn_PresenceIncrease.Enabled", ".AutoOn_Lux.OnlyIfNoPresence", ".AutoOn_PresenceIncrease.MinLux", ".AutoOn_Lux.DailyLock", ".RampOn.SwitchOutletsLast", ".AutoOn_Lux.AutoOnBri", ".AutoOn_Lux.AutoOnColor", ".AutoOn_PresenceIncrease.AutoOnBri", ".AutoOn_PresenceIncrease.AutoOnColor", ".AutoOff_Lux.Enabled", ".AutoOff_Lux.MinLux", ".AutoOff_Lux.DailyLock", ".AutoOff_Lux.Operator", ".AutoOn_Lux.Operator"]

// 0=".Power", 1=".Bri",2= ".Ct",3= ".Color", 4=".AutoOff_Timed.AutoOffTime", 5=".AutoOff_Timed.Enabled", 6=".AutoOff_Timed.NoAutoOffWhenMotion", 7=".MotionDpArray", 8=".AutoOn_Motion.Enabled", 9=".AutoOn_Motion.MinLux", 10=".LuxDp", 11=".AdaptiveBri", 12=".AdaptiveCt",
// 13=".RampOn.Enabled", 14=".RampOff.Enabled", 15=".RampOn.Time", 16=".RampOff.Time", 17=".BlinkEnabled", 18=".Blink", 19=".OnOverride", 20= ".RampOff.SwitchOutletsLast", 21=".AutoOnBri", 22=".AutoOnColor", 
// 23=".IsMotion", 24= ".AutoOn_Lux.Enabled", 25= ".AutoOn_Lux.MinLux", 26=".AutoOn_Lux.OnlyIfPresence", 27=".AutoOn_PresenceIncrease.Enabled", 28=".AutoOn_Lux.OnlyIfNoPresence",29=".AutoOn_PresenceIncrease.MinLux"
// 30=".AutoOn_Lux.DailyLock", 31= ".RampOn.SwitchOutletsLast", 32=".AutoOn_Lux.AutoOnBri", 33=".AutoOn_Lux.AutoOnColor", 34=".AutoOn_PresenceIncrease.AutoOnBri", 35=".AutoOn_PresenceIncrease.AutoOnColor",
// 36=".AutoOff_Lux.Enabled", 37=".AutoOff_Lux.MinLux", 38=".AutoOff_Lux.DailyLock", 39=".AutoOff_Lux.Operator", 40=".AutoOn_Lux.Operator"
// ab 50 interne Werte - 50=Gruppenname,

for (let x = 0; x < Groups.length; x++) {
    //Datenpunkte global
    States[DpCount] = { id: praefix + "." + x + ".Power", initial: false, forceCreation: false, common: { read: true, write: true, name: Groups[x] + " - " + "Gruppe aktiv?", type: "boolean", def: false } };
    DpCount++;
    States[DpCount] = { id: praefix + "." + x + ".Bri", initial: 100, forceCreation: false, common: { read: true, write: true, name: Groups[x] + " - " + "Helligkeit", type: "number", unit: "%", def: 100 } };
    DpCount++;
    States[DpCount] = { id: praefix + "." + x + ".Ct", initial: 100, forceCreation: false, common: { read: true, write: true, name: Groups[x] + " - " + "Farbtemperatur", type: "number", unit: "%", def: 100 } };
    DpCount++;
    States[DpCount] = { id: praefix + "." + x + ".Color", initial: "#FFFFFF", forceCreation: false, common: { read: true, write: true, name: Groups[x] + " - " + "Farbe", type: "string", def: "#FFFFFF" } };
    DpCount++;
    States[DpCount] = { id: praefix + "." + x + ".AutoOff_Timed.AutoOffTime", initial: 120, forceCreation: false, common: { read: true, write: true, name: Groups[x] + " - " + "Zeit nach der die Gruppe abgeschaltet wird", type: "number", unit: "s", def: 120 } };
    DpCount++;
    States[DpCount] = { id: praefix + "." + x + ".AutoOff_Timed.Enabled", initial: false, forceCreation: false, common: { read: true, write: true, name: Groups[x] + " - " + "Gruppe automatisch abschalten?", type: "boolean", def: false } };
    DpCount++;
    States[DpCount] = { id: praefix + "." + x + ".AutoOff_Timed.NoAutoOffWhenMotion", initial: true, forceCreation: false, common: { read: true, write: true, name: Groups[x] + " - " + "Kein AutoOff bei erkannter Bewegung?", type: "boolean", def: true } };
    DpCount++;
    States[DpCount] = { id: praefix + "." + x + ".MotionSensors.Sensor0", initial: "", forceCreation: false, common: { read: true, write: true, name: Groups[x] + " - " + "Datenpunkt des 1. Bewegungsmelders?", type: "string", def: "" } };
    DpCount++;
    States[DpCount] = { id: praefix + "." + x + ".AutoOn_Motion.Enabled", initial: false, forceCreation: false, common: { read: true, write: true, name: Groups[x] + " - " + "Gruppe bei Bewegung automatisch anschalten?", type: "boolean", def: false } };
    DpCount++;
    States[DpCount] = { id: praefix + "." + x + ".AutoOn_Motion.MinLux", initial: 100, forceCreation: false, common: { read: true, write: true, name: Groups[x] + " - " + "Mindesthelligkeit für AutoOn?", type: "number", unit: "Lux", def: 100 } };
    DpCount++;
    States[DpCount] = { id: praefix + "." + x + ".LuxDp", initial: "", forceCreation: false, common: { read: true, write: true, name: Groups[x] + " - " + "Datenpunkt des Helligkeitssensors?", type: "string", def: "" } };
    DpCount++;
    States[DpCount] = { id: praefix + "." + x + ".AdaptiveBri", initial: false, forceCreation: false, common: { read: true, write: true, name: Groups[x] + " - " + "Helligkeit mit Aussenhelligkeit steuern?", type: "boolean", def: false } };
    DpCount++;
    States[DpCount] = { id: praefix + "." + x + ".AdaptiveCt", initial: false, forceCreation: false, common: { read: true, write: true, name: Groups[x] + " - " + "Farbtemperatur durch Tageszeit steuern?", type: "boolean", def: false } };
    DpCount++;
    States[DpCount] = { id: praefix + "." + x + ".RampOn.Enabled", initial: false, forceCreation: false, common: { read: true, write: true, name: Groups[x] + " - " + "Bei Anschalten Helligkeit langsam hochfahren?", type: "boolean", def: false } };
    DpCount++;
    States[DpCount] = { id: praefix + "." + x + ".RampOff.Enabled", initial: false, forceCreation: false, common: { read: true, write: true, name: Groups[x] + " - " + "Bei Ausschalten Helligkeit langsam runterfahren?", type: "boolean", def: false } };
    DpCount++;
    States[DpCount] = { id: praefix + "." + x + ".RampOn.Time", initial: 10, forceCreation: false, common: { read: true, write: true, name: Groups[x] + " - " + "Zeit für RampOn?", type: "number", unit: "s", def: 10 } };
    DpCount++;
    States[DpCount] = { id: praefix + "." + x + ".RampOff.Time", initial: 10, forceCreation: false, common: { read: true, write: true, name: Groups[x] + " - " + "Zeit für RampOff?", type: "number", unit: "s", def: 10 } };
    DpCount++;
    States[DpCount] = { id: praefix + "." + x + ".Blink.BlinkEnabled", initial: true, forceCreation: false, common: { read: true, write: true, name: Groups[x] + " - " + "Aktiviert Blinkfunktion", type: "boolean", def: true } };
    DpCount++;
    States[DpCount] = { id: praefix + "." + x + ".Blink.BlinkNow", initial: false, forceCreation: false, common: { read: true, write: true, name: Groups[x] + " - " + "Löst kurzes blinken aus", type: "boolean", def: false } };
    DpCount++;
    States[DpCount] = { id: praefix + "." + x + ".OnOverride", initial: false, forceCreation: false, common: { read: true, write: true, name: Groups[x] + " - " + "Putzlicht - Anschalten mit 100%, weiß, keinerlei Effekte", type: "boolean", def: false } };
    DpCount++;
    States[DpCount] = { id: praefix + "." + x + ".RampOff.SwitchOutletsLast", initial: false, forceCreation: false, common: { read: true, write: true, name: Groups[x] + " - " + "Sollen Devices am Rampenende geschaltet werden?", type: "boolean", def: false } };
    DpCount++;
    States[DpCount] = { id: praefix + "." + x + ".AutoOn_Motion.AutoOnBri", initial: 0, forceCreation: false, common: { read: true, write: true, name: Groups[x] + " - " + "Helligkeit bei AutoOn", type: "number", unit: "%", def: 0 } };
    DpCount++;
    States[DpCount] = { id: praefix + "." + x + ".AutoOn_Motion.AutoOnColor", initial: "", forceCreation: false, common: { read: true, write: true, name: Groups[x] + " - " + "Farbe bei AutoOn?", type: "string", def: "" } };
    DpCount++;
    States[DpCount] = { id: praefix + "." + x + ".IsMotion", initial: false, forceCreation: false, common: { read: true, write: true, name: Groups[x] + " - " + "Summenstatus aller Bewegungsmelder", type: "boolean", def: false } };
    DpCount++;
    States[DpCount] = { id: praefix + "." + x + ".AutoOn_Lux.Enabled", initial: false, forceCreation: false, common: { read: true, write: true, name: Groups[x] + " - " + "Gruppe bei Dämmerung automatisch anschalten?", type: "boolean", def: false } };
    DpCount++;
    States[DpCount] = { id: praefix + "." + x + ".AutoOn_Lux.MinLux", initial: 100, forceCreation: false, common: { read: true, write: true, name: Groups[x] + " - " + "Mindesthelligkeit für AutoOn_Lux?", type: "number", unit: "Lux", def: 100 } };
    DpCount++;
    States[DpCount] = { id: praefix + "." + x + ".AutoOn_Lux.OnlyIfPresence", initial: false, forceCreation: false, common: { read: true, write: true, name: Groups[x] + " - " + "Nur ausführen wenn jemand anwesend ist?", type: "boolean", def: false } };
    DpCount++;
    States[DpCount] = { id: praefix + "." + x + ".AutoOn_PresenceIncrease.Enabled", initial: false, forceCreation: false, common: { read: true, write: true, name: Groups[x] + " - " + "Ausführen wenn jemand kommt", type: "boolean", def: false } };
    DpCount++;
    States[DpCount] = { id: praefix + "." + x + ".AutoOn_Lux.OnlyIfNoPresence", initial: false, forceCreation: false, common: { read: true, write: true, name: Groups[x] + " - " + "Nur ausführen wenn niemand anwesend ist?", type: "boolean", def: false } };
    DpCount++;
    States[DpCount] = { id: praefix + "." + x + ".AutoOn_PresenceIncrease.MinLux", initial: 60, forceCreation: false, common: { read: true, write: true, name: Groups[x] + " - " + "Mindesthelligkeit für AutoOn_PresenceIncrease", type: "number", unit: "Lux", def: 60 } };
    DpCount++;
    States[DpCount] = { id: praefix + "." + x + ".AutoOn_Lux.DailyLock", initial: false, forceCreation: false, common: { read: true, write: true, name: "Ist false wenn Schaltung noch aussteht", type: "boolean", def: false } };
    DpCount++;
    States[DpCount] = { id: praefix + "." + x + ".RampOn.SwitchOutletsLast", initial: true, forceCreation: false, common: { read: true, write: true, name: Groups[x] + " - " + "Sollen Devices am Rampenende geschaltet werden?", type: "boolean", def: true } };
    DpCount++;
    States[DpCount] = { id: praefix + "." + x + ".AutoOn_Lux.AutoOnBri", initial: 0, forceCreation: false, common: { read: true, write: true, name: Groups[x] + " - " + "Helligkeit bei AutoOn?", type: "number", unit: "%", def: 0 } };
    DpCount++;
    States[DpCount] = { id: praefix + "." + x + ".AutoOn_Lux.AutoOnColor", initial: "", forceCreation: false, common: { read: true, write: true, name: Groups[x] + " - " + "Farbe bei AutoOn?", type: "string", def: "" } };
    DpCount++;
    States[DpCount] = { id: praefix + "." + x + ".AutoOn_PresenceIncrease.AutoOnBri", initial: 0, forceCreation: false, common: { read: true, write: true, name: Groups[x] + " - " + "Helligkeit bei AutoOn", type: "number", unit: "%", def: 0 } };
    DpCount++;
    States[DpCount] = { id: praefix + "." + x + ".AutoOn_PresenceIncrease.AutoOnColor", initial: "", forceCreation: false, common: { read: true, write: true, name: Groups[x] + " - " + "Farbe bei AutoOn?", type: "string", def: "" } };
    DpCount++;
    States[DpCount] = { id: praefix + "." + x + ".AutoOff_Lux.Enabled", initial: false, forceCreation: false, common: { read: true, write: true, name: Groups[x] + " - " + "Gruppe automatisch abschalten?", type: "boolean", def: false } };
    DpCount++;
    States[DpCount] = { id: praefix + "." + x + ".AutoOff_Lux.MinLux", initial: 100, forceCreation: false, common: { read: true, write: true, name: Groups[x] + " - " + "Mindesthelligkeit für abschalten der Gruppe", type: "number", def: 0 } };
    DpCount++;
    States[DpCount] = { id: praefix + "." + x + ".AutoOff_Lux.DailyLock", initial: false, forceCreation: false, common: { read: true, write: true, name: "Ist false wenn Schaltung noch aussteht", type: "boolean", def: false } };
    DpCount++;
    States[DpCount] = { id: praefix + "." + x + ".AutoOff_Lux.Operator", initial: ">", forceCreation: false, common: { read: true, write: true, name: Groups[x] + " - " + "Auf Über- oder Unterschreitung der Helligkeit prüfen?", type: "string", def: ">" } };
    DpCount++;
    States[DpCount] = { id: praefix + "." + x + ".AutoOn_Lux.Operator", initial: "<", forceCreation: false, common: { read: true, write: true, name: Groups[x] + " - " + "Auf Über- oder Unterschreitung der Helligkeit prüfen?", type: "string", def: "<" } };
    DpCount++;

};
States[DpCount] = { id: praefix + "." + "all" + ".Power", initial: false, forceCreation: false, common: { read: true, write: true, name: "Gruppe aktiv", type: "boolean", def: false } };
DpCount++;
States[DpCount] = { id: praefix + "." + "all" + ".Bri", initial: 50, forceCreation: false, common: { read: true, write: true, name: "Helligkeit", type: "number", unit: "%", def: 50 } };
DpCount++;
States[DpCount] = { id: praefix + "." + "all" + ".Ct", initial: 100, forceCreation: false, common: { read: true, write: true, name: "Farbtemperatur", type: "number", unit: "%", def: 100 } };
DpCount++;
States[DpCount] = { id: praefix + "." + "all" + ".AutoOffTime", initial: 0, forceCreation: false, common: { read: true, write: true, name: "Zeit nach der die Gruppe abgeschaltet wird", type: "number", unit: "s", def: 0 } };
DpCount++;
States[DpCount] = { id: praefix + "." + "all" + ".AutoOff", initial: false, forceCreation: false, common: { read: true, write: true, name: "Gruppe automatisch abschalten?", type: "boolean", def: false } };
DpCount++;
States[DpCount] = { id: praefix + "." + "all" + ".NoAutoOffWhenMotion", initial: false, forceCreation: false, common: { read: true, write: true, name: "Kein AutoOff bei erkannter Bewegung?", type: "boolean", def: false } };
DpCount++;
States[DpCount] = { id: praefix + "." + "all" + ".MotionDp", initial: "", forceCreation: false, common: { read: true, write: true, name: "Datenpunkt des Bewegungsmelders?", type: "string", def: "" } };

//Alle States anlegen, Main aufrufen wenn fertig
let numStates = States.length;
States.forEach(function (state) {
    createState(state.id, state.initial, state.forceCreation, state.common, function () {
        numStates--;
        if (numStates === 0) {
            if (logging) log("CreateStates fertig!");
            for (let x = 0; x < Groups.length; x++) { //Channels erstellen
                setObject(praefix + "." + x, { type: 'channel', common: { name: Groups[x][0] }, native: {} });
                setObject(praefix + "." + x + ".AutoOff_Timed", { type: 'channel', common: { name: Groups[x] + " - " + "Zeitgesteuertes ausschalten" }, native: {} });
                setObject(praefix + "." + x + ".AutoOff_Lux", { type: 'channel', common: { name: Groups[x] + " - " + "Helligkeitsgesteuertes ausschalten" }, native: {} });
                setObject(praefix + "." + x + ".AutoOn_Motion", { type: 'channel', common: { name: Groups[x] + " - " + "Bewegungsgesteuertes anschalten" }, native: {} });
                setObject(praefix + "." + x + ".MotionSensors", { type: 'channel', common: { name: Groups[x] + " - " + "Bewegungsmelder der Gruppe" }, native: {} });
                setObject(praefix + "." + x + ".RampOn", { type: 'channel', common: { name: Groups[x] + " - " + "Langsames hochdimmen bei anschalten" }, native: {} });
                setObject(praefix + "." + x + ".RampOff", { type: 'channel', common: { name: Groups[x] + " - " + "Langsames runterdimmen bei ausschalten" }, native: {} });
                setObject(praefix + "." + x + ".AutoOn_Lux", { type: 'channel', common: { name: Groups[x] + " - " + "Helligkeitsgesteuertes anschalten" }, native: {} });
                setObject(praefix + "." + x + ".AutoOn_PresenceIncrease", { type: 'channel', common: { name: Groups[x] + " - " + "Anwesenheitsgesteuertes anschalten" }, native: {} });
                setObject(praefix + "." + x + ".Blink", { type: 'channel', common: { name: Groups[x] + " - " + "Blinken" }, native: {} });
            };
            main();
        };
    });
});

function main() {
    if (logging) log("Reaching main");
    Init();
    CreateTrigger();
    CheckPresence();
    AutoOn_Lux();
    AutoOff_Lux();

}

function Init() {
    if (logging) log("Reaching Init");
    let z = 0;
    for (let x = 0; x < Groups.length; x++) { //Alle Gruppen durchgehen und Werte aller Dps in Group Array einlesen
        OldPowerState[x] = [];
        z = 0;
        Groups[x][50] = Groups[x][0]; //Den zum initialisieren genutzten Namen von Index 0 auf 50 kopieren um 0 wieder frei zu haben für die Loop
        //Groups[x][51] = false; // AutoOn_Lux-stateLock
        for (let y = 0; y < Dps.length; y++) {

            if (y == 7) {
                Groups[x][y] = [];
                do {
                    Groups[x][y][z] = getState(praefix + "." + x + ".MotionSensors.Sensor" + z).val; //Ersten (sicher vorhandenen) Bwm Dp einlesen
                    if (typeof Groups[x][7][z] != "undefined" && Groups[x][7][z] != "") { //Wenn ein Bwm eingetragen ist
                        //log(getState(getState(praefix + "." + x + ".MotionSensors.Sensor0").val).val)
                        SetBwmTrigger(Groups[x][7][z], "", x);
                    };
                    z++;
                }
                while (existsState(praefix + "." + x + ".MotionSensors.Sensor" + z)); //Schleifenabbruch wenn kein weiterer Bwm eingetragen ".MotionSensors.Sensor1"
                if (logging) log("Group " + x + " has " + z + " Motion Sensor Datapoints, with values: " + Groups[x][y]);


            } else {
                Groups[x][y] = getState(praefix + "." + x + Dps[y]).val;
                //if (logging) log("Groups[x][50]=" + Groups[x][50] + " Groups[x][y]=" + Groups[x][y] + " x=" + x + " y=" + y);
                OldPowerState[x][y] = null; //Hilfsvariable für alten Powerstate mit null initialisieren

            };
        };

    };
}

function CheckPresence() { //Prüft ob und wieviele Personen anwesend sind

    if (PresenceCountDp != "") { //Es ist ein Anwesenheitszählerdatenpunkt vorhanden
        PresenceCount = getState(PresenceCountDp).val;
        log("PresenceCount Dp found, set Presence to " + PresenceCount);
    }
    else if (IsPresenceDp != "") { //Es ist nur ein Anwesenheitsdatenpunkt true/false vorhanden
        let temp = getState(IsPresenceDp).val;
        if (temp) {
            log("IsPresence Dp found, set Presence to 1");
            PresenceCount = 1;
        } else {
            log("IsPresence Dp found, set Presence to 0");
            PresenceCount = 0;
        };
    } else { // //Es ist kein Anwesenheitszählerdatenpunkt und kein Anwesenheitsdatenpunkt vorhanden
        log("No Presence Dps found, set Presence internally to 1");
        PresenceCount = 1;
    };
}

function ClrTimeOut(gruppe) {
    if (logging) log("Reaching ClrTimeOut(gruppe) Group=" + gruppe);

    if (typeof AutoOffTimeOutObject[gruppe] == "object") {
        if (logging) log("Timeout for Group=" + gruppe + " deleted.");
        clearTimeout(AutoOffTimeOutObject[gruppe]);
    };
}

function AutoOff_Timed(gruppe) { //Schaltet Gruppe nach pro Gruppe vorgegbenenr Zeit aus. Berücksichtigt Bewegung.
    if (logging) log("Reaching AutoOff_timed(gruppe) Group=" + gruppe);
    ClrTimeOut(gruppe); //Alten Timeout löschen

    if (Groups[gruppe][5]) { //Nur wenn AutoOff aktiv ist.
        if (logging) log("AutoOff aktive, starting Timeout");

        AutoOffTimeOutObject[gruppe] = setTimeout(function () { // Bei aktivierung timeout starten
            log("Starting Timeoutloop Groups[gruppe][7] =" + Groups[gruppe][7] + " Groups[gruppe][6]=" + Groups[gruppe][6] + " IsMotion[gruppe]=" + Groups[gruppe][23]);

            if (Groups[gruppe][6] && !Groups[gruppe][23]) { //AutoOff ausführen wenn keine Bewegung und 6=".AutoOff_Timed.NoAutoOffWhenMotion"=true
                DoPower(gruppe, 0);
                if (logging) log("Group " + gruppe + " autooff cause no motion");
            }
            else if (Groups[gruppe][6] && Groups[gruppe][23]) { //AutoOff blocken da Bewegung und Timeout neustarten
                AutoOff_Timed(gruppe);
                if (logging) log("Group " + gruppe + " Motion detected, canceling autooff and restarting timeout");
            }
            else if (!Groups[gruppe][6]) { //AutoOff blocken da Bewegung und Timeout neustarten
                DoPower(gruppe, 0);
                if (logging) log("Group " + gruppe + " autooff ignoring motion");
            };
        }, parseInt(Groups[gruppe][4]) * 1000); //AutoOffzeit
    };
}

function AutoOff_Lux() {
    if (logging) log("Reaching AutoOff_Lux() Lux=" + ActualLux); // 36=".AutoOff_Lux.Enabled", 37=".AutoOff_Lux.MinLux", 38=".AutoOff_Lux.DailyLock",39=".AutoOff_Lux.Operator"
    for (let x = 0; x < Groups.length; x++) { //Alle Gruppen prüfen
        if (Groups[x][39] == "<") { //Operator kleiner als - wenn AktualLux < x Lux...
            if (Groups[x][36] && ActualLux <= Groups[x][37] && Groups[x][0] && !Groups[x][38]) { //Wenn .AutoOff_Lux.Enabled true und eingestellter Luxwert unterschritten ist und Gruppe ist inaktiv und Gruppe ist nicht gelockt
                if (DoPower(x, 0)) {
                    if (logging) log("AutoOff_Lux() deactivated group=" + x + " Groups[x][0]=" + Groups[x][0]);
                };
                setState(praefix + "." + x + ".AutoOff_Lux.DailyLock", true);
                if (logging) log("AutoOff_Lux() setting DailyLock to " + Groups[x][38]);
            } else if (ActualLux > Groups[x][37] && Groups[x][38]) { //DailyLock zurücksetzen
                Counter++;
                if (Counter > 5) { //5 Werte abwarten = Ausreisserschutz wenns am abend kurz mal heller wird
                    Counter = 0;
                    setState(praefix + "." + x + ".AutoOff_Lux.DailyLock", false);
                    if (logging) log("AutoOff_Lux() setting DailyLock to " + Groups[x][38]);
                };
            };

        } else if (Groups[x][39] == ">") { //Operator größer als - wenn AktualLux > x Lux...
            if (Groups[x][36] && ActualLux >= Groups[x][37] && Groups[x][0] && !Groups[x][38]) { //Wenn .AutoOff_Lux.Enabled true und eingestellter Luxwert unterschritten ist und Gruppe ist inaktiv und Gruppe ist nicht gelockt
                if (DoPower(x, 0)) {
                    if (logging) log("AutoOff_Lux() deactivated group=" + x + " Groups[x][0]=" + Groups[x][0]);
                };
                setState(praefix + "." + x + ".AutoOff_Lux.DailyLock", true);
                if (logging) log("AutoOff_Lux() setting DailyLock to " + Groups[x][38]);
            } else if (ActualLux < Groups[x][37] && Groups[x][38]) { //DailyLock zurücksetzen
                Counter++;
                if (Counter > 5) { //5 Werte abwarten = Ausreisserschutz wenns am abend kurz mal heller wird
                    Counter = 0;
                    setState(praefix + "." + x + ".AutoOff_Lux.DailyLock", false);
                    if (logging) log("AutoOff_Lux() setting DailyLock to " + Groups[x][38]);
                };
            };
        };
    };
}

function DoPower(gruppe, onoff) { // onoff 0=aus, 1=an, 2=Gruppe um 3=Devices um 4=Save 5=restore
    if (logging) log("Reaching DoPower(gruppe, onoff) Gruppe=" + gruppe + " onoff=" + onoff);



    if (onoff == 1 && Groups[gruppe][5]) { //Bei anschalten und wenn AutoOff_Timed aktiviert
        if (logging) log("DoPower detected AutoOff=" + Groups[gruppe][5]);
        AutoOff_Timed(gruppe);
    };

    if (onoff == 1 && Groups[gruppe][13]) { //Bei anschalten und wenn RampOn aktiviert
        if (logging) log("DoPower detected RampOn=" + Groups[gruppe][13]);

        if (RampOn(gruppe)) {
            Groups[gruppe][0] = true;
            setState(praefix + "." + gruppe + ".Power", true); //AnschaltDp setzen
            return true;
        };
    };

    if (onoff == 0 && Groups[gruppe][14]) { //Bei ausschalten und wenn RampOff aktiviert
        if (logging) log("DoPower detected RampOff=" + Groups[gruppe][14]);
        if (RampOff(gruppe)) return true;
    };

    if (onoff == 0) { // Gruppe ausschalten
        if (DoBri(gruppe, 2)) { //Erst runterdimmen um Einschaltblitzer zu vermeiden
            Groups[gruppe][0] = false;
            for (let x = 0; x < LightGroups[gruppe].length; x++) {
                setState(LightGroups[gruppe][x][0][0], LightGroups[gruppe][x][0][2]);  //Ausschalten
                if (logging) log("Datapoint " + LightGroups[gruppe][x][0][0] + " set to " + LightGroups[gruppe][x][0][2] + " what means, switched off");
                if (x == LightGroups[gruppe].length - 1) {
                    setState(praefix + "." + gruppe + ".Power", false); //Ausschalten
                    return true;
                };
            }

        }

    } else if (onoff == 1) { //Gruppe anschalten
        Groups[gruppe][0] = true;
        for (let x = 0; x < LightGroups[gruppe].length; x++) {
            setState(LightGroups[gruppe][x][0][0], LightGroups[gruppe][x][0][1]); //Anschalten
            if (logging) log("Datapoint " + LightGroups[gruppe][x][0][0] + " set to " + LightGroups[gruppe][x][0][1] + " what means, switched on");
            if (x == LightGroups[gruppe].length - 1) {
                setState(praefix + "." + gruppe + ".Power", true); //AnschaltDp aktualsieren
                return true;
            };
        };

    } else if (onoff == 2) { //Gruppe umschalten
        if (Groups[gruppe][0]) { //Wenn Gruppe an, ausschalten und umgekehrt
            Groups[gruppe][0] = false;
            for (let x = 0; x < LightGroups[gruppe].length; x++) {
                setState(LightGroups[gruppe][x][0][0], LightGroups[gruppe][x][0][2]);  //Ausschalten
                if (logging) log("Group " + Groups[gruppe][50] + " Datapoint " + LightGroups[gruppe][x][0][0] + " toggled to " + LightGroups[gruppe][x][0][2] + " what means, switched off");
                if (x == LightGroups[gruppe].length - 1) {
                    setState(praefix + "." + gruppe + ".Power", false); //Ausschalten
                    return true;
                };
            };

        } else {
            Groups[gruppe][0] = true;
            for (let x = 0; x < LightGroups[gruppe].length; x++) {
                setState(LightGroups[gruppe][x][0][0], LightGroups[gruppe][x][0][1]); //Anschalten
                if (logging) log("Group " + Groups[gruppe][50] + " Datapoint " + LightGroups[gruppe][x][0][0] + " toggled to " + LightGroups[gruppe][x][0][1] + " what means, switched on");
                if (x == LightGroups[gruppe].length - 1) {
                    setState(praefix + "." + gruppe + ".Power", true); //Anschalten
                    return true;
                };
            };

        };
    } else if (onoff == 3) { //Devices der Gruppe umschalten
        //if (getState(LightGroups[gruppe][x][0][0]).val) { //Wenn Device an, ausschalten und umgekehrt
        //   setState(LightGroups[gruppe][x][0][0], LightGroups[gruppe][x][0][2]);  //Ausschalten
        //   log("Datapoint " + LightGroups[gruppe][x][0][0] + " toggled to " + LightGroups[gruppe][x][0][2] + " what means, switched off");
        // } else {
        //     setState(LightGroups[gruppe][x][0][0], LightGroups[gruppe][x][0][1]); //Anschalten
        //     if (logging) log("Datapoint " + LightGroups[gruppe][x][0][0] + " toggled to " + LightGroups[gruppe][x][0][1] + " what means, switched on");
        //  };
    } else if (onoff == 4) { //Devicewerte sichern
        //OldPowerState[gruppe][x] = getState(LightGroups[gruppe][x][0][0]).val; //Alte Werte zwecks restore speichern
        // if (logging) log("Datapoint " + LightGroups[gruppe][x][0][0] + " saved ");
    } else if (onoff == 5) { //Devicewerte restoren
        // setState(LightGroups[gruppe][x][0][0], OldPowerState[gruppe][x]);  //Gespeicherten Wert wiederherstellen
        // if (logging) log("Datapoint " + LightGroups[gruppe][x][0][0] + " Data restored ");
    };
}

function DoCt(gruppe, ct) { //Farbtemperatur setzen
    if (logging) log("Reaching DoCt(gruppe, ct) Gruppe=" + gruppe + " ct=" + ct + " Groupcolor=" + Groups[gruppe][3].toLowerCase())
    if (Groups[gruppe][3].toLowerCase() != "white" && Groups[gruppe][3].toLowerCase() != "#ffffff") { //Wenn Gruppe farbig, ct unnötig, Abbruch
        if (logging) log("Color choosen, aborting DoCt()");
        return true;
    };
    if (!Groups[gruppe][0]) { //Wenn Gruppe aus, ct unnötig, Abbruch
        if (logging) log("Group is not active, aborting DoCt()");
        return true;
    };

    for (let x = 0; x < LightGroups[gruppe].length; x++) {
        if (logging) log("typeof LightGroups[gruppe][x][2]=" + typeof LightGroups[gruppe][x][2]);
        if (typeof LightGroups[gruppe][x][2] !== "undefined") { // Device hat ct Funktion
            let ProzCt = (LightGroups[gruppe][x][2][2] - LightGroups[gruppe][x][2][1]) / 100 // =1% als Wert
            let TempVal = Math.abs(parseInt(LightGroups[gruppe][x][2][1] + (ProzCt * ct)));
            if (logging) log("(ProzCt * ct)=" + (ProzCt * ct) + " LightGroups[gruppe][x][2][1]=" + LightGroups[gruppe][x][2][1] + " ProzCt=" + ProzCt + " TempVal=" + TempVal + " typeof LightGroups[gruppe][x][2][0]=" + typeof LightGroups[gruppe][x][2][0])
            if (getState(LightGroups[gruppe][x][2][0]).val != TempVal) setStateDelayed(LightGroups[gruppe][x][2][0], TempVal, 100);
        } else if (typeof LightGroups[gruppe][x][2] == "undefined" && typeof LightGroups[gruppe][x][3] !== "undefined") { //Device hat keine ct Funktion, aber color Funktion
            if (ct >= 50) {
                if (typeof LightGroups[gruppe][x][3][3] !== "undefined") {
                    if (getState(LightGroups[gruppe][x][3][0]).val != LightGroups[gruppe][x][3][3]) setStateDelayed(LightGroups[gruppe][x][3][0], LightGroups[gruppe][x][3][3], 100); //Device auf Farbe, entsprechend warmweiss setzen  
                    if (logging) log("No ct function, but color function found, setting color to: " + LightGroups[gruppe][x][3][3] + ", what should be warmwhite" + " DeviceDp=" + LightGroups[gruppe][x][3][0])
                };
            } else {
                if (typeof LightGroups[gruppe][x][3][4] !== "undefined") {
                    if (getState(LightGroups[gruppe][x][3][0]).val != LightGroups[gruppe][x][3][4]) setStateDelayed(LightGroups[gruppe][x][3][0], LightGroups[gruppe][x][3][4], 100); //Device auf Farbe, entsprechend tagesweiss setzen  
                    if (logging) log("No ct function, but color function found, setting color to: " + LightGroups[gruppe][x][3][4] + ", what should be daywhite" + " DeviceDp=" + LightGroups[gruppe][x][3][0])
                };
            };
        };

        if (x == LightGroups[gruppe].length - 1) { //Letzter Durchlauf des Zyklus
            return true;
        };
    };
}

function DoBri(gruppe, bri) { //Helligkeit
    if (logging) log("Reaching DoBri(gruppe, bri gruppe=)" + gruppe + " bri=" + bri)
    let newbri;

    if (!Groups[gruppe][0]) { //Wenn Gruppe aus, bri unnötig, Abbruch
        if (logging) log("Group is not active, aborting DoBri()");
        return true;
    };

    for (let x = 0; x < LightGroups[gruppe].length; x++) { //Alle Devices der Gruppe durchgehen
        if (typeof LightGroups[gruppe][x][1] != "undefined") { //Device hat bri Funktion
            if (!Groups[gruppe][19]) { //BriDefaults des Devices nutzen und mit geforderter Helligkeit verrechnen, jedoch nur wenn kein OnOverride
                if (logging) log("Calculated Bri=" + (bri * (LightGroups[gruppe][x][1][3] / 100)) + " Incoming Bri=" + bri + " DeviceDefaultBri=" + LightGroups[gruppe][x][1][3])
                newbri = bri * (LightGroups[gruppe][x][1][3] / 100);
                if (newbri < 1) newbri = 1;
                if (getState(LightGroups[gruppe][x][1][0]).val != newbri) setState(LightGroups[gruppe][x][1][0], newbri);
                if (logging) log("newbri=" + newbri + "% relative Brightness DeviceDp=" + LightGroups[gruppe][x][1][0]);
            } else { //Bei Override 
                if (getState(LightGroups[gruppe][x][1][0]).val != bri) setState(LightGroups[gruppe][x][1][0], bri); //Bri direkt setzen
                if (logging) log("bri=" + bri + "% absolute Brightness Lightgroup=" + LightGroups[gruppe][x][1][0]);

            };
        };
        if (x == LightGroups[gruppe].length - 1) { //Letzter Durchlauf des Zyklus

            return true;
        };
    };
}

function DoColor(gruppe, color) { //Farbe
    if (logging) log("Reaching DoColor(gruppe, color) - gruppe=" + gruppe + " color=" + color)
    let TempColor;
    if (logging) log("incoming color is " + color + " color.substring(0, 1)=" + color.substring(0, 1) + " color.length=" + color.length);

    if (!Groups[gruppe][0]) { //Wenn Gruppe aus, color unnötig, Abbruch
        if (logging) log("Group is not active, aborting DoColor()");
        return true;
    };


    // Farbsystem von color bestimmen und nach rgb konvertieren
    if (color.substring(0, 1) == "#" && color.length == 7) { //Wenn Hexfarbe wie "#FFFFFF"
        if (logging) log("incoming color is hex " + color.substring(0, 1) + " " + color.length);
        TempColor = ConvertHexToRgb(color);
        //log(TempColor)
    }
    else if (Object.keys(cssKeywords).indexOf(color.toLowerCase()) != -1) { //Wenn benannte Farbe, diese umwandeln und zurückschreiben damit Vis Widgets darstellen können
        if (logging) log("incoming color is namedcolor ");
        if (logging) log("rgb=" + ConvertKeywordToRgb(color.toLowerCase()));
        TempColor = ConvertKeywordToRgb(color.toLowerCase());
        setState(praefix + "." + gruppe + ".Color", "#" + ConvertRgbToHex(TempColor));

        return false;
    };

    color = TempColor; //color ist nun dediziert rgb
    if (logging) log("incoming color simplyfied to rgb=" + color + " now converting this rgb to the targets colorsystem")

    // Konvertiertes RGB umwandeln zu Zielfarbsystem pro Device
    for (let x = 0; x < LightGroups[gruppe].length; x++) { //Alle Devices der Gruppe durchgehen
        if (typeof LightGroups[gruppe][x][3] != "undefined") { //Nachfolgendes nur ausführen wenn ein Arrayeintrag für Farbe vorhanden

            if (logging) log("color=" + color + " Lightgroup=" + LightGroups[gruppe][x][3][0]);

            switch (LightGroups[gruppe][x][3][1]) {
                case "rgb":
                    if (logging) log("Targets colorsystem is: rgb");
                    TempColor = color;
                    break;
                case "xy":
                    if (logging) log("Targets colorsystem is: xy");
                    TempColor = ConvertRgbToXy(color);
                    break;
                case "hex":
                    if (logging) log("Targets colorsystem is: hex");
                    TempColor = "#" + ConvertRgbToHex(color);
                    break;
                case "hsl":
                    if (logging) log("Targets colorsystem is: hsl");
                    TempColor = ConvertRgbToHsl(color);
                    break;
                default:
            };
            if (logging) log("TempColor=" + TempColor);
            if (typeof LightGroups[gruppe][x][4] != "undefined") { //Device hat Farbe/weiss umschaltung
                if (logging) log("Found Device with colormode switch. DeviceDp=" + LightGroups[gruppe][x][4][0]);
                if (color.toString() == "255,255,255") { //Farbe weiss gefordert
                    setState(LightGroups[gruppe][x][4][0], LightGroups[gruppe][x][4][2]); //Weissmodus aktivieren
                    if (logging) log("switched to whitemode, color=" + color + " colormode=" + LightGroups[gruppe][x][4][2]);
                } else {
                    setState(LightGroups[gruppe][x][4][0], LightGroups[gruppe][x][4][1]); //Farbmodus aktivieren
                    if (logging) log("switched to colormode, color=" + color + " colormode=" + LightGroups[gruppe][x][4][1]);
                };
            };
            setStateDelayed(LightGroups[gruppe][x][3][0], TempColor.toString(), 150);
        };
        if (x == LightGroups[gruppe].length - 1) { //Letzter Durchlauf des Zyklus
            return true;
        };
    };
}

function GetAdaptiveBri() {
    log("Reaching GetAdaptiveBri()")
    let bri = ActualLux / 10; //Alles über 1000Lux ist 100%
    if (bri < 2) { //Helligkeit unter 2% vermeiden, da diesen bei einigen Devices zur Abschaltung führt
        bri = 2;
    } else if (bri > 100) { //Werte über 100% blocken
        bri = 100;
    };
    if (logging) log("Adaptive bri set to " + bri)

    return bri;
}

function GetAdaptiveCt() { //
    if (logging) log("Reaching GetAdaptiveCt()")
    let ct = 0;
    let now = new Date();
    let EpochNow = now.getTime();
    let EpochGoldenHour = getAstroDate("goldenHour").getTime();
    let EpochGoldenHourEnd = getAstroDate("goldenHourEnd").getTime();

    if (EpochNow > EpochGoldenHourEnd && EpochNow < EpochGoldenHour) { //Wenn aktuelle Zeit zwischen blauer und goldener Stunde ist (Tag)
        ct = 10;
    } else {
        ct = 100;
    };

    if (logging) log("Adaptive ct set to " + ct)
    //Ikea 2200-4000
    //2800-warm/abend 4000-tag 5500-kalt/morgen
    return ct;
}


function Blink(gruppe, farbe, MaxBlinks = 1, frequenz = 1000) {
    if (logging) log("Reaching Blink(gruppe)=" + gruppe)

    let counter = 1;

    //log("x=" + x + "LightGroups[gruppe][x][0][0]=" + LightGroups[gruppe][x][0][0] + " LightGroups[gruppe][x][0][1]" + LightGroups[gruppe][x][0][1] + " LightGroups[gruppe][x][0][2]" + LightGroups[gruppe][x][0][2])
    if (DoPower(gruppe, 2)) DoColor(gruppe, farbe); //Umschalten, dann Farbe setzen



    BlinkInterval[gruppe] = setInterval(function () {
        DoPower(gruppe, 2); //Umschalten
        counter++;
        if (counter >= MaxBlinks * 2 - 0) {
            clearInterval(BlinkInterval[gruppe]);
        };
    }, frequenz);
}

function RampOn(gruppe) {
    if (logging) log("Reaching RampOn(gruppe)=" + gruppe);
    let TempBri = 0;
    let RampSteps = 20;
    let AdaptiveBri = GetAdaptiveBri();
    RampInterval[gruppe] = [];

    for (let x = 0; x < LightGroups[gruppe].length; x++) {
        TempBri = 2;
        if (typeof LightGroups[gruppe][x][1] != "undefined") { //Eintrag für Helligkeitssteuerung vorhanden
            if (typeof LightGroups[gruppe][x][1][3] != "undefined" && Groups[gruppe][11]) { // Device hat Bri Funktion und AdaptiveBri ist aktiviert
                if (setState(LightGroups[gruppe][x][0][0], LightGroups[gruppe][x][0][1])) {//Anschalten und nach Erfolg Helligkeit auf 2
                    setState(LightGroups[gruppe][x][1][0], 2); //Helligkeit setzen 
                };

                RampInterval[gruppe][x] = setInterval(function () { // Intervall starten
                    setState(LightGroups[gruppe][x][1][0], TempBri); //Helligkeit setzen 
                    TempBri += LightGroups[gruppe][x][1][3] / RampSteps;
                    if (TempBri + LightGroups[gruppe][x][1][3] / RampSteps > AdaptiveBri) {
                        clearInterval(RampInterval[gruppe][x]);
                    };
                }, parseInt(Groups[gruppe][15]) * 1000 / RampSteps); //

                if (logging) log("Group " + Groups[gruppe][50] + " switched ramped on. Device=" + LightGroups[gruppe][x][1][0] + ", and set brightness adaptive to: " + AdaptiveBri);
            }
            else if (typeof LightGroups[gruppe][x][1][3] != "undefined") { // Device hat Bri Funktion und UseBriDefaults ist aktiviert
                if (setState(LightGroups[gruppe][x][0][0], LightGroups[gruppe][x][0][1])) {//Anschalten und nach Erfolg Helligkeit auf 2
                    setState(LightGroups[gruppe][x][1][0], 2); //Helligkeit setzen 
                };


                RampInterval[gruppe][x] = setInterval(function () { //
                    setState(LightGroups[gruppe][x][1][0], TempBri); //Helligkeit setzen 
                    TempBri += LightGroups[gruppe][x][1][3] / RampSteps;
                    //log("TempBri" + TempBri);

                    if (TempBri + LightGroups[gruppe][x][1][3] / RampSteps > LightGroups[gruppe][x][1][3]) {
                        if (typeof RampInterval[gruppe][x] == "object") clearInterval(RampInterval[gruppe][x]);
                    };
                }, parseInt(Groups[gruppe][15]) * 1000 / RampSteps); //

                if (logging) log("Group " + Groups[gruppe][50] + " switched ramped on. Device=" + LightGroups[gruppe][x][1][0] + ", and set brightness to default: " + LightGroups[gruppe][x][1][3]);
            };
        }
        else { //Kein Eintrag für Helligkeitssteuerung vorhanden, vermutlich Schaltsteckdose
            if (Groups[gruppe][13]) { //Wenn Rampe aktiv, Erst nach Ablauf der Rampenzeit schalten
                setTimeout(function () { //
                    setState(LightGroups[gruppe][x][0][0], LightGroups[gruppe][x][0][1]); //Anschalten
                    if (logging) log("Group " + Groups[gruppe][50] + " just switched ramped on. Device=" + LightGroups[gruppe][x][0][0]);
                }, parseInt(Groups[gruppe][16]) * 1000); //
            } else {
                setState(LightGroups[gruppe][x][0][0], LightGroups[gruppe][x][0][1]); //Anschalten
                if (logging) log("Group " + Groups[gruppe][50] + " just switched on. Device=" + LightGroups[gruppe][x][0][0]);
            };
        };
        if (x == LightGroups[gruppe].length - 1) { //Letzter Durchlauf des Zyklus
            Groups[gruppe][0] = true;
            return true;
        };

    };
}

function RampOff(gruppe) {
    if (logging) log("Reaching RampOff(gruppe)=" + gruppe);
    let TempBri = 0;
    let RampSteps = 20;
    RampInterval[gruppe] = [];

    for (let x = 0; x < LightGroups[gruppe].length; x++) {
        if (typeof LightGroups[gruppe][x][1] != "undefined") { // Device hat Bri Funktion 
            TempBri = getState(LightGroups[gruppe][x][1][0]).val; //Aktuellen Devicewert lesen 
            let Faktor = (TempBri / RampSteps);
            if (logging) log("A Faktor=" + Faktor + " TempBri=" + TempBri);
            RampInterval[gruppe][x] = setInterval(function () { //
                TempBri = TempBri - Faktor;
                if (logging) log("Faktor=" + Faktor + " TempBri=" + TempBri);
                setState(LightGroups[gruppe][x][1][0], TempBri); //Helligkeit setzen 

                if (TempBri - Faktor <= 2) {
                    log("typeof RampInterval[gruppe][x]=" + typeof RampInterval[gruppe][x])
                    if (typeof RampInterval[gruppe][x] == "object") clearInterval(RampInterval[gruppe][x]);
                    setState(LightGroups[gruppe][x][0][0], LightGroups[gruppe][x][0][2]);  //Ausschalten
                };
            }, parseInt(Groups[gruppe][16]) * 1000 / RampSteps); //
        } else { // Device hat keine Bri Funktion - simple Lampe oder Schaltsteckdose
            if (Groups[gruppe][16]) { //".RampOff.SwitchOutletsLast"
                setTimeout(function () { //TimeOut setzen um diese Devices erst nach Ablauf der Rampe der anderen Devices zu aktivieren
                    setState(LightGroups[gruppe][x][0][0], LightGroups[gruppe][x][0][2]); //Ausschalten der Geräte ohne Helligkeitssteuerung erst nach Ablauf der rampofftime
                    if (logging) log("Outlets switched off at RampEnd");
                }, parseInt(Groups[gruppe][16]) * 1000); //
            } else {
                setState(LightGroups[gruppe][x][0][0], LightGroups[gruppe][x][0][2]); //Ausschalten der Geräte ohne Helligkeitssteuerung als erstes
                if (logging) log("Outlets switched off at RampStart");
            };
        };
        if (x == LightGroups[gruppe].length - 1) { //Letzter Durchlauf des Zyklus
            Groups[gruppe][0] = false;
            setState(praefix + "." + gruppe + ".Power", false); //Ausschalten

            return true;
        };

    };
}


function OnOverride(gruppe, onoff) {
    if (logging) log("Reaching OnOverride(gruppe, onoff) Group=" + gruppe + " onoff=" + onoff);

    if (DoPower(gruppe, onoff)) { //Erst wenn Durchlauf fertig ist (async Problem vermeiden) und anschaltung
        if (onoff == 1) {
            if (logging) log("Setting bri after full On cycle");
            if (DoBri(gruppe, 100)) {//Helligkeit 100%
                DoColor(gruppe, "white"); //Farbe auf weiss
            };

        }
    };
}

function SetBwmTrigger(Dp, OldDp, gruppe) { //Setzt oder ersetzt Trigger für eingetragene Bewegungsmelder
    if (logging) log("Reaching SetBwmTrigger(Dp, OldDp)=" + Dp + " " + OldDp + " Group=" + gruppe);

    if (unsubscribe(OldDp)) { //Vorherigen Trigger löschen
        if (logging) log("Subscription for " + OldDp + " deleted");
    };
    on(Dp, function (dp) { //Bei Bewegung
        // if (Groups[gruppe][5]) { //Wenn Gruppe angeschaltet, und AutoOff sowie NoAutoOffWhenMotion aktiviert
        SummarizeBwms(gruppe, dp.state.val);
        // };
        if (logging) log("Bwm was triggered. Bwm=" + Groups[gruppe][7][0] + " Value=" + dp.state.val + " Group=" + gruppe + "=" + Groups[gruppe][50]);
    });
}

function SummarizeBwms(gruppe, value) { //Kombiniert x Bewegungsmelder auf einen Dp
    if (logging) log("Reaching SummarizeBwms(gruppe, value) Group=" + gruppe + " value=" + value);

    let Motionstate = false; //Motionstate initial auf false setzen, wird bei auch nur einem aktiven Bwm mit true überschrieben
    for (let x = 0; x < Groups[gruppe][7].length; x++) { // Alle Bwms der Gruppe prüfen, false setzen wenn ALLE false, true wenn EINER true
        if (getState(Groups[gruppe][7][x]).val) {
            Motionstate = true;
        };
        if (x == Groups[gruppe][7].length - 1) { //Bei letztem Schleifendurchlauf
            setState(praefix + "." + gruppe + ".IsMotion", Motionstate);
            Groups[gruppe][23] = Motionstate;
            log("Set IsMotion für Group " + gruppe + " to " + Motionstate)
        };
    };
}

function AutoOn_Motion(gruppe) { //Schaltet Gruppe bei Bewegung an. 
    if (logging) log("Reaching AutoOn_Motion(gruppe) Group=" + gruppe);
    let UseLux = ActualLux;
    if (Groups[gruppe][10] != "" && typeof Groups[gruppe][10] != "undefined") { //Wenn Helligkeitssensor bei Gruppe eingetragen, dessen Wert nutzen, ansonsten den generischen    
        UseLux = getState(Groups[gruppe][10]).val;
    };
    log("Groups[gruppe][8]=" + Groups[gruppe][8] + " UseLux=" + UseLux + " Groups[gruppe][9]=" + Groups[gruppe][9] + " Groups[gruppe][0]=" + Groups[gruppe][0])
    if (Groups[gruppe][8] && UseLux <= Groups[gruppe][9] && !Groups[gruppe][0]) { //AutoOn_Motion ist enabled, Helligkeitstriggerwert wurde erreicht bzw. unterschritten und die Gruppe ist noch nicht an
        if (logging) log("Group " + gruppe + " Brightness triggervalue at Group " + Groups[gruppe][9] + " was reached or fallen below, actual Value is " + UseLux + " Lux");

        if (DoPower(gruppe, 1)) { //Anschalten
            if (typeof Groups[gruppe][22] != "undefined" && Groups[gruppe][22] != "") { //33=.AutoOn_Motion.AutoOnColor ist nicht leer
                DoColor(gruppe, Groups[gruppe][22]);
            } else {
                DoColor(gruppe, Groups[gruppe][3]); //Gruppencolor verwenden
            };


            if (typeof Groups[gruppe][21] != "undefined" && typeof Groups[gruppe][21] != "null" && Groups[gruppe][21] != "" && Groups[gruppe][21] != 0) { //32=.AutoOn_Motion.AutoOnBri ist nicht leer
                DoBri(gruppe, Groups[gruppe][21]);
            } else {
                if (Groups[gruppe][11]) {//Wenn Adaptive Bri ist aktiviert
                    DoBri(gruppe, GetAdaptiveBri()); //Adaptive bri Wert setzen
                } else {
                    DoBri(gruppe, Groups[gruppe][1]); //Gruppenbri verwenden
                };
            };
            setTimeout(function () { //
                //Jetzt Farbtemperatur setzen
                if (Groups[gruppe][12]) {//Wenn Adaptive Ct ist aktiviert
                    DoCt(gruppe, GetAdaptiveCt()); //Adaptive ct Wert setzen
                } else {
                    DoCt(gruppe, Groups[gruppe][2]); //ct Wert aus Gruppe setzen
                };


            }, 500); //

        };

    };
}

function AutoOn_Lux() {
    if (logging) log("Reaching AutoOn_Lux() Lux=" + ActualLux);
    for (let x = 0; x < Groups.length; x++) { //Alle Gruppen prüfen

        if (Groups[x][40] == "<") { //Anschalten wenn Luxwert unterschritten
            if (Groups[x][24] && ActualLux <= Groups[x][25] && !Groups[x][0] && !Groups[x][30]) { //Wenn .AutoOn_Lux.Enabled true und eingestellter Luxwert unterschritten ist und Gruppe ist inaktiv und Gruppe ist nicht gelockt
                if (logging) log("AutoOn_Lux() activated group=" + x + " Groups[x][0]=" + Groups[x][0]);
                if ((Groups[x][26] && PresenceCount > 0) || (Groups[x][28] && PresenceCount == 0)) { //Wenn ".AutoOn_Lux.OnlyIfPresence" ist true und Presence ist true ODER ".AutoOn_Lux.OnlyIfNoPresence" ist true und Presence ist 0
                    if (DoPower(x, 1)) {
                        if (typeof Groups[x][32] != "undefined" && typeof Groups[x][32] != "null" && Groups[x][32] != "" && Groups[x][32] != 0) { //32=.AutoOn_Lux.AutoOnBri ist nicht leer
                            DoBri(x, Groups[x][32]);
                        } else {
                            if (Groups[x][11]) {//Wenn Adaptive Bri ist aktiviert
                                DoBri(x, GetAdaptiveBri()); //Adaptive bri Wert setzen
                            } else {
                                DoBri(x, Groups[x][1]); //Gruppenbri verwenden
                            };
                        };
                        if (typeof Groups[x][33] != "undefined" && Groups[x][33] != "") { //33=.AutoOn_Lux.AutoOnColor ist nicht leer
                            DoColor(x, Groups[x][33]);
                        } else {
                            DoColor(x, Groups[x][3]); //Gruppencolor verwenden
                        };
                        if (Groups[x][12]) {//Wenn Adaptive Ct ist aktiviert
                            DoCt(x, GetAdaptiveCt()); //Adaptive ct Wert setzen
                        } else {
                            DoCt(x, Groups[x][2]); //ct Wert aus Gruppe setzen
                        };
                    };
                };
                setState(praefix + "." + x + ".AutoOn_Lux.DailyLock", true);
                if (logging) log("AutoOn_Lux() setting DailyLock to " + Groups[x][30]);
            } else if (ActualLux > Groups[x][25] && Groups[x][30]) { //DailyLock zurücksetzen
                Counter++;
                if (Counter > 5) { //5 Werte abwarten = Ausreisserschutz wenns am morgen kurz mal dunkler wird
                    Counter = 0;
                    setState(praefix + "." + x + ".AutoOn_Lux.DailyLock", false);
                    if (logging) log("AutoOn_Lux() setting DailyLock to " + Groups[x][30]);
                };
            };
        } else if (Groups[x][40] == ">") { //Anschalten wenn Luxwert überschritten
            if (Groups[x][24] && ActualLux >= Groups[x][25] && !Groups[x][0] && !Groups[x][30]) { //Wenn .AutoOn_Lux.Enabled true und eingestellter Luxwert unterschritten ist und Gruppe ist inaktiv und Gruppe ist nicht gelockt
                if (logging) log("AutoOn_Lux() activated group=" + x + " Groups[x][0]=" + Groups[x][0]);
                if ((Groups[x][26] && PresenceCount > 0) || (Groups[x][28] && PresenceCount == 0)) { //Wenn ".AutoOn_Lux.OnlyIfPresence" ist true und Presence ist true ODER ".AutoOn_Lux.OnlyIfNoPresence" ist true und Presence ist 0
                    if (DoPower(x, 1)) {
                        if (typeof Groups[x][32] != "undefined" && typeof Groups[x][32] != "null" && Groups[x][32] != "" && Groups[x][32] != 0) { //32=.AutoOn_Lux.AutoOnBri ist nicht leer
                            DoBri(x, Groups[x][32]);
                        } else {
                            if (Groups[x][11]) {//Wenn Adaptive Bri ist aktiviert
                                DoBri(x, GetAdaptiveBri()); //Adaptive bri Wert setzen
                            } else {
                                DoBri(x, Groups[x][1]); //Gruppenbri verwenden
                            };
                        };
                        if (typeof Groups[x][33] != "undefined" && Groups[x][33] != "") { //33=.AutoOn_Lux.AutoOnColor ist nicht leer
                            DoColor(x, Groups[x][33]);
                        } else {
                            DoColor(x, Groups[x][3]); //Gruppencolor verwenden
                        };
                        if (Groups[x][12]) {//Wenn Adaptive Ct ist aktiviert
                            DoCt(x, GetAdaptiveCt()); //Adaptive ct Wert setzen
                        } else {
                            DoCt(x, Groups[x][2]); //ct Wert aus Gruppe setzen
                        };
                    };
                };
                setState(praefix + "." + x + ".AutoOn_Lux.DailyLock", true);
                if (logging) log("AutoOn_Lux() setting DailyLock to " + Groups[x][30]);
            } else if (ActualLux < Groups[x][25] && Groups[x][30]) { //DailyLock zurücksetzen
                Counter++;
                if (Counter > 5) { //5 Werte abwarten = Ausreisserschutz wenns am morgen kurz mal dunkler wird
                    Counter = 0;
                    setState(praefix + "." + x + ".AutoOn_Lux.DailyLock", false);
                    if (logging) log("AutoOn_Lux() setting DailyLock to " + Groups[x][30]);
                };
            };
        };



    };
}

// 30=".AutoOn_Lux.DailyLock", 31= ".RampOn.SwitchOutletsLast", 32=".AutoOn_Lux.AutoOnBri", 33=".AutoOn_Lux.AutoOnColor", 34=".AutoOn_PresenceIncrease.AutoOnBri", 35=".AutoOn_PresenceIncrease.AutoOnColor"

function AutoOn_PresenceIncrease() {
    if (logging) log("Reaching AutoOn_PresenceIncrease()");
    for (let x = 0; x < Groups.length; x++) { //Alle Gruppen prüfen
        if (Groups[x][27] && ActualLux <= Groups[x][29] && !Groups[x][0]) { //Wenn .AutoOn_PresenceIncrease.Enabled true und eingestellter Luxwert unterschritten ist und die Gruppe nicht ohnehin an ist
            if (logging) log("AutoOn_PresenceIncrease() activated group=" + x);
            //setState(praefix + "." + x + ".Power", true); 
            if (DoPower(x, 1)) {//Anschalten
                if (typeof Groups[x][34] != "undefined" && typeof Groups[x][34] != "null" && Groups[x][34] != "" && Groups[x][34] != 0) { //32=.AutoOn_Lux.AutoOnBri ist nicht leer
                    DoBri(x, Groups[x][34]);
                } else {
                    if (Groups[x][11]) {//Wenn Adaptive Bri ist aktiviert
                        DoBri(x, GetAdaptiveBri()); //Adaptive bri Wert setzen
                    } else {
                        DoBri(x, Groups[x][1]); //Gruppenbri verwenden
                    };

                };

                if (typeof Groups[x][35] != "undefined" && Groups[x][35] != "") { //33=.AutoOn_Lux.AutoOnColor ist nicht leer
                    DoColor(x, Groups[x][35]);
                } else {
                    DoColor(x, Groups[x][3]); //Gruppencolor verwenden
                };
                if (Groups[x][12]) {//Wenn Adaptive Ct ist aktiviert
                    DoCt(x, GetAdaptiveCt()); //Adaptive ct Wert setzen
                } else {
                    DoCt(x, Groups[x][2]); //ct Wert aus Gruppe setzen
                };

            };

        };
    };
}


function CreateTrigger() {
    on(LuxSensor, function (dp) { //Bei Statusänderung Luxaussensensor
        ActualLux = dp.state.val;
        AutoOn_Lux();
        AutoOff_Lux();
    });

    if (PresenceCountDp != "") { //Trigger nur setzen wenn Eintrag vorhanden
        on(PresenceCountDp, function (dp) { //Bei Statusänderung Anwesenheitszähler
            PresenceCount = dp.state.val;
            if (dp.state.val > dp.oldState.val) { //Wenn jemand kommt
                PresenceCountIncrease = true;
            } else { //Wenn jemand geht
                PresenceCountIncrease = false;
            };
        });
    };

    if (IsPresenceDp != "") { //Trigger nur setzen wenn Eintrag vorhanden
        on(IsPresenceDp, function (dp) { //Bei Statusänderung Anwesenheit
            PresenceCount = dp.state.val;
        });
    };

    for (let x = 0; x < Groups.length; x++) {
        on({ id: praefix + "." + x + ".Power", change: "ne" }, function (dp) { //Bei Statusänderung Power
            if (logging) log("Group " + x + " Power triggered")
            //Groups[x][0] = dp.state.val;
            if (logging) log("Call DoPower, values are: x=" + x + " Power=" + dp.state.val + " color=" + Groups[x][3])
            if (dp.state.val && !Groups[x][0]) {
                if (DoPower(x, 1)) { //Sobald alles angeschaltet
                    if (DoColor(x, Groups[x][3])) {
                        if (Groups[x][11]) {//Wenn Adaptive Bri ist aktiviert
                            DoBri(x, GetAdaptiveBri()); //Adaptive bri Wert setzen
                        } else {
                            DoBri(x, Groups[x][1]); //Gruppenbri verwenden
                        };

                        if (Groups[x][12]) {//Wenn Adaptive Ct ist aktiviert
                            DoCt(x, GetAdaptiveCt()); //Adaptive ct Wert setzen
                        } else {
                            DoCt(x, Groups[x][2]); //ct Wert aus Gruppe setzen
                        };
                    };
                };
            } else if (!dp.state.val && Groups[x][0]) {
                DoPower(x, 0);
            };
        });
        on(praefix + "." + x + ".Bri", function (dp) { //Bei Statusänderung Helligkeit
            Groups[x][1] = dp.state.val;
            DoBri(x, dp.state.val);
        });
        on(praefix + "." + x + ".Ct", function (dp) { //Bei Statusänderung Farbtemperatur
            Groups[x][2] = dp.state.val;
            DoCt(x, dp.state.val);
        });
        on(praefix + "." + x + ".Color", function (dp) { //Bei Statusänderung Farbe
            Groups[x][3] = dp.state.val;
            DoColor(x, dp.state.val);
        });
        on(praefix + "." + x + ".AutoOff_Timed.AutoOffTime", function (dp) { //Bei Statusänderung 
            Groups[x][4] = dp.state.val;
        });
        on(praefix + "." + x + ".AutoOff_Timed.Enabled", function (dp) { //Bei Statusänderung
            Groups[x][5] = dp.state.val;
        });

        on(praefix + "." + x + ".AutoOff_Timed.NoAutoOffWhenMotion", function (dp) { //Bei Statusänderung
            Groups[x][6] = dp.state.val;
        });

        for (let z = 0; z < Groups[x][7].length; z++) {
            on(praefix + "." + x + ".MotionSensors.Sensor" + z, function (dp) { //Bei Statusänderung
                Groups[x][7][z] = dp.state.val;
                if (dp.state.val != "") SetBwmTrigger(dp.state.val, dp.oldState.val, x);

                if (typeof Groups[x][7][z] != "undefined" && Groups[x][7][z] != "") { //Wenn ein Bwm eingetragen wurde
                    //log(getState(getState(praefix + "." + x + ".MotionSensors.Sensor0").val).val)
                    if (dp.state.val != "") SetBwmTrigger(dp.state.val, dp.oldState.val, x);
                };
            });
        };

        on(praefix + "." + x + ".AutoOn_Motion.Enabled", function (dp) { //Bei Statusänderung
            Groups[x][8] = dp.state.val;
        });
        on(praefix + "." + x + ".AutoOn_Motion.MinLux", function (dp) { //Bei Statusänderung
            Groups[x][9] = dp.state.val;
        });
        on(praefix + "." + x + ".LuxDp", function (dp) { //Bei Statusänderung
            Groups[x][10] = dp.state.val;
        });
        on(praefix + "." + x + ".AdaptiveBri", function (dp) { //Bei Statusänderung
            Groups[x][11] = dp.state.val;
        });
        on(praefix + "." + x + ".AdaptiveCt", function (dp) { //Bei Statusänderung
            Groups[x][12] = dp.state.val;
        });
        on(praefix + "." + x + ".RampOn.Enabled", function (dp) { //Bei Statusänderung
            Groups[x][13] = dp.state.val;
        });
        on(praefix + "." + x + ".RampOff.Enabled", function (dp) { //Bei Statusänderung
            Groups[x][14] = dp.state.val;
        });
        on(praefix + "." + x + ".RampOn.Time", function (dp) { //Bei Statusänderung
            Groups[x][15] = dp.state.val;
        });
        on(praefix + "." + x + ".RampOff.Time", function (dp) { //Bei Statusänderung
            Groups[x][16] = dp.state.val;
        });
        on(praefix + "." + x + ".Blink.BlinkEnabled", function (dp) { //Bei Statusänderung
            Groups[x][17] = dp.state.val;
        });

        on(praefix + "." + x + ".Blink.BlinkNow", function (dp) { //Bei Statusänderung Blink
            Groups[x][18] = dp.state.val;
            if (dp.state.val && Groups[x][17]) {
                Blink(x, "red", 2, 1000);
                setTimeout(function () { // Tasterfunktion, Rückstellung auf false
                    setState(praefix + "." + x + ".Blink.BlinkNow", false);
                }, 100); //
            };
        });
        on(praefix + "." + x + ".OnOverride", function (dp) { //Bei Putzlicht aktivierung
            Groups[x][19] = dp.state.val;
            OnOverride(x, dp.state.val);

        });
        on(praefix + "." + x + ".RampOff.SwitchOutletsLast", function (dp) { //Bei Statusänderung
            Groups[x][20] = dp.state.val;
        });
        on(praefix + "." + x + ".AutoOn_Motion.AutoOnBri", function (dp) { //Bei Statusänderung
            Groups[x][21] = dp.state.val;
        });
        on(praefix + "." + x + ".AutoOn_Motion.AutoOnColor", function (dp) { //Bei Statusänderung
            Groups[x][22] = dp.state.val;
        });
        on(praefix + "." + x + ".IsMotion", function (dp) { //Bei Statusänderung
            Groups[x][23] = dp.state.val;
            if (dp.state.val && Groups[x][8]) { //Bei Bewegung und aktivem AutoOn
                AutoOn_Motion(x);
            };
        });
        on(praefix + "." + x + ".AutoOn_Lux.Enabled", function (dp) { //Bei Statusänderung
            Groups[x][24] = dp.state.val;
        });
        on(praefix + "." + x + ".AutoOn_Lux.MinLux", function (dp) { //Bei Statusänderung
            Groups[x][25] = dp.state.val;
        });

        on(praefix + "." + x + ".AutoOn_Lux.OnlyIfPresence", function (dp) { //Bei Statusänderung
            Groups[x][26] = dp.state.val;
        });
        on(praefix + "." + x + ".AutoOn_PresenceIncrease.Enabled", function (dp) { //Bei Statusänderung
            Groups[x][27] = dp.state.val;
        });
        on(praefix + "." + x + ".AutoOn_Lux.OnlyIfNoPresence", function (dp) { //Bei Statusänderung
            Groups[x][28] = dp.state.val;
        });
        on(praefix + "." + x + ".AutoOn_PresenceIncrease.MinLux", function (dp) { //Bei Statusänderung
            Groups[x][29] = dp.state.val;
        });

        on(praefix + "." + x + ".AutoOn_Lux.DailyLock", function (dp) { //Bei Statusänderung
            Groups[x][30] = dp.state.val;
        });
        on(praefix + "." + x + ".RampOn.SwitchOutletsLast", function (dp) { //Bei Statusänderung
            Groups[x][31] = dp.state.val;
        });
        on(praefix + "." + x + ".AutoOn_Lux.AutoOnBri", function (dp) { //Bei Statusänderung
            Groups[x][32] = dp.state.val;
        });
        on(praefix + "." + x + ".AutoOn_Lux.AutoOnColor", function (dp) { //Bei Statusänderung
            Groups[x][33] = dp.state.val;
        });
        on(praefix + "." + x + ".AutoOn_PresenceIncrease.AutoOnBri", function (dp) { //Bei Statusänderung
            Groups[x][34] = dp.state.val;
        });
        on(praefix + "." + x + ".AutoOn_PresenceIncrease.AutoOnColor", function (dp) { //Bei Statusänderung
            Groups[x][35] = dp.state.val;
        });
        on(praefix + "." + x + ".AutoOff_Lux.Enabled", function (dp) { //Bei Statusänderung
            Groups[x][36] = dp.state.val;
        });
        on(praefix + "." + x + ".AutoOff_Lux.MinLux", function (dp) { //Bei Statusänderung
            Groups[x][37] = dp.state.val;
        });
        on(praefix + "." + x + ".AutoOff_Lux.DailyLock", function (dp) { //Bei Statusänderung
            Groups[x][38] = dp.state.val;
        });
        on(praefix + "." + x + ".AutoOff_Lux.Operator", function (dp) { //Bei Statusänderung
            Groups[x][39] = dp.state.val;
        });
        on(praefix + "." + x + ".AutoOn_Lux.Operator", function (dp) { //Bei Statusänderung
            Groups[x][40] = dp.state.val;
        });

    };
        on("zigbee.0.ccccccfffed4ee4c.color", function (dp) { //Bei Statusänderung
           log("zigbee.0.ccccccfffed4ee4c.color="+ dp.state.val);
        });

    //alle Gruppen on(praefix + SzenenName + ".activate", function (obj) {
    on({ id: praefix + ".all" + ".Power", change: "ne" }, function (dp) { //Bei Statusänderung
        if (logging) log("All Lightgroups deactivated");
        if (dp.state.val) {
            for (let x = 0; x < Groups.length; x++) {
                DoPower(x, 1);
            };

        } else {
            for (let x = 0; x < Groups.length; x++) {
                DoPower(x, 0);
            };
        };
    });
    on(praefix + ".all" + ".Ct", function (dp) { //Bei Statusänderung
        for (let x = 0; x < Groups.length; x++) {
            DoCt(x, dp.state.val);
        };
    });
    on(praefix + ".all" + ".Bri", function (dp) { //Bei Statusänderung
        for (let x = 0; x < Groups.length; x++) {
            DoBri(x, dp.state.val);
        };
    });
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
