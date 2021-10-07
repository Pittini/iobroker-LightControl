# iobroker-LightControl 2 - BETAVERSION
Lichtsteuerung für Leuchtmittel unterschiedlicher Hersteller


## Features
* Gruppierung beliebig vieler Lampen/Leuchtmittel
* Verwendung gemischter Lampen/Farbsystemen und Umrechnung der Farbsysteme (Hex,Rgb,Hsl,Xy)
* Möglichkeit der Zuweisung von defaultwerten zu jedem Leuchtmittel (gleiche Helligkeit trotz unterschiedlich leistungsstarker Leuchtmittel)
* Verwendung beliebig vieler Bewegungsmelder pro Gruppe
* Ramping (langsame Änderung der Helligkeit bis Zielwert) für on und off
* AutoOff nach Zeit / Kein Off bei Bewegung; Zwei Modi: Zeit restart nach jeder gemeldeten Bewegung oder Prüfung auf Bewegung kurz vor Abschaltung.
* AutoOff nach Helligkeit
* AutoOn bei Bewegung ab bestimmter Helligkeit 
* AutoOn bei Dunkelheit
* AutoOn bei Anwesenheitszählererhöhung ab bestimmter Helligkeit (Begrüßungslicht bei heimkommen)
* Override on (Putzlicht)
* Adaptive Helligkeit (Bei Aussenhelligkeit über 1000 Lux volle Helligkeit (100%), darunter linear dunkler bis 0 Lux (2%))
* Adaptive Farbtemperatur (3 dynamische Modi: Linear (linear ansteigend von Sonnenaufgang bis Sonnenmittag, dann linear abfallend bis Sonnenuntergang), Solar (entsprechend der Sonnenhöhe errechneter Sinus, maxCt ist Jahreszeitenabhängig), SolarInterpoliert (wie Solar, jedoch ohne Jahreszeitenabhängigkeit))  ![lc_info0.png](/admin/lc_info0.png) 

* Blinken (Alarm, Türklingel, etc.)
* Vis View (Import via "Widgets importieren")
* 
![lc_info1.png](/admin/lc_info1.png) 

## Installation
Nachdem ihr das Skript in ein neues Js Projekt kopiert habt, müßt ihr dem Skript Eure Leuchtmittel bekannt machen, es wird mindestens ein Schaltdatenpunkt (an/aus) erwartet. D.h. ihr könnt hier auch Steckdosen schalten mit herkömmlichen, nicht smarten, Leuchtmitteln, bzw. auch Geräte die keine Lampen sind.
Optional könnt ihr Datenpunkte für Helligkeit, Farbe, Farbtemperatur und Farb/Weiss Modus umschaltung angeben. Zu den jeweiligen Einträgen gehören dann noch folgende Zusatzangaben: die jeweiligen min/max Werte des Datenpunktes, sowie die gewünschten Defaultwerte, nachfolgend das ganze im Detail:











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
