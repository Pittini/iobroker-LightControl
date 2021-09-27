# iobroker-LightControl 2 - Pre BETAVERSION
Lichtsteuerung für Leuchtmittel unterschiedlicher Hersteller


## Features
* Gruppierung beliebig vieler Lampen/Leuchtmittel
* Verwendung gemischter Lampen/Farbsystemen und Umrechnung der Farbsysteme (Hex,Rgb,Hsl,Xy)
* Möglichkeit der Zuweisung von defaultwerten zu jedem Leuchtmittel (gleiche Helligkeit trotz unterschiedlich leistungsstarker Leuchtmittel)
* Verwendung beliebig vieler Bewegungsmelder pro Gruppe
* Ramping (langsame Änderung der Helligkeit bis Zielwert) für on und off
* AutoOff nach Zeit / Kein Off bei Bewegung 
* AutoOff nach Helligkeit
* AutoOn bei Bewegung ab bestimmter Helligkeit 
* AutoOn bei Dunkelheit
* AutoOn bei Anwesenheitszählererhöhung ab bestimmter Helligkeit (Begrüßungslicht bei heimkommen)
* Override on (Putzlicht)
* Adaptive Helligkeit (Bei Aussenhelligkeit über 1000 Lux volle Helligkeit (100%), darunter linear dunkler bis 0 Lux (2%))
* Adaptive Farbtemperatur (Tags Tageslichtweiss, abends warmweiss)
* Blinken (Alarm, Türklingel, etc.)
* Vis View (Import via "Widgets importieren")
* 
![lc_info1.png](/admin/lc_info1.png) 

## Installation
Nachdem ihr das Skript in ein neues Js Projekt kopiert habt, müßt ihr dem Skript Eure Leuchtmittel bekannt machen, es wird mindestens ein Schaltdatenpunkt (an/aus) erwartet. D.h. ihr könnt hier auch Steckdosen schalten mit herkömmlichen, nicht smarten, Leuchtmitteln, bzw. auch Geräte die keine Lampen sind.
Optional könnt ihr Datenpunkte für Helligkeit, Farbe, Farbtemperatur und Farb/Weiss Modus umschaltung angeben. Zu den jeweiligen Einträgen gehören dann noch folgende Zusatzangaben: die jeweiligen min/max Werte des Datenpunktes, sowie die gewünschten Defaultwerte, nachfolgend das ganze im Detail:

Als erstes gebt Ihr den gewünschten Gruppen Namen im entsprechenden Array an, hier wies bei mir aussieht:

    const GroupNames = ["Flur Eg", "Wohnzimmer", "Toilette", "Flur Og", "Bad", "Dach", "Schlafzimmer Carlo", "Kueche Unterbau", "Vitrine", "Hauseingang"]; 

Diese Gruppen werden, mit 0 beginnend, nun durchgezählt und jede Gruppe bekommt Ihre Devices zugeteilt:

    LightGroups[0] = [];     //Gruppe 0 = Flur Eg   
    LightGroups[0][0] = []; //Gruppe 0 Device 0 = Strahler1   

    LightGroups[0][0][0] = ["DeviceDp", true, false]; // 0=Datenpunkt für Power - Wert für an, Wert für aus (dürfte in den meisten Fällen true/false sein)   
    LightGroups[0][0][1] = ["DeviceDp", 0, 100, 30]; //1=Datenpunkt für Helligkeit - min.Wert - max.Wert - Defaultwert   
    LightGroups[0][0][2] = ["DeviceDp", 250, 454];*** // 2=Datenpunkt für Farbtemperatur - min.Wert - max.Wert 
    LightGroups[0][0][3] = ["DeviceDp", 250, 454];*** // 3=Datenpunkt für Farbe - min.Wert - max.Wert 
    LightGroups[0][0][4] = ["DeviceDp", 250, 454];*** // 4=Datenpunkt für Farbumschaltung - min.Wert - max.Wert 


Info: Die min. und max. Werte, werden benötigt da es sehr viele verschiedene Varianten für Helligkeit, ct, Farbe gibt. Bei den einen gehts von 0-100, bei anderen von 0-255 und bei wieder andere gehe z.B. von 250-454. Um das unter einen Hut zu kriegen wandelt das Skript den sich jeweils ergebenden Wertebereich bei Helligkeit und ct in einen Prozentwert um. Bei Farbwerten wird intern mit RGB gearbeitet, dieser Wert wird dann zum Zielsystem konvertiert.

Für jede Gruppe wird nun im Skriptverzeichnis ein channel erstellt mit allen nötigen Datenpunkten. Ich habe aussagekräftige Bezeichnungen verwendet, sollte also selbsterklärend sein.
In der channelroot findet ihr die allgemeinen Datenpunkte der Gruppe, in den Unterordnern jeweils die Datenpunkte der jeweiligen Funktion. 

![lc_info2.png](/admin/lc_info2.png) 

## Changelog
### V0.2.0 (24.7.2021)
* Init V2, kompletter Rewrite.

### V0.1.6 (27.3.2021)
* Add: Filter für ungültige 0 Lux Werte eingebaut
### V0.1.5 (06.10.2020)
* Change: Einige rewrites, Strukturänderungen, Bugfixes
* Add: Vis View hinzugefügt (Import via "Widgets importieren")
* Add: Neue Funktion AutoOff_Lux hinzugefügt
### V0.1.1 (06.10.2020)
* Add: Neue Funktionen integriert, jetzt setzen von Helligkeit und Farbe für alle AutoOn Funktionen unabhängig der Gruppensettings einstellbar.
* Change: Von Alpha nach Beta.
### V0.0.3 (03.10.2020)
* Fix: AutoOn_Motion Problem mit Bwms behoben.
### V0.0.2 (12.09.2020)
* Change: Datenpunktstruktur und -benamung geändert und neue hinzugefügt.
### V0.0.1 (19.08.2020)
* Add: Init
