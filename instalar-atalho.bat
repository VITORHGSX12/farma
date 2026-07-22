@echo off
chcp 65001 > NUL
set SCRIPT_DIR=%~dp0
set HTML_PATH=%SCRIPT_DIR%index.html
set ICON_PATH=%SCRIPT_DIR%icon.ico

:: Escape backslashes for PowerShell
set HTML_PATH_ESC=%HTML_PATH:\=\\%
set ICON_PATH_ESC=%ICON_PATH:\=\\%

:: Find browser executable without breaking batch parentheses
set BROWSER_PATH=C:\Program Files\Google\Chrome\Application\chrome.exe
if not exist "C:\Program Files\Google\Chrome\Application\chrome.exe" set BROWSER_PATH=C:\Program Files (x86)\Google\Chrome\Application\chrome.exe
if not exist "%BROWSER_PATH%" set BROWSER_PATH=C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe

echo =======================================================
echo     FARMA LUZ - INSTALADOR DE ATALHO DE OPERADOR
echo =======================================================
echo.
echo Localizando arquivos...
echo HTML: "%HTML_PATH%"
echo Icone: "%ICON_PATH%"
echo Navegador: "%BROWSER_PATH%"
echo.

powershell -Command "$Shell = New-Object -ComObject WScript.Shell; $Shortcut = $Shell.CreateShortcut([System.IO.Path]::Combine([Environment]::GetFolderPath('Desktop'), 'FARMA LUZ.lnk')); $Shortcut.TargetPath = '%BROWSER_PATH%'; $Shortcut.Arguments = '--app=file:///%HTML_PATH_ESC%'; $Shortcut.IconLocation = '%ICON_PATH_ESC%'; $Shortcut.Save()"

echo.
echo [OK] Atalho 'FARMA LUZ' criado na sua Area de Trabalho!
echo.
pause
