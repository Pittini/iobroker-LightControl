# iobroker-LightControl - ALPHAVERSION
Lichtsteuerung für Leuchtmittel unterschiedlicher Hersteller


## Features
* Gruppierung beliebig vieler Lampen/Leuchtmittel
* Verwendung gemischter Lampen/Farbsystemen und Umrechnung der Farbsysteme (Hex,Rgb,Hsl,Xy)
* Möglichkeit der Zuweisung von defaultwerten zu jedem Leuchtmittel (gleiche Helligkeit trotz unterschiedlich leistungsstarker Leuchtmittel)
* Verwendung beliebig vieler Bewegungsmelder pro Gruppe
* Ramping (langsame Änderung der Helligkeit bis Zielwert) für on und off
* AutoOff nach Zeit / Kein Off bei Bewegung 
* AutoOn bei Bewegung ab bestimmter Helligkeit 
* AutoOn bei Dunkelheit
* AutoOn bei Anwesenheitszählererhöhung ab bestimmter Helligkeit (Begrüßungslicht bei heimkommen)
* Override on (Putzlicht)
* Adaptive Helligkeit (Bei Aussenhelligkeit über 1000 Lux volle Helligkeit (100%), darunter linear dunkler bis 0 Lux (2%))
* Adaptive Farbtemperatur (Tags Tageslichtweiss, abends warmweiss)
* Blinken (Alarm, Türklingel, etc.)

## Installation
Nachdem ihr das Skript in ein neues Js Projekt kopiert habt, müßt ihr dem Skript Eure Leuchtmittel bekannt machen, es wird mindestens ein Schaltdatenpunkt (an/aus) erwartet. D.h. ihr könnt hier auch Steckdosen schalten mit herkömmlichen, nicht smarten, Leuchtmitteln, bzw. auch Geräte die keine Lampen sind.
Optional könnt ihr Datenpunkte für Helligkeit, Farbe, Farbtemperatur und Farb/Weiss Modus umschaltung angeben. Zu den jeweiligen Einträgen gehören dann noch folgende Zusatzangaben: die jeweiligen min/max Werte des Datenpunktes, sowie die gewünschten Defaultwerte, nachfolgend das ganze im Detail:

Als erstes gebt Ihr den gewünschten Gruppen Namen im entsprechenden Array an, hier wies bei mir aussieht:

     const Groups = [["Flur Eg"], ["Wohnzimmer"], ["Toilette"], ["Flur Og"], ["Bad"], ["Dach"], ["Schlafzimmer Carlo"], ["Kueche Unterbau"], ["Küchenvorraum"]];

Diese Gruppen werden, mit 0 beginnend, nun durchgezählt und jede Gruppe bekommt Ihre Devices zugeteilt:

    LightGroups[0] = [];     //Gruppe 0 = Flur Eg   
    LightGroups[0][0] = []; //Gruppe 0 Device 0 = Strahler1   

    LightGroups[0][0][0] = ["deconz.0.Lights.680ae2fffe0ca671.on", true, false]; // 0=Datenpunkt für Power - Wert für an, Wert für aus (dürfte in den meisten Fällen true/false sein)   
    LightGroups[0][0][1] = ["deconz.0.Lights.680ae2fffe0ca671.level", 0, 100, 30]; //1=Datenpunkt für Helligkeit - min.Wert - max.Wert - Defaultwert   
    LightGroups[0][0][2] = ["deconz.0.Lights.680ae2fffe0ca671.ct", 250, 454];*** // 2=Datenpunkt für Farbtemperatur - min.Wert - max.Wert 

Info: Die min. und max. Werte, werden benötigt da es sehr viele verschiedene Varianten für Helligkeit, ct, Farbe gibt. Bei den einen gehts von 0-100, bei anderen von 0-255 und bei wieder andere gehe z.B. von 250-454. Um das unter einen Hut zu kriegen wandelt das Skript den sich jeweils ergebenden Wertebereich bei Helligkeit und ct in einen Prozentwert um. Bei Farbwerten wird intern mit RGB gearbeitet, dieser Wert wird dann zum Zielsystem konvertiert.


## Changelog
### V0.0.2 (12.09.2020)
* Change: Datenpunktstruktur und -benamung geändert und neue hinzugefügt.
### V0.0.1 (19.08.2020)
* Add: Init
