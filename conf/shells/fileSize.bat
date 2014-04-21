:: @author Jackie lin
:: @Date 2014-3-25
:: @Content deal with mime type
@echo off&setlocal enabledelayedexpansion
    set input=%1
 	cd /d %input%
 	set total=0
 	for /f "delims=" %%a in ('dir /b /s /a-d') do set /a total=(!total!+%%~za)
 	echo %total%
pause
exit