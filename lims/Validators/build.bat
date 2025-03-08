@echo off

:: 设置输出路径变量
set WASM_OUT_DIR=..\src\public\js\wasm

echo Building wasm module...
wasm-pack build --release --no-typescript --out-dir "%WASM_OUT_DIR%" --out-name "validators" --target web

echo Removing trash files...
if exist "%WASM_OUT_DIR%\.gitignore" del "%WASM_OUT_DIR%\.gitignore"
if exist "%WASM_OUT_DIR%\package.json" del "%WASM_OUT_DIR%\package.json"
echo Done
pause