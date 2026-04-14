# Build release APK locally. Clears a broken system JAVA_HOME so gradlew uses java from PATH
# (see android/gradle.properties org.gradle.java.home).
$ErrorActionPreference = "Stop"
Remove-Item Env:JAVA_HOME -ErrorAction SilentlyContinue
Set-Location (Join-Path $PSScriptRoot "..\android")
& .\gradlew.bat assembleRelease @args
