:: @author Jackie lin
:: @Date 2014-3-25
:: @Content deal with mime type
@echo off&setlocal enabledelayedexpansion
    set input=%1
    set total=0
    if EXIST %input%\NUL (
        cd /d %input%
        for /f "delims=" %%a in ('dir /b /s /a-d') do set /a total=^(!total!+%%~za^)
    ) else (
        for /f "usebackq" %%a IN ('%input%') do set /a total=%%~za
    )
    echo %total%
pause